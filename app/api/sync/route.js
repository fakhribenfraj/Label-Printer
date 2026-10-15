import { NextResponse } from "next/server";
import { syncOrders } from "../../../lib/converty.js";

export async function POST() {
  try { return NextResponse.json({ count: await syncOrders() }); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
