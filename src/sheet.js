const RESPONSE_PATTERN =
  /google\.visualization\.Query\.setResponse\((\{[\s\S]*\})\);?\s*$/;

export function parseSheetResponse(body) {
  const match = body.match(RESPONSE_PATTERN);
  if (!match) throw new Error("The sheet returned an unexpected response.");

  const response = JSON.parse(match[1]);
  if (response.status !== "ok" || !Array.isArray(response.table?.rows)) {
    throw new Error("The skin list is unavailable.");
  }

  const skins = response.table.rows
    .map((row, index) => {
      const cells = (row.c || []).map((cell) => {
        if (!cell || cell.v == null) return "";
        const value =
          typeof cell.v === "number"
            ? cell.v
            : cell.f !== undefined
              ? cell.f
              : cell.v;
        return String(value).trim();
      });

      return {
        id: index,
        rarity: cells[0] || "",
        collection: cells[1] || "",
        weapon: cells[2] || "",
        name: cells[3] || "",
        value: cells[4] || "",
        demand: cells[5] || "",
        trend: cells[6] || "",
      };
    })
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

export async function fetchSkins(sheetUrl) {
  const response = await fetch(sheetUrl, {
    headers: { "User-Agent": "archives-redliner-values/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`The value sheet returned HTTP ${response.status}.`);
  }
  return parseSheetResponse(await response.text());
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
