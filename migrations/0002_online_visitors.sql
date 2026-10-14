CREATE TABLE online_visitors (
  id TEXT PRIMARY KEY,
  last_seen INTEGER NOT NULL
);

CREATE INDEX online_visitors_last_seen ON online_visitors (last_seen);
