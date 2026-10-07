import "./background-dots.js";

const key = "archives-redliner-theme";
const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");
const button = document.getElementById("theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
let selected = false;
let animationTimer;

try {
  selected = ["light", "dark"].includes(localStorage.getItem(key));
} catch {}

function setTheme(theme, save = false) {
  if (
    root.dataset.theme !== theme &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    root.classList.add("theme-changing");
    clearTimeout(animationTimer);
    animationTimer = setTimeout(
      () => root.classList.remove("theme-changing"),
      400,
    );
  }
  root.dataset.theme = theme;
  button.setAttribute("aria-pressed", String(theme === "dark"));
  button.setAttribute(
    "aria-label",
    `Dark mode ${theme === "dark" ? "on" : "off"}`,
  );
  themeColor?.setAttribute("content", theme === "dark" ? "#101114" : "#eeede8");
  if (save) {
    selected = true;
    try {
      localStorage.setItem(key, theme);
    } catch {}
  }
  window.dispatchEvent(new Event("themechange"));
}

setTheme(root.dataset.theme || (media.matches ? "dark" : "light"));
button.addEventListener("click", () =>
  setTheme(root.dataset.theme === "dark" ? "light" : "dark", true),
);
media.addEventListener("change", () => {
  if (!selected) setTheme(media.matches ? "dark" : "light");
});
window.addEventListener("storage", (event) => {
  if (event.key !== key) return;
  selected = event.newValue === "light" || event.newValue === "dark";
  setTheme(selected ? event.newValue : media.matches ? "dark" : "light");
});
