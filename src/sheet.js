import { googleAccessToken } from "./google-auth.js";

function skinsFromRows(rows) {
  const skins = rows
    .map((cells) => ({
      rarity: String(cells[0] ?? "").trim(),
      collection: String(cells[1] ?? "").trim(),
      weapon: String(cells[2] ?? "").trim(),
      name: String(cells[3] ?? "").trim(),
      value: String(cells[4] ?? "").trim(),
      demand: String(cells[5] ?? "").trim(),
      trend: String(cells[6] ?? "").trim(),
    }))
    .filter(
      (skin) =>
        skin.name &&
        skin.rarity &&
        skin.rarity.toLowerCase() !== "exclusive" &&
        !(
          skin.weapon.toLowerCase() === "castigate" &&
          skin.name.toLowerCase() === "golden eagle"
        ),
    )
    .map((skin, id) => ({ id, ...skin }));

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

export function parseSheetsApiResponse(body) {
  const data = JSON.parse(body);
  if (!Array.isArray(data.values))
    throw new Error("The private value sheet returned an unexpected response.");
  return skinsFromRows(data.values);
}

export async function fetchSheetValues(env, range, valueRenderOption) {
  const sheetId = env.SHEET_ID;
  if (!/^[\w-]+$/.test(sheetId || ""))
    throw new Error("The value sheet ID is not configured.");
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON)
    throw new Error("The Google service account is not configured.");
  const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueRenderOption=${valueRenderOption}`;
  const response = await fetch(sheetUrl, {
    headers: {
      Authorization: `Bearer ${await googleAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON)}`,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`The value sheet returned HTTP ${response.status}.`);
  }
  return response.text();
}

export async function fetchSkins(env) {
  return parseSheetsApiResponse(
    await fetchSheetValues(env, "'Main Skins'!A2:G", "UNFORMATTED_VALUE"),
  );
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
