import fs from "fs/promises";
import path from "path";
const dir = path.join(process.cwd(), "data");
export async function load(name, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(dir, name + ".json"), "utf8")); }
  catch { return fallback; }
}
export async function save(name, value) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name + ".json"), JSON.stringify(value));
}
