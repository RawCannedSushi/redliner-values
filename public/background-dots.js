const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const background = document.body;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let frame = 0;

function animateDots() {
  currentX += (targetX - currentX) * 0.16;
  currentY += (targetY - currentY) * 0.16;
  background.style.setProperty("--dot-drift-x", `${currentX.toFixed(2)}px`);
  background.style.setProperty("--dot-drift-y", `${currentY.toFixed(2)}px`);
  if (
    Math.abs(targetX - currentX) > 0.05 ||
    Math.abs(targetY - currentY) > 0.05
  ) {
    frame = requestAnimationFrame(animateDots);
  } else {
    frame = 0;
  }
}

function startAnimation() {
  if (!frame) frame = requestAnimationFrame(animateDots);
}

window.addEventListener(
  "pointermove",
  (event) => {
    if (reducedMotion.matches || event.pointerType !== "mouse") return;
    targetX = (event.clientX / window.innerWidth - 0.5) * 36;
    targetY = (event.clientY / window.innerHeight - 0.5) * 36;
    startAnimation();
  },
  { passive: true },
);

document.documentElement.addEventListener("pointerleave", () => {
  targetX = 0;
  targetY = 0;
  if (!reducedMotion.matches) startAnimation();
});

reducedMotion.addEventListener("change", () => {
  if (!reducedMotion.matches) return;
  cancelAnimationFrame(frame);
  frame = 0;
  targetX = currentX = 0;
  targetY = currentY = 0;
  background.style.removeProperty("--dot-drift-x");
  background.style.removeProperty("--dot-drift-y");
});
