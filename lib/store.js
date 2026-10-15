import fs from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";

// Vercel functions have a read-only filesystem (only /tmp is writable), so when the
// Upstash integration is present we keep state in Redis; local dev keeps the JSON
// files in ./data. Same load/save interface either way.
const dir = path.join(process.cwd(), "data");
const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL);
let kv = null;
const redis = () => (kv ??= Redis.fromEnv());

export async function load(name, fallback) {
  if (useRedis) {
    try {
      return (await redis().get(name)) ?? fallback;
    } catch (e) {
      console.error(`load ${name} failed:`, e.message);
      return fallback;
    }
  }
  try {
    return JSON.parse(await fs.readFile(path.join(dir, name + ".json"), "utf8"));
  } catch {
    return fallback;
  }
}

export async function save(name, value) {
  if (useRedis) {
    await redis().set(name, value);
    return;
  }
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name + ".json"), JSON.stringify(value));
  } catch (e) {
    console.error(
      `save ${name} failed (${e.code ?? e.message}): ./data is read-only on Vercel — ` +
      "install the Upstash integration so UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set"
    );
    throw e;
  }
}
