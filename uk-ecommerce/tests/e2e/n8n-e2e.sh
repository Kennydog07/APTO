#!/usr/bin/env bash
# End-to-end test: signed Shopify webhook -> ops-service (TEST_MODE) -> n8n
# Workflow 05 -> Workflow 06 -> idempotent supplier submission.
# Requires: a local n8n install (N8N_BIN, N8N_NODE) — see TEST-RESULTS.md.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
WORK="${WORK:-$(mktemp -d)}"; mkdir -p "$WORK"
N8N_NODE="${N8N_NODE:?path to node>=24 binary}"; N8N_BIN="${N8N_BIN:?path to n8n/bin/n8n}"
OPS_PORT=18080; N8N_PORT=15678
TOKEN=$(openssl rand -hex 24); INBOUND=$(openssl rand -hex 24); WHSECRET=$(openssl rand -hex 16)
export N8N_USER_FOLDER="$WORK/n8nhome" N8N_ENCRYPTION_KEY=$(openssl rand -hex 16) N8N_DIAGNOSTICS_ENABLED=false N8N_PORT N8N_PERSONALIZATION_ENABLED=false N8N_LISTEN_ADDRESS=127.0.0.1
for port in $OPS_PORT $N8N_PORT 5679 5690; do
  if (echo > /dev/tcp/127.0.0.1/$port) 2>/dev/null; then echo "Port $port is already in use — stop the other process first"; exit 2; fi
done
rm -rf "$N8N_USER_FOLDER" "$WORK/ops.sqlite"* "$WORK/wf"; mkdir -p "$WORK/wf"
n8n() { "$N8N_NODE" "$N8N_BIN" "$@"; }

# Workflows pointed at the local ops-service
for f in "$ROOT"/n8n-workflows/[01]*.json; do sed "s#http://ops-service:8080#http://127.0.0.1:$OPS_PORT#g" "$f" > "$WORK/wf/$(basename "$f")"; done
cat > "$WORK/creds.json" <<JSON
[{"id":"REPLACE_OPS_API_CRED","name":"Ops service API (Bearer)","type":"httpHeaderAuth","data":{"name":"Authorization","value":"Bearer $TOKEN"}},
 {"id":"REPLACE_INBOUND_CRED","name":"Inbound webhook secret (X-Ops-Token)","type":"httpHeaderAuth","data":{"name":"X-Ops-Token","value":"$INBOUND"}}]
JSON
n8n import:credentials --input="$WORK/creds.json" >/dev/null 2>&1
n8n import:workflow --separate --input="$WORK/wf" 2>&1 | tail -1
for id in NoWf05NewOrder00 NoWf06Fulfil0000 NoWf12Errors0000; do n8n publish:workflow --id=$id >/dev/null 2>&1 || n8n update:workflow --id=$id --active=true >/dev/null 2>&1; done

# Seed ops-service with one approved product, then start it
export DB_PATH="$WORK/ops.sqlite" TEST_MODE=true OPS_API_TOKEN=$TOKEN SHOPIFY_WEBHOOK_SECRET=$WHSECRET SHOPIFY_SHOP_DOMAIN=e2e.myshopify.com \
  N8N_ORDER_WEBHOOK_URL="http://127.0.0.1:$N8N_PORT/webhook/ops-new-paid-order" N8N_SHARED_SECRET=$INBOUND PORT=$OPS_PORT \
  DASHBOARD_PASSWORD_HASH='scrypt$16384$8$1$AAAA$AAAA'
cd "$ROOT/ops-service"
node --disable-warning=ExperimentalWarning -e "
  const { openDb } = await import('./src/db.js'); const { upsertProduct } = await import('./src/catalogue.js');
  const db = openDb(process.env.DB_PATH);
  upsertProduct(db, { sku: 'SKU-1', title: 'Pantry bin', supplier: 'MOCK', supplier_sku: 'SUP-1', cost_gbp: 6, shipping_gbp: 2.5, price_gbp: 24.99, stock: 50, status: 'active', approved: 1, cost_verified: 1 });" --input-type=module
