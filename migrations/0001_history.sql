CREATE TABLE latest_snapshot (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  recorded_at TEXT NOT NULL,
  day TEXT NOT NULL,
  values_json TEXT NOT NULL
);

CREATE TABLE history_events (
  recorded_at TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('baseline', 'change')),
  values_json TEXT NOT NULL
);

CREATE INDEX history_baselines ON history_events (kind, recorded_at);
