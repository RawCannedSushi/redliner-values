import { pricedSkinState } from "./sheet.js";

const DAY_MS = 86_400_000;
const HISTORY_ZONE = "America/Detroit";
const PAGE_SIZE = 1000;

export function localDate(timestamp, timeZone = HISTORY_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const part = (type) => parts.find((value) => value.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function changesBetween(previous, current) {
  const changes = {};
  for (const key of Object.keys(previous)) {
    if (!Object.hasOwn(current, key)) changes[key] = null;
  }
  for (const [key, value] of Object.entries(current)) {
    if (!Object.hasOwn(previous, key) || previous[key] !== value)
      changes[key] = value;
  }
  return changes;
}

export function retentionCutoff(now, days = 730) {
  return new Date(new Date(now).getTime() - days * DAY_MS).toISOString();
}

export async function recordSnapshot(database, skins, now = new Date()) {
  const current = pricedSkinState(skins);
  const timestamp = now.toISOString();
  const day = localDate(now);

  for (let attempt = 0; attempt < 3; attempt++) {
    const previous = await database
      .prepare("SELECT * FROM latest_snapshot WHERE id = 1")
      .first();
    if (previous && timestamp <= previous.recorded_at) return false;
    const kind = !previous || previous.day !== day ? "baseline" : "change";
    const values =
      kind === "baseline"
        ? current
        : changesBetween(JSON.parse(previous.values_json), current);
    const hasEvent = kind === "baseline" || Object.keys(values).length > 0;
    const expected = previous?.recorded_at || "";
    const guard =
      "COALESCE((SELECT recorded_at FROM latest_snapshot WHERE id = 1), '') = ?";
    const statements = [];

    // D1 batches are transactions. The guard prevents a concurrent poll from
    // applying a delta computed from a stale latest-state row.
    if (hasEvent)
      statements.push(
        database
          .prepare(
            `INSERT INTO history_events (recorded_at, kind, values_json) SELECT ?, ?, ? WHERE ${guard}`,
          )
          .bind(timestamp, kind, JSON.stringify(values), expected),
      );
    statements.push(
      database
        .prepare(
          `INSERT INTO latest_snapshot (id, recorded_at, day, values_json) SELECT 1, ?, ?, ? WHERE ${guard}
       ON CONFLICT(id) DO UPDATE SET recorded_at = excluded.recorded_at, day = excluded.day, values_json = excluded.values_json`,
        )
        .bind(timestamp, day, JSON.stringify(current), expected),
    );
    const result = await database.batch(statements);
    if (!result.at(-1).meta.changes) continue;

    if (kind === "baseline") {
      // Keep the baseline preceding the cutoff so surviving deltas remain readable.
      await database
        .prepare(
          `DELETE FROM history_events WHERE recorded_at < (
          SELECT MAX(recorded_at) FROM history_events WHERE kind = 'baseline' AND recorded_at <= ?
        )`,
        )
        .bind(retentionCutoff(now))
        .run();
    }
    return hasEvent;
  }
  throw new Error(
    "History changed during all three save attempts; retry next poll.",
  );
}

export async function getHistoryPage(database, { range = "7", until, after }) {
  let start = "";
  if (!after && range !== "all") {
    const cutoff = retentionCutoff(until, Number(range));
    const baseline = await database
      .prepare(
        "SELECT recorded_at FROM history_events WHERE kind = 'baseline' AND recorded_at <= ? ORDER BY recorded_at DESC LIMIT 1",
      )
      .bind(cutoff)
      .first();
    start = baseline?.recorded_at || "";
  }
  const comparison = after ? ">" : ">=";
  const { results } = await database
    .prepare(
      `SELECT recorded_at, kind, values_json FROM history_events
     WHERE recorded_at ${comparison} ? AND recorded_at <= ? ORDER BY recorded_at LIMIT ?`,
    )
    .bind(after || start, until, PAGE_SIZE + 1)
    .all();
  const page = results.slice(0, PAGE_SIZE);
  return {
    until,
    events: page.map((event) => [
      event.recorded_at,
      event.kind,
      JSON.parse(event.values_json),
    ]),
    after: results.length > PAGE_SIZE ? page.at(-1).recorded_at : null,
  };
}
