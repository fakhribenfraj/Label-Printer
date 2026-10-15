// Converty order -> neutral LabelData. If Converty changes its API, only this file changes.
const dedupe = (arr) => [...new Set(arr.map((s) => (s || "").trim()).filter(Boolean))];

export function money(n, code) {
  const v = Number(n || 0);
  if (code === "TND") return v.toFixed(3) + " DT";
  if (code === "DZD") return v.toFixed(0) + " DA";
  return v.toFixed(2) + " " + (code || "");
}

export function phone(p) {
  const d = String(p || "").replace(/[\s.-]/g, "");
  return /^\d{8}$/.test(d) ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}` : d;
}

export function toLabel(o, store) {
  const c = o.customer || {}, t = o.total || {}, code = o.currencyCode || "TND";
  const items = (o.cart || []).map((l) => {
    const v = (l.selectedVariants || []).map((x) => x.value).filter(Boolean).join(", ");
    return `${l.quantity}x ${l.product?.name || ""}${v ? ` (${v})` : ""}`;
  });
  const paidOnline = !!o.isOnline;
  const due = Math.max(0, (t.totalPrice || 0) - (paidOnline ? o.paidAmount || 0 : 0));
  const contact = store?.contactInfo || {};
  return {
    code: o.barcode || `ORD-${o.reference}`,   // carrier tracking number, else Converty order number
    reference: o.reference,
    date: new Date(o.createdAt).toLocaleString("fr-TN", { dateStyle: "short", timeStyle: "short" }),
    origin: (process.env.ORIGIN_CITY || "").toUpperCase(),
    dest: (c.city || "").toUpperCase(),
    fragile: process.env.FRAGILE !== "0",
    openParcel: process.env.OPEN_PARCEL !== "0",
    exchange: !!o.exchange,
    name: c.name || "",
    phone: phone(c.phone),
    phone2: phone(c.phone2),
    address: c.address || "",
    area: dedupe([c.town, c.city]).join(" · "),
    note: c.note || "",
    product: items.join(" + "),
    sender: { name: store?.name || "", phone: phone((contact.phones || [])[0]), address: contact.address || "" },
    subtotal: money(t.basePrice ?? (t.totalPrice - (t.deliveryPrice || 0)), code),
    delivery: money(t.deliveryPrice, code),
    total: money(due, code),
    prepaid: paidOnline && due === 0,
    storeUrl: store?.domain || "https://converty.shop",
  };
}
