import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";

const input = createInterface({ input: process.stdin, output: process.stdout });
try {
  const clientId = (
    await input.question("Paste the Google OAuth web client ID: ")
  ).trim();
  if (!/^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(clientId))
    throw new Error(
      "That does not look like a Google OAuth web client ID. Nothing was changed.",
    );
  const settingsPath = new URL("../public/settings.js", import.meta.url);
  const original = await readFile(settingsPath, "utf8");
  const declaration =
    /export const GOOGLE_DRIVE_CLIENT_ID\s*=\s*"[^"\r\n]*"\s*;/g;
  if ([...original.matchAll(declaration)].length !== 1)
    throw new Error(
      "Could not find exactly one Google client ID setting. Nothing was changed.",
    );
  const settings = original.replace(
    declaration,
    `export const GOOGLE_DRIVE_CLIENT_ID = ${JSON.stringify(clientId)};`,
  );
  await writeFile(settingsPath, settings);
  console.log(
    "Saved the public Google OAuth client ID. No client secret is used by this website.",
  );
} finally {
  input.close();
}
