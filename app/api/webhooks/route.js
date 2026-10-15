import crypto from "crypto";
import { upsertOrder } from "../../../lib/converty.js";

export async function POST(req) {
  const raw = await req.text();
  const expected = crypto.createHmac("sha256", process.env.CONVERTY_CLIENT_SECRET).update(raw).digest("base64");
  const got = req.headers.get("x-converty-signature") || "";
  const ok = expected.length === got.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got));
  if (!ok) return new Response("bad signature", { status: 401 });
  const { event, data } = JSON.parse(raw);
  if (event?.startsWith("order.") && data?._id) await upsertOrder(data);
  return new Response("ok");
}
