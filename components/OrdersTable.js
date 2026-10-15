"use client";
import { useMemo, useState } from "react";

export default function OrdersTable({ orders, templates, syncedAt }) {
  const [sel, setSel] = useState(new Set());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [tpl, setTpl] = useState(templates[0].id);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const statuses = useMemo(() => [...new Set(orders.map((o) => o.status))], [orders]);
  const rows = orders.filter((o) =>
    (!status || o.status === status) &&
    (!q || `${o.ref} ${o.name} ${o.phone} ${o.city}`.toLowerCase().includes(q.toLowerCase())));

  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOn = rows.length > 0 && rows.every((o) => sel.has(o.id));
  const print = () => window.open(`/print?t=${tpl}&ids=${[...sel].join(",")}`, "_blank");

  async function sync() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/sync", { method: "POST" });
    const j = await r.json();
    setMsg(r.ok ? `${j.count} orders synced` : j.error);
    setBusy(false);
    if (r.ok) location.reload();
  }

  const bar = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" };
  const cell = { padding: "6px 8px", borderBottom: "1px solid #e3e3e3", textAlign: "left" };
  return (
    <>
      <div style={bar}>
        <input placeholder="Search name, phone, city, #" value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: 6, minWidth: 240 }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 6 }}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync orders"}</button>
        <span style={{ color: "#666", fontSize: 13 }}>
          {msg || (syncedAt ? `Last sync ${new Date(syncedAt).toLocaleString()}` : "Not synced yet")}
        </span>
      </div>
      <div style={{ ...bar, position: "sticky", top: 0, background: "#fff", padding: "8px 0" }}>
        <select value={tpl} onChange={(e) => setTpl(e.target.value)} style={{ padding: 6 }}>
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={print} disabled={!sel.size}>Print {sel.size || ""} label{sel.size === 1 ? "" : "s"}</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead><tr>
          <th style={cell}><input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(rows.map((o) => o.id)))} aria-label="Select all" /></th>
          {["#", "Customer", "Phone", "City", "Total", "Status", "Date"].map((h) => <th key={h} style={cell}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td style={cell}><input type="checkbox" checked={sel.has(o.id)} onChange={() => toggle(o.id)} /></td>
              <td style={cell}>{o.ref}{o.printed ? " ✓" : ""}</td>
              <td style={cell}>{o.name}</td><td style={cell}>{o.phone}</td><td style={cell}>{o.city}</td>
              <td style={cell}>{o.total} {o.cur}</td><td style={cell}>{o.status}</td>
              <td style={cell}>{new Date(o.at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p>No orders. Click “Sync orders”.</p>}
    </>
  );
}
