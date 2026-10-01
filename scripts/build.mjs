import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

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
