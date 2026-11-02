// APTO Solve AI tutor API (native on aptotools). Serves /solve/api/ai.
// Contract (matches /solve front end):
//   GET  ?clientId=…  -> {ok:true,status:{configured,mock:false,limit,remaining}}
//   POST {action,clientId,request?,mode?,answers?,images?,context?}
//        -> {ok:true,data,refused?,source:"ai",usage:{limit,remaining}}
//        -> {ok:false,error:{code,message},usage?}
// Daily limits: 5 successful requests per browser clientId and 15 per IP (UTC day), in Netlify Blobs.
import { getStore } from "@netlify/blobs";
import SCHEMAS from "./schemas.json" with { type: "json" };

const LIMIT = 5;
const IP_LIMIT = 15;
const MODEL = process.env.SOLVE_MODEL || "claude-sonnet-4-5";
const ACTIONS = ["assess", "practical_plan", "step_help", "course_plan", "course_help", "adapt_course"];
const MAX_BODY = 5 * 1024 * 1024;

const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });
const err = (status, code, message, usage, extra) =>
  json(status, { ok: false, error: { code, message }, ...(usage ? { usage } : {}) }, extra);

const day = () => new Date().toISOString().slice(0, 10);
const cleanId = (s) => String(s || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
const configured = () => /^sk-ant-/.test(process.env.ANTHROPIC_API_KEY || "");

async function counts(store, clientId, ip) {
  const d = day();
  const [c, i] = await Promise.all([
    store.get(`${d}/c/${clientId}`, { type: "json" }).catch(() => null),
    ip ? store.get(`${d}/ip/${ip}`, { type: "json" }).catch(() => null) : null,
  ]);
  return { c: c?.n || 0, i: i?.n || 0, d };
}
const usageOf = (n) => ({ limit: LIMIT, remaining: Math.max(0, LIMIT - n) });

const SYSTEM = `You are APTO Solve, a patient, friendly AI instructor for UK learners. You help people either
(a) tackle a practical job (DIY, household, hobby, bike, simple repairs) step by step, or
(b) learn a subject through a structured course with short lessons, worked examples and quizzes.

Safety comes first. Give every practical job a rating: green (low risk, fine for a careful beginner),
amber (possible with care, clear precautions and stop points), or red (must be done by a qualified professional).
Never guide gas work, mains electrical work (beyond plugging things in or resetting a breaker), structural changes,
asbestos, work at height, high-risk vehicle repairs (brakes, steering, airbags, fuel), medical treatment, weapons,
or anything illegal or dangerous. For these, use type "refuse" with rating "red", explain the risk calmly, name the
right professional (e.g. Gas Safe registered engineer, registered electrician), give safe preparation steps and
questions to ask the professional. If anyone may be in immediate danger, put emergency advice (999, gas emergency
line 0800 111 999) in "emergency".

Only describe what is actually visible in photos as observations; never claim a photo proves something is safe.
State assumptions and uncertainties honestly. Use plain British English, short sentences, metric units and UK
terminology. Ask only the questions you truly need (at most 4). Keep within the length limits of the schema.
APTO Solve provides educational guidance only and cannot inspect, certify or guarantee work.
Always answer by calling the provided tool exactly once with a complete, valid object.`;

function userContent(action, b) {
  const parts = [];
  const imgs = Array.isArray(b.images) ? b.images.slice(0, 3) : [];
  for (const im of imgs) {
    if (im && typeof im.data === "string" && /^image\/(jpeg|png|webp|gif)$/.test(im.mimeType || ""))
      parts.push({ type: "image", source: { type: "base64", media_type: im.mimeType, data: im.data.replace(/^data:[^,]+,/, "") } });
  }
  const payload = {
    action,
    request: String(b.request || "").slice(0, 500),
    mode: b.mode || "auto",
    answers: Array.isArray(b.answers) ? b.answers.slice(0, 6) : undefined,
    context: b.context ? JSON.stringify(b.context).slice(0, 4000) : undefined,
    photosAttached: imgs.length,
  };
  const task = {
    assess: "Assess the learner's request. Decide type (practical, course, or refuse), safety rating, and up to 4 short questions needed to personalise the guide or course. If mode is practical or course, respect it unless safety requires refusal.",
    practical_plan: "Create the step-by-step practical guide using the request and the learner's answers.",
    course_plan: "Create the structured course (roadmap, lessons with sections, worked examples and quizzes) using the request and answers.",
    step_help: "The learner needs help with one step of their practical guide (see context.helpType and the step). Reply helpfully; set shouldStop if they should stop and get a professional.",
    course_help: "The learner needs help within a course lesson (see context.kind). Explain, give an example, and include a short quiz if useful.",
    adapt_course: "Adapt the remaining course lessons based on the learner's progress and feedback in context.",
  }[action];
  parts.push({ type: "text", text: `${task}\n\nInput:\n${JSON.stringify(payload)}` });
  return parts;
}

async function callClaude(action, b) {
  const schema = action === "assess" ? SCHEMAS.assess : SCHEMAS[action];
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 55000);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: action === "course_plan" || action === "adapt_course" ? 8000 : 4000,
        system: SYSTEM,
        tools: [{ name: "respond", description: `Return the ${action} result.`, input_schema: schema }],
        tool_choice: { type: "tool", name: "respond" },
        messages: [{ role: "user", content: userContent(action, b) }],
      }),
    });
    if (r.status === 429 || r.status === 529) return { code: "AI_RATE_LIMIT", status: 429 };
    if (!r.ok) {
      console.error("solve-ai anthropic error", r.status, (await r.text()).slice(0, 300));
      return { code: r.status === 401 ? "NOT_CONFIGURED" : "AI_ERROR", status: 502 };
    }
    const out = await r.json();
    const tool = (out.content || []).find((c) => c.type === "tool_use");
    if (!tool || typeof tool.input !== "object") return { code: "AI_ERROR", status: 502 };
    return { data: tool.input };
  } catch (e) {
    console.error("solve-ai fetch failed", e?.name);
    return { code: e?.name === "AbortError" ? "TIMEOUT" : "AI_ERROR", status: 504 };
  } finally {
    clearTimeout(t);
  }
}

