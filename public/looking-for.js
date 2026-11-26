import { rarityAccent } from "./rarity-theme.js";
import { createLookingForPng } from "./looking-for-image.js";

const STORAGE_KEY = "archives-redliner-looking-for-v1";
const MAX_QUANTITY = 999;
const rarityOrder = [
  "Classified",
  "Direct Classified",
  "Exotic",
  "Elite",
  "Rare",
  "Uncommon",
];
const $ = (id) => document.getElementById(id);

function node(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}

function savedListings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((listing) => listing && typeof listing.id === "string")
      .map((listing) => ({
        id: listing.id,
        have: cleanItems(listing.have),
        want: cleanItems(listing.want),
        include: listing.include !== false,
        note:
          typeof listing.note === "string" ? listing.note.slice(0, 180) : "",
      }));
  } catch {
    return [];
  }
}

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(
      (item) =>
        item && typeof item.key === "string" && item.key.includes("\u001f"),
    )
    .map((item) => ({
      key: item.key,
      quantity: Math.max(
        1,
        Math.min(MAX_QUANTITY, Math.trunc(Number(item.quantity) || 1)),
      ),
    }));
}

export function createLookingFor({
  skinKey,
  skinPhotoUrl,
  fallbackPhotoUrl,
  downloadPng,
  copyPngToClipboard,
}) {
  const listings = savedListings();
  const skinsByKey = new Map();
  const picker = $("looking-for-picker");
  const search = $("looking-for-picker-search");
  const sort = $("looking-for-picker-sort");
  const options = $("looking-for-picker-options");
  const pickerCount = $("looking-for-picker-count");
  const pickerAdd = $("looking-for-picker-add");
  const list = $("looking-for-list");
  const status = $("looking-for-status");
  const selectedSummary = $("looking-for-selected-summary");
  const selectedDownload = $("looking-for-download-selected");
  const selectedCopy = $("looking-for-copy-selected");
  const exportStatus = $("looking-for-export-status");
  let pickerTarget = null;
  const selected = new Set();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
      status.textContent = "";
    } catch {
      status.textContent =
        "Could not save listings on this device. Export your PNGs before leaving.";
    }
  }

  function lookup(key) {
    const found = skinsByKey.get(key);
    if (found) return found;
    const [weapon, name] = key.split("\u001f");
    return { weapon, name, rarity: "", value: null };
  }

  function photo(skin) {
    const image = node("img");
    image.alt = "";
    image.loading = "lazy";
    image.src = skinPhotoUrl(skin);
    image.onerror = () => {
      if (image.src !== new URL(fallbackPhotoUrl, location.href).href)
        image.src = fallbackPhotoUrl;
    };
    return image;
  }

  function createItemRow(listing, side, item) {
    const skin = lookup(item.key);
    const row = node("div", "looking-for-item");
    row.style.setProperty(
      "--skin-paint",
      rarityAccent(skin.rarity, "to right"),
    );
    row.append(photo(skin));
    const label = node("div", "looking-for-item-name");
    label.append(node("strong", "", skin.name));
    label.append(
      node("small", "", [skin.weapon, skin.rarity].filter(Boolean).join(" · ")),
    );
    row.append(label);

    const controls = node("div", "looking-for-item-controls");
    const quantity = node("div", "looking-for-quantity");
    const minus = node("button", "", "−");
    minus.type = "button";
    minus.setAttribute("aria-label", `Decrease ${skin.name} quantity`);
    minus.disabled = item.quantity <= 1;
    const input = node("input");
    input.type = "number";
    input.min = "1";
    input.max = String(MAX_QUANTITY);
    input.value = String(item.quantity);
    input.setAttribute("aria-label", `${skin.name} quantity`);
    const plus = node("button", "", "+");
    plus.type = "button";
    plus.setAttribute("aria-label", `Increase ${skin.name} quantity`);
    plus.disabled = item.quantity >= MAX_QUANTITY;
    const setQuantity = (value) => {
      item.quantity = Math.max(
        1,
        Math.min(MAX_QUANTITY, Math.trunc(value || 1)),
      );
      save();
      input.value = String(item.quantity);
      minus.disabled = item.quantity <= 1;
      plus.disabled = item.quantity >= MAX_QUANTITY;
    };
    minus.onclick = () => setQuantity(item.quantity - 1);
    plus.onclick = () => setQuantity(item.quantity + 1);
    input.onchange = () => setQuantity(Number(input.value));
    quantity.append(minus, input, plus);
    const remove = node("button", "looking-for-item-remove", "×");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${skin.name}`);
    remove.onclick = () => {
      listing[side] = listing[side].filter((entry) => entry !== item);
      save();
      render();
    };
    controls.append(quantity, remove);
    row.append(controls);
    return row;
  }

  function createSide(listing, side) {
    const pane = node("div", "looking-for-side");
    const head = node("div", "looking-for-side-head");
    head.append(node("h4", "", side === "have" ? "I have" : "Looking for"));
    const add = node("button", "", "+ Add skins");
    add.type = "button";
    add.setAttribute(
      "aria-label",
      `Add skins to ${side === "have" ? "I have" : "Looking for"}`,
    );
    add.onclick = () => openPicker(listing.id, side);
    head.append(add);
    pane.append(head);
    const items = node("div", "looking-for-items");
    if (listing[side].length) {
      listing[side].forEach((item) =>
        items.append(createItemRow(listing, side, item)),
      );
    } else {
      items.append(
        node(
          "div",
          "looking-for-side-empty",
          side === "have"
            ? "Add what you're trading"
            : "Add a skin, or use the note for open offers",
        ),
      );
    }
    pane.append(items);
    return pane;
  }

  function exportReady(listing) {
    return (
      listing.have.length > 0 &&
      (listing.want.length > 0 || listing.note.trim().length > 0)
    );
  }

  function selectedTrades() {
    return listings.filter((listing) => listing.include);
  }

  function updateCombinedControls(clearMessage = true) {
    const selected = selectedTrades();
    const unfinished = selected.find((listing) => !exportReady(listing));
    selectedSummary.textContent = `${selected.length} of ${listings.length} ${listings.length === 1 ? "trade" : "trades"} selected`;
    selectedDownload.disabled = selectedCopy.disabled =
      selected.length === 0 || Boolean(unfinished);
    if (unfinished) {
      exportStatus.textContent = `Finish or uncheck Trade ${listings.indexOf(unfinished) + 1} to export.`;
    } else if (selected.length === 0) {
      exportStatus.textContent = "Select at least one trade to export.";
    } else if (clearMessage) {
      exportStatus.textContent = "";
    }
  }

  function createListing(listing, index) {
    const card = node("article", "looking-for-listing");
    const head = node("div", "looking-for-listing-head");
    const heading = node("div", "looking-for-listing-heading");
    heading.append(node("h3", "", `Trade ${index + 1}`));
    const includeLabel = node("label", "looking-for-include");
    const include = node("input");
    include.type = "checkbox";
    include.checked = listing.include;
    include.setAttribute("aria-label", `Include Trade ${index + 1} in export`);
    include.onchange = () => {
      listing.include = include.checked;
      save();
      updateCombinedControls();
    };
    includeLabel.append(include, node("span", "", "Include in export"));
    heading.append(includeLabel);
    head.append(heading);
    const remove = node("button", "", "Delete trade");
    remove.type = "button";
    remove.onclick = () => {
      if (!confirm("Delete this trade?")) return;
      listings.splice(listings.indexOf(listing), 1);
      save();
      render();
    };
    head.append(remove);
    card.append(head);
    const sides = node("div", "looking-for-sides");
    const exchange = node("div", "looking-for-exchange", "⇄");
    exchange.setAttribute("aria-hidden", "true");
    sides.append(
      createSide(listing, "have"),
      exchange,
      createSide(listing, "want"),
    );
    card.append(sides);
    const noteLabel = node(
      "label",
      "looking-for-note",
      "Note / offer details (optional)",
    );
    const note = node("textarea");
    note.maxLength = 180;
    note.placeholder =
      "Example: Looking at offers, or 2 Nihility for 1 Inheritor";
    note.value = listing.note;
    note.addEventListener("input", () => {
      listing.note = note.value;
      save();
      updateCombinedControls();
    });
    noteLabel.append(note);
    card.append(noteLabel);
    return card;
  }

  function render() {
    list.replaceChildren();
    if (!listings.length) {
      list.append(
        node(
          "div",
          "looking-for-empty",
          "No trades yet. Add one to show what you're trading.",
        ),
      );
    } else {
      listings.forEach((listing, index) =>
        list.append(createListing(listing, index)),
      );
    }
    updateCombinedControls();
  }

  function updatePickerCount() {
    pickerCount.textContent = `${selected.size} selected`;
    pickerAdd.disabled = selected.size === 0;
  }

  function renderPicker() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = [...skinsByKey.values()].filter((skin) =>
      `${skin.name} ${skin.weapon} ${skin.rarity}`
        .toLocaleLowerCase()
        .includes(query),
    );
    const byName = (a, b) =>
      a.name.localeCompare(b.name) || a.weapon.localeCompare(b.weapon);
    if (sort.value === "value")
      visible.sort((a, b) => (b.value ?? -1) - (a.value ?? -1) || byName(a, b));
    else if (sort.value === "rarity")
      visible.sort(
        (a, b) =>
          rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity) ||
          byName(a, b),
      );
    else
      visible.sort((a, b) => a.weapon.localeCompare(b.weapon) || byName(a, b));
    options.replaceChildren();
    if (!visible.length)
      options.append(node("p", "looking-for-picker-empty", "No skins found."));
    for (const skin of visible) {
      const key = skinKey(skin);
      const label = node("label", "looking-for-picker-option");
      label.style.setProperty(
        "--skin-paint",
        rarityAccent(skin.rarity, "to bottom"),
      );
      const box = node("input");
      box.type = "checkbox";
      box.checked = selected.has(key);
      box.setAttribute("aria-label", `${skin.name} (${skin.weapon})`);
      box.onchange = () => {
        if (box.checked) selected.add(key);
        else selected.delete(key);
        updatePickerCount();
      };
      const text = node("span");
      text.append(
        node("strong", "", skin.name),
        node(
          "small",
          "",
          `${skin.weapon} · ${skin.rarity}${skin.value === null ? "" : ` · ${skin.value.toLocaleString()}`}`,
        ),
      );
      label.append(box, text);
      options.append(label);
    }
    updatePickerCount();
  }

  function openPicker(id, side) {
    pickerTarget = { id, side };
    selected.clear();
    search.value = "";
    sort.value = "value";
    renderPicker();
    picker.showModal();
    search.focus();
  }

  async function exportTrades(
    trades,
    copy,
    downloadButton,
    copyButton,
    message,
  ) {
    if (!trades.length || trades.some((trade) => !exportReady(trade))) return;
    const snapshot = trades.map((trade) => ({
      have: trade.have.map((item) => ({
        skin: { ...lookup(item.key) },
        quantity: item.quantity,
      })),
      want: trade.want.map((item) => ({
        skin: { ...lookup(item.key) },
        quantity: item.quantity,
      })),
      note: trade.note.trim(),
    }));
    const createPng = () =>
      createLookingForPng(snapshot, skinPhotoUrl, fallbackPhotoUrl);
    downloadButton.disabled = copyButton.disabled = true;
    message.textContent = copy ? "Copying image…" : "Making image…";
    try {
      if (copy) await copyPngToClipboard(createPng);
      else downloadPng(await createPng(), "trade-maker");
      message.textContent = copy ? "Copied to clipboard." : "PNG downloaded.";
    } catch (error) {
      message.textContent = copy
        ? "Could not copy image. Try Download PNG."
        : "Could not create PNG.";
      console.error("Trade Maker PNG export failed", error);
    } finally {
      updateCombinedControls(false);
    }
  }

  $("looking-for-add").addEventListener("click", () => {
    listings.push({
      id: crypto.randomUUID(),
      have: [],
      want: [],
      include: true,
      note: "",
    });
    save();
    render();
    list.lastElementChild?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  });
  $("looking-for-picker-close").addEventListener("click", () => picker.close());
  selectedDownload.addEventListener("click", () =>
    exportTrades(
      selectedTrades(),
      false,
      selectedDownload,
      selectedCopy,
      exportStatus,
    ),
  );
  selectedCopy.addEventListener("click", () =>
    exportTrades(
      selectedTrades(),
      true,
      selectedDownload,
      selectedCopy,
      exportStatus,
    ),
  );
  picker.addEventListener("close", () => {
    pickerTarget = null;
    selected.clear();
  });
  search.addEventListener("input", renderPicker);
  sort.addEventListener("change", renderPicker);
  pickerAdd.addEventListener("click", () => {
    const listing = listings.find((item) => item.id === pickerTarget?.id);
    if (!listing) return;
    const side = pickerTarget.side;
    for (const key of selected) {
      const existing = listing[side].find((item) => item.key === key);
      if (existing)
        existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + 1);
      else listing[side].push({ key, quantity: 1 });
    }
    save();
    picker.close();
    render();
  });

  render();
  return {
    refresh(nextSkins) {
      skinsByKey.clear();
      for (const skin of nextSkins) {
        if (!skin.name || !skin.weapon || !rarityOrder.includes(skin.rarity))
          continue;
        skinsByKey.set(skinKey(skin), skin);
      }
      render();
      if (picker.open) renderPicker();
    },
    enter: render,
  };
}
