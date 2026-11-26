import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
export const commonsRoot = path.resolve(
  process.env.INATOR_COMMONS_ROOT || path.join(projectRoot, "..", "inator"),
);
export const labRoot = path.join(commonsRoot, "tools", "adversary-lab");
export async function sharedTool(relative) {
  const target = path.join(commonsRoot, relative);
  try {
    await access(target);
  } catch {
    throw Error(
      "Commons quality tools are unavailable. Set INATOR_COMMONS_ROOT to an installed Commons checkout.",
    );
  }
  return target;
}
export async function toolManifest() {
  return JSON.parse(await readFile(path.join(labRoot, "package.json"), "utf8"));
}
