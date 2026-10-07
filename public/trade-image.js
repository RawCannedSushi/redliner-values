import { rarityStops } from "./rarity-theme.js";

const format = new Intl.NumberFormat("en-US");
const WIDTH = 1920;
const MARGIN = 64;
const GAP = 28;
const PANEL_WIDTH = (WIDTH - MARGIN * 2 - GAP) / 2;
const PANEL_TOP = 276;
const CARDS_TOP = 382;
const CARD_GAP = 14;
const CARD_WIDTH = (PANEL_WIDTH - 36 - CARD_GAP) / 2;
const CARD_HEIGHT = 145;

function fittedText(ctx, value, x, y, maxWidth, size, minSize = 16) {
  const text = String(value);
  let fontSize = size;
  do {
    ctx.font = `700 ${fontSize}px "Archivo Narrow", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      ctx.fillText(text, x, y);
      return;
    }
    fontSize -= 1;
  } while (fontSize >= minSize);
  ctx.font = `700 ${minSize}px "Archivo Narrow", Arial, sans-serif`;
  let clipped = text;
  while (clipped && ctx.measureText(clipped + "…").width > maxWidth)
    clipped = clipped.slice(0, -1);
  ctx.fillText(clipped + "…", x, y);
}

function loadPhoto(url) {
  return new Promise((resolve) => {
    const image = new Image();
    const timeout = setTimeout(() => resolve(null), 8000);
    image.onload = () => {
      clearTimeout(timeout);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    image.src = url;
  });
}

function drawPhoto(ctx, image, x, y, width, height) {
  ctx.fillStyle = "#111316";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#3d4347";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  if (!image?.naturalWidth || !image?.naturalHeight) return;
  const scale = Math.min(
    (width - 10) / image.naturalWidth,
    (height - 10) / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawCard(ctx, { skin, qty }, photo, x, y) {
  ctx.fillStyle = "#212529";
  ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);
  ctx.strokeStyle = "#4a5155";
  ctx.strokeRect(x + 0.5, y + 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1);
  const [start, end] = rarityStops(skin.rarity);
  const accent = ctx.createLinearGradient(x, y, x + CARD_WIDTH, y);
  accent.addColorStop(0, start);
  accent.addColorStop(1, end);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, CARD_WIDTH, 4);

  drawPhoto(ctx, photo, x + 12, y + 19, 115, 107);
  const textX = x + 142;
  ctx.fillStyle = "#f2f0e9";
  fittedText(ctx, skin.name, textX, y + 43, CARD_WIDTH - 238, 26);
  ctx.fillStyle = "#30363a";
  ctx.fillRect(x + CARD_WIDTH - 88, y + 16, 72, 40);
  ctx.strokeStyle = "#687073";
  ctx.strokeRect(x + CARD_WIDTH - 87.5, y + 16.5, 71, 39);
  ctx.fillStyle = "#f2f0e9";
  ctx.textAlign = "center";
  fittedText(ctx, `×${qty}`, x + CARD_WIDTH - 52, y + 45, 62, 30, 22);
  ctx.textAlign = "left";
  ctx.fillStyle = "#aeb6b8";
  ctx.font = '17px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText(
    `${skin.weapon} · ${skin.rarity}`,
    textX,
    y + 69,
    CARD_WIDTH - 158,
  );
  ctx.strokeStyle = "#454b4f";
  ctx.beginPath();
  ctx.moveTo(textX, y + 81.5);
  ctx.lineTo(x + CARD_WIDTH - 15, y + 81.5);
  ctx.stroke();

  ctx.fillStyle = "#aeb6b8";
  ctx.font = "15px ui-monospace, Consolas, monospace";
  ctx.fillText("EACH", textX, y + 105);
  ctx.textAlign = "right";
  ctx.fillText("TOTAL", x + CARD_WIDTH - 15, y + 105);
  ctx.fillStyle = "#f2f0e9";
  ctx.textAlign = "left";
  fittedText(
    ctx,
    skin.value === null ? "Unpriced" : format.format(skin.value),
    textX,
    y + 132,
    120,
    23,
  );
  ctx.textAlign = "right";
  fittedText(
    ctx,
    skin.value === null ? "—" : format.format(skin.value * qty),
    x + CARD_WIDTH - 15,
    y + 132,
    130,
    23,
  );
  ctx.textAlign = "left";
}

function drawPanel(ctx, side, items, total, photos, skinPhotoUrl, height, x) {
  const panelHeight = height - PANEL_TOP - 113;
  ctx.fillStyle = "#191d20";
  ctx.fillRect(x, PANEL_TOP, PANEL_WIDTH, panelHeight);
  ctx.strokeStyle = "#646b6e";
  ctx.strokeRect(x + 0.5, PANEL_TOP + 0.5, PANEL_WIDTH - 1, panelHeight - 1);
  ctx.strokeStyle = "#646b6e";
  ctx.beginPath();
  ctx.moveTo(x, PANEL_TOP + 82.5);
  ctx.lineTo(x + PANEL_WIDTH, PANEL_TOP + 82.5);
  ctx.stroke();
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '700 26px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText(
    side === "give" ? "YOU GIVE" : "YOU RECEIVE",
    x + 20,
    PANEL_TOP + 51,
  );
  ctx.textAlign = "right";
  fittedText(
    ctx,
    format.format(total),
    x + PANEL_WIDTH - 20,
    PANEL_TOP + 56,
    480,
    42,
    24,
  );
  ctx.textAlign = "left";
  items.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    drawCard(
      ctx,
      item,
      photos.get(skinPhotoUrl(item.skin)),
      x + 18 + column * (CARD_WIDTH + CARD_GAP),
      CARDS_TOP + row * (CARD_HEIGHT + CARD_GAP),
    );
  });
}

export async function createTradePng({
  snapshot,
  skinPhotoUrl,
  fallbackPhotoUrl,
}) {
  // Capture quantities before waiting for fonts or images, so later edits cannot
  // change a trade that is already being exported.
  const entries = {
    give: snapshot.entries.give.map(({ skin, qty }) => ({
      skin: { ...skin },
      qty,
    })),
    receive: snapshot.entries.receive.map(({ skin, qty }) => ({
      skin: { ...skin },
      qty,
    })),
  };
  const rows = Math.max(
    Math.ceil(entries.give.length / 2),
    Math.ceil(entries.receive.length / 2),
  );
  const height = Math.max(
    1080,
    CARDS_TOP + rows * (CARD_HEIGHT + CARD_GAP) + 100,
  );
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  ctx.fillStyle = "#101215";
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.fillStyle = "#171b1e";
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.66, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.lineTo(WIDTH, height * 0.67);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#272c2f";
  for (let line = -height; line < WIDTH; line += 135) {
    ctx.beginPath();
    ctx.moveTo(line, height);
    ctx.lineTo(line + height, 0);
    ctx.stroke();
  }
  ctx.fillStyle = "#a9232d";
  ctx.fillRect(MARGIN, 53, 6, 119);
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '700 69px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText("TRADE CALCULATOR", MARGIN + 26, 115);
  ctx.fillStyle = "#adb4b4";
  ctx.font = "20px ui-monospace, Consolas, monospace";
  ctx.fillText("archives® / REDLINER VALUES", MARGIN + 27, 155);

  const verdict = {
    win: "W",
    loss: "L",
    fair: "FAIR",
    empty: "INCOMPLETE",
  }[snapshot.outcome];
  ctx.textAlign = "right";
  ctx.fillStyle = "#adb4b4";
  ctx.font = "18px ui-monospace, Consolas, monospace";
  ctx.fillText("TRADE RESULT", WIDTH - MARGIN, 78);
  ctx.fillStyle =
    snapshot.outcome === "win"
      ? "#a7d49d"
      : snapshot.outcome === "loss"
        ? "#ef777b"
        : "#f2f0e9";
  fittedText(ctx, verdict, WIDTH - MARGIN, 156, 400, 82, 40);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#696e70";
  ctx.beginPath();
  ctx.moveTo(MARGIN, 191.5);
  ctx.lineTo(WIDTH - MARGIN, 191.5);
  ctx.stroke();
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '700 29px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText(
    snapshot.hasBoth
      ? `${snapshot.delta > 0 ? "+" : ""}${format.format(snapshot.delta)} value difference`
      : "Value difference unavailable",
    MARGIN,
    238,
    690,
  );
  ctx.fillStyle = "#adb4b4";
  ctx.font = '21px "Archivo Narrow", Arial, sans-serif';
  ctx.textAlign = "right";
  ctx.fillText(snapshot.percent || snapshot.note, WIDTH - MARGIN, 236, 890);
  ctx.textAlign = "left";

  const allItems = [...entries.give, ...entries.receive];
  const urls = [...new Set(allItems.map(({ skin }) => skinPhotoUrl(skin)))];
  const photos = new Map(
    await Promise.all(urls.map(async (url) => [url, await loadPhoto(url)])),
  );
  if ([...photos.values()].some((photo) => !photo)) {
    const fallback = await loadPhoto(fallbackPhotoUrl);
    for (const [url, photo] of photos) if (!photo) photos.set(url, fallback);
  }
  drawPanel(
    ctx,
    "give",
    entries.give,
    snapshot.totals.give,
    photos,
    skinPhotoUrl,
    height,
    MARGIN,
  );
  drawPanel(
    ctx,
    "receive",
    entries.receive,
    snapshot.totals.receive,
    photos,
    skinPhotoUrl,
    height,
    MARGIN + PANEL_WIDTH + GAP,
  );

  ctx.strokeStyle = "#646b6e";
  ctx.beginPath();
  ctx.moveTo(MARGIN, height - 90.5);
  ctx.lineTo(WIDTH - MARGIN, height - 90.5);
  ctx.stroke();
  ctx.fillStyle = "#adb4b4";
  ctx.font = "18px ui-monospace, Consolas, monospace";
  ctx.fillText(
    `EXPORTED ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`,
    MARGIN,
    height - 55,
  );
  ctx.textAlign = "right";
  ctx.fillText(
    snapshot.incomplete
      ? "UNPRICED SKINS EXCLUDED FROM TOTALS"
      : "LISTED VALUES ONLY · OFFERS AND DEMAND MAY DIFFER",
    WIDTH - MARGIN,
    height - 55,
  );
  ctx.fillText("archivesvalues.com", WIDTH - MARGIN, height - 27);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    );
  });
}
