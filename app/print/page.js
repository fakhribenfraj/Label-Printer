import "./vertical.css";
import { load } from "../../lib/store.js";
import { getStore, freshOrder } from "../../lib/converty.js";
import { toLabel } from "../../lib/label.js";
import { templates, defaultTemplate } from "../../lib/templates/index.js";

export const dynamic = "force-dynamic";

export default async function Print({ searchParams }) {
  const ids = (searchParams?.ids || "").split(",").filter(Boolean);
  const tpl = templates[searchParams?.t] || templates[defaultTemplate];
  const Layout = tpl.Component;
  const [cache, store] = await Promise.all([load("orders", {}), getStore()]);
  const orders = await Promise.all(ids.map((id) => freshOrder(id, cache[id])));
  const labels = orders.filter(Boolean).map((o) => toLabel(o, store));
  return (
    <>
      {labels.map((d, i) => (
        <Layout key={d.code || i} {...d} />
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: "onload=()=>setTimeout(()=>print(),400)",
        }}
      />
    </>
  );
}
