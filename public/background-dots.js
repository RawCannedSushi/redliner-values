const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const plane = document.createElement("div");
plane.className = "background-dot-plane";
plane.setAttribute("aria-hidden", "true");
document.body.prepend(plane);
document.body.classList.add("dots-interactive");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let targetRadius = 0;
let currentRadius = 0;
let frame = 0;

function animateDots() {
  currentX += (targetX - currentX) * 0.2;
  currentY += (targetY - currentY) * 0.2;
  currentRadius += (targetRadius - currentRadius) * 0.18;
  plane.style.setProperty("--dot-x", `${currentX.toFixed(1)}px`);
  plane.style.setProperty("--dot-y", `${currentY.toFixed(1)}px`);
  plane.style.setProperty(
    "--dot-core",
    `${(currentRadius * 0.42).toFixed(1)}px`,
  );
  plane.style.setProperty("--dot-radius", `${currentRadius.toFixed(1)}px`);
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

window.addEventListener(
  "pointermove",
  (event) => {
    if (reducedMotion.matches || event.pointerType !== "mouse") return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!currentRadius) {
      currentX = targetX;
      currentY = targetY;
    }
    targetRadius = 145;
    startAnimation();
  },
  { passive: true },
);
document.documentElement.addEventListener("pointerleave", lowerDots);
window.addEventListener("blur", lowerDots);

reducedMotion.addEventListener("change", () => {
  if (!reducedMotion.matches) return;
  cancelAnimationFrame(frame);
  frame = 0;
  targetRadius = currentRadius = 0;
  plane.style.removeProperty("--dot-core");
  plane.style.removeProperty("--dot-radius");
});
