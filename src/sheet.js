import { googleAccessToken } from "./google-auth.js";

const RESPONSE_PATTERN =
  /google\.visualization\.Query\.setResponse\((\{[\s\S]*\})\);?\s*$/;

function skinsFromRows(rows) {
  const skins = rows
    .map((cells, index) => ({
      id: index,
      rarity: String(cells[0] ?? "").trim(),
      collection: String(cells[1] ?? "").trim(),
      weapon: String(cells[2] ?? "").trim(),
      name: String(cells[3] ?? "").trim(),
      value: String(cells[4] ?? "").trim(),
      demand: String(cells[5] ?? "").trim(),
      trend: String(cells[6] ?? "").trim(),
    }))
    .filter((skin) => skin.name && skin.rarity);

  if (!skins.length) throw new Error("No skins were found in the sheet.");
  const identities = new Set();
  for (const skin of skins) {
    const identity = `${skin.weapon}\u001f${skin.name}`;
    if (identities.has(identity))
      throw new Error("Duplicate weapon/name in value sheet.");
    identities.add(identity);
  }
  return skins;
}

export function parseSheetResponse(body) {
  const match = body.match(RESPONSE_PATTERN);
  if (!match) throw new Error("The sheet returned an unexpected response.");

  const response = JSON.parse(match[1]);
  if (response.status !== "ok" || !Array.isArray(response.table?.rows)) {
    throw new Error("The skin list is unavailable.");
  }

  return skinsFromRows(
    response.table.rows.map((row) =>
      (row.c || []).map((cell) => {
        if (!cell || cell.v == null) return "";
        return typeof cell.v === "number"
          ? cell.v
          : cell.f !== undefined
            ? cell.f
            : cell.v;
      }),
    ),
  );
}

export function parseSheetsApiResponse(body) {
  const data = JSON.parse(body);
  if (!Array.isArray(data.values))
    throw new Error("The private value sheet returned an unexpected response.");
  return skinsFromRows(data.values);
}

export async function fetchSkins(env) {
  const sheetId = env.SHEET_ID;
  if (!/^[\w-]+$/.test(sheetId || ""))
    throw new Error("The value sheet ID is not configured.");
  const privateSheet = Boolean(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const range = encodeURIComponent("'Main Skins'!A2:G");
  const sheetUrl = privateSheet
    ? `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`
    : `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Main%20Skins`;
  const headers = privateSheet
    ? {
        Authorization: `Bearer ${await googleAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON)}`,
      }
    : {};
  const response = await fetch(sheetUrl, {
    headers,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`The value sheet returned HTTP ${response.status}.`);
  }
  const body = await response.text();
  return privateSheet ? parseSheetsApiResponse(body) : parseSheetResponse(body);
}

export function pricedSkinState(skins) {
  return Object.fromEntries(
    skins.flatMap((skin) => {
      const raw = String(skin.value ?? "")
        .trim()
        .replaceAll(",", "");
      if (!/^\d+(?:\.\d+)?$/.test(raw)) return [];
      if (!Number.isFinite(Number(raw)))
        throw new Error("A sheet value is too large.");
      return [[`${skin.weapon}\u001f${skin.name}`, Number(raw)]];
    }),
  );
}
