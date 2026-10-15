# Converty label printer (MVP)

Prints Converty orders as 100×150 mm labels. Layouts are plug-in templates (`lib/templates/`).

## Setup
1. Converty dashboard → Integrations → Custom apps → New app (store owner only).
   Redirect URI: `http://localhost:3000/api/auth/callback` (add your production URL too).
   Scopes: `read-orders read-stores read-hooks create-hooks`.
2. `cp .env.example .env` and fill `CONVERTY_CLIENT_ID` / `CONVERTY_CLIENT_SECRET`.
3. `npm install && npm run dev`, open http://localhost:3000, click **Connect Converty**.
4. Tick orders → **Print**. In the browser print dialog choose the thermal printer, paper 100×150 mm, margins none.

## Notes
- `GET /orders` is limited to 20 calls/hour/store. Orders are cached in `data/orders.json`;
  webhooks (`order.create`, `order.update`) keep the cache fresh once `APP_URL` is public.
- Tokens and cache are stored in `./data` (needs a writable disk: VPS/Docker, not Vercel). Swap `lib/store.js` for a DB later.
- New layout: add `lib/templates/<name>.js` exporting `css` and `render(label)`, register it in `lib/templates/index.js`.
- Order → label field mapping lives in `lib/label.js`.
