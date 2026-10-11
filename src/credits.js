import { fetchSheetValues } from "./sheet.js";

const cell = (row, index) => String(row?.[index] ?? "").trim();

export function parseCreditsResponse(body) {
  const data = JSON.parse(body);
  if (!Array.isArray(data.values))
    throw new Error("The credits sheet returned an unexpected response.");
  const rows = data.values;
  const headerIndex = rows.findIndex(
    (row) =>
      Array.isArray(row) && row.some((value) => String(value ?? "").trim()),
  );
  if (headerIndex < 0) throw new Error("The credits headings were not found.");

  const groups = rows[headerIndex]
    .map((_, index) => ({
      role: cell(rows[headerIndex], index),
      members: rows
        .slice(headerIndex + 1)
        .map((row) => cell(row, index))
        .filter(Boolean),
    }))
    .filter((group) => group.role);
  return { groups };
}

export async function fetchCredits(env) {
  return parseCreditsResponse(
    await fetchSheetValues(env, "'Credits'!A:Z", "FORMATTED_VALUE"),
  );
}
