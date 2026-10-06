import {
  SITE_MESSAGE,
  SOURCE_REPOSITORY,
  GOOGLE_DRIVE_CLIENT_ID,
} from "./settings.js";
import { chartHistory } from "./history-client.js";
import "./theme.js";
import { CHART_PLOT, createChartZoom } from "./chart-zoom.js";
import {
  createGoogleDriveSync,
  checkedInventory,
} from "./google-drive-sync.js";

if (/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(SOURCE_REPOSITORY)) {
  document.getElementById("source-link").href = SOURCE_REPOSITORY;
  document.getElementById("source-details").hidden = false;
}

document.querySelectorAll(".context-help").forEach((help) => {
  const summary = help.querySelector("summary");
  let pinned = false;
  help.addEventListener("mouseenter", () => {
    help.open = true;
  });
  help.addEventListener("mouseleave", () => {
    if (!pinned) help.open = false;
  });
  summary.addEventListener("click", (event) => {
    event.preventDefault();
    pinned = !pinned;
    help.open = pinned || help.matches(":hover");
  });
  help.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    pinned = false;
    help.open = false;
    summary.focus();
  });
  document.addEventListener("pointerdown", (event) => {
    if (help.contains(event.target)) return;
    pinned = false;
    help.open = false;
  });
});

const SNAPSHOT_ROWS = [
  {
    id: 0,
    rarity: "Classified",
    collection: "Precede All",
    weapon: "Redliner",
    name: "Inheritor",
    value: "11250",
    demand: "10",
    trend: "Rising",
  },
  {
    id: 1,
    rarity: "Classified",
    collection: "Dragonhunt",
    weapon: "Monarch",
    name: "Dragora",
    value: "9200",
    demand: "10",
    trend: "Rising",
  },
  {
    id: 2,
    rarity: "Classified",
    collection: "Breakthrough",
    weapon: "Phoenix",
    name: "Kugelblitz",
    value: "4500",
    demand: "8",
    trend: "Fluctuating",
  },
  {
    id: 3,
    rarity: "Exotic",
    collection: "Precede All",
    weapon: "Castigate",
    name: "Unleashed",
    value: "1200",
    demand: "8",
    trend: "Rising",
  },
  {
    id: 4,
    rarity: "Exotic",
    collection: "Dragonhunt",
    weapon: "Redliner",
    name: "Demise",
    value: "750",
    demand: "7",
    trend: "Stable",
  },
  {
    id: 5,
    rarity: "Exotic",
    collection: "Breakthrough",
    weapon: "Siege",
    name: "Mechanist",
    value: "400",
    demand: "6",
    trend: "Stable",
  },
  {
    id: 6,
    rarity: "Elite",
    collection: "Precede All",
    weapon: "Monarch",
    name: "AWP",
    value: "200",
    demand: "6",
    trend: "Stable",
  },
  {
    id: 7,
    rarity: "Elite",
    collection: "Precede All",
    weapon: "Redliner",
    name: "Glass",
    value: "200",
    demand: "5",
    trend: "Stable",
  },
  {
    id: 8,
    rarity: "Elite",
    collection: "Breakthrough",
    weapon: "Monarch",
    name: "Sentinel",
    value: "80",
    demand: "5",
    trend: "Stable",
  },
  {
    id: 9,
    rarity: "Elite",
    collection: "Dragonhunt",
    weapon: "Phoenix",
    name: "Blunderbuss",
    value: "80",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 10,
    rarity: "Elite",
    collection: "Dragonhunt",
    weapon: "Siege",
    name: "Doomsday",
    value: "80",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 11,
    rarity: "Elite",
    collection: "Breakthrough",
    weapon: "Redliner",
    name: "Type: Neo",
    value: "80",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 12,
    rarity: "Rare",
    collection: "Precede All",
    weapon: "Phoenix",
    name: "Zealot",
    value: "25",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 13,
    rarity: "Rare",
    collection: "Dragonhunt",
    weapon: "Redliner",
    name: "Cavalry",
    value: "20",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 14,
    rarity: "Rare",
    collection: "Precede All",
    weapon: "Redliner",
    name: "Jetstream",
    value: "20",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 15,
    rarity: "Rare",
    collection: "Precede All",
    weapon: "Siege",
    name: "Afterburn",
    value: "20",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 16,
    rarity: "Rare",
    collection: "Dragonhunt",
    weapon: "Phoenix",
    name: "Obelisk",
    value: "10",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 17,
    rarity: "Rare",
    collection: "Dragonhunt",
    weapon: "Castigate",
    name: "Grimm",
    value: "10",
    demand: "4",
    trend: "Stable",
  },
  {
    id: 18,
    rarity: "Rare",
    collection: "Breakthrough",
    weapon: "Redliner",
    name: "Graffiti",
    value: "10",
    demand: "3",
    trend: "Stable",
  },
  {
    id: 19,
    rarity: "Rare",
    collection: "Breakthrough",
    weapon: "Phoenix",
    name: "Volt",
    value: "10",
    demand: "3",
    trend: "Stable",
  },
  {
    id: 20,
    rarity: "Rare",
    collection: "Breakthrough",
    weapon: "Castigate",
    name: "Carmine",
    value: "10",
    demand: "3",
    trend: "Stable",
  },
  {
    id: 21,
    rarity: "Uncommon",
    collection: "Dragonhunt",
    weapon: "Monarch",
    name: "Cobwebs",
    value: "5",
    demand: "3",
    trend: "Stable",
  },
  {
    id: 22,
    rarity: "Uncommon",
    collection: "Precede All",
    weapon: "Castigate",
    name: "Goldrose",
    value: "3",
    demand: "2",
    trend: "Stable",
  },
  {
    id: 23,
    rarity: "Uncommon",
    collection: "Precede All",
    weapon: "Monarch",
    name: "Winter Troop",
    value: "3",
    demand: "2",
    trend: "Stable",
  },
  {
    id: 24,
    rarity: "Uncommon",
    collection: "Precede All",
    weapon: "Siege",
    name: "Desolated",
    value: "3",
    demand: "2",
    trend: "Stable",
  },
  {
    id: 25,
    rarity: "Uncommon",
    collection: "Dragonhunt",
    weapon: "Phoenix",
    name: "Heavy-Duty",
    value: "2",
    demand: "1",
    trend: "Stable",
  },
  {
    id: 26,
    rarity: "Uncommon",
    collection: "Dragonhunt",
    weapon: "Castigate",
    name: "Eroder",
    value: "2",
    demand: "1",
    trend: "Stable",
  },
  {
    id: 27,
    rarity: "Uncommon",
    collection: "Breakthrough",
    weapon: "Monarch",
    name: "Binary",
    value: "1",
    demand: "1",
    trend: "Stable",
  },
  {
    id: 28,
    rarity: "Uncommon",
    collection: "Breakthrough",
    weapon: "Castigate",
    name: "Geometric",
    value: "1",
    demand: "1",
    trend: "Stable",
  },
  {
    id: 29,
    rarity: "Uncommon",
    collection: "Breakthrough",
    weapon: "Siege",
    name: "Rebecca",
    value: "1",
    demand: null,
    trend: "ass",
  },
];
const $ = (id) => document.getElementById(id);
const announcement = String(SITE_MESSAGE || "").trim();
$("site-message-text").textContent = announcement;
$("site-message").hidden = !announcement;
const numberFormat = new Intl.NumberFormat("en-US");
const fmt = (n) => numberFormat.format(n);
const REFRESH_INTERVAL = 15 * 60 * 1000;
const rarityOrder = [
  "Classified",
  "Direct Classified",
  "Exotic",
  "Elite",
  "Rare",
  "Uncommon",
];
function compareRarity(a, b) {
  const aRank = rarityOrder.indexOf(a);
  const bRank = rarityOrder.indexOf(b);
  return (
    (aRank === -1 ? rarityOrder.length : aRank) -
      (bRank === -1 ? rarityOrder.length : bRank) || a.localeCompare(b)
  );
}
const rarityColors = {
  Classified: "#f46762",
  "Direct Classified": "#ee2e32",
  Exotic: "#db9c57",
  Elite: "#bd8be2",
  Rare: "#65a5e4",
  Uncommon: "#94ae90",
};
const chartColors = {
  ...rarityColors,
  "Direct Classified": "#000000",
};
const lightChartColors = {
  Classified: "#a62630",
  "Direct Classified": "#111315",
  Exotic: "#835826",
  Elite: "#704685",
  Rare: "#235a78",
  Uncommon: "#456346",
};
const rarityGradients = {
  Classified: ["#ee2e32", "#5c1023"],
  "Direct Classified": ["#ee2e32", "#000000"],
};
function rarityAccent(rarity, direction) {
  const stops = rarityGradients[rarity];
  return stops
    ? `linear-gradient(${direction}, ${stops[0]}, ${stops[1]})`
    : rarityColors[rarity] || "#7e858d";
}
let skins = [];
const trade = { give: [], receive: [] };
const selectedFilters = {
  rarity: new Set(["Classified", "Direct Classified", "Exotic", "Elite"]),
  collection: new Set(),
};
const RARITY_PREF_KEY = "archives-redliner-rarities-v1";
function loadRarityPreference() {
  try {
    const saved = localStorage.getItem(RARITY_PREF_KEY);
    if (saved === null) return false;
    const values = JSON.parse(saved);
    if (
      !Array.isArray(values) ||
      !values.every((value) => typeof value === "string")
    )
      return false;
    selectedFilters.rarity = new Set(values);
    const selected = selectedFilters.rarity;
    if (
      selected.has("Classified") &&
      selected.has("Exotic") &&
      (selected.size === 2 || (selected.size === 3 && selected.has("Elite")))
    )
      selected.add("Direct Classified");
    return true;
  } catch (error) {
    return false;
  }
}
function saveRarityPreference() {
  try {
    localStorage.setItem(
      RARITY_PREF_KEY,
      JSON.stringify([...selectedFilters.rarity]),
    );
  } catch (error) {}
}
const needsRarityWelcome = !loadRarityPreference();
$("rarity-welcome").addEventListener("cancel", saveRarityPreference);
document.querySelectorAll("[data-rarity-preset]").forEach((button) =>
  button.addEventListener("click", () => {
    selectedFilters.rarity =
      button.dataset.rarityPreset === "all"
        ? new Set()
        : button.dataset.rarityPreset === "elite"
          ? new Set(["Classified", "Direct Classified", "Exotic", "Elite"])
          : new Set(["Classified", "Direct Classified", "Exotic"]);
    saveRarityPreference();
    $("rarity-welcome").close();
    if (skins.length) {
      updateFilters();
      render();
      renderHistory();
    }
  }),
);
let historyData = null;
const chartZoom = createChartZoom(
  $("history-chart"),
  $("chart-zoom-tools"),
  renderHistory,
);
let activeView = "list";
const viewPanels = {
  list: "list-view",
  history: "history-view",
  inventory: "inventory-view",
  trade: "trade",
  info: "info-view",
  sheet: "sheet-view",
};
const viewTabs = [...document.querySelectorAll("[data-view]")];
viewTabs.forEach((tab) => {
  const view = tab.dataset.view;
  tab.id = "tab-" + view;
  tab.setAttribute("aria-controls", viewPanels[view]);
  tab.tabIndex = view === "list" ? 0 : -1;
  const panel = $(viewPanels[view]);
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", tab.id);
  panel.tabIndex = 0;
});

