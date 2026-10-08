export const rarityColors = {
  Classified: "#f46762",
  "Direct Classified": "#ee2e32",
  Exotic: "#db9c57",
  Elite: "#bd8be2",
  Rare: "#65a5e4",
  Uncommon: "#94ae90",
  Common: "#9ba3a9",
};

export const lightChartColors = {
  Classified: "#a62630",
  "Direct Classified": "#111315",
  Exotic: "#835826",
  Elite: "#704685",
  Rare: "#235a78",
  Uncommon: "#456346",
  Common: "#515c63",
};

const rarityGradients = {
  Classified: ["#ee2e32", "#5c1023"],
  "Direct Classified": ["#ee2e32", "#000000"],
};

export function rarityStops(rarity) {
  const solid = rarityColors[rarity] || "#7e858d";
  return rarityGradients[rarity] || [solid, solid];
}

export function rarityAccent(rarity, direction) {
  const stops = rarityGradients[rarity];
  return stops
    ? `linear-gradient(${direction}, ${stops[0]}, ${stops[1]})`
    : rarityColors[rarity] || "#7e858d";
}

export function applyRarityAccent(element, rarity, direction = "to right") {
  const hasGradient = Object.hasOwn(rarityGradients, rarity);
  const lightPaint = hasGradient
    ? rarityAccent(rarity, "to right")
    : lightChartColors[rarity] || "#343a40";
  const lightPaintVertical = hasGradient
    ? rarityAccent(rarity, "to bottom")
    : lightChartColors[rarity] || "#343a40";
  element.classList.add("skin-rarity-accent");
  element.classList.toggle("classified-gradient", rarity === "Classified");
  element.classList.toggle(
    "direct-classified-accent",
    rarity === "Direct Classified",
  );
  element.style.setProperty("--rarity", rarityAccent(rarity, direction));
  element.style.setProperty("--skin-paint-light", lightPaint);
  element.style.setProperty("--skin-paint-vertical-light", lightPaintVertical);
  element.style.setProperty(
    "--skin-paint-dark",
    rarityAccent(rarity, "to right"),
  );
  element.style.setProperty(
    "--skin-paint-vertical-dark",
    rarityAccent(rarity, "to bottom"),
  );
  element.style.setProperty(
    "--skin-ink-light",
    lightChartColors[rarity] || "#343a40",
  );
  element.style.setProperty(
    "--skin-ink-dark",
    rarity === "Direct Classified"
      ? "#f46762"
      : rarityColors[rarity] || "#bcc3ca",
  );
}
