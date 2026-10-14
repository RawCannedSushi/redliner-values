const ONLINE_WINDOW_SECONDS = 120;
const RETENTION_SECONDS = 30 * 60;

export async function recordPresence(db, id, now = Date.now()) {
  const lastSeen = Math.floor(now / 1000);
  await db
    .prepare(
      "INSERT INTO online_visitors (id, last_seen) VALUES (?, ?) " +
        "ON CONFLICT(id) DO UPDATE SET last_seen = excluded.last_seen " +
        "WHERE online_visitors.last_seen < excluded.last_seen - 30",
    )
    .bind(id, lastSeen)
    .run();
  const result = await db
    .prepare(
      "SELECT COUNT(*) AS count FROM online_visitors WHERE last_seen >= ?",
    )
    .bind(lastSeen - ONLINE_WINDOW_SECONDS)
    .first();
  return { count: Number(result?.count || 0) };
}

export async function prunePresence(db, now = Date.now()) {
  await db
    .prepare("DELETE FROM online_visitors WHERE last_seen < ?")
    .bind(Math.floor(now / 1000) - RETENTION_SECONDS)
    .run();
}