function normalize(raw, i) {
  const text = (key) => String(raw[key] ?? "").trim();
  const numeric = /^\d+(?:\.\d+)?$/.test(text("value").replace(/,/g, ""))
    ? Number(text("value").replace(/,/g, ""))
    : null;
  const demand = /^\d+(?:\.\d+)?$/.test(text("demand"))
    ? Number(text("demand"))
    : null;
  const trend = text("trend");
  return {
    id: i,
    rarity: text("rarity"),
    collection: text("collection"),
    weapon: text("weapon"),
    name: text("name"),
    value: numeric,
    demand,
    trend: /^(Stable|Unstable|Fluctuating|Rising|Lowering|Hyped|N\/A)$/i.test(
      trend,
    )
      ? trend
      : "N/A",
  };
}
function setStatus(kind, message) {
  const el = $("feed-status");
  el.className = "status " + kind;
  el.lastElementChild.textContent = message;
}
let valuesLoading = false;
async function load(forceRefresh = false) {
  if (valuesLoading) return;
  valuesLoading = true;
  $("refresh").disabled = true;
  setStatus("", skins.length ? "Checking for updates…" : "Loading values…");
  try {
    const url = forceRefresh ? "/api/skins?refresh=1" : "/api/skins";
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Value request failed");
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) throw new Error("Empty response");
    skins = rows.map(normalize);
    setStatus(
      "live",
      "Sheet data · checked " +
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
    );
  } catch (error) {
    showSavedValues();
  }
  finishLoad();
}
function showSavedValues() {
  if (skins.length) {
    setStatus("error", "Showing last loaded values · refresh to retry");
    return;
  }
  skins = SNAPSHOT_ROWS.map(normalize);
  setStatus("error", "Showing Sep 25 snapshot · refresh to retry");
}
function finishLoad() {
  updateFilters();
  render();
  updatePickers();
  renderTrade();
  updateInventoryFilters();
  renderInventory();
  if (historyData || activeView === "history") loadHistory();
  valuesLoading = false;
  $("refresh").disabled = false;
}
function updateFilters() {
  for (const [id, field] of [
    ["rarity", "rarity"],
    ["collection", "collection"],
  ]) {
    const available = [...new Set(skins.map((s) => s[field]).filter(Boolean))];
    if (id === "rarity") available.sort(compareRarity);
    const selected = selectedFilters[id];
    [...selected].forEach((value) => {
      if (!available.includes(value)) selected.delete(value);
    });
    const panel = $(id + "-options");
    panel.replaceChildren();
    available.forEach((value) => {
      const label = element("label");
      const box = element("input");
      box.type = "checkbox";
      box.value = value;
      box.checked = selected.has(value);
      box.addEventListener("change", () => {
        if (box.checked) selected.add(value);
        else selected.delete(value);
        if (id === "rarity") saveRarityPreference();
        updateFilterLabel(id);
        render();
        renderHistory();
      });
      label.append(box, document.createTextNode(value));
      panel.append(label);
    });
    const clear = element("button", "", "Show all");
    clear.type = "button";
    clear.addEventListener("click", () => {
      selected.clear();
      if (id === "rarity") saveRarityPreference();
      updateFilters();
      render();
      renderHistory();
    });
    panel.append(clear);
    updateFilterLabel(id);
  }
}
function updateFilterLabel(id) {
  const values = [...selectedFilters[id]];
  if (id === "rarity") values.sort(compareRarity);
  const allSelected =
    id === "rarity" &&
    skins.length &&
    values.length ===
      [...new Set(skins.map((s) => s.rarity).filter(Boolean))].length;
  $(id + "-label").textContent =
    (id === "rarity" ? "Rarity: " : "Collection: ") +
    (values.length && !allSelected ? values.join(" + ") : "All");
}
function filteredSkins() {
  const sort = $("sort").value;
  const filtered = skins.filter(
    (s) =>
      (!selectedFilters.rarity.size || selectedFilters.rarity.has(s.rarity)) &&
      (!selectedFilters.collection.size ||
        selectedFilters.collection.has(s.collection)),
  );
  if (sort === "high")
    filtered.sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  if (sort === "low")
    filtered.sort((a, b) => (a.value ?? Infinity) - (b.value ?? Infinity));
  if (sort === "demand")
    filtered.sort((a, b) => (b.demand ?? -1) - (a.demand ?? -1));
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}
function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) {
    el.textContent = text;
  }
  return el;
}
const INVENTORY_KEY = "archives-redliner-inventory-v1";
const INVENTORY_UPDATED_KEY = "archives-redliner-inventory-updated-v1";
let inventory = {};
let inventoryUpdatedAt = "";
let inventoryStorageFailed = false;
let googleDriveSync;
try {
  inventoryUpdatedAt = localStorage.getItem(INVENTORY_UPDATED_KEY) || "";
  const saved = JSON.parse(localStorage.getItem(INVENTORY_KEY) || "{}");
  if (saved && typeof saved === "object" && !Array.isArray(saved))
    Object.entries(saved).forEach(([key, qty]) => {
      if (
        key.includes("\u001f") &&
        Number.isInteger(qty) &&
        qty > 0 &&
        qty <= 9999
      )
        inventory[key] = qty;
    });
} catch (error) {
  inventoryStorageFailed = true;
}
function skinKey(skin) {
  return skin.weapon + "\u001f" + skin.name;
}
function saveInventory({
  sync = true,
  updatedAt = new Date().toISOString(),
} = {}) {
  inventoryUpdatedAt = updatedAt;
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    localStorage.setItem(INVENTORY_UPDATED_KEY, inventoryUpdatedAt);
    inventoryStorageFailed = false;
    $("inventory-status").textContent = "";
  } catch (error) {
    inventoryStorageFailed = true;
    $("inventory-status").textContent =
      "Could not save on this device. Export a backup before leaving.";
  }
  if (sync) googleDriveSync?.queueUpload();
}
function rememberControlFocus(container) {
  const focused = document.activeElement;
  if (!container.contains(focused)) return () => {};
  const controls = [...container.querySelectorAll("button,input")];
  const index = controls.indexOf(focused);
  const label = focused.getAttribute("aria-label");
  return () => {
    if (focused.isConnected) return;
    const updated = [...container.querySelectorAll("button,input")];
    const replacement =
      updated.find(
        (control) => label && control.getAttribute("aria-label") === label,
      ) || updated[Math.min(index, updated.length - 1)];
    replacement?.focus({ preventScroll: true });
  };
}
function setInventoryCount(key, qty) {
  const count = Math.min(9999, Math.max(0, Number.parseInt(qty, 10) || 0));
  if (count) inventory[key] = count;
  else delete inventory[key];
  saveInventory();
  renderInventory();
}
const pendingInventorySkins = new Set();
function updateInventorySelection() {
  const count = pendingInventorySkins.size;
  $("inventory-selection-count").textContent = count + " selected";
  $("inventory-confirm").disabled = !count;
  $("inventory-confirm").textContent = count ? "Add " + count : "Add";
}
function updateInventoryFilters() {
  const available = new Set(skins.map(skinKey));
  for (const key of pendingInventorySkins)
    if (inventory[key] || !available.has(key))
      pendingInventorySkins.delete(key);
  const query = $("inventory-pick-search").value.trim().toLowerCase();
  const rows = skins
    .filter(
      (s) => !query || (s.name + " " + s.weapon).toLowerCase().includes(query),
    )
    .sort(
      (a, b) =>
        Number(!!inventory[skinKey(a)]) - Number(!!inventory[skinKey(b)]) ||
        (b.value ?? -1) - (a.value ?? -1) ||
        a.name.localeCompare(b.name),
    );
  const list = $("inventory-pick-results");
  list.replaceChildren();
  if (!rows.length)
    list.append(
      element(
        "div",
        "inventory-picker-empty",
        skins.length ? "No matching skins or weapons." : "Loading skins…",
      ),
    );
  rows.forEach((s) => {
    const key = skinKey(s),
      owned = !!inventory[key],
      label = element(
        "label",
        "inventory-pick-row" +
          (owned ? " owned" : "") +
          (pendingInventorySkins.has(key) ? " selected" : ""),
      );
    const check = element("input");
    check.type = "checkbox";
    check.disabled = owned;
    check.checked = pendingInventorySkins.has(key);
    check.setAttribute(
      "aria-label",
      s.name + " · " + s.weapon + (owned ? " · Already owned" : ""),
    );
    const title = element("span", "pick-title");
    title.append(
      element("strong", "", s.name),
      element("small", "", s.weapon + " · " + s.rarity),
    );
    label.append(
      check,
      title,
      element(
        "span",
        "pick-value",
        owned
          ? "Owned x" + inventory[key]
          : s.value === null
            ? "Unpriced"
            : fmt(s.value),
      ),
    );
    check.addEventListener("change", () => {
      if (check.checked) pendingInventorySkins.add(key);
      else pendingInventorySkins.delete(key);
      label.classList.toggle("selected", check.checked);
      updateInventorySelection();
    });
    list.append(label);
  });
  updateInventorySelection();
}
function openInventoryPicker() {
  pendingInventorySkins.clear();
  $("inventory-pick-search").value = "";
  updateInventoryFilters();
  $("inventory-dialog").showModal();
  $("inventory-pick-search").focus();
}
$("inventory-pick-search").addEventListener("input", updateInventoryFilters);
$("inventory-cancel").addEventListener("click", () =>
  $("inventory-dialog").close(),
);
$("inventory-add-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const available = new Set(skins.map(skinKey));
  for (const key of pendingInventorySkins)
    if (available.has(key) && !inventory[key]) inventory[key] = 1;
  saveInventory();
  renderInventory();
  pendingInventorySkins.clear();
  $("inventory-dialog").close();
});
function renderInventory() {
  const grid = $("inventory-grid");
  const restoreFocus = rememberControlFocus(grid);
  grid.replaceChildren();
  const byKey = new Map(skins.map((s) => [skinKey(s), s]));
  const entries = Object.entries(inventory).filter(([, qty]) => qty > 0);
  $("inventory-count").textContent = fmt(
    entries.reduce((sum, [, qty]) => sum + qty, 0),
  );
  $("inventory-unique").textContent = fmt(entries.length);
  $("inventory-total").textContent = fmt(
    entries.reduce(
      (sum, [key, qty]) => sum + (byKey.get(key)?.value || 0) * qty,
      0,
    ),
  );
  const rows = entries
    .map(([key]) => {
      const [weapon, name] = key.split("\u001f");
      return (
        byKey.get(key) || {
          weapon,
          name,
          rarity: "Unknown",
          collection: "No longer listed",
          value: null,
        }
      );
    })
    .sort(
      (a, b) =>
        (b.value ?? -1) - (a.value ?? -1) || a.name.localeCompare(b.name),
    );
  rows.forEach((s) => {
    const key = skinKey(s),
      card = element("article", "inventory-card");
    card.classList.toggle("classified-gradient", s.rarity === "Classified");
    card.style.setProperty("--rarity", rarityAccent(s.rarity, "to right"));
    const art = element("div", "inventory-art");
    art.append(element("span", "art-placeholder", s.weapon));
    const remove = element("button", "inventory-delete");
    remove.type = "button";
    remove.setAttribute("aria-label", "Delete " + s.name + " from inventory");
    remove.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
    remove.addEventListener("click", () => setInventoryCount(key, 0));
    const body = element("div", "inventory-card-body"),
      bottom = element("div", "inventory-bottom"),
      stepper = element("div", "inventory-stepper");
    const minus = element("button", "", "−"),
      plus = element("button", "", "+");
    minus.type = plus.type = "button";
    minus.setAttribute("aria-label", "Remove one " + s.name);
    plus.setAttribute("aria-label", "Add one " + s.name);
    minus.addEventListener("click", () =>
      setInventoryCount(key, (inventory[key] || 0) - 1),
    );
    plus.addEventListener("click", () =>
      setInventoryCount(key, (inventory[key] || 0) + 1),
    );
    stepper.append(minus, plus);
    bottom.append(
      element(
        "span",
        "inventory-value",
        s.value === null ? "Unpriced" : fmt(s.value) + " each",
      ),
      stepper,
    );
    body.append(
      element("h3", "", s.name),
      element("div", "inventory-meta", s.weapon + " · " + s.rarity),
      bottom,
    );
    card.append(
      art,
      element("span", "inventory-quantity", "x" + inventory[key]),
      remove,
      body,
    );
    grid.append(card);
  });
  const add = element("button", "inventory-add", "+");
  add.type = "button";
  add.setAttribute("aria-label", "Add a skin to inventory");
  add.disabled = !skins.length;
  add.addEventListener("click", openInventoryPicker);
  grid.append(add);
  restoreFocus();
}
$("inventory-export").addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify({ format: INVENTORY_KEY, items: inventory }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob),
    link = element("a");
  link.href = url;
  link.download = "redliner-inventory.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("inventory-import").addEventListener("click", () =>
  $("inventory-file").click(),
);
$("inventory-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const imported = checkedInventory(data);
    if (
      Object.keys(inventory).length &&
      !window.confirm(
        "Replace your inventory with this backup? Export a backup first if you want to keep the current items.",
      )
    )
      return;
    inventory = imported;
    saveInventory();
    renderInventory();
  } catch (error) {
    $("inventory-status").textContent =
      "That file is not a valid Redliner inventory backup.";
  } finally {
    event.target.value = "";
  }
});

