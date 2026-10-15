import { NextResponse } from "next/server";
import { exchangeCode, subscribeHooks, syncOrders, getStore } from "../../../../lib/converty.js";

export async function GET(req) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!code || state !== req.cookies.get("oauth_state")?.value)
    return NextResponse.json({ error: "Invalid OAuth state or missing code" }, { status: 400 });
  await exchangeCode(code);
  await getStore();
  await subscribeHooks();
  try { await syncOrders(); } catch (e) { console.error("initial sync", e.message); }
  return NextResponse.redirect(new URL("/", process.env.APP_URL));
}
