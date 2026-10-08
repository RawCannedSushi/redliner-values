// Set saved display preferences before the stylesheet paints.
try {
  const saved = localStorage.getItem("archives-redliner-theme");
  document.documentElement.dataset.theme =
    saved === "light" || saved === "dark" ? saved : "dark";
  document.documentElement.dataset.density =
    localStorage.getItem("archives-redliner-density") === "compressed"
      ? "compressed"
      : "standard";
} catch {
  document.documentElement.dataset.theme = "dark";
  document.documentElement.dataset.density = "standard";
}