function setGoogleConnected(connected) {
  $("inventory-google-sync").textContent = connected
    ? "Sync now"
    : "Sync inventory with Google";
  $("inventory-google-disconnect").hidden = !connected;
  $("inventory-google-delete").hidden = !connected;
}

googleDriveSync = createGoogleDriveSync({
  clientId: GOOGLE_DRIVE_CLIENT_ID,
  getLocal: () => ({
    format: INVENTORY_KEY,
    updatedAt: inventoryUpdatedAt || new Date().toISOString(),
    items: inventory,
  }),
  applyRemote: (data) => {
    inventory = checkedInventory(data);
    saveInventory({
      sync: false,
      updatedAt: data.updatedAt || new Date().toISOString(),
    });
    renderInventory();
  },
  chooseCopy: (remote, local, signal) =>
    new Promise((resolve) => {
      const dialog = $("inventory-conflict-dialog");
      const describe = (data) =>
        `${Object.values(data.items).reduce((sum, n) => sum + n, 0)} items; ${Object.keys(data.items).length} different skins; ${data.updatedAt ? `saved ${new Date(data.updatedAt).toLocaleString()}` : "save time unknown"}`;
      $("inventory-conflict-local").textContent = describe(local);
      $("inventory-conflict-remote").textContent = describe(remote);
      const close = () => {
        dialog.removeEventListener("close", close);
        signal.removeEventListener("abort", abort);
        resolve(signal.aborted ? "cancel" : dialog.returnValue);
      };
      const abort = () => dialog.close("cancel");
      dialog.returnValue = "cancel";
      dialog.addEventListener("close", close);
      signal.addEventListener("abort", abort, { once: true });
      dialog.showModal();
      if (signal.aborted) abort();
    }),
  setStatus: (message) => {
    $("inventory-status").textContent =
      message +
      (inventoryStorageFailed
        ? " Browser storage is unavailable. Export a backup before leaving."
        : "");
  },
  setConnected: setGoogleConnected,
  setBusy: (busy) => {
    $("inventory-google-sync").disabled = busy;
    $("inventory-google-delete").disabled = busy;
  },
});