node --disable-warning=ExperimentalWarning src/server.js > "$WORK/ops.log" 2>&1 & OPS_PID=$!
setsid "$N8N_NODE" "$N8N_BIN" start > "$WORK/n8n.log" 2>&1 & N8N_PID=$!
cleanup() {
  kill $OPS_PID 2>/dev/null || true
  # n8n is started in its own process group (setsid) so its renamed children die with it.
  kill -- -"$N8N_PID" 2>/dev/null || kill "$N8N_PID" 2>/dev/null || true
}
trap cleanup EXIT
for i in $(seq 1 90); do curl -sf "http://127.0.0.1:$N8N_PORT/healthz" >/dev/null && break; sleep 2; done
# Wait until the order webhook is registered (unauthenticated probe returns 403, not 404)
for i in $(seq 1 90); do c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:$N8N_PORT/webhook/ops-new-paid-order" --data '{}'); [ "$c" = "403" ] && break; sleep 2; done
echo "n8n webhook ready (probe: $c)"

send() { # $1 webhook id
  BODY='{"id":7001,"name":"#2001","email":"e2e@example.com","financial_status":"paid","currency":"GBP","total_price":"24.99","total_tax":"4.17","subtotal_price":"24.99","shipping_address":{"country_code":"GB","city":"Leeds","zip":"LS1 1AA","address1":"1 Test St","name":"E2E"},"line_items":[{"id":1,"sku":"SKU-1","quantity":1,"price":"24.99","title":"Pantry bin"}]}'
  SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$WHSECRET" -binary | base64)
  curl -sS -m 30 -o /dev/null -w "%{http_code}" -X POST "http://127.0.0.1:$OPS_PORT/webhooks/shopify" -H "Content-Type: application/json" \
    -H "X-Shopify-Hmac-Sha256: $SIG" -H "X-Shopify-Shop-Domain: e2e.myshopify.com" -H "X-Shopify-Topic: orders/paid" -H "X-Shopify-Webhook-Id: $1" --data "$BODY"
}
echo "webhook 1 -> $(send e2e-1)"; sleep 12
echo "webhook 2 (duplicate delivery, same id) -> $(send e2e-1)"
echo "webhook 3 (same order, new id) -> $(send e2e-2)"; sleep 12
echo "forged webhook -> $(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:$OPS_PORT/webhooks/shopify -H 'X-Shopify-Hmac-Sha256: Zm9yZ2Vk' -H 'X-Shopify-Webhook-Id: x' --data '{}')"
echo "unauthenticated n8n webhook -> $(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:$N8N_PORT/webhook/ops-new-paid-order --data '{"orderId":"7001"}')"
echo "--- executing scheduled workflows once (email nodes are expected to fail: no SMTP in test) ---"
for id in NoWf03Inventory0 NoWf04Pricing000 NoWf07Tracking00 NoWf09Content000 NoWf10Publish000 NoWf11Report0000 NoWf13Optimise00; do
  out=$(N8N_RUNNERS_BROKER_PORT=5690 timeout 180 "$N8N_NODE" "$N8N_BIN" execute --id=$id 2>&1 || true); echo "$out" > "$WORK/exec-$id.log"
  if echo "$out" | grep -q "Execution was successful"; then echo "$id: SUCCESS";
  else echo "$id: $(echo "$out" | grep -iE 'error|fail|node' | grep -v Deprecat | head -2 | tr '\n' ' ')"; fi
done
node --disable-warning=ExperimentalWarning --input-type=module -e "
  const { openDb } = await import('./src/db.js'); const db = openDb(process.env.DB_PATH);
  console.log('ops-service logs written by n8n:', JSON.stringify(db.prepare(\"SELECT source, COUNT(*) AS n FROM logs WHERE source LIKE 'n8n:%' GROUP BY source\").all()));
  console.log('exceptions recorded from n8n failures:', JSON.stringify(db.prepare(\"SELECT source, message FROM exceptions WHERE source LIKE 'n8n:%'\").all()));
  console.log('content items queued for approval:', db.prepare(\"SELECT COUNT(*) AS n FROM content WHERE status='pending_approval'\").get().n);"
node --disable-warning=ExperimentalWarning --input-type=module -e "
  const { openDb } = await import('./src/db.js'); const db = openDb(process.env.DB_PATH);
  const o = db.prepare(\"SELECT state FROM orders WHERE id='7001'\").get();
  const so = db.prepare(\"SELECT supplier, status, external_id, attempts FROM supplier_orders WHERE order_id='7001'\").all();
  const logs = db.prepare(\"SELECT source, message FROM logs WHERE source LIKE 'n8n:%' ORDER BY id\").all();
  console.log(JSON.stringify({ order: o, supplierOrders: so, n8nLogs: logs }, null, 1));
  const pass = o?.state === 'submitted' && so.length === 1 && so[0].status === 'confirmed' && so[0].attempts === 1;
  console.log(pass ? 'E2E RESULT: PASS' : 'E2E RESULT: FAIL'); process.exit(pass ? 0 : 1);"
