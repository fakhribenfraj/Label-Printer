import { NextResponse } from "next/server";
import { exchangeCode, subscribeHooks, syncOrders, getStore } from "../../../../lib/converty.js";

const home = (req, error) => {
  const url = new URL("/", process.env.APP_URL || req.url);
  if (error) url.searchParams.set("auth_error", error.slice(0, 300));
  return NextResponse.redirect(url);
};

export async function GET(req) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!code || state !== req.cookies.get("oauth_state")?.value)
    return NextResponse.json({ error: "Invalid OAuth state or missing code" }, { status: 400 });
  try {
    await exchangeCode(code);
    await getStore();
    await subscribeHooks();
    try { await syncOrders(); } catch (e) { console.error("initial sync", e.message); }
  } catch (e) {
    // Authorization codes are single-use: never let a failure turn into a raw 500
    // the user might refresh (that burns the code and hides the real error).
    console.error("oauth callback failed:", e);
    return home(req, e.message);
  }
  return home(req);
}