$("inventory-google-sync").addEventListener("click", () =>
  googleDriveSync.connect(),
);
$("inventory-sync-info").addEventListener("click", () =>
  $("inventory-sync-dialog").showModal(),
);
$("inventory-sync-close").addEventListener("click", () =>
  $("inventory-sync-dialog").close(),
);
$("inventory-google-disconnect").addEventListener("click", () => {
  googleDriveSync.disconnect();
  $("inventory-sync-dialog").close();
});
$("inventory-google-delete").addEventListener("click", async () => {
  if (
    !window.confirm(
      "Permanently delete the synced inventory file from Google Drive? The inventory saved on this device will remain.",
    )
  )
    return;
  await googleDriveSync.deleteRemote();
  $("inventory-sync-dialog").close();
});
function render() {
  const filtered = filteredSkins();
  $("result-count").textContent =
    filtered.length + " of " + skins.length + " skins";
  $("clear").hidden = !(
    selectedFilters.rarity.size ||
    selectedFilters.collection.size ||
    $("sort").value !== "default"
  );
  const container = $("rows");
  container.replaceChildren();
  if (!filtered.length) {
    const row = element("tr");
    const cell = element("td", "empty", "No skins match those filters.");
    cell.colSpan = 7;
    row.append(cell);
    container.append(row);
    return;
  }
  const fragment = document.createDocumentFragment();
  filtered.forEach((s) => {
    const row = element("tr", "skin-row");
    const name = element("td", "name-cell");
    name.append(
      element("div", "name", s.name),
      element("div", "skin-detail", s.weapon + " / " + s.collection),
    );
    const rarityCell = element("td", "cell");
    const badge = element("span", "rarity", s.rarity);
    badge.classList.toggle("classified-gradient", s.rarity === "Classified");
    badge.style.setProperty("--rarity", rarityAccent(s.rarity, "to bottom"));
    rarityCell.append(badge);
    row.append(
      name,
      rarityCell,
      element("td", "cell", s.collection),
      element("td", "cell", s.weapon),
      element(
        "td",
        "value" + (s.value === null ? " invalid" : ""),
        s.value === null ? "Unpriced" : fmt(s.value),
      ),
      element("td", "demand", s.demand === null ? "—" : String(s.demand)),
    );
    const trend = element(
      "td",
      "trend " + s.trend.toLowerCase().replace(/[^a-z]+/g, "-"),
      s.trend || "—",
    );
    row.append(trend);
    fragment.append(row);
  });
  container.append(fragment);
}
function tradeSkinChoices() {
  return skins
    .filter((s) => s.value !== null)
    .sort(
      (a, b) =>
        compareRarity(a.rarity, b.rarity) ||
        a.name.localeCompare(b.name) ||
        a.weapon.localeCompare(b.weapon),
    );
}
function updatePickerLabel(side) {
  const select = $(side + "-select");
  const selected = [...select.selectedOptions].filter((option) => option.value);
  $(side + "-selection").textContent =
    selected.length === 1
      ? selected[0].textContent
      : selected.length > 1
        ? selected.length + " skins selected"
        : "Select skins…";
}
function renderPickerOptions(side) {
  const select = $(side + "-select");
  const options = $(side + "-options");
  const selectOptions = new Map(
    [...select.options].map((option) => [option.value, option]),
  );
  const terms = $(side + "-search")
    .value.trim()
    .toLocaleLowerCase()
    .split(/\s+/);
  options.replaceChildren();
  let group;
  let lastRarity;
  let count = 0;
  for (const skin of tradeSkinChoices()) {
    const searchable = [skin.name, skin.weapon, skin.rarity, skin.collection]
      .join(" ")
      .toLocaleLowerCase();
    if (!terms.every((term) => searchable.includes(term))) continue;
    const rarity = skin.rarity || "Other";
    if (rarity !== lastRarity) {
      group = element("div", "trade-picker-group");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", rarity);
      const heading = element("div", "trade-picker-group-label", rarity);
      heading.setAttribute("aria-hidden", "true");
      group.append(heading);
      options.append(group);
      lastRarity = rarity;
    }
    const key = skinKey(skin);
    const choice = element(
      "button",
      "trade-picker-option",
      skin.name + " (" + skin.weapon + ") · " + fmt(skin.value),
    );
    choice.type = "button";
    const selectOption = selectOptions.get(key);
    choice.setAttribute(
      "aria-pressed",
      String(selectOption?.selected || false),
    );
    choice.addEventListener("click", () => {
      selectOption.selected = !selectOption.selected;
      choice.setAttribute("aria-pressed", String(selectOption.selected));
      updatePickerLabel(side);
    });
    group.append(choice);
    count++;
  }
  if (!count)
    options.append(element("div", "trade-picker-empty", "No matching skins"));
}
function updatePickers() {
  const choices = tradeSkinChoices();
  for (const side of ["give", "receive"]) {
    const select = $(side + "-select");
    const selected = new Set(
      [...select.selectedOptions].map((option) => option.value),
    );
    select.replaceChildren(element("option", "", "Select skins…"));
    select.firstElementChild.value = "";
    const groups = new Map();
    choices.forEach((s) => {
      const rarity = s.rarity || "Other";
      if (!groups.has(rarity)) {
        const group = element("optgroup");
        group.label = rarity;
        groups.set(rarity, group);
        select.append(group);
      }
      const option = element(
        "option",
        "",
        s.name + " (" + s.weapon + ") · " + fmt(s.value),
      );
      option.value = skinKey(s);
      option.selected = selected.has(option.value);
      groups.get(rarity).append(option);
    });
    updatePickerLabel(side);
    renderPickerOptions(side);
  }
}
function closeTradePicker(side) {
  $(side + "-panel").hidden = true;
  $(side + "-trigger").setAttribute("aria-expanded", "false");
  $(side + "-search").value = "";
}
function renderTrade() {
  const restoreFocus = rememberControlFocus($("trade"));
  const totals = { give: 0, receive: 0 };
  let incomplete = false;
  for (const side of ["give", "receive"]) {
    const list = $(side + "-items");
    list.replaceChildren();
    if (!trade[side].length)
      list.append(element("div", "trade-empty", "No skins added yet."));
    trade[side].forEach((item, index) => {
      const skin = skins.find((s) => skinKey(s) === item.key) || {
        name: item.key.split("\u001f")[1],
        weapon: item.key.split("\u001f")[0],
        value: null,
      };
      if (skin.value === null) incomplete = true;
      totals[side] += (skin.value ?? 0) * item.quantity;
      const row = element("div", "trade-item"),
        title = element("div", "trade-item-title");
      const description = skin.name + " (" + skin.weapon + ") you " + side;
      title.append(
        element("strong", "", skin.name),
        element(
          "small",
          "",
          skin.weapon + " · " + (skin.rarity || "Unknown rarity"),
        ),
        element(
          "small",
          "trade-unit-value",
          skin.value === null ? "Unpriced" : fmt(skin.value) + " each",
        ),
      );
      const quantityControl = element("div", "trade-quantity");
      const quantity = element("input", "quantity");
      quantity.type = "number";
      quantity.min = "1";
      quantity.max = "999";
      quantity.value = item.quantity;
      quantity.setAttribute("aria-label", "Quantity of " + description);
      function changeQuantity(value) {
        const buttonHadFocus =
          quantityControl.contains(document.activeElement) &&
          document.activeElement.tagName === "BUTTON";
        item.quantity = Math.min(
          999,
          Math.max(1, Number.parseInt(value, 10) || 1),
        );
        renderTrade();
        if (buttonHadFocus && (item.quantity === 1 || item.quantity === 999))
          [...list.querySelectorAll("input")]
            .find(
              (input) =>
                input.getAttribute("aria-label") ===
                "Quantity of " + description,
            )
            ?.focus({ preventScroll: true });
      }
      quantity.addEventListener("change", () => {
        changeQuantity(quantity.value);
      });
      const decrease = element("button", "", "−"),
        increase = element("button", "", "+");
      decrease.type = increase.type = "button";
      decrease.setAttribute(
        "aria-label",
        "Decrease quantity of " + description,
      );
      increase.setAttribute(
        "aria-label",
        "Increase quantity of " + description,
      );
      decrease.disabled = item.quantity <= 1;
      increase.disabled = item.quantity >= 999;
      decrease.addEventListener("click", () =>
        changeQuantity(item.quantity - 1),
      );
      increase.addEventListener("click", () =>
        changeQuantity(item.quantity + 1),
      );
      quantityControl.append(decrease, quantity, increase);
      const remove = element("button", "remove", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove " + description);
      remove.addEventListener("click", () => {
        trade[side].splice(index, 1);
        renderTrade();
      });
      row.append(
        title,
        remove,
        quantityControl,
        element(
          "span",
          "value",
          skin.value === null ? "Unpriced" : fmt(skin.value * item.quantity),
        ),
      );
      list.append(row);
    });
    $(side + "-total").textContent = fmt(totals[side]);
  }
  const delta = totals.receive - totals.give,
    hasBoth = !incomplete && trade.give.length && trade.receive.length;
  const outcome = !hasBoth
    ? "empty"
    : Math.abs(delta) <= 100
      ? "fair"
      : delta > 100
        ? "win"
        : "loss";
  $("trade-summary").dataset.state = outcome;
  $("difference").textContent = hasBoth
    ? (delta > 0 ? "+" : "") + fmt(delta)
    : "—";
  $("trade-verdict").textContent = {
    empty: "—",
    fair: "Fair",
    win: "W",
    loss: "L",
  }[outcome];
  $("trade-verdict").setAttribute(
    "aria-label",
    { empty: "Incomplete trade", fair: "Fair trade", win: "Win", loss: "Loss" }[
      outcome
    ],
  );
  const percent = $("trade-percent");
  percent.hidden = !hasBoth || totals.give === 0;
  percent.textContent = percent.hidden
    ? ""
    : (delta > 0 ? "+" : "") +
      ((delta / totals.give) * 100).toFixed(1) +
      "% of what you give";
  $("trade-note").textContent = incomplete
    ? "Remove unpriced skins to compare complete totals."
    : !hasBoth
      ? "Add skins to both sides to compare."
      : delta === 0
        ? "Both sides total " + fmt(totals.give) + "."
        : outcome === "fair"
          ? "Within 100 value of an even trade."
          : outcome === "win"
            ? "You receive more value than you give."
            : "You give more value than you receive.";
  restoreFocus();
}
$("sort").addEventListener("change", () => {
  render();
  renderHistory();
});
$("clear").addEventListener("click", () => {
  selectedFilters.rarity.clear();
  selectedFilters.collection.clear();
  saveRarityPreference();
  $("sort").value = "default";
  updateFilters();
  render();
  renderHistory();
});
$("refresh").addEventListener("click", () => load(true));
for (const side of ["give", "receive"]) {
  const trigger = $(side + "-trigger");
  const panel = $(side + "-panel");
  const search = $(side + "-search");
  trigger.addEventListener("click", () => {
    if (!panel.hidden) {
      closeTradePicker(side);
      return;
    }
    closeTradePicker(side === "give" ? "receive" : "give");
    renderPickerOptions(side);
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    search.focus();
  });
  search.addEventListener("input", () => renderPickerOptions(side));
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeTradePicker(side);
      trigger.focus();
      return;
    }
    const choices = [...panel.querySelectorAll(".trade-picker-option")];
    if (event.key === "Enter" && document.activeElement === search) {
      if (choices.length === 1) {
        event.preventDefault();
        choices[0].click();
      }
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const focusable = [search, ...choices];
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const index = focusable.indexOf(document.activeElement);
    focusable[
      (index + direction + focusable.length) % focusable.length
    ].focus();
  });
}
document.addEventListener("pointerdown", (event) => {
  for (const side of ["give", "receive"])
    if (!$(side + "-trigger").parentElement.contains(event.target))
      closeTradePicker(side);
});
document.querySelectorAll(".trade-add").forEach((button) =>
  button.addEventListener("click", () => {
    const side = button.dataset.side;
    const keys = [...$(side + "-select").selectedOptions]
      .map((option) => option.value)
      .filter(Boolean);
    closeTradePicker(side);
    if (!keys.length) return;
    for (const key of keys) {
      const existing = trade[side].find((item) => item.key === key);
      if (existing) existing.quantity = Math.min(999, existing.quantity + 1);
      else trade[side].push({ key, quantity: 1 });
    }
    renderTrade();
  }),
);
let historyLoading = false;
function switchView(view) {
  hideSkinTooltip();
  if (view !== "trade") {
    closeTradePicker("give");
    closeTradePicker("receive");
  }
  activeView = view;
  Object.entries(viewPanels).forEach(([name, id]) => {
    $(id).hidden = name !== view;
  });
  $("shared-filters").hidden =
    view === "trade" ||
    view === "inventory" ||
    view === "info" ||
    view === "sheet";
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.tabIndex = active ? 0 : -1;
    if (button.getAttribute("role") === "tab")
      button.setAttribute("aria-selected", String(active));
  });
  if (view === "history") {
    if (!historyData) loadHistory();
    else renderHistory();
  }
  if (view === "inventory") {
    renderInventory();
  }
}
document.querySelectorAll("[data-view]").forEach((button) =>
  button.addEventListener("click", () => {
    switchView(button.dataset.view);
    document
      .querySelector(".view-tabs")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }),
);
$("history-range").addEventListener("change", () => loadHistory(true));
$("history-mode").addEventListener("change", renderHistory);
let historyRequest;
const initialView = location.hash.slice(1);
if (viewPanels[initialView]) switchView(initialView);
document.querySelector(".view-tabs").addEventListener("keydown", (event) => {
  const index = viewTabs.indexOf(event.target);
  if (index < 0) return;
  let next;
  if (event.key === "ArrowRight") next = (index + 1) % viewTabs.length;
  else if (event.key === "ArrowLeft")
    next = (index + viewTabs.length - 1) % viewTabs.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = viewTabs.length - 1;
  else return;
  event.preventDefault();
  switchView(viewTabs[next].dataset.view);
  viewTabs[next].focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  hideSkinTooltip();
  document.querySelectorAll(".multi-filter[open]").forEach((filter) => {
    filter.open = false;
    if (filter.contains(document.activeElement))
      filter.querySelector("summary").focus();
  });
});
document.addEventListener("click", (event) => {
  document.querySelectorAll(".multi-filter[open]").forEach((filter) => {
    if (!filter.contains(event.target)) filter.open = false;
  });
});

