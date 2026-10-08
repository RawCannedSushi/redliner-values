const SPACING = 5;
const MAX_RADIUS = 125;
const CANVAS_SIZE = (MAX_RADIUS + SPACING) * 2;
const CONTOUR_SPACING = 46;
const CONTOUR_SPEED = 2.5;

function initBackgroundContours(plane, reducedMotion) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.className = "background-contour-canvas";
  canvas.setAttribute("aria-hidden", "true");
  plane.prepend(canvas);

  let width = 0;
  let height = 0;
  let originX = 0;
  let originY = 0;
  let horizontalScale = 1;
  let maxRadius = 0;
  let color = "";
  let phase = 0;
  let frame = 0;
  let lastTime = 0;
  let lastPaint = 0;

  function draw() {
    context.clearRect(0, 0, width, height);
    if (!color) return;
    context.strokeStyle = color;
    context.lineWidth = 1;
    for (
      let radius = phase - 22;
      radius < maxRadius;
      radius += CONTOUR_SPACING
    ) {
      if (radius < 0.5) continue;
      context.globalAlpha = Math.min(1, radius / 18);
      context.beginPath();
      context.ellipse(
        originX,
        originY,
        radius * horizontalScale,
        radius,
        0,
        0,
        2 * Math.PI,
      );
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    originX = width * 0.87;
    originY = height * 0.08;
    horizontalScale = Math.max(0.45, Math.min(2.7, width / height));
    maxRadius =
      Math.hypot(
        Math.max(originX, width - originX) / horizontalScale,
        Math.max(originY, height - originY),
      ) + CONTOUR_SPACING;
    const resolution = Math.min(
      window.devicePixelRatio || 1,
      2,
      Math.sqrt(6_000_000 / (width * height)),
    );
    canvas.width = Math.round(width * resolution);
    canvas.height = Math.round(height * resolution);
    context.setTransform(resolution, 0, 0, resolution, 0, 0);
    draw();
  }

  function updateColor() {
    color = getComputedStyle(document.documentElement)
      .getPropertyValue("--contour")
      .trim();
    draw();
  }

  function shouldAnimate() {
    return (
      !reducedMotion.matches &&
      !document.hidden &&
      document.documentElement.dataset.density !== "compressed"
    );
  }

  function animate(time) {
    if (!shouldAnimate()) {
      frame = 0;
      lastTime = 0;
      return;
    }
    if (lastTime)
      phase =
        (phase + ((time - lastTime) * CONTOUR_SPEED) / 1000) % CONTOUR_SPACING;
    lastTime = time;
    if (time - lastPaint >= 80) {
      draw();
      lastPaint = time;
    }
    frame = requestAnimationFrame(animate);
  }

  function updateAnimation() {
    if (!shouldAnimate()) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (reducedMotion.matches) phase = 0;
      draw();
    } else if (!frame) {
      frame = requestAnimationFrame(animate);
    }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("themechange", updateColor);
  window.addEventListener("densitychange", updateAnimation);
  document.addEventListener("visibilitychange", updateAnimation);
  reducedMotion.addEventListener("change", updateAnimation);
  resize();
  updateColor();
  document.body.classList.add("contours-interactive");
  updateAnimation();
}

function initBackgroundDots() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const plane = document.createElement("div");
  plane.className = "background-dot-plane";
  plane.setAttribute("aria-hidden", "true");
  canvas.className = "background-dot-canvas";
  canvas.style.width = `${CANVAS_SIZE}px`;
  canvas.style.height = `${CANVAS_SIZE}px`;
  plane.append(canvas);
  document.body.prepend(plane);
  document.body.classList.add("dots-interactive");
  initBackgroundContours(plane, reducedMotion);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let targetRadius = 0;
  let currentRadius = 0;
  let frame = 0;
  let dotColor = "";

  function drawDots() {
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (currentRadius < 0.5) return;

    const left = currentX - CANVAS_SIZE / 2;
    const top = currentY - CANVAS_SIZE / 2;
    const firstX =
      Math.floor((currentX - currentRadius - SPACING / 2) / SPACING) * SPACING +
      SPACING / 2;
    const firstY =
      Math.floor((currentY - currentRadius - SPACING / 2) / SPACING) * SPACING +
      SPACING / 2;

    context.save();
    context.beginPath();
    context.arc(
      CANVAS_SIZE / 2,
      CANVAS_SIZE / 2,
      currentRadius,
      0,
      2 * Math.PI,
    );
    context.clip();
    context.fillStyle = dotColor;
    context.beginPath();
    for (
      let y = firstY;
      y <= currentY + currentRadius + SPACING;
      y += SPACING
    ) {
      for (
        let x = firstX;
        x <= currentX + currentRadius + SPACING;
        x += SPACING
      ) {
        const distance = Math.hypot(x - currentX, y - currentY);
        if (distance > currentRadius + 0.65) continue;
        const proximity = Math.max(0, 1 - distance / currentRadius);
        const lift = proximity * proximity * (3 - 2 * proximity);
        const radius = 0.65 + 1.35 * lift;
        const localX = x - left;
        const localY = y - top;
        context.moveTo(localX + radius, localY);
        context.arc(localX, localY, radius, 0, 2 * Math.PI);
      }
    }
    context.fill();
    context.restore();
  }

  function animateDots() {
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;
    currentRadius += (targetRadius - currentRadius) * 0.18;
    plane.style.setProperty("--dot-x", `${currentX.toFixed(1)}px`);
    plane.style.setProperty("--dot-y", `${currentY.toFixed(1)}px`);
    plane.style.setProperty("--dot-radius", `${currentRadius.toFixed(1)}px`);
    canvas.style.transform = `translate3d(${(currentX - CANVAS_SIZE / 2).toFixed(1)}px, ${(currentY - CANVAS_SIZE / 2).toFixed(1)}px, 0)`;
    drawDots();
    if (
      Math.abs(targetX - currentX) > 0.1 ||
      Math.abs(targetY - currentY) > 0.1 ||
      Math.abs(targetRadius - currentRadius) > 0.1
    )
      frame = requestAnimationFrame(animateDots);
    else frame = 0;
  }

  function startAnimation() {
    if (!frame) frame = requestAnimationFrame(animateDots);
  }

  function lowerDots() {
    targetRadius = 0;
    if (!reducedMotion.matches) startAnimation();
  }

  function updateDensity() {
    if (document.documentElement.dataset.density !== "compressed") return;
    cancelAnimationFrame(frame);
    frame = 0;
    targetRadius = currentRadius = 0;
    plane.style.removeProperty("--dot-radius");
    drawDots();
  }

  function resizeCanvas() {
    const resolution = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(CANVAS_SIZE * resolution);
    canvas.height = Math.round(CANVAS_SIZE * resolution);
    context.setTransform(resolution, 0, 0, resolution, 0, 0);
    drawDots();
  }

  function updateColor() {
    dotColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--grain")
      .trim();
    drawDots();
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (
        reducedMotion.matches ||
        document.documentElement.dataset.density === "compressed" ||
        event.pointerType !== "mouse"
      )
        return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!currentRadius) {
        currentX = targetX;
        currentY = targetY;
      }
      targetRadius = MAX_RADIUS;
      startAnimation();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", lowerDots);
  window.addEventListener("blur", lowerDots);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("themechange", updateColor);
  window.addEventListener("densitychange", updateDensity);
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    cancelAnimationFrame(frame);
    frame = 0;
    targetRadius = currentRadius = 0;
    plane.style.removeProperty("--dot-radius");
    drawDots();
  });

  resizeCanvas();
  updateColor();
}

initBackgroundDots();
