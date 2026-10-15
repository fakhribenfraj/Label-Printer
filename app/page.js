import { load } from "../lib/store.js";
import { isConnected } from "../lib/converty.js";
import { templates } from "../lib/templates/index.js";
import OrdersTable from "../components/OrdersTable.js";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await isConnected())) {
    return (
      <>
        <h1>Étiquettes Converty</h1>
        <p>Connect your store to start printing labels.</p>
        <a href="/api/auth/install">Connect Converty</a>
      </>
    );
  }
  const orders = Object.values(await load("orders", {})).sort((a, b) => b.reference - a.reference);
  const meta = await load("meta", {});
  const list = orders.map((o) => ({
    id: o._id, ref: o.reference, status: o.status, name: o.customer?.name || "",
    phone: o.customer?.phone || "", city: o.customer?.city || "", total: o.total?.totalPrice,
    cur: o.currencyCode, at: o.createdAt, printed: !!o.printed,
  }));
  const tpls = Object.entries(templates).map(([id, t]) => ({ id, name: t.name }));
  return (
    <>
      <h1 style={{ marginTop: 0 }}>Étiquettes Converty</h1>
      <OrdersTable orders={list} templates={tpls} syncedAt={meta.syncedAt || null} />
    </>
  );
}
