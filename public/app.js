import {
  SITE_MESSAGE,
  SOURCE_REPOSITORY,
  GOOGLE_DRIVE_CLIENT_ID,
} from "./settings.js";
import { chartHistory } from "./history-client.js";
import {
  createGoogleDriveSync,
  checkedInventory,
} from "./google-drive-sync.js";

if (/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(SOURCE_REPOSITORY)) {
  document.getElementById("source-link").href = SOURCE_REPOSITORY;
  document.getElementById("source-details").hidden = false;
  fetch("/build-info.json")
    .then((response) => response.json())
    .then((build) => {
      if (!/^[0-9a-f]{40}$/.test(build.commit)) return;
      const link = document.createElement("a");
      link.href = `${SOURCE_REPOSITORY.replace(/\/$/, "")}/commit/${build.commit}`;
      link.textContent = `Source revision ${build.commit.slice(0, 7)}`;
      document.getElementById("build-version").append(link);
    })
    .catch(() => {});
}

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
const rarityColors = {
  Classified: "#f46762",
  Exotic: "#db9c57",
  Elite: "#bd8be2",
  Rare: "#65a5e4",
  Uncommon: "#94ae90",
};
let skins = [];
const trade = { give: [], receive: [] };
const selectedFilters = {
  rarity: new Set(["Classified", "Exotic", "Elite"]),
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
          ? new Set(["Classified", "Exotic", "Elite"])
          : new Set(["Classified", "Exotic"]);
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
    card.style.setProperty("--rarity", rarityColors[s.rarity] || "#7e858d");
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
    badge.style.setProperty("--rarity", rarityColors[s.rarity] || "#7e858d");
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
function updatePickers() {
  for (const side of ["give", "receive"]) {
    const select = $(side + "-select"),
      selected = select.value;
    select.replaceChildren(element("option", "", "Select a skin…"));
    select.firstElementChild.value = "";
    skins
      .filter((s) => s.value !== null)
      .sort((a, b) => b.value - a.value)
      .forEach((s) => {
        const option = element("option", "", s.name + " · " + fmt(s.value));
        option.value = skinKey(s);
        select.append(option);
      });
    select.value = selected;
  }
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
      title.append(
        element("strong", "", skin.name),
        element("small", "", skin.weapon),
      );
      const quantity = element("input", "quantity");
      quantity.type = "number";
      quantity.min = "1";
      quantity.max = "999";
      quantity.value = item.quantity;
      quantity.setAttribute("aria-label", "Quantity of " + skin.name);
      quantity.addEventListener("change", () => {
        item.quantity = Math.min(
          999,
          Math.max(1, Number.parseInt(quantity.value, 10) || 1),
        );
        renderTrade();
      });
      const remove = element("button", "remove", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove " + skin.name);
      remove.addEventListener("click", () => {
        trade[side].splice(index, 1);
        renderTrade();
      });
      row.append(
        title,
        quantity,
        element(
          "span",
          "value",
          skin.value === null ? "Unpriced" : fmt(skin.value * item.quantity),
        ),
        remove,
      );
      list.append(row);
    });
    $(side + "-total").textContent = fmt(totals[side]);
  }
  const delta = totals.receive - totals.give,
    hasBoth = !incomplete && trade.give.length && trade.receive.length;
  $("difference").textContent = hasBoth
    ? (delta > 0 ? "+" : "") + fmt(delta)
    : "—";
  $("difference").className =
    "difference " +
    (hasBoth ? (delta > 0 ? "positive" : delta < 0 ? "negative" : "") : "");
  $("trade-verdict").textContent = !hasBoth
    ? "Add skins to both sides"
    : delta === 0
      ? "Equal listed values"
      : delta > 0
        ? "You receive more listed value"
        : "You give more listed value";
  if (incomplete)
    $("trade-verdict").textContent = "Some skins are no longer priced";
  $("trade-note").textContent = incomplete
    ? "Remove unpriced skins to compare complete totals."
    : !hasBoth
      ? "The difference is based on listed values."
      : delta === 0
        ? "Both sides total " + fmt(totals.give) + "."
        : fmt(Math.abs(delta)) + " value difference based on the sheet.";
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
document.querySelectorAll(".trade-picker button").forEach((button) =>
  button.addEventListener("click", () => {
    const side = button.dataset.side,
      key = $(side + "-select").value;
    if (!$(side + "-select").value) return;
    const existing = trade[side].find((item) => item.key === key);
    if (existing) existing.quantity = Math.min(999, existing.quantity + 1);
    else trade[side].push({ key, quantity: 1 });
    renderTrade();
  }),
);
let historyLoading = false;
function switchView(view) {
  hideSkinTooltip();
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
  return rarityColors[rarity] || "#7e858d";
}
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
    empty.hidden = false;
    svg.hidden = true;
    legend.hidden = true;
    empty.textContent =
      "None of these skins has recorded values in the selected range.";
    return;
  }
  const w = 1000,
    h = 450,
    left = 74,
    right = 22,
    top = 24,
    bottom = 58;
  const minValue =
    mode === "value"
      ? 0
      : allPoints.reduce((min, value) => Math.min(min, value), 0);
  const maxValue = allPoints.reduce((max, value) => Math.max(max, value), 0);
  const span = Math.max(1, maxValue - minValue);
  const yMin = mode === "value" ? 0 : minValue - span * 0.08;
  const yMax = maxValue + span * 0.08;
  const firstTime = snapshotTime(dates[0][0]),
    timeSpan = snapshotTime(dates[dates.length - 1][0]) - firstTime;
  const x = (i) =>
    left +
    (timeSpan > 0 ? (snapshotTime(dates[i][0]) - firstTime) / timeSpan : 0) *
      (w - left - right);
  const y = (v) => top + ((yMax - v) / (yMax - yMin)) * (h - top - bottom);
  for (let i = 0; i <= 4; i++) {
    const value = yMin + ((yMax - yMin) * (4 - i)) / 4,
      pos = top + ((h - top - bottom) * i) / 4;
    svg.append(
      svgNode("line", {
        x1: left,
        y1: pos,
        x2: w - right,
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
      mode === "change" ? Math.round(value) + "%" : fmt(Math.round(value));
    svg.append(label);
  }
  const indices = [
    ...new Set([
      0,
      Math.floor((dates.length - 1) / 4),
      Math.floor((dates.length - 1) / 2),
      Math.floor(((dates.length - 1) * 3) / 4),
      dates.length - 1,
    ]),
  ];
  indices.forEach((index) => {
    const label = svgNode("text", {
      x: x(index),
      y: h - 18,
      "text-anchor":
        index === 0 ? "start" : index === dates.length - 1 ? "end" : "middle",
      class: "chart-label",
    });
    label.textContent = snapshotLabel(dates[index][0]).replace(/, 20\d{2}/, "");
    svg.append(label);
  });
  const markerLayer = svgNode("g", {
    "aria-label": "Recorded value points",
  });
  series.forEach((s) => {
    let segment = [],
      segmentIndexes = [];
    function flush() {
      if (segment.length > 1) {
        const path = svgNode("polyline", {
          points: segment.join(" "),
          stroke: s.color,
          class: "chart-line",
        });
        svg.append(path);
        const hit = svgNode("polyline", {
          points: segment.join(" "),
          class: "chart-hit",
        });
        const indexes = segmentIndexes.slice();
        const hover = (event) => {
          const bounds = svg.getBoundingClientRect();
          const pointerX = ((event.clientX - bounds.left) * w) / bounds.width;
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
        svg.append(hit);
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
      const marker = svgNode("g", {});
      const dot = svgNode("circle", {
        cx: x(index),
        cy: y(value),
        r: index === lastIndex ? 6 : 3.5,
        fill: s.color,
        class: "chart-dot",
      });
      const hit = svgNode("circle", {
        cx: x(index),
        cy: y(value),
        r: 9,
        fill: "transparent",
        stroke: "none",
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
      hit.style.cursor = "crosshair";
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
    swatch.style.background = s.color;
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