async function loadHistory(replace = false) {
  if (historyLoading && !replace) return;
  historyRequest?.abort();
  const controller = new AbortController();
  historyRequest = controller;
  historyLoading = true;
  historyData = null;
  chartZoom.disable();
  $("history-chart").hidden = true;
  $("history-legend").hidden = true;
  $("chart-empty").hidden = true;
  $("history-status").textContent = "Loading recorded values…";
  try {
    const range = $("history-range").value;
    const params = new URLSearchParams({ range });
    const events = [];
    let until;
    let after;
    do {
      const response = await fetch(`/api/history?${params}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("History request failed");
      const page = await response.json();
      if (
        !Array.isArray(page.events) ||
        !page.until ||
        (page.after && page.after === after)
      )
        throw new Error("Invalid history response");
      events.push(...page.events);
      until = page.until;
      after = page.after;
      params.set("until", until);
      if (after) params.set("after", after);
      $("history-status").textContent =
        `Loading history · ${events.length} records`;
    } while (after);
    historyData = chartHistory(events, range, until);
    renderHistory();
  } catch (error) {
    if (controller.signal.aborted) return;
    $("history-status").textContent =
      "History is unavailable. Use Refresh to retry.";
    $("history-chart").hidden = true;
    $("history-legend").hidden = true;
    $("chart-empty").hidden = false;
    $("chart-empty").textContent = "Recorded values could not be loaded.";
  } finally {
    if (historyRequest === controller) historyLoading = false;
  }
}
function svgNode(tag, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) =>
    node.setAttribute(key, String(value)),
  );
  return node;
}
function colorFor(rarity) {
  const dark = document.documentElement.dataset.theme === "dark";
  return (
    (dark ? chartColors : lightChartColors)[rarity] ||
    (dark ? "#bcc3ca" : "#343a40")
  );
}
window.addEventListener("themechange", renderHistory);
function hideSkinTooltip() {
  $("skin-tooltip").hidden = true;
}
function snapshotTime(stamp) {
  return new Date(stamp.length === 10 ? stamp + "T12:00:00Z" : stamp).getTime();
}
function snapshotLabel(stamp) {
  const date = new Date(snapshotTime(stamp));
  return stamp.length === 10
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "America/Detroit",
      })
    : date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Detroit",
      });
}
function showSkinTooltip(event, series, dateIndex, dates) {
  const tip = $("skin-tooltip");
  $("tip-name").textContent = series.skin.name;
  $("tip-details").textContent =
    series.skin.weapon + " · " + series.skin.rarity;
  const historical = $("tip-history");
  const isPoint = dateIndex != null;
  const currentValue =
    series.skin.value === null ? "Unpriced" : fmt(series.skin.value);
  $("tip-value-label").textContent = isPoint
    ? "Value at this point"
    : "Current value";
  $("tip-current").textContent = isPoint
    ? fmt(series.values[dateIndex])
    : currentValue;
  historical.hidden = !isPoint;
  if (isPoint)
    historical.textContent =
      snapshotLabel(dates[dateIndex][0]) + " · Current: " + currentValue;
  tip.hidden = false;
  const width = tip.offsetWidth,
    height = tip.offsetHeight,
    margin = 10;
  tip.style.left =
    Math.max(
      margin,
      Math.min(event.clientX + 16, window.innerWidth - width - margin),
    ) + "px";
  tip.style.top =
    Math.max(
      margin,
      Math.min(event.clientY + 16, window.innerHeight - height - margin),
    ) + "px";
}
function renderHistory() {
  if (!historyData) return;
  hideSkinTooltip();
  const svg = $("history-chart"),
    empty = $("chart-empty"),
    legend = $("history-legend");
  svg.replaceChildren();
  legend.replaceChildren();
  const mode = $("history-mode").value;
  const dates = historyData.dates;
  const selected = filteredSkins();
  $("history-status").textContent = historyData.dates.length
    ? historyData.dates.length +
      " snapshot" +
      (historyData.dates.length === 1 ? "" : "s") +
      " saved · " +
      selected.length +
      " skins selected"
    : "No recorded values yet";
  if (historyData.totalPoints > dates.length) {
    $("history-status").textContent +=
      ` · Showing ${dates.length} evenly spaced points of ${historyData.totalPoints}; use a shorter range for detail`;
  }
  if (!dates.length || !selected.length) {
    chartZoom.disable();
    empty.hidden = false;
    svg.hidden = true;
    legend.hidden = true;
    empty.textContent = !historyData.dates.length
      ? "History begins with the first successful scheduled check."
      : !selected.length
        ? "No skins match the current filters."
        : "No snapshots in this date range. Choose All saved history.";
    return;
  }
  empty.hidden = true;
  svg.hidden = false;
  legend.hidden = false;
  const catalogIndex = new Map(
    historyData.catalog.map((key, index) => [key, index]),
  );
  const daily = dates.map((day) => new Map(day[1]));
  const series = selected
    .map((s) => {
      const identity = skinKey(s),
        index = catalogIndex.get(identity);
      if (index === undefined) return null;
      const values = daily.map((map) =>
        map.has(index) ? Number(map.get(index)) : null,
      );
      const initial = values.find((v) => v !== null);
      const plotted = values.map((value) =>
        value === null
          ? null
          : mode === "change"
            ? initial
              ? ((value - initial) / initial) * 100
              : null
            : value,
      );
      return {
        skin: s,
        identity,
        values,
        plotted,
        initial,
        color: colorFor(s.rarity),
      };
    })
    .filter(Boolean);
  const allPoints = series.flatMap((s) =>
    s.plotted.filter((v) => v !== null && Number.isFinite(v)),
  );
  if (!allPoints.length) {
    chartZoom.disable();
    empty.hidden = false;
    svg.hidden = true;
    legend.hidden = true;
    empty.textContent =
      "None of these skins has recorded values in the selected range.";
    return;
  }
  const w = Math.max(320, Math.min(1000, svg.clientWidth || 1000)),
    h = 450;
  const plot = { ...CHART_PLOT, right: w - 22 };
  const { left, right, top, bottom } = plot;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const minValue =
    mode === "value"
      ? 0
      : allPoints.reduce((min, value) => Math.min(min, value), 0);
  const maxValue = allPoints.reduce((max, value) => Math.max(max, value), 0);
  const span = Math.max(1, maxValue - minValue);
  const fullYMin = mode === "value" ? 0 : minValue - span * 0.08;
  const fullYMax = maxValue + span * 0.08;
  const firstTime = snapshotTime(dates[0][0]),
    lastTime = snapshotTime(dates[dates.length - 1][0]);
  const { xMin, xMax, yMin, yMax } = chartZoom.setBounds(
    {
      xMin: firstTime === lastTime ? firstTime - 3600000 : firstTime,
      xMax: firstTime === lastTime ? lastTime + 3600000 : lastTime,
      yMin: fullYMin,
      yMax: fullYMax,
    },
    JSON.stringify([mode, dates.map((day) => day[0]), selected.map(skinKey)]),
    plot,
  );
  const x = (i) =>
    left +
    ((snapshotTime(dates[i][0]) - xMin) / (xMax - xMin)) * (right - left);
  const y = (v) => top + ((yMax - v) / (yMax - yMin)) * (bottom - top);
  const defs = svgNode("defs", {});
  const clip = svgNode("clipPath", { id: "history-plot-clip" });
  clip.append(
    svgNode("rect", {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    }),
  );
  defs.append(clip);
  svg.append(defs);
  const lines = svgNode("g", { "clip-path": "url(#history-plot-clip)" });
  const axisFormat = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Math.max(
      0,
      Math.min(6, Math.ceil(-Math.log10((yMax - yMin) / 4)) + 1),
    ),
  });
  for (let i = 0; i <= 4; i++) {
    const value = yMin + ((yMax - yMin) * (4 - i)) / 4,
      pos = top + ((bottom - top) * i) / 4;
    svg.append(
      svgNode("line", {
        x1: left,
        y1: pos,
        x2: right,
        y2: pos,
        class: "chart-grid",
      }),
    );
    const label = svgNode("text", {
      x: left - 12,
      y: pos + 4,
      "text-anchor": "end",
      class: "chart-label",
    });
    label.textContent =
      axisFormat.format(value) + (mode === "change" ? "%" : "");
    svg.append(label);
  }
  const timeTicks = w < 600 ? 2 : 4;
  for (let tick = 0; tick <= timeTicks; tick++) {
    const stamp = new Date(xMin + ((xMax - xMin) * tick) / timeTicks);
    const tickX = left + ((right - left) * tick) / timeTicks;
    const label = svgNode("text", {
      x: tickX,
      y: h - 32,
      "text-anchor":
        tick === 0 ? "start" : tick === timeTicks ? "end" : "middle",
      class: "chart-label",
    });
    label.textContent = stamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/Detroit",
    });
    if (xMax - xMin < 2 * 86400000) {
      const time = svgNode("tspan", { x: tickX, dy: 17 });
      time.textContent = stamp.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Detroit",
      });
      label.append(time);
    }
    svg.append(label);
  }
  svg.append(lines);
  const markerLayer = svgNode("g", {
    "aria-label": "Recorded value points",
    "clip-path": "url(#history-plot-clip)",
  });
  series.forEach((s) => {
    let segment = [],
      segmentIndexes = [];
    function flush() {
      if (segment.length > 1) {
        if (s.skin.rarity === "Direct Classified")
          lines.append(
            svgNode("polyline", {
              points: segment.join(" "),
              class: "chart-line-outline",
            }),
          );
        const path = svgNode("polyline", {
          points: segment.join(" "),
          stroke: s.color,
          class: "chart-line",
        });
        lines.append(path);
        const hit = svgNode("polyline", {
          points: segment.join(" "),
          class: "chart-hit",
        });
        const indexes = segmentIndexes.filter(
          (index) => x(index) >= left && x(index) <= right,
        );
        const hover = (event) => {
          if (!indexes.length || svg.classList.contains("chart-dragging"))
            return;
          const matrix = svg.getScreenCTM();
          if (!matrix) return;
          const pointerX = new DOMPoint(
            event.clientX,
            event.clientY,
          ).matrixTransform(matrix.inverse()).x;
          const nearest = indexes.reduce(
            (best, index) =>
              Math.abs(x(index) - pointerX) < Math.abs(x(best) - pointerX)
                ? index
                : best,
            indexes[0],
          );
          showSkinTooltip(event, s, nearest, dates);
        };
        hit.addEventListener("pointerenter", hover);
        hit.addEventListener("pointermove", hover);
        hit.addEventListener("pointerleave", hideSkinTooltip);
        lines.append(hit);
      }
      segment = [];
      segmentIndexes = [];
    }
    s.plotted.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) {
        flush();
        return;
      }
      segment.push(x(index).toFixed(2) + "," + y(value).toFixed(2));
      segmentIndexes.push(index);
    });
    flush();
    const lastIndex = s.plotted.findLastIndex(
      (v) => v !== null && Number.isFinite(v),
    );
    s.plotted.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) return;
      if (x(index) < left || x(index) > right || value < yMin || value > yMax)
        return;
      const marker = svgNode("g", {});
      const isCurrent = index === lastIndex;
      const dot = svgNode("circle", {
        cx: x(index),
        cy: y(value),
        r: isCurrent ? 6 : 3.25,
        fill: s.color,
        class: isCurrent ? "chart-dot" : "chart-dot historical",
      });
      const hit = svgNode("circle", {
        cx: x(index),
        cy: y(value),
        r: 9,
        fill: "transparent",
        stroke: "none",
        class: "chart-point-hit",
        tabindex: 0,
        role: "img",
        "aria-label":
          s.skin.name +
          " / " +
          s.skin.weapon +
          " · " +
          snapshotLabel(dates[index][0]) +
          " · recorded value " +
          fmt(s.values[index]),
      });
      hit.addEventListener("pointerenter", (event) =>
        showSkinTooltip(event, s, index, dates),
      );
      hit.addEventListener("pointermove", (event) =>
        showSkinTooltip(event, s, index, dates),
      );
      hit.addEventListener("pointerleave", hideSkinTooltip);
      hit.addEventListener("focus", () => {
        const rect = hit.getBoundingClientRect();
        showSkinTooltip(
          { clientX: rect.right, clientY: rect.top },
          s,
          index,
          dates,
        );
      });
      hit.addEventListener("blur", hideSkinTooltip);
      marker.append(dot, hit);
      markerLayer.append(marker);
    });
    const last = s.values.findLast((v) => v !== null),
      change =
        last !== undefined && s.initial
          ? ((last - s.initial) / s.initial) * 100
          : 0;
    const row = element("div", "legend-row"),
      swatch = element("span", "legend-swatch"),
      name = element("span", "legend-name"),
      value = element("span", "legend-value");
    const classified = s.skin.rarity === "Classified";
    swatch.classList.toggle("classified-gradient", classified);
    swatch.classList.toggle(
      "direct-classified-swatch",
      s.skin.rarity === "Direct Classified",
    );
    if (classified)
      swatch.style.setProperty(
        "--rarity",
        rarityAccent(s.skin.rarity, "to right"),
      );
    else swatch.style.background = s.color;
    name.textContent = s.skin.name + " / " + s.skin.weapon;
    value.append(
      document.createTextNode(last === undefined ? "—" : fmt(last)),
      element(
        "small",
        change > 0 ? "positive" : change < 0 ? "negative" : "",
        (change >= 0 ? "+" : "") + change.toFixed(1) + "%",
      ),
    );
    row.append(swatch, name, value);
    legend.append(row);
    row.tabIndex = 0;
    row.addEventListener("pointerenter", (event) =>
      showSkinTooltip(event, s, null, dates),
    );
    row.addEventListener("pointermove", (event) =>
      showSkinTooltip(event, s, null, dates),
    );
    row.addEventListener("pointerleave", hideSkinTooltip);
    row.addEventListener("focus", () => {
      const rect = row.getBoundingClientRect();
      showSkinTooltip(
        { clientX: rect.right, clientY: rect.top },
        s,
        null,
        dates,
      );
    });
    row.addEventListener("blur", hideSkinTooltip);
  });
  svg.append(markerLayer);
  if (dates.length === 1) {
    $("history-status").textContent +=
      " · lines appear after a second snapshot";
  }
}

function startOpeningIntro() {
  const intro = $("site-intro");
  let seen = false;
  try {
    seen = sessionStorage.getItem("archives-redliner-intro-v1") === "seen";
  } catch (error) {}
  const pageParts = [
    document.querySelector("main"),
    document.querySelector("footer"),
  ];
  let finished = false,
    timer;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    intro.remove();
    pageParts.forEach((part) => {
      part.inert = false;
    });
    if (needsRarityWelcome) $("rarity-welcome").showModal();
    else if (!seen)
      viewTabs
        .find((tab) => tab.dataset.view === activeView)
        .focus({ preventScroll: true });
  };
  if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return;
  }
  try {
    sessionStorage.setItem("archives-redliner-intro-v1", "seen");
  } catch (error) {}
  pageParts.forEach((part) => {
    part.inert = true;
  });
  intro
    .querySelector(".bottom")
    .append(intro.querySelector(".intro-scene").cloneNode(true));
  $("intro-skip").addEventListener("click", finish);
  intro.addEventListener("keydown", (event) => {
    if (event.key === "Escape") finish();
  });
  intro.addEventListener("animationend", (event) => {
    if (event.animationName === "introCut") finish();
  });
  intro.classList.add("intro-playing");
  $("intro-skip").focus();
  timer = setTimeout(finish, 3000);
}
startOpeningIntro();

load();
setInterval(load, REFRESH_INTERVAL);
