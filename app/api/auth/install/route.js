import { NextResponse } from "next/server";
import crypto from "crypto";
import { authorizeUrl } from "../../../../lib/converty.js";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authorizeUrl(state));
  res.cookies.set("oauth_state", state, { httpOnly: true, maxAge: 600, path: "/" });
  return res;
}
