import { load } from "../../lib/store.js";
import { getStore, freshOrder } from "../../lib/converty.js";
import { toLabel } from "../../lib/label.js";
import { templates, defaultTemplate } from "../../lib/templates/index.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const u = new URL(req.url);
  const ids = (u.searchParams.get("ids") || "").split(",").filter(Boolean);
  const tpl = templates[u.searchParams.get("t")] || templates[defaultTemplate];
  const [cache, store] = await Promise.all([load("orders", {}), getStore()]);
  const orders = await Promise.all(ids.map((id) => freshOrder(id, cache[id])));
  const labels = orders.filter(Boolean).map((o) => tpl.render(toLabel(o, store)));
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Labels</title><style>${tpl.css}</style></head>
<body>${labels.join("")}<script>onload=()=>setTimeout(()=>print(),400)</script></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
