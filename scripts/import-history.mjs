import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { changesBetween, localDate } from "../src/history.js";

export function historyImportSql(history) {
  if (
    !history ||
    !Array.isArray(history.catalog) ||
    !Array.isArray(history.dates)
  )
    throw new Error("Expected an Apps Script getValueHistory export.");
  if (
    !history.catalog.every(
      (key) => typeof key === "string" && key.includes("\u001f"),
    ) ||
    new Set(history.catalog).size !== history.catalog.length
  )
    throw new Error("Invalid skin catalog.");
  const snapshots = history.dates
    .map((entry) => {
      if (
        !Array.isArray(entry) ||
        typeof entry[0] !== "string" ||
        !Array.isArray(entry[1])
      )
        throw new Error("Invalid history entry.");
      const timestamp = new Date(
        entry[0].length === 10 ? entry[0] + "T12:00:00Z" : entry[0],
      ).toISOString();
      if (Date.parse(timestamp) > Date.now() + 300000)
        throw new Error("Export contains future dates.");
      const values = {};
      for (const point of entry[1]) {
        if (!Array.isArray(point)) throw new Error("Invalid history point.");
        const [index, value] = point;
        if (
          !Number.isInteger(index) ||
          index < 0 ||
          index >= history.catalog.length ||
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0
        )
          throw new Error("Invalid skin index or value.");
        values[history.catalog[index]] = value;
      }
      return { timestamp, values };
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  if (
    new Set(snapshots.map((entry) => entry.timestamp)).size !== snapshots.length
  )
    throw new Error("Export contains duplicate timestamps.");
  const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
  let previous = {};
  let previousDay;
  const statements = [];
  for (const { timestamp, values } of snapshots) {
    const day = localDate(timestamp);
    const kind = day === previousDay ? "change" : "baseline";
    const event =
      kind === "baseline" ? values : changesBetween(previous, values);
    if (kind === "baseline" || Object.keys(event).length) {
      statements.push(
        `INSERT OR IGNORE INTO history_events (recorded_at, kind, values_json) VALUES (${quote(timestamp)}, ${quote(kind)}, ${quote(JSON.stringify(event))});`,
      );
    }
    previous = values;
    previousDay = day;
  }
  return statements.join("\n") + "\n";
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const file = process.argv[2];
  if (!file)
    throw new Error(
      "Usage: node scripts/import-history.mjs backups/redliner-history.json",
    );
  const sql = historyImportSql(JSON.parse(await readFile(file, "utf8")));
  await mkdir(new URL("../backups/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../backups/history-import.sql", import.meta.url),
    sql,
  );
  console.log(
    "Created backups/history-import.sql. Review it, then follow the history import steps in DEPLOY.md. No remote database was modified.",
  );
}
