import { execFileSync } from "node:child_process";
import { readdir, writeFile } from "node:fs/promises";

const photoFiles = (
  await readdir(new URL("../public/skin-photos/", import.meta.url))
)
  .filter((file) => file.endsWith(".png") && file !== "unknown.png")
  .sort();
await writeFile(
  new URL("../public/skin-photo-manifest.js", import.meta.url),
  "// Generated from public/skin-photos by scripts/build.mjs.\n" +
    "export const SKIN_PHOTO_FILES = [\n" +
    photoFiles.map((file) => `  ${JSON.stringify(file)},`).join("\n") +
    "\n];\n",
);

let commit = process.env.GITHUB_SHA || "local";
if (commit === "local") {
  try {
    commit = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {}
}
await writeFile(
  new URL("../public/build-info.json", import.meta.url),
  JSON.stringify({ commit }) + "\n",
);
