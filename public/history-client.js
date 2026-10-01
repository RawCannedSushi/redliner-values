// Replay compact events in the browser so the Worker never expands an entire
// archive into a large response. Limit plotted points, not stored history.
export function chartHistory(events, range, until, limit = 400) {
  const cutoff =
    range === "all" ? -Infinity : Date.parse(until) - Number(range) * 86400000;
  const visible = events.flatMap((event, index) =>
    Date.parse(event[0]) >= cutoff ? [index] : [],
  );
  const count = Math.min(limit, visible.length);
  const plotted = new Set(
    Array.from(
      { length: count },
      (_, i) =>
        visible[
          count === 1 ? 0 : Math.round((i * (visible.length - 1)) / (count - 1))
        ],
    ),
  );
  const catalog = [];
  const indexes = new Map();
  let current = new Map();
  const dates = [];
  events.forEach(([timestamp, kind, values], eventIndex) => {
    if (kind === "baseline") current = new Map();
    for (const [identity, value] of Object.entries(values)) {
      if (!indexes.has(identity)) {
        indexes.set(identity, catalog.length);
        catalog.push(identity);
      }
      const index = indexes.get(identity);
      if (value === null) current.delete(index);
      else current.set(index, value);
    }
    if (plotted.has(eventIndex)) dates.push([timestamp, Array.from(current)]);
  });
  return { catalog, dates, totalPoints: visible.length };
}
