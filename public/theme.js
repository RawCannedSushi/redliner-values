import "./background-dots.js";

const themeKey = "archives-redliner-theme";
const densityKey = "archives-redliner-density";
const root = document.documentElement;
const themeButton = document.getElementById("theme-toggle");
const densityButton = document.getElementById("compressed-toggle");
const settings = document.getElementById("site-settings");
const themeColor = document.querySelector('meta[name="theme-color"]');
const pageTabs = document.querySelector(".view-tabs");
const navigation = document.querySelector(".site-navigation");
const pageMain = document.querySelector("main.shell");
let animationTimer;

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
  themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  themeButton.setAttribute(
    "aria-label",
    `Dark mode ${theme === "dark" ? "on" : "off"}`,
  );
  themeColor?.setAttribute("content", theme === "dark" ? "#101114" : "#eeede8");
  if (save) {
    try {
      localStorage.setItem(themeKey, theme);
    } catch {}
  }
  window.dispatchEvent(new Event("themechange"));
}

function setDensity(density, save = false) {
  root.dataset.density = density;
  if (pageTabs) {
    if (density === "compressed") pageMain.append(pageTabs);
    else navigation.prepend(pageTabs);
  }
  densityButton.setAttribute("aria-pressed", String(density === "compressed"));
  densityButton.setAttribute(
    "aria-label",
    `Compressed mode ${density === "compressed" ? "on" : "off"}`,
  );
  if (save) {
    try {
      localStorage.setItem(densityKey, density);
    } catch {}
  }
  window.dispatchEvent(new Event("densitychange"));
}

setTheme(root.dataset.theme || "dark");
setDensity(root.dataset.density || "standard");
themeButton.addEventListener("click", () =>
  setTheme(root.dataset.theme === "dark" ? "light" : "dark", true),
);
densityButton.addEventListener("click", () =>
  setDensity(
    root.dataset.density === "compressed" ? "standard" : "compressed",
    true,
  ),
);
document.addEventListener("pointerdown", (event) => {
  if (settings.open && !settings.contains(event.target)) settings.open = false;
});
settings.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  settings.open = false;
  settings.querySelector("summary").focus();
});
window.addEventListener("storage", (event) => {
  if (event.key === themeKey)
    setTheme(event.newValue === "light" ? "light" : "dark");
  if (event.key === densityKey)
    setDensity(event.newValue === "compressed" ? "compressed" : "standard");
});
