import { rarityStops } from "./rarity-theme.js";
import { drawPhoto, loadPhotos, pngBlob } from "./export-image.js";

const WIDTH = 1920;
const MARGIN = 64;
const GAP = 28;
const PANEL_WIDTH = (WIDTH - MARGIN * 2 - GAP) / 2;
const PANEL_TOP = 250;
const CARD_TOP = 355;
const CARD_GAP = 14;
const CARD_WIDTH = (PANEL_WIDTH - 36 - CARD_GAP) / 2;
const CARD_HEIGHT = 145;
const PHOTO_STYLE = { border: "#42494e", inset: 10, size: "naturalWidth" };

function fittedText(ctx, value, x, y, width, size, minSize = 16) {
  const text = String(value);
  for (let fontSize = size; fontSize >= minSize; fontSize -= 1) {
    ctx.font = `700 ${fontSize}px "Archivo Narrow", Arial, sans-serif`;
    if (ctx.measureText(text).width <= width) {
      ctx.fillText(text, x, y);
      return;
    }
  }
  ctx.font = `700 ${minSize}px "Archivo Narrow", Arial, sans-serif`;
  let clipped = text;
  while (clipped && ctx.measureText(clipped + "…").width > width)
    clipped = clipped.slice(0, -1);
  ctx.fillText(clipped + "…", x, y);
}

function drawCard(ctx, item, photo, x, y) {
  const { skin, quantity } = item;
  ctx.fillStyle = "#212529";
  ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);
  ctx.strokeStyle = "#50575a";
  ctx.strokeRect(x + 0.5, y + 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1);
  const [start, end] = rarityStops(skin.rarity);
  const gradient = ctx.createLinearGradient(x, y, x + CARD_WIDTH, y);
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, CARD_WIDTH, 5);
  drawPhoto(ctx, photo, x + 13, y + 19, 116, 108, PHOTO_STYLE);
  ctx.fillStyle = "#f2f0e9";
  fittedText(ctx, skin.name, x + 145, y + 51, CARD_WIDTH - 235, 28);
  ctx.fillStyle = "#abb3b6";
  ctx.font = '18px "Archivo Narrow", Arial, sans-serif';
  fittedText(
    ctx,
    [skin.weapon, skin.rarity].filter(Boolean).join(" · "),
    x + 145,
    y + 81,
    CARD_WIDTH - 161,
    18,
  );
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '700 35px "Archivo Narrow", Arial, sans-serif';
  ctx.textAlign = "right";
  ctx.fillText(`×${quantity}`, x + CARD_WIDTH - 17, y + 52);
  ctx.textAlign = "left";
}

function drawPanel(ctx, title, items, photos, photoUrl, x, height) {
  const panelHeight = height - PANEL_TOP - 132;
  ctx.fillStyle = "#191d20";
  ctx.fillRect(x, PANEL_TOP, PANEL_WIDTH, panelHeight);
  ctx.strokeStyle = "#62696c";
  ctx.strokeRect(x + 0.5, PANEL_TOP + 0.5, PANEL_WIDTH - 1, panelHeight - 1);
  ctx.strokeStyle = "#62696c";
  ctx.beginPath();
  ctx.moveTo(x, PANEL_TOP + 82.5);
  ctx.lineTo(x + PANEL_WIDTH, PANEL_TOP + 82.5);
  ctx.stroke();
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '800 36px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText(title, x + 22, PANEL_TOP + 54);
  ctx.fillStyle = "#aeb6b8";
  ctx.font = "18px ui-monospace, Consolas, monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    `${items.length} SKIN${items.length === 1 ? "" : "S"}`,
    x + PANEL_WIDTH - 22,
    PANEL_TOP + 52,
  );
  ctx.textAlign = "left";
  if (!items.length) {
    ctx.fillStyle = "#aeb6b8";
    ctx.font = '28px "Archivo Narrow", Arial, sans-serif';
    ctx.fillText("OPEN TO OFFERS", x + 24, CARD_TOP + 48);
  }
  items.forEach((item, index) => {
    const photo = photos.get(photoUrl(item.skin));
    const column = index % 2;
    const row = Math.floor(index / 2);
    drawCard(
      ctx,
      item,
      photo,
      x + 18 + column * (CARD_WIDTH + CARD_GAP),
      CARD_TOP + row * (CARD_HEIGHT + CARD_GAP),
    );
  });
}

