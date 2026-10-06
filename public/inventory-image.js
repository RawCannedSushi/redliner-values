import { rarityColors, rarityStops } from "./rarity-theme.js";

const format = new Intl.NumberFormat("en-US");
const CARD_WIDTH = 420;
const CARD_HEIGHT = 176;
const GAP = 16;
const MARGIN = 64;
const GRID_TOP = 250;

function writeFitted(ctx, text, x, y, maxWidth, size, minSize = 17) {
  let fontSize = size;
  do {
    ctx.font = `700 ${fontSize}px "Archivo Narrow", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    fontSize -= 1;
  } while (fontSize > minSize);
  if (ctx.measureText(text).width <= maxWidth) {
    ctx.fillText(text, x, y);
    return;
  }
  while (text.length && ctx.measureText(text + "…").width > maxWidth)
    text = text.slice(0, -1);
  ctx.fillText(text + "…", x, y);
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
  ctx.strokeStyle = "#42464b";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  if (!image?.naturalWidth || !image?.naturalHeight) return;
  const scale = Math.min(
    (width - 12) / image.width,
    (height - 12) / image.height,
  );
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawCard(ctx, item, image, x, y) {
  const { skin, qty } = item;
  ctx.fillStyle = "#202327";
  ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);
  ctx.strokeStyle = "#51565b";
  ctx.strokeRect(x + 0.5, y + 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1);
  const [start, end] = rarityStops(skin.rarity);
  const rarityBar = ctx.createLinearGradient(x, y, x + CARD_WIDTH, y);
  rarityBar.addColorStop(0, start);
  rarityBar.addColorStop(1, end);
  ctx.fillStyle = rarityBar;
  ctx.fillRect(x, y, CARD_WIDTH, 4);

  drawPhoto(ctx, image, x + 14, y + 19, 132, 139);
  ctx.fillStyle = rarityColors[skin.rarity] || "#82878a";
  ctx.fillRect(x + 22, y + 27, 65, 34);
  ctx.fillStyle = "#101215";
  ctx.font = '700 23px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText(`×${qty}`, x + 31, y + 52);

  const textX = x + 165;
  ctx.fillStyle = "#f2f0e9";
  writeFitted(ctx, skin.name, textX, y + 51, 237, 30);
  ctx.fillStyle = "#b6bab9";
  ctx.font = '18px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText(`${skin.weapon} · ${skin.rarity}`, textX, y + 79, 237);
  ctx.strokeStyle = "#454a4e";
  ctx.beginPath();
  ctx.moveTo(textX, y + 96.5);
  ctx.lineTo(x + CARD_WIDTH - 18, y + 96.5);
  ctx.stroke();

  ctx.fillStyle = "#aeb3b2";
  ctx.font = "15px ui-monospace, Consolas, monospace";
  ctx.fillText("EACH", textX, y + 122);
  ctx.textAlign = "right";
  ctx.fillText("TOTAL", x + CARD_WIDTH - 18, y + 122);
  ctx.fillStyle = "#f2f0e9";
  ctx.textAlign = "left";
  writeFitted(
    ctx,
    skin.value === null ? "Unpriced" : format.format(skin.value),
    textX,
    y + 153,
    105,
    27,
  );
  ctx.textAlign = "right";
  writeFitted(
    ctx,
    skin.value === null ? "—" : format.format(skin.value * qty),
    x + CARD_WIDTH - 18,
    y + 153,
    120,
    27,
  );
  ctx.textAlign = "left";
}

export async function createInventoryPng({
  items,
  total,
  skinPhotoUrl,
  fallbackPhotoUrl,
}) {
  await document.fonts.ready;
  const columns = Math.max(4, Math.ceil(Math.sqrt(items.length * 0.9)));
  const rows = Math.ceil(items.length / columns);
  const gridWidth = columns * CARD_WIDTH + (columns - 1) * GAP;
  const gridHeight = rows * CARD_HEIGHT + (rows - 1) * GAP;
  const neededHeight = GRID_TOP + gridHeight + 96;
  const width = Math.max(
    1920,
    MARGIN * 2 + gridWidth,
    Math.ceil((neededHeight * 16) / 9),
  );
  const height = Math.ceil((width * 9) / 16);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  ctx.fillStyle = "#101215";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#191c20";
  ctx.beginPath();
  ctx.moveTo(width * 0.7, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, height * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2b3034";
  for (let line = -height; line < width; line += 110) {
    ctx.beginPath();
    ctx.moveTo(line, height);
    ctx.lineTo(line + height, 0);
    ctx.stroke();
  }

  ctx.fillStyle = "#a9232d";
  ctx.fillRect(MARGIN, 53, 6, 114);
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '700 70px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText("MY INVENTORY", MARGIN + 25, 119);
  ctx.fillStyle = "#abb0ae";
  ctx.font = "20px ui-monospace, Consolas, monospace";
  ctx.fillText("archives® / REDLINER VALUES", MARGIN + 27, 155);

  ctx.textAlign = "right";
  ctx.fillStyle = "#abb0ae";
  ctx.font = "20px ui-monospace, Consolas, monospace";
  ctx.fillText("TOTAL VALUE", width - MARGIN, 79);
  ctx.fillStyle = "#e65a62";
  writeFitted(ctx, format.format(total), width - MARGIN, 152, 760, 76, 40);
  ctx.textAlign = "left";
  ctx.fillStyle = "#abb0ae";
  ctx.font = "18px ui-monospace, Consolas, monospace";
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  ctx.fillText(
    `${format.format(count)} ITEMS  /  ${format.format(items.length)} SKINS`,
    MARGIN,
    208,
  );
  ctx.textAlign = "right";
  ctx.fillText(
    `EXPORTED ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`,
    width - MARGIN,
    208,
  );
  ctx.textAlign = "left";
  ctx.strokeStyle = "#707579";
  ctx.beginPath();
  ctx.moveTo(MARGIN, 226.5);
  ctx.lineTo(width - MARGIN, 226.5);
  ctx.stroke();

  const photoUrls = items.map(({ skin }) => skinPhotoUrl(skin));
  const photos = new Map(
    await Promise.all(
      [...new Set(photoUrls)].map(async (url) => [url, await loadPhoto(url)]),
    ),
  );
  if ([...photos.values()].some((photo) => !photo)) {
    const fallback = await loadPhoto(fallbackPhotoUrl);
    for (const [url, photo] of photos) if (!photo) photos.set(url, fallback);
  }
  items.forEach((item, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    drawCard(
      ctx,
      item,
      photos.get(photoUrls[index]),
      MARGIN + column * (CARD_WIDTH + GAP),
      GRID_TOP + row * (CARD_HEIGHT + GAP),
    );
  });

  ctx.strokeStyle = "#53585b";
  ctx.beginPath();
  ctx.moveTo(MARGIN, height - 71.5);
  ctx.lineTo(width - MARGIN, height - 71.5);
  ctx.stroke();
  ctx.fillStyle = "#abb0ae";
  ctx.font = "18px ui-monospace, Consolas, monospace";
  ctx.fillText("ARCHIVES® REDLINER VALUES", MARGIN, height - 38);
  ctx.textAlign = "right";
  ctx.fillText(
    items.some(({ skin }) => skin.value === null)
      ? "UNPRICED SKINS EXCLUDED FROM TOTAL"
      : "VALUES AT TIME OF EXPORT",
    width - MARGIN,
    height - 38,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    );
  });
}
