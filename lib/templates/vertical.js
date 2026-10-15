import bwip from "bwip-js";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// rough text-fit: font size (pt) so `text` fits in `mm` on one line
const fit = (text, max, mm, k = 0.62) => Math.max(6, Math.min(max, mm / (Math.max(1, String(text).length) * k * 0.3528)));
const svg = (opts) => bwip.toSVG(opts).replace("<svg ", '<svg preserveAspectRatio="none" ');

export const css = `
@page{size:100mm 150mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Helvetica,Arial,"Noto Sans Arabic",sans-serif;color:#000;background:#fff}
.l{width:100mm;height:150mm;padding:2mm;page-break-after:always;overflow:hidden}
.in{height:146mm;border:.6pt solid #000;border-radius:2mm;display:flex;flex-direction:column;overflow:hidden}
.hd{padding:2.5mm 3mm 0;height:27mm;flex:none}
.hd .r{display:flex;justify-content:space-between;align-items:flex-start}
.brand{font-weight:800;font-size:17pt;line-height:1}.brand small{display:block;font-size:5.5pt;font-weight:400;margin-top:1mm}
.dt{font-weight:700;font-size:7.5pt}
.bc svg{display:block;width:84mm;height:9mm;margin:1mm auto 0}
.code{text-align:center;font-weight:700;font-size:9pt;margin-top:.8mm}
.band{flex:none;background:#000;color:#fff;height:11.5mm;line-height:11.5mm;text-align:center;font-weight:800;font-size:20pt;white-space:nowrap}
.bd{flex:none;display:flex;gap:2mm;padding:2.5mm 3mm}
.b{flex:1;text-align:center;font-weight:800;font-size:9.5pt;border:1pt solid #000;border-radius:1.2mm;padding:1.2mm 0}
.b.k{background:#000;color:#fff}
.rc{flex:1;padding:0 3mm;display:flex;flex-direction:column;justify-content:space-between;min-height:0}
.lab{font-weight:700;font-size:6.5pt;color:#595959}
.nm{font-weight:800;line-height:1.05;white-space:nowrap;overflow:hidden}
.tel{border:1.4pt solid #000;border-radius:1.5mm;padding:0 2.5mm;display:flex;justify-content:space-between;align-items:center;height:13.5mm}
.tel b{font-size:32pt;line-height:1;white-space:nowrap}.tel i{font-style:normal;font-weight:700;font-size:7pt;color:#595959}
.ad{font-weight:800;line-height:1.05;text-transform:uppercase;overflow:hidden;max-height:16mm}
.ar{font-weight:700;font-size:12pt}
.cash{flex:none;margin:0 3mm 2mm;border:1.6pt solid #000;border-radius:2mm;overflow:hidden}
.cash h4{background:#000;color:#fff;text-align:center;font-size:8.5pt;padding:1.3mm 0}
.cb{display:flex;align-items:center;padding:1.5mm 3mm;height:13mm}
.cb .a{width:40mm;font-size:7.5pt;border-right:.5pt solid #000;padding-right:2mm}
.cb .a div{display:flex;justify-content:space-between;margin:1mm 0}.cb .a b{font-size:8pt}
.cb .t{flex:1;text-align:right}.cb .t span{font-size:6.5pt;font-weight:700;display:block}.cb .t b{font-size:20pt;white-space:nowrap}
.bt{flex:none;border-top:.6pt solid #000;padding:2mm 3mm;height:21mm;position:relative}
.bt .pd{font-weight:800;font-size:11pt;max-width:70mm;max-height:9mm;overflow:hidden;line-height:1.1;margin:.5mm 0 1.5mm}
.bt .sd{font-size:8.5pt;line-height:1.25;max-width:70mm}
.qr{position:absolute;right:3mm;top:2.5mm;text-align:center;font-size:5.5pt;font-weight:700}.qr svg{display:block;width:16mm;height:16mm}
.ft{flex:none;border-top:.4pt solid #000;padding:1.2mm 3mm;font-size:5.3pt;line-height:1.35;height:8.5mm}
@media screen{body{background:#d9d9d9}.l{margin:8mm auto;background:#fff;box-shadow:0 1px 6px #0004}}
@media print{body{background:#fff}}
`;

export function render(d) {
  const barcode = svg({ bcid: "code128", text: d.code, height: 12, includetext: false });
  const qr = svg({ bcid: "qrcode", text: d.storeUrl, eclevel: "M" });
  const addr = d.address || "";
  const badges = [
    d.fragile && `<div class="b k">FRAGILE</div>`,
    `<div class="b">OUVRIR COLIS : ${d.openParcel ? "OUI" : "NON"}</div>`,
    d.exchange && `<div class="b">ÉCHANGE</div>`,
  ].filter(Boolean).join("");
  const sender = [d.sender.name && d.sender.phone ? `${d.sender.name} · ${d.sender.phone}` : d.sender.name || d.sender.phone, d.sender.address]
    .filter(Boolean).map(esc).join("<br>");
  return `<section class="l"><div class="in">
  <div class="hd"><div class="r"><div class="brand">${esc(d.sender.name || "COLIS")}<small>BON DE LIVRAISON</small></div><div class="dt">${esc(d.date)}</div></div>
    <div class="bc">${barcode}</div><div class="code">${esc(d.code)}</div></div>
  <div class="band">${esc(d.origin)}${d.origin ? "  &gt;  " : ""}${esc(d.dest)}</div>
  <div class="bd">${badges}</div>
  <div class="rc">
    <div><div class="lab">DESTINATAIRE</div><div class="nm" dir="auto" style="font-size:${fit(d.name, 21, 90)}pt">${esc(d.name.toUpperCase())}</div></div>
    <div class="tel"><i>TEL</i><b style="font-size:${fit(d.phone, 32, 72, 0.58)}pt">${esc(d.phone)}</b></div>
    <div><div class="ad" dir="auto" style="font-size:${fit(addr, 18, 170)}pt">${esc(addr)}</div><div class="ar" dir="auto">${esc(d.area)}</div></div>
  </div>
  <div class="cash"><h4>${d.prepaid ? "PAYÉ D'AVANCE" : "À ENCAISSER · ESPÈCES"}</h4>
    <div class="cb"><div class="a"><div>Montant TTC <b>${esc(d.subtotal)}</b></div><div>Livraison <b>${esc(d.delivery)}</b></div></div>
    <div class="t"><span>TOTAL À PAYER</span><b style="font-size:${fit(d.total, 20, 41, 0.6)}pt">${esc(d.total)}</b></div></div></div>
  <div class="bt"><div class="lab">PRODUIT</div><div class="pd" dir="auto">${esc(d.product)}</div><div class="lab">EXPÉDITEUR</div><div class="sd">${sender}</div>
    <div class="qr">${qr}VOTRE AVIS</div></div>
  <div class="ft">Le transporteur n'intervient pas dans la vente. L'expéditeur accepte les CGV du transporteur.<br>Commande #${esc(d.reference)}</div>
  </div></section>`;
}
