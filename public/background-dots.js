const SPACING = 5;
const MAX_RADIUS = 125;
const CANVAS_SIZE = (MAX_RADIUS + SPACING) * 2;

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
