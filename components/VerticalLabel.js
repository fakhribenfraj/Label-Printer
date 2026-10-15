import { Fragment } from "react";
import bwip from "bwip-js";

// rough text-fit: font size (pt) so `text` fits in `mm` on one line
const fit = (text, max, mm, k = 0.62) =>
  Math.max(
    6,
    Math.min(max, mm / (Math.max(1, String(text ?? "").length) * k * 0.3528)),
  );

const svg = (opts) =>
  bwip.toSVG(opts).replace("<svg ", '<svg preserveAspectRatio="none" ');

/* ── Label sections — edit freely; print styles live in app/print/vertical.css ── */

const Barcode = ({ code }) => (
  <div className="barcode">
    <div
      className="bc"
      dangerouslySetInnerHTML={{
        __html: svg({
          bcid: "code128",
          text: code,
          height: 12,
          includetext: false,
        }),
      }}
    />
    <div className="code">{code}</div>
  </div>
);

function Header({ senderName, code }) {
  return (
    <div className="hd">
      <div className="r">
        <div className="brand">
          <img src="/companies/fasthull.svg" />
        </div>
        <Barcode code={code} />
      </div>
    </div>
  );
}

function RouteBand({ origin, dest }) {
  return (
    <div className="band">
      {origin}
      {origin ? "  >  " : ""}
      {dest}
    </div>
  );
}

function Badges({ fragile, openParcel, exchange }) {
  return (
    <div className="bd">
      {fragile && <div className="b k">FRAGILE</div>}
      <div className="b">OUVRIR COLIS : {openParcel ? "OUI" : "NON"}</div>
      {exchange && <div className="b">ÉCHANGE</div>}
    </div>
  );
}

function Recipient({ name, phone, address, area }) {
  const nm = String(name ?? "");
  const addr = String(address ?? "");
  return (
    <div className="rc">
      <div>
        <div className="lab">DESTINATAIRE</div>
        <div
          className="nm"
          dir="auto"
          style={{ fontSize: `${fit(nm, 19, 90)}pt` }}
        >
          {nm.toUpperCase()}
        </div>
      </div>
      <div className="tel">
        <b style={{ fontSize: `${fit(phone, 26, 72, 0.58)}pt` }}>{phone}</b>
      </div>
      <div>
        <div
          className="ad"
          dir="auto"
          style={{ fontSize: `${fit(addr, 14, 170)}pt` }}
        >
          {addr}
        </div>
        <div className="ar" dir="auto">
          {area}
        </div>
      </div>
    </div>
  );
}

function CashSection({ prepaid, subtotal, delivery, total }) {
  return (
    <div className="cash">
      <h4>{prepaid ? "PAYÉ D'AVANCE" : "À ENCAISSER · ESPÈCES"}</h4>
      <div className="cb">
        <div className="a">
          <div>
            Montant TTC <b>{subtotal}</b>
          </div>
          <div>
            Livraison <b>{delivery}</b>
          </div>
        </div>
        <div className="t">
          <span>TOTAL À PAYER</span>
          <b style={{ fontSize: `${fit(total, 20, 41, 0.6)}pt` }}>{total}</b>
        </div>
      </div>
    </div>
  );
}

function SenderLines({ name, phone, address, cin }) {
  const lines = [
    name && phone ? `${name} · ${phone}` : name || phone,
    address,
    cin,
  ].filter(Boolean);
  return (
    <div style={{ display: "flex", gap: "1mm" }}>
      {lines.map((line, i) => (
        <span key={i}>{line}</span>
      ))}
    </div>
  );
}

function ProductSection({ product, storeUrl }) {
  return (
    <div className="bt">
      <div className="lab">PRODUIT</div>
      <div className="pd" dir="auto">
        {product}
      </div>

      <div className="qr">
        <div
          dangerouslySetInnerHTML={{
            __html: svg({ bcid: "qrcode", text: storeUrl, eclevel: "M" }),
          }}
        />
        VOTRE AVIS
      </div>
    </div>
  );
}
function ExpediteurSection({ sender }) {
  return (
    <div className="sd">
      <div className="lab">EXPÉDITEUR</div>
      <SenderLines
        name={sender?.name}
        phone={sender?.phone || "50 388 377,"}
        address={sender?.address || "maamoura,"}
        cin={sender?.cin || "cin: 13028547"}
      />
    </div>
  );
}
function Footer({ reference }) {
  return (
    <div className="ft">
      Le transporteur n&#39;intervient pas dans la vente. L&#39;expéditeur
      accepte les CGV du transporteur.
      <br />
      Commande #{reference}
    </div>
  );
}

/**
 * Vertical 100×150 mm shipping label.
 * Props = LabelData produced by lib/label.js toLabel().
 */
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

export default function VerticalLabel(d) {
  return (
    <section className="l">
      <div className="in">
        <Header senderName={d.sender?.name} code={d.code} />
        <section class="dt">
          <span style={{ fontSize: "12pt", marginRight: "2mm" }}>
            Bon de livraison
          </span>
          <span>{esc(d.date)}</span>
        </section>
        <RouteBand origin={d.origin} dest={d.dest} />
        <Badges
          fragile={d.fragile}
          openParcel={d.openParcel}
          exchange={d.exchange}
        />
        <Recipient
          name={d.name}
          phone={d.phone}
          address={d.address}
          area={d.area}
        />
        <CashSection
          prepaid={d.prepaid}
          subtotal={d.subtotal}
          delivery={d.delivery}
          total={d.total}
        />
        <ProductSection product={d.product} storeUrl={d.storeUrl} />
        <ExpediteurSection sender={d.sender} />
        <Footer reference={d.reference} />
      </div>
    </section>
  );
}
