import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";

const input = createInterface({ input: process.stdin, output: process.stdout });
try {
  const databaseId = (
    await input.question("Paste your Cloudflare D1 database ID (UUID): ")
  ).trim();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      databaseId,
    )
  )
    throw new Error("That is not a database UUID. Nothing was changed.");
  const repository = (
    await input.question("Paste your public GitHub repository URL: ")
  )
    .trim()
    .replace(/\/$/, "");
  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(repository))
    throw new Error(
      "Use a URL like https://github.com/yourname/redliner-values. Nothing was changed.",
    );
  const configPath = new URL("../wrangler.jsonc", import.meta.url);
  const config = JSON.parse(await readFile(configPath, "utf8"));
  config.d1_databases[0].database_id = databaseId;
  const settingsPath = new URL("../public/settings.js", import.meta.url);
  const settings = (await readFile(settingsPath, "utf8")).replace(
    /export const SOURCE_REPOSITORY = .*?;/,
    `export const SOURCE_REPOSITORY = ${JSON.stringify(repository)};`,
  );
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
  await writeFile(settingsPath, settings);
  console.log(
    "Saved the database ID and public source link. Neither is a secret.",
  );
} finally {
  input.close();
}