function toRefusal(a, request) {
  return {
    type: "refuse", rating: "red", category: "safety",
    title: a.title || "This job needs a qualified professional",
    request: String(request || "").slice(0, 200),
    risk: a.risk || a.ratingReason || "",
    professional: a.professional || "",
    safePreparation: a.safePreparation || [],
    questionsForProfessional: a.questionsForProfessional || [],
    emergency: a.emergency || "",
  };
}

export default async (req, context) => {
  const store = getStore({ name: "solve-usage", consistency: "strong" });
  const ip = cleanId(String(context.ip || "").replace(/[.:]/g, "-"));
  const url = new URL(req.url);

  if (req.method === "GET") {
    const clientId = cleanId(url.searchParams.get("clientId"));
    const { c, i } = await counts(store, clientId || "none", ip);
    const remaining = Math.min(Math.max(0, LIMIT - c), Math.max(0, IP_LIMIT - i));
    return json(200, { ok: true, status: { configured: configured(), mock: false, limit: LIMIT, remaining } });
  }
  if (req.method !== "POST") return err(405, "METHOD_NOT_ALLOWED", "Method not allowed.");

  const raw = await req.text();
  if (raw.length > MAX_BODY) return err(413, "TOO_LARGE", "That request is too large. Try fewer or smaller photos.");
  let b;
  try { b = JSON.parse(raw); } catch { return err(400, "BAD_REQUEST", "Invalid request."); }
  const action = b?.action;
  if (!ACTIONS.includes(action)) return err(400, "BAD_ACTION", "Unknown action.");
  const clientId = cleanId(b.clientId);
  if (!clientId) return err(400, "BAD_REQUEST", "Missing client id.");

  const { c, i, d } = await counts(store, clientId, ip);
  if (c >= LIMIT) return err(429, "DAILY_LIMIT", "You’re out of free requests today.", usageOf(c));
  if (ip && i >= IP_LIMIT) return err(429, "DAILY_LIMIT_IP", "You’re out of free requests today.", usageOf(LIMIT));

  if (!configured())
    return err(503, "NOT_CONFIGURED", "The AI tutor is not available right now. Please try again later.", usageOf(c));

  const lockKey = `${d}/lock/${clientId}`;
  const lock = await store.get(lockKey, { type: "json" }).catch(() => null);
  if (lock && Date.now() - lock.t < 60000)
    return err(429, "IN_FLIGHT", "Your previous request is still running.", usageOf(c), { "retry-after": "3" });
  await store.setJSON(lockKey, { t: Date.now() });

  try {
    const res = await callClaude(action, b);
    if (res.code) {
      const msg = {
        AI_RATE_LIMIT: "The free AI service is busy right now. Please wait a minute and try again.",
        NOT_CONFIGURED: "The AI tutor is not available right now. Please try again later.",
        TIMEOUT: "The AI took too long to answer. Please try again.",
      }[res.code] || "The AI could not produce a usable answer. Please try again.";
      return err(res.status, res.code, msg, usageOf(c));
    }
    const n = c + 1;
    await Promise.all([
      store.setJSON(`${d}/c/${clientId}`, { n }),
      ip ? store.setJSON(`${d}/ip/${ip}`, { n: i + 1 }) : null,
    ]);
    const usage = usageOf(n);
    if (action === "assess" && res.data.type === "refuse")
      return json(200, { ok: true, refused: true, data: toRefusal(res.data, b.request), source: "ai", usage });
    return json(200, { ok: true, data: res.data, source: "ai", usage });
  } finally {
    await store.delete(lockKey).catch(() => {});
  }
};
