// Server-side relay for APTO Solve's AI tutor. The original edge function lives on the
// apto-solve site (source not in any repo) and rejects browser requests from other origins,
// so /solve/api/ai on apto-pro.com is relayed here without the Origin header.
const UPSTREAM = "https://apto-solve.netlify.app/api/ai";

export default async (req, context) => {
  const url = new URL(req.url);
  const headers = { "content-type": req.headers.get("content-type") || "application/json" };
  const ip = context.ip || req.headers.get("x-nf-client-connection-ip");
  if (ip) headers["x-forwarded-for"] = ip;
  const init = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") init.body = await req.text();
  const res = await fetch(UPSTREAM + url.search, init);
  return new Response(await res.text(), {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
};
