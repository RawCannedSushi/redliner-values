import { fetchSheetValues } from "./sheet.js";

const separator = /^-{4,}$/;
const cell = (row, index) => String(row?.[index] ?? "").trim();

function separateHeading(text) {
  const [heading, ...body] = text.split("\n");
  return { heading: heading.trim(), body: body.join("\n").trim() };
}

export function parseScamListResponse(body) {
  const data = JSON.parse(body);
  if (!Array.isArray(data.values))
    throw new Error("The scam list returned an unexpected response.");
  const rows = data.values;
  const headerIndex = rows.findIndex(
    (row) =>
      cell(row, 0).toLowerCase() === "infraction" &&
      [1, 2, 3].some((index) => cell(row, index)),
  );
  if (headerIndex < 0)
    throw new Error("The scam list headings were not found.");

  const introduction = rows
    .slice(0, headerIndex)
    .map((row) => cell(row, 1))
    .filter((text) => text && !separator.test(text));
  const guideIndex = introduction.findIndex((text) =>
    /^understanding\b/i.test(text),
  );
  const disclaimerIndex = introduction.findIndex((text) =>
    /^disclaimer\b/i.test(text),
  );
  const entries = [];
  for (const row of rows.slice(headerIndex + 1)) {
    const values = [0, 1, 2, 3].map((index) => cell(row, index));
    if (!values.some(Boolean) || separator.test(values[0])) continue;
    if (values[0]) {
      entries.push({
        infraction: values[0],
        accounts: values[1] ? [values[1]] : [],
        context: values[2] ? [values[2]] : [],
        notes: values[3] ? [values[3]] : [],
      });
    } else if (entries.length) {
      const entry = entries.at(-1);
      if (values[1]) entry.accounts.push(values[1]);
      if (values[2]) entry.context.push(values[2]);
      if (values[3]) entry.notes.push(values[3]);
    }
  }

  const report = introduction.find((text) => /to report\b/i.test(text)) || "";
  const invite = report.match(/discord\.gg\/[A-Za-z0-9]+/i)?.[0];
  return {
    title: introduction[0] || "Scam List",
    report,
    reportUrl: invite ? `https://${invite}` : "",
    guideTitle: guideIndex < 0 ? "" : introduction[guideIndex],
    definitions:
      guideIndex < 0
        ? []
        : introduction
            .slice(
              guideIndex + 1,
              disclaimerIndex < 0 ? undefined : disclaimerIndex,
            )
            .map(separateHeading),
    disclaimer:
      disclaimerIndex < 0
        ? null
        : separateHeading(introduction[disclaimerIndex]),
    headings: [0, 1, 2, 3].map((index) => cell(rows[headerIndex], index)),
    entries,
  };
}

export async function fetchScamList(env) {
  return parseScamListResponse(
    await fetchSheetValues(env, "'Scam List'!A:D", "FORMATTED_VALUE"),
  );
}
