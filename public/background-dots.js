const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const background = document.body;
const RIPPLE_DURATION = 650;
let lastMove = 0;
let start = 0;
let frame = 0;

function animateRipple(now) {
  const progress = Math.min(1, (now - start) / RIPPLE_DURATION);
  background.style.setProperty(
    "--ripple-radius",
    `${Math.round(32 + progress * 150)}px`,
  );
  background.style.setProperty(
    "--ripple-opacity",
    String((1 - progress) * 0.75),
  );
  if (progress < 1) {
    frame = requestAnimationFrame(animateRipple);
  } else if (now - lastMove < 120) {
    start = now;
    frame = requestAnimationFrame(animateRipple);
  } else {
    frame = 0;
  }
}

window.addEventListener(
  "pointermove",
  (event) => {
    if (reducedMotion.matches || event.pointerType !== "mouse") return;
    background.style.setProperty("--ripple-x", `${event.clientX}px`);
    background.style.setProperty("--ripple-y", `${event.clientY}px`);
    lastMove = performance.now();
    if (!frame) {
      start = lastMove;
      frame = requestAnimationFrame(animateRipple);
    }
  },
  { passive: true },
);

reducedMotion.addEventListener("change", () => {
  if (!reducedMotion.matches) return;
  cancelAnimationFrame(frame);
  frame = 0;
  background.style.removeProperty("--ripple-opacity");
});
