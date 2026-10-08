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

export async function loadPhotos(urls, fallbackPhotoUrl) {
  const photos = new Map(
    await Promise.all(
      [...new Set(urls)].map(async (url) => [url, await loadPhoto(url)]),
    ),
  );
  if ([...photos.values()].some((photo) => !photo)) {
    const fallback = await loadPhoto(fallbackPhotoUrl);
    for (const [url, photo] of photos) if (!photo) photos.set(url, fallback);
  }
  return photos;
}

export function drawPhoto(ctx, image, x, y, width, height, style) {
  ctx.fillStyle = "#111316";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = style.border;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  if (!image?.naturalWidth || !image?.naturalHeight) return;
  const imageWidth = image[style.size];
  const imageHeight =
    image[style.size === "width" ? "height" : "naturalHeight"];
  const scale = Math.min(
    (width - style.inset) / imageWidth,
    (height - style.inset) / imageHeight,
  );
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

export function pngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    );
  });
}