function wrapText(ctx, value, maxWidth) {
  const lines = [];
  let current = "";
  for (const word of value.split(/\s+/).filter(Boolean)) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = "";
    for (const character of word) {
      if (current && ctx.measureText(current + character).width > maxWidth) {
        lines.push(current);
        current = "";
      }
      current += character;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function createLookingForPng(listing, photoUrl, fallbackPhotoUrl) {
  await document.fonts.ready;
  const urls = [...listing.have, ...listing.want].map((item) =>
    photoUrl(item.skin),
  );
  const photos = await loadPhotos(urls, fallbackPhotoUrl);
  const canvas = document.createElement("canvas");
  const measure = canvas.getContext("2d");
  measure.font = '24px "Archivo Narrow", Arial, sans-serif';
  const noteLines = listing.note
    ? wrapText(measure, listing.note, WIDTH - MARGIN * 2 - 60)
    : [];
  const rows = Math.max(
    1,
    Math.ceil(listing.have.length / 2),
    Math.ceil(listing.want.length / 2),
  );
  const cardsBottom = CARD_TOP + rows * (CARD_HEIGHT + CARD_GAP);
  const noteHeight = noteLines.length ? 90 + noteLines.length * 34 : 0;
  const height = Math.max(1080, cardsBottom + 70 + noteHeight + 105);
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111416";
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.fillStyle = "#191d20";
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.63, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.lineTo(WIDTH, height * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#30363a";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(WIDTH * 0.8, 0, 310 + i * 100, 0, Math.PI);
    ctx.stroke();
  }
  ctx.fillStyle = "#ef302e";
  ctx.fillRect(MARGIN, 58, 11, 95);
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '800 78px "Archivo Narrow", Arial, sans-serif';
  ctx.fillText("TRADE MAKER", MARGIN + 31, 126);
  ctx.fillStyle = "#aeb6b8";
  ctx.font = "23px ui-monospace, Consolas, monospace";
  ctx.fillText("archives® / REDLINER VALUES", MARGIN + 33, 169);
  ctx.strokeStyle = "#62696c";
  ctx.beginPath();
  ctx.moveTo(MARGIN, 216.5);
  ctx.lineTo(WIDTH - MARGIN, 216.5);
  ctx.stroke();

  drawPanel(
    ctx,
    "I HAVE",
    listing.have,
    photos,
    photoUrl,
    MARGIN,
    height - noteHeight,
  );
  drawPanel(
    ctx,
    "LOOKING FOR",
    listing.want,
    photos,
    photoUrl,
    MARGIN + PANEL_WIDTH + GAP,
    height - noteHeight,
  );
  if (noteLines.length) {
    const noteTop = height - noteHeight - 110;
    ctx.fillStyle = "#212529";
    ctx.fillRect(MARGIN, noteTop, WIDTH - MARGIN * 2, noteHeight);
    ctx.fillStyle = "#ef302e";
    ctx.fillRect(MARGIN, noteTop, 5, noteHeight);
    ctx.fillStyle = "#aeb6b8";
    ctx.font = "18px ui-monospace, Consolas, monospace";
    ctx.fillText("OFFER DETAILS", MARGIN + 24, noteTop + 29);
    ctx.fillStyle = "#f2f0e9";
    ctx.font = '24px "Archivo Narrow", Arial, sans-serif';
    noteLines.forEach((line, index) =>
      ctx.fillText(line, MARGIN + 24, noteTop + 64 + index * 34),
    );
  }
  ctx.fillStyle = "#8f989c";
  ctx.font = "16px ui-monospace, Consolas, monospace";
  ctx.fillText("archivesvalues.com", MARGIN, height - 44);
  return pngBlob(canvas);
}
