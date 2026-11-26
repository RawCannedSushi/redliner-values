import { rarityStops } from "./rarity-theme.js";
import { drawPhoto, loadPhotos, pngBlob } from "./export-image.js";

const WIDTH = 1920;
const MARGIN = 64;
const CENTER_GAP = 112;
const PANEL_WIDTH = (WIDTH - MARGIN * 2 - CENTER_GAP) / 2;
const RIGHT_X = MARGIN + PANEL_WIDTH + CENTER_GAP;
const BODY_TOP = 284;
const CARD_GAP = 10;
const CARD_WIDTH = (PANEL_WIDTH - 28 - CARD_GAP) / 2;
const CARD_HEIGHT = 70;
const NOTE_FONT_SIZE = 27;
const NOTE_LINE_HEIGHT = 32;
const PHOTO_STYLE = { border: "#42494e", inset: 8, size: "naturalWidth" };

function fittedText(ctx, value, x, y, maxWidth, size, minSize = 15) {
  const text = String(value);
  for (let fontSize = size; fontSize >= minSize; fontSize -= 1) {
    ctx.font = `700 ${fontSize}px "Archivo Narrow", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      ctx.fillText(text, x, y);
      return;
    }
  }
  ctx.font = `700 ${minSize}px "Archivo Narrow", Arial, sans-serif`;
  let clipped = text;
  while (clipped && ctx.measureText(clipped + "…").width > maxWidth)
    clipped = clipped.slice(0, -1);
  ctx.fillText(clipped + "…", x, y);
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

function drawCard(ctx, item, photo, x, y) {
  const { skin, quantity } = item;
  const name = /^rite of the dead$/i.test(skin.name.trim())
    ? "ROTD"
    : skin.name;
  ctx.fillStyle = "#24282c";
  ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);
  ctx.strokeStyle = "#50575a";
  ctx.strokeRect(x + 0.5, y + 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1);
  const [start, end] = rarityStops(skin.rarity);
  const gradient = ctx.createLinearGradient(x, y, x + CARD_WIDTH, y);
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, CARD_WIDTH, 4);
  drawPhoto(ctx, photo, x + 9, y + 9, 82, 52, PHOTO_STYLE);
  ctx.fillStyle = "#f2f0e9";
  const quantityText = `×${quantity}`;
  const quantityX = x + CARD_WIDTH - 12;
  const nameX = x + 102;
  ctx.font = '700 36px "Archivo Narrow", Arial, sans-serif';
  const nameWidth =
    quantityX - ctx.measureText(quantityText).width - 14 - nameX;
  fittedText(ctx, name, nameX, y + 49, nameWidth, 30);
  ctx.font = '700 36px "Archivo Narrow", Arial, sans-serif';
  ctx.textAlign = "right";
  ctx.fillText(quantityText, quantityX, y + 49);
  ctx.textAlign = "left";
}

function drawOffersCard(ctx, x, y) {
  ctx.fillStyle = "#24282c";
  ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);
  ctx.strokeStyle = "#50575a";
  ctx.strokeRect(x + 0.5, y + 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1);
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '700 26px "Archivo Narrow", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("OFFERS", x + CARD_WIDTH / 2, y + 45);
  ctx.textAlign = "left";
}

function drawPanel(
  ctx,
  items,
  photos,
  photoUrl,
  x,
  y,
  height,
  emptyText,
  offers = false,
) {
  ctx.fillStyle = "#191d20";
  ctx.fillRect(x, y, PANEL_WIDTH, height);
  ctx.strokeStyle = "#62696c";
  ctx.strokeRect(x + 0.5, y + 0.5, PANEL_WIDTH - 1, height - 1);
  if (!items.length && !offers) {
    ctx.fillStyle = "#aeb6b8";
    ctx.font = '26px "Archivo Narrow", Arial, sans-serif';
    ctx.fillText(emptyText, x + 18, y + 70);
  }
  items.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    drawCard(
      ctx,
      item,
      photos.get(photoUrl(item.skin)),
      x + 14 + column * (CARD_WIDTH + CARD_GAP),
      y + 14 + row * (CARD_HEIGHT + CARD_GAP),
    );
  });
  if (offers) {
    const column = items.length % 2;
    const row = Math.floor(items.length / 2);
    drawOffersCard(
      ctx,
      x + 14 + column * (CARD_WIDTH + CARD_GAP),
      y + 14 + row * (CARD_HEIGHT + CARD_GAP),
    );
  }
}

function drawArrow(ctx, centerY) {
  const centerX = WIDTH / 2;
  ctx.strokeStyle = "#c0c6c8";
  ctx.lineWidth = 4;
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(centerX - 28, centerY - 12);
  ctx.lineTo(centerX + 25, centerY - 12);
  ctx.moveTo(centerX + 12, centerY - 23);
  ctx.lineTo(centerX + 25, centerY - 12);
  ctx.lineTo(centerX + 12, centerY - 1);
  ctx.moveTo(centerX + 28, centerY + 12);
  ctx.lineTo(centerX - 25, centerY + 12);
  ctx.moveTo(centerX - 12, centerY + 1);
  ctx.lineTo(centerX - 25, centerY + 12);
  ctx.lineTo(centerX - 12, centerY + 23);
  ctx.stroke();
}

function drawTrade(ctx, trade, index, layout, photos, photoUrl, y) {
  const { panelHeight, noteLines, noteHeight, height } = layout;
  ctx.fillStyle = "#171b1e";
  ctx.fillRect(MARGIN, y, WIDTH - MARGIN * 2, height - 12);
  ctx.strokeStyle = "#3e4549";
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN + 0.5, y + 0.5, WIDTH - MARGIN * 2 - 1, height - 13);
  ctx.fillStyle = "#d9dcda";
  ctx.font = '700 24px "Archivo Narrow", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(
    `TRADE ${String(index + 1).padStart(2, "0")}`,
    WIDTH / 2,
    y + 31,
  );
  ctx.textAlign = "left";
  const panelY = y + 47;
  drawPanel(
    ctx,
    trade.have,
    photos,
    photoUrl,
    MARGIN + 18,
    panelY,
    panelHeight,
    "ADD WHAT YOU'RE TRADING",
  );
  drawPanel(
    ctx,
    trade.want,
    photos,
    photoUrl,
    RIGHT_X - 18,
    panelY,
    panelHeight,
    "OPEN TO OFFERS",
    trade.offers === true,
  );
  drawArrow(ctx, panelY + panelHeight / 2);
  if (noteHeight) {
    const noteY = panelY + panelHeight + 12;
    ctx.fillStyle = "#24282c";
    ctx.fillRect(MARGIN + 18, noteY, WIDTH - MARGIN * 2 - 36, noteHeight);
    ctx.fillStyle = "#aeb6b8";
    ctx.font = "18px ui-monospace, Consolas, monospace";
    ctx.fillText("NOTE", MARGIN + 36, noteY + 32);
    ctx.fillStyle = "#f2f0e9";
    ctx.font = `${NOTE_FONT_SIZE}px "Archivo Narrow", Arial, sans-serif`;
    noteLines.forEach((line, lineIndex) =>
      ctx.fillText(
        line,
        MARGIN + 114,
        noteY + 32 + lineIndex * NOTE_LINE_HEIGHT,
      ),
    );
  }
}

export async function createLookingForPng(
  listingOrListings,
  photoUrl,
  fallbackPhotoUrl,
) {
  const listings = Array.isArray(listingOrListings)
    ? listingOrListings
    : [listingOrListings];
  await document.fonts.ready;
  const urls = listings.flatMap((listing) =>
    [...listing.have, ...listing.want].map((item) => photoUrl(item.skin)),
  );
  const photos = await loadPhotos(urls, fallbackPhotoUrl);
  const canvas = document.createElement("canvas");
  const measure = canvas.getContext("2d");
  measure.font = `${NOTE_FONT_SIZE}px "Archivo Narrow", Arial, sans-serif`;
  const layouts = listings.map((listing) => {
    const rows = Math.max(
      1,
      Math.ceil(listing.have.length / 2),
      Math.ceil((listing.want.length + (listing.offers ? 1 : 0)) / 2),
    );
    const panelHeight = 28 + rows * CARD_HEIGHT + (rows - 1) * CARD_GAP;
    const noteLines = wrapText(measure, listing.note, WIDTH - MARGIN * 2 - 162);
    const noteHeight = noteLines.length
      ? 22 + noteLines.length * NOTE_LINE_HEIGHT
      : 0;
    return {
      panelHeight,
      noteLines,
      noteHeight,
      height: 47 + panelHeight + (noteHeight ? 12 + noteHeight : 0) + 30,
    };
  });
  const height = Math.max(
    760,
    BODY_TOP + layouts.reduce((sum, layout) => sum + layout.height, 0) + 48,
  );
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111416";
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.fillStyle = "#191d20";
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.63, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.lineTo(WIDTH, Math.min(height * 0.5, 680));
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
  ctx.fillStyle = "#f2f0e9";
  ctx.font = '800 31px "Archivo Narrow", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("TRADING", MARGIN + 18 + PANEL_WIDTH / 2, 263);
  ctx.fillText("LOOKING FOR", RIGHT_X - 18 + PANEL_WIDTH / 2, 263);
  ctx.textAlign = "left";
  let y = BODY_TOP;
  listings.forEach((listing, index) => {
    drawTrade(ctx, listing, index, layouts[index], photos, photoUrl, y);
    y += layouts[index].height;
  });
  ctx.fillStyle = "#8f989c";
  ctx.font = "16px ui-monospace, Consolas, monospace";
  ctx.fillText("archivesvalues.com", MARGIN, height - 30);
  return pngBlob(canvas);
}
