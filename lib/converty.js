import { load, save } from "./store.js";

const PARTNER = "https://partner.converty.shop"; // /oauth2/*
const API = "https://api.converty.shop"; // /api/v1/*
export const SCOPES = "read-orders read-stores read-hooks create-hooks";
export const redirectUri = () => `${process.env.APP_URL}/api/auth/callback`;

export function authorizeUrl(state) {
  const q = new URLSearchParams({
    response_type: "code",
    client_id: process.env.CONVERTY_CLIENT_ID,
    redirect_uri: redirectUri(),
    scope: SCOPES,
    state,
  });
  return `${PARTNER}/oauth2/authorize?${q}`;
}

async function tokenCall(body) {
  const r = await fetch(`${PARTNER}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.CONVERTY_CLIENT_ID,
      client_secret: process.env.CONVERTY_CLIENT_SECRET,
      ...body,
    }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return r.json();
}

export async function exchangeCode(code) {
  // RFC 6749 §4.1.3: redirect_uri must be echoed exactly as sent to /authorize,
  // otherwise the server treats the code as invalid.
  const t = await tokenCall({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
  });
  await save("tokens", { ...t, obtainedAt: Date.now() });
}

async function refresh(old) {
  const t = await tokenCall({
    grant_type: "refresh_token",
    refresh_token: old.refresh_token,
  });
  // the refresh token stays the same; keep the stored one
  const next = {
    ...old,
    ...t,
    refresh_token: old.refresh_token,
    obtainedAt: Date.now(),
  };
  await save("tokens", next);
  return next;
}

export const isConnected = async () => !!(await load("tokens", null));

export async function api(path, init = {}) {
  let tokens = await load("tokens", null);
  if (!tokens) throw new Error("Not connected to Converty");
  const expiresAt = tokens.obtainedAt + (tokens.expires_in || 0) * 1000;
  if (Date.now() > expiresAt - 3600_000) tokens = await refresh(tokens);

  const call = (t) =>
    fetch(API + path, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${t.access_token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  let r = await call(tokens);
  if (r.status === 401) r = await call(await refresh(tokens));
  if (!r.ok) throw new Error(`${path} -> ${r.status}: ${await r.text()}`);
  return r.json();
}

export const getStore = async () => {
  const cached = await load("store", null);
  if (cached) return cached;
  const { data } = await api("/api/v1/stores/me");
  await save("store", data);
  return data;
};

// GET /orders is limited to 20 calls/hour/store: fetch big pages, cache on disk,
// and keep the cache fresh through the order.create / order.update webhooks.
export async function syncOrders(maxPages = 5) {
  const byId = await load("orders", {});
  let page = 1,
    total = Infinity;
  while (page <= maxPages && (page - 1) * 200 < total) {
    const res = await api(
      `/api/v1/orders?page=${page}&limit=200&status=uploaded`,
    );
    total = res.count;
    for (const o of res.data) byId[o._id] = o;
    page++;
  }
  await save("orders", byId);
  await save("meta", { syncedAt: Date.now() });
  return Object.keys(byId).length;
}

export async function upsertOrder(order) {
  const byId = await load("orders", {});
  byId[order._id] = order;
  await save("orders", byId);
}

// Fresh copy for printing (60 req/min). Unpaid orders are not returned individually -> fall back to cache.
export async function freshOrder(id, cached) {
  try {
    return (await api(`/api/v1/orders/${id}`)).data;
  } catch {
    return cached;
  }
}

export async function subscribeHooks() {
  const base = process.env.APP_URL;
  if (!base || base.includes("localhost")) return; // webhooks need a public URL
  for (const event of ["order.create", "order.update"]) {
    try {
      await api("/api/v1/hooks/subscribe", {
        method: "POST",
        body: JSON.stringify({ targetUrl: `${base}/api/webhooks`, event }),
      });
    } catch (e) {
      console.error("subscribe", event, e.message);
    }
  }
}
