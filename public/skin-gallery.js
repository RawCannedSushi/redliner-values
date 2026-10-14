import { applyRarityAccent } from "./rarity-theme.js";

const $ = (id) => document.getElementById(id);
const PHOTO_FALLBACK = "/skin-photos/unknown.png";
const SKIN_SHOWCASES = {
  "Castigate\u001fFuneralist": {
    src: "/skin-media/Castigate-Funeralist-Showcase.mp4",
    poster: "/skin-media/Castigate-Funeralist-Showcase.jpg",
    description: "inspect, firing, and kill effect audio",
  },
  "Monarch\u001fDragora": {
    src: "/skin-media/Monarch-Dragora-Showcase.mp4",
    poster: "/skin-media/Monarch-Dragora-Showcase.jpg",
    description: "inspect, firing, and elimination effect audio",
  },
  "Redliner\u001fInheritor": {
    src: "/skin-media/Redliner-Inheritor-Showcase.mp4",
    poster: "/skin-media/Redliner-Inheritor-Showcase.jpg",
    description: "inspect, attack, and parry audio",
  },
};
const SKIN_ANIMATIONS = {
  "Castigate\u001fDefault": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Castigate-Default-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Castigate-Default-Firing.webp" },
  ],
  "Castigate\u001fCarmine": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Castigate-Carmine-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Castigate-Carmine-Firing.webp" },
  ],
  "Castigate\u001fEroder": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Castigate-Eroder-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Castigate-Eroder-Firing.webp" },
  ],
  "Castigate\u001fFractal": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Castigate-Fractal-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Castigate-Fractal-Firing.webp" },
  ],
  "Castigate\u001fGeometric": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Castigate-Geometric-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Castigate-Geometric-Firing.webp" },
  ],
  "Castigate\u001fGoldrose": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Castigate-Goldrose-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Castigate-Goldrose-Firing.webp" },
  ],
  "Castigate\u001fGrimm": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Castigate-Grimm-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Castigate-Grimm-Firing.webp" },
  ],
  "Liberator\u001fDefault": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Liberator-Default-Inspect.webp",
    },
    { label: "Slashing", src: "/skin-media/Liberator-Default-Slashing.webp" },
    { label: "Firing", src: "/skin-media/Liberator-Default-Firing.webp" },
  ],
  "Monarch\u001fDefault": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Monarch-Default-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Monarch-Default-Firing.webp" },
  ],
  "Monarch\u001fBinary": [
    { label: "Weapon inspect", src: "/skin-media/Monarch-Binary-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Monarch-Binary-Firing.webp" },
  ],
  "Monarch\u001fCobwebs": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Monarch-Cobwebs-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Monarch-Cobwebs-Firing.webp" },
  ],
  "Monarch\u001fScoria": [
    { label: "Weapon inspect", src: "/skin-media/Monarch-Scoria-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Monarch-Scoria-Firing.webp" },
  ],
  "Monarch\u001fSentinel": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Monarch-Sentinel-Inspect.webp",
    },
    { label: "Weapon draw", src: "/skin-media/Monarch-Sentinel-Draw.webp" },
  ],
  "Monarch\u001fWinter Troop": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Monarch-WinterTroop-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Monarch-WinterTroop-Firing.webp" },
  ],
  "Phoenix\u001fDefault": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Phoenix-Default-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Phoenix-Default-Firing.webp" },
  ],
  "Phoenix\u001fBlunderbuss": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Phoenix-Blunderbuss-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Phoenix-Blunderbuss-Firing.webp" },
  ],
  "Phoenix\u001fHeavy-Duty": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Phoenix-HeavyDuty-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Phoenix-HeavyDuty-Firing.webp" },
  ],
  "Phoenix\u001fStatic": [
    { label: "Weapon inspect", src: "/skin-media/Phoenix-Static-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Phoenix-Static-Firing.webp" },
  ],
  "Phoenix\u001fVolt": [
    { label: "Weapon inspect", src: "/skin-media/Phoenix-Volt-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Phoenix-Volt-Firing.webp" },
  ],
  "Phoenix\u001fZealot": [
    { label: "Weapon inspect", src: "/skin-media/Phoenix-Zealot-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Phoenix-Zealot-Firing.webp" },
  ],
  "Phoenix\u001fObelisk": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Phoenix-Obelisk-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Phoenix-Obelisk-Firing.webp" },
  ],
  "Redliner\u001fDefault": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Redliner-Default-Inspect.webp",
    },
    { label: "Attack", src: "/skin-media/Redliner-Default-Attack.webp" },
  ],
  "Redliner\u001fCavalry": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Redliner-Cavalry-Inspect.webp",
    },
    { label: "Attack", src: "/skin-media/Redliner-Cavalry-Attack.webp" },
  ],
  "Redliner\u001fGlass": [
    { label: "Weapon inspect", src: "/skin-media/Redliner-Glass-Inspect.webp" },
    { label: "Attack", src: "/skin-media/Redliner-Glass-Attack.webp" },
  ],
  "Redliner\u001fGraffiti": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Redliner-Graffiti-Inspect.webp",
    },
    { label: "Attack", src: "/skin-media/Redliner-Graffiti-Attack.webp" },
  ],
  "Redliner\u001fHigh Voltage": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Redliner-HighVoltage-Inspect.webp",
    },
    { label: "Attack", src: "/skin-media/Redliner-HighVoltage-Attack.webp" },
  ],
  "Redliner\u001fJetstream": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Redliner-Jetstream-Inspect.webp",
    },
    { label: "Attack", src: "/skin-media/Redliner-Jetstream-Attack.webp" },
  ],
  "Redliner\u001fType: Neo": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Redliner-TypeNeo-Inspect.webp",
    },
    { label: "Attack", src: "/skin-media/Redliner-TypeNeo-Attack.webp" },
  ],
  "Revolt\u001fDefault": [
    { label: "Weapon inspect", src: "/skin-media/Revolt-Default-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Revolt-Default-Firing.webp" },
  ],
  "Revolt\u001fDune": [
    { label: "Weapon inspect", src: "/skin-media/Revolt-Dune-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Revolt-Dune-Firing.webp" },
  ],
  "Revolt\u001fEntropy": [
    { label: "Weapon inspect", src: "/skin-media/Revolt-Entropy-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Revolt-Entropy-Firing.webp" },
  ],
  "Revolt\u001fSurge": [
    { label: "Weapon inspect", src: "/skin-media/Revolt-Surge-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Revolt-Surge-Firing.webp" },
  ],
  "Siege\u001fDefault": [
    { label: "Weapon inspect", src: "/skin-media/Siege-Default-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Siege-Default-Firing.webp" },
  ],
  "Siege\u001fAfterburn": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Siege-Afterburn-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Siege-Afterburn-Firing.webp" },
  ],
  "Siege\u001fDesolated": [
    {
      label: "Weapon inspect",
      src: "/skin-media/Siege-Desolated-Inspect.webp",
    },
    { label: "Firing", src: "/skin-media/Siege-Desolated-Firing.webp" },
  ],
  "Siege\u001fDoomsday": [
    { label: "Weapon inspect", src: "/skin-media/Siege-Doomsday-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Siege-Doomsday-Firing.webp" },
  ],
  "Siege\u001fMonolith": [
    { label: "Weapon inspect", src: "/skin-media/Siege-Monolith-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Siege-Monolith-Firing.webp" },
  ],
  "Siege\u001fRebecca": [
    { label: "Weapon inspect", src: "/skin-media/Siege-Rebecca-Inspect.webp" },
    { label: "Firing", src: "/skin-media/Siege-Rebecca-Firing.webp" },
  ],
};
const DEFAULT_SKINS = [
  "Castigate",
  "Liberator",
  "Monarch",
  "Phoenix",
  "Redliner",
  "Revolt",
  "Siege",
].map((weapon) =>
  Object.freeze({
    name: "Default",
    weapon,
    rarity: "Common",
    value: null,
    defaultSkin: true,
    untradable: true,
  }),
);
const EXCLUSIVE_SKINS = [
  Object.freeze({
    name: "Golden Eagle",
    weapon: "Castigate",
    rarity: "Exclusive",
    value: null,
    exclusive: true,
    untradable: true,
    unlockLabel: "Achievement unlock",
    unlockTitle: "Castigate Max",
    unlockDescription:
      "Golden Eagle is untradable. Unlock it by completing this achievement.",
    requirement: "Get 5,000 kills with the Castigate.",
  }),
  Object.freeze({
    name: "Sanguine Pledge",
    weapon: "Redliner",
    rarity: "Exclusive",
    value: null,
    exclusive: true,
    untradable: true,
    unlockLabel: "Ranked unlock",
    unlockTitle: "Top 50 Ranked",
    unlockDescription:
      "Sanguine Pledge is untradable. Unlock it through Ranked placement.",
    requirement: "Be actively ranked in the Top 50 in either 1v1s or 2v2s.",
  }),
];
const ACCENT_PROPERTIES = [
  "--rarity",
  "--skin-paint-light",
  "--skin-paint-vertical-light",
  "--skin-paint-dark",
  "--skin-paint-vertical-dark",
  "--skin-ink-light",
  "--skin-ink-dark",
];

function applyGalleryAccent(element, skin) {
  element.classList.toggle("gallery-exclusive-accent", !!skin.exclusive);
  if (skin.exclusive) {
    element.classList.add("skin-rarity-accent");
    element.classList.remove("classified-gradient");
    for (const property of ACCENT_PROPERTIES)
      element.style.removeProperty(property);
  } else {
    applyRarityAccent(element, skin.rarity);
  }
}

export function skinHistorySeries(events, identity) {
  const points = [];
  for (const [timestamp, kind, values] of events) {
    const hasValue = Object.hasOwn(values, identity);
    if (kind !== "baseline" && !hasValue) continue;
    points.push({
      time: Date.parse(timestamp),
      value: hasValue ? values[identity] : null,
    });
  }
  return points;
}

function svgNode(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [name, value] of Object.entries(attrs))
    node.setAttribute(name, String(value));
  return node;
}

function photoFor(skin, photoUrl) {
  const image = document.createElement("img");
  image.src = photoUrl(skin);
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("error", () => {
    if (image.getAttribute("src") !== PHOTO_FALLBACK)
      image.src = PHOTO_FALLBACK;
  });
  return image;
}

export function createSkinGallery({
  photoUrl,
  skinKey,
  fmt,
  getInventoryCount,
  setInventoryCount,
}) {
  let skins = [];
  let weapon = null;
  let weaponSkins = [];
  let coverButtons = [];
  let index = 0;
  let history = null;
  let historyRequest = null;
  let historyPromise = null;
  let historyError = false;
  let active = false;
  let swipeStart = null;
  let suppressClick = false;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let parallaxFrame = 0;
  let parallaxCover = null;
  let pointerX = 0;
  let pointerY = 0;
  let expanded = false;
  let zoomAnimating = false;
  let zoomTimer = 0;

  function zoomGeometry() {
    const stage = $("gallery-stage");
    const cover = coverButtons[index];
    if (!cover) return;
    const scale = Math.max(
      1,
      Math.min(
        2,
        (document.documentElement.clientWidth - 24) / cover.offsetWidth,
        (window.innerHeight - 100) / cover.offsetHeight,
      ),
    );
    stage.style.setProperty(
      "--gallery-zoom-depth",
      `${1000 * (1 - 1 / scale)}px`,
    );
  }

  function setExpanded(next, immediate = false) {
    const stage = $("gallery-stage");
    if (expanded === next && !immediate) return;
    resetParallax();
    clearTimeout(zoomTimer);
    zoomAnimating = !immediate && !reducedMotion.matches;
    if (next) zoomGeometry();
    expanded = next;
    stage.classList.toggle("is-expanded", expanded);
    stage.classList.toggle("is-zooming", zoomAnimating);
    if (!next) stage.style.setProperty("--gallery-zoom-depth", "0px");
    if (zoomAnimating) {
      zoomTimer = setTimeout(() => {
        zoomAnimating = false;
        stage.classList.remove("is-zooming");
      }, 600);
    }
  }

  function resetParallax() {
    cancelAnimationFrame(parallaxFrame);
    parallaxFrame = 0;
    if (!parallaxCover) return;
    for (const name of [
      "--parallax-rotate-x",
      "--parallax-rotate-y",
      "--parallax-x",
      "--parallax-y",
      "--image-parallax-x",
      "--image-parallax-y",
    ])
      parallaxCover.style.removeProperty(name);
    parallaxCover.classList.remove("is-parallax");
    parallaxCover = null;
  }

  function moveParallax(event, button, buttonIndex) {
    if (
      buttonIndex !== index ||
      event.pointerType !== "mouse" ||
      !finePointer.matches ||
      reducedMotion.matches ||
      zoomAnimating
    )
      return;
    if (parallaxCover && parallaxCover !== button) resetParallax();
    parallaxCover = button;
    button.classList.add("is-parallax");
    const rect = button.getBoundingClientRect();
    pointerX = Math.max(
      -1,
      Math.min(1, (2 * (event.clientX - rect.left)) / rect.width - 1),
    );
    pointerY = Math.max(
      -1,
      Math.min(1, (2 * (event.clientY - rect.top)) / rect.height - 1),
    );
    if (parallaxFrame) return;
    parallaxFrame = requestAnimationFrame(() => {
      parallaxFrame = 0;
      button.style.setProperty("--parallax-rotate-x", `${-pointerY * 6}deg`);
      button.style.setProperty("--parallax-rotate-y", `${pointerX * 7}deg`);
      button.style.setProperty("--parallax-x", `${pointerX * 5}px`);
      button.style.setProperty("--parallax-y", `${pointerY * 5}px`);
      button.style.setProperty("--image-parallax-x", `${pointerX * 10}px`);
      button.style.setProperty("--image-parallax-y", `${pointerY * 8}px`);
    });
  }

  reducedMotion.addEventListener("change", resetParallax);
  finePointer.addEventListener("change", resetParallax);

  function renderWeapons() {
    const container = $("gallery-weapons");
    container.replaceChildren();
    if (!skins.length) {
      const note = document.createElement("p");
      note.className = "gallery-empty";
      note.textContent = "Loading skins…";
      container.append(note);
      return;
    }
    const groups = new Map();
    for (const skin of skins) {
      if (!skin.weapon) continue;
      if (!groups.has(skin.weapon)) groups.set(skin.weapon, []);
      groups.get(skin.weapon).push(skin);
    }
    for (const name of [...groups.keys()].sort((a, b) => a.localeCompare(b))) {
      const group = groups.get(name);
      const featured = group.find((skin) => skin.defaultSkin) || group[0];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-weapon";
      button.setAttribute("aria-label", `Explore ${name} skins`);
      applyGalleryAccent(button, featured);
      const text = document.createElement("span");
      text.className = "gallery-weapon-copy";
      const title = document.createElement("strong");
      title.textContent = name;
      const count = document.createElement("small");
      count.textContent = `${group.length} ${group.length === 1 ? "SKIN" : "SKINS"} / EXPLORE ↗`;
      text.append(title, count);
      const accent = document.createElement("span");
      accent.className = "gallery-weapon-accent";
      button.append(text, photoFor(featured, photoUrl), accent);
      button.addEventListener("click", () => selectWeapon(name));
      container.append(button);
    }
  }

  function selectWeapon(name) {
    weapon = name;
    index = 0;
    buildCovers();
    $("gallery-chooser").hidden = true;
    $("gallery-explore").hidden = false;
    $("gallery-stage").focus({ preventScroll: true });
    if (!weaponSkins[index].untradable) ensureHistory();
  }

  function buildCovers(preferredKey) {
    setExpanded(false, true);
    weaponSkins = skins.filter((skin) => skin.weapon === weapon);
    const hasExclusive = weaponSkins.some((skin) => skin.exclusive);
    const exclusiveRank = (skin) => {
      if (skin.rarity === "Classified") return 0;
      if (skin.rarity === "Direct Classified") return 1;
      return skin.exclusive ? 2 : 3;
    };
    weaponSkins.sort(
      (a, b) =>
        (hasExclusive ? exclusiveRank(a) - exclusiveRank(b) : 0) ||
        (b.value ?? -1) - (a.value ?? -1) ||
        a.name.localeCompare(b.name),
    );
    if (!weaponSkins.length) {
      weapon = null;
      $("gallery-chooser").hidden = false;
      $("gallery-explore").hidden = true;
      return;
    }
    if (preferredKey) {
      const previousIndex = weaponSkins.findIndex(
        (skin) => skinKey(skin) === preferredKey,
      );
      index = previousIndex < 0 ? 0 : previousIndex;
    }
    index = Math.min(index, weaponSkins.length - 1);
    $("gallery-weapon-name").textContent = weapon;
    const jump = $("gallery-jump");
    jump.replaceChildren();
    const stage = $("gallery-stage");
    stage.replaceChildren();
    coverButtons = weaponSkins.map((skin, skinIndex) => {
      const option = document.createElement("option");
      option.value = String(skinIndex);
      option.textContent = skin.name;
      jump.append(option);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-cover";
      button.setAttribute(
        "aria-label",
        skin.untradable
          ? `${skin.name}, ${skin.weapon}, ${skin.rarity}, untradable`
          : `${skin.name}, ${skin.weapon}`,
      );
      applyGalleryAccent(button, skin);
      const inner = document.createElement("span");
      inner.className = "gallery-cover-inner";
      const art = document.createElement("span");
      art.className = "gallery-cover-art";
      const label = document.createElement("span");
      label.className = "gallery-cover-label";
      label.textContent = skin.name;
      art.append(photoFor(skin, photoUrl));
      inner.append(art, label);
      button.append(inner);
      button.addEventListener("pointermove", (event) =>
        moveParallax(event, button, skinIndex),
      );
      button.addEventListener("pointerleave", () => {
        if (parallaxCover === button) resetParallax();
      });
      button.addEventListener("click", () => {
        if (suppressClick) return;
        if (skinIndex === index) {
          setExpanded(!expanded);
          renderCoverState();
        } else setIndex(skinIndex);
      });
      stage.append(button);
      return button;
    });
    renderCurrent();
  }

  function setIndex(next) {
    const bounded = Math.min(Math.max(next, 0), weaponSkins.length - 1);
    if (bounded === index) return;
    setExpanded(false);
    index = bounded;
    renderCurrent();
    if (!weaponSkins[index].untradable) ensureHistory();
  }

  function renderCoverState() {
    coverButtons.forEach((button, buttonIndex) => {
      if (buttonIndex === index) {
        button.setAttribute("aria-pressed", String(expanded));
        button.title = expanded
          ? "Click to return card to normal size"
          : "Click to enlarge card";
      } else {
        button.removeAttribute("aria-pressed");
        button.removeAttribute("title");
      }
    });
  }

  function updateInventory() {
    const skin = weaponSkins[index];
    $("gallery-inventory-control").hidden = !skin || !!skin.untradable;
    if (!skin || skin.untradable) return;
    const count = getInventoryCount(skinKey(skin));
    $("gallery-inventory-count").textContent = `x${count}`;
    $("gallery-inventory-minus").disabled = count === 0;
    $("gallery-inventory-plus").disabled = count >= 9999;
    $("gallery-inventory-minus").setAttribute(
      "aria-label",
      `Remove one ${skin.name} from inventory`,
    );
    $("gallery-inventory-plus").setAttribute(
      "aria-label",
      `Add one ${skin.name} to inventory`,
    );
  }

  function renderCurrent() {
    resetParallax();
    const skin = weaponSkins[index];
    if (!skin) return;
    applyGalleryAccent($("gallery-explore"), skin);
    coverButtons.forEach((button, buttonIndex) => {
      const offset = buttonIndex - index;
      button.hidden = Math.abs(offset) > 2;
      if (!button.hidden) button.dataset.offset = String(offset);
      button.tabIndex = offset === 0 ? 0 : -1;
      if (offset === 0) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    renderCoverState();
    $("gallery-position").textContent = `${index + 1} / ${weaponSkins.length}`;
    $("gallery-prev").disabled = index === 0;
    $("gallery-next").disabled = index === weaponSkins.length - 1;
    $("gallery-jump").value = String(index);
    $("gallery-stage").setAttribute(
      "aria-label",
      `${skin.name}, ${index + 1} of ${weaponSkins.length}. Use left and right arrows to browse.`,
    );
    $("gallery-rarity").textContent = skin.rarity || "Unknown rarity";
    $("gallery-skin-name").textContent = skin.name;
    $("gallery-skin-meta").textContent = skin.weapon;
    $("gallery-skin-meta").hidden = !!skin.defaultSkin;
    $("gallery-banner").hidden = !!skin.untradable;
    $("gallery-value-block").hidden = !!skin.untradable;
    $("gallery-demand").hidden = !!skin.untradable;
    $("gallery-history-panel").hidden = !!skin.untradable;
    $("gallery-untradable-status").hidden = !skin.untradable;
    $("gallery-exclusive-panel").hidden = !skin.exclusive;
    renderAnimations(skin);
    updateInventory();
    if (skin.exclusive) {
      $("gallery-exclusive-kicker").textContent = skin.unlockLabel;
      $("gallery-exclusive-title").textContent = skin.unlockTitle;
      $("gallery-exclusive-description").textContent = skin.unlockDescription;
      $("gallery-exclusive-requirement").textContent = skin.requirement;
    }
    if (skin.untradable) return;
    $("gallery-banner").textContent =
      `BANNER / ${skin.collection || "Unknown"}`;
    $("gallery-value").textContent =
      skin.value === null ? "Unpriced" : fmt(skin.value);
    const details = [];
    if (skin.demand !== null) details.push(`Demand ${skin.demand}/10`);
    if (skin.trend && skin.trend !== "N/A") details.push(skin.trend);
    $("gallery-demand").textContent = details.join("  ·  ");
    renderChart();
  }

  function pauseShowcase() {
    $("gallery-animations").querySelector("video")?.pause();
  }

  function renderAnimations(skin) {
    const panel = $("gallery-animations");
    const key = skinKey(skin);
    const showcase = SKIN_SHOWCASES[key];
    const clips = showcase ? [] : SKIN_ANIMATIONS[key] || [];
    pauseShowcase();
    panel.replaceChildren();
    panel.hidden = !showcase && clips.length === 0;
    if (showcase) {
      const figure = document.createElement("figure");
      figure.className = "gallery-showcase";
      const caption = document.createElement("figcaption");
      caption.textContent = "WEAPON SHOWCASE";
      const video = document.createElement("video");
      video.src = showcase.src;
      video.poster = showcase.poster;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.width = 1280;
      video.height = 720;
      video.setAttribute(
        "aria-label",
        `${skin.name} ${skin.weapon} weapon showcase with ${showcase.description}`,
      );
      figure.append(caption, video);
      panel.append(figure);
      return;
    }
    for (const { label, src } of clips) {
      const figure = document.createElement("figure");
      const caption = document.createElement("figcaption");
      caption.textContent = label;
      const image = document.createElement("img");
      image.src = src;
      image.alt = `${skin.name} ${skin.weapon} ${label.toLowerCase()}`;
      image.width = 720;
      image.height = 405;
      image.loading = "lazy";
      figure.append(caption, image);
      panel.append(figure);
    }
  }

  function clearChart(message) {
    const svg = $("gallery-chart");
    svg.replaceChildren();
    svg.hidden = true;
    $("gallery-history-status").textContent = message;
    $("gallery-history-retry").hidden = !historyError;
    $("gallery-history-summary").textContent = "";
    svg.setAttribute("aria-label", message);
  }

  function renderChart() {
    const skin = weaponSkins[index];
    if (!skin || skin.untradable) return;
    if (!history) {
      clearChart(
        historyError
          ? "History is unavailable right now."
          : "Loading recorded history…",
      );
      return;
    }
    const values = skinHistorySeries(history, skinKey(skin));
    const firstIndex = values.findIndex((point) => point.value !== null);
    const lastIndex = values.findLastIndex((point) => point.value !== null);
    if (firstIndex < 0) {
      clearChart("No recorded values for this skin yet.");
      return;
    }
    const points = values.slice(firstIndex, lastIndex + 1);
    const priced = points.filter((point) => point.value !== null);
    const first = priced[0];
    const last = priced.at(-1);
    const low = Math.min(...priced.map((point) => point.value));
    const high = Math.max(...priced.map((point) => point.value));
    const padding = Math.max(1, (high - low) * 0.12);
    const yMin = Math.max(0, low - padding);
    const yMax = high + padding;
    const svg = $("gallery-chart");
    svg.replaceChildren();
    svg.hidden = false;
    $("gallery-history-retry").hidden = true;
    const plot = { left: 54, right: 543, top: 18, bottom: 170 };
    const x = (time) =>
      plot.left +
      (first.time === last.time
        ? 0.5
        : (time - first.time) / (last.time - first.time)) *
        (plot.right - plot.left);
    const y = (value) =>
      plot.bottom - ((value - yMin) / (yMax - yMin)) * (plot.bottom - plot.top);
    for (let tick = 0; tick <= 2; tick++) {
      const at = plot.top + (tick * (plot.bottom - plot.top)) / 2;
      svg.append(
        svgNode("line", {
          x1: plot.left,
          x2: plot.right,
          y1: at,
          y2: at,
          class: "gallery-chart-grid",
        }),
      );
      const label = svgNode("text", {
        x: plot.left - 9,
        y: at + 4,
        "text-anchor": "end",
        class: "gallery-chart-label",
      });
      label.textContent = fmt(Math.round(yMax - (tick * (yMax - yMin)) / 2));
      svg.append(label);
    }
    let path = "";
    let connected = false;
    for (const point of points) {
      if (point.value === null) {
        connected = false;
        continue;
      }
      path += `${connected ? "L" : "M"}${x(point.time).toFixed(1)},${y(point.value).toFixed(1)} `;
      connected = true;
    }
    svg.append(svgNode("path", { d: path, class: "gallery-chart-line" }));
    for (const point of first === last ? [last] : [first, last])
      svg.append(
        svgNode("circle", {
          cx: x(point.time),
          cy: y(point.value),
          r: point === last ? 5 : 3,
          class: "gallery-chart-dot",
        }),
      );
    const shortRange = last.time - first.time < 2 * 86_400_000;
    const dateLabel = (time) =>
      new Date(time).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        ...(shortRange ? { hour: "numeric", minute: "2-digit" } : {}),
        timeZone: "America/Detroit",
      });
    for (const point of first === last ? [last] : [first, last]) {
      const label = svgNode("text", {
        x: x(point.time),
        y: 204,
        "text-anchor":
          first === last ? "middle" : point === first ? "start" : "end",
        class: "gallery-chart-label",
      });
      label.textContent = dateLabel(point.time);
      svg.append(label);
    }
    $("gallery-history-status").textContent =
      `${priced.length} recorded ${priced.length === 1 ? "point" : "points"}`;
    $("gallery-history-summary").textContent =
      `First ${fmt(first.value)} · Latest recorded ${fmt(last.value)}`;
    svg.setAttribute(
      "aria-label",
      `${skin.name} value history: ${fmt(first.value)} on ${dateLabel(first.time)} to ${fmt(last.value)} on ${dateLabel(last.time)}.`,
    );
  }

  function ensureHistory() {
    if (history || historyPromise) return;
    const controller = new AbortController();
    historyRequest = controller;
    historyError = false;
    historyPromise = (async () => {
      const params = new URLSearchParams({ range: "all" });
      const events = [];
      let after;
      let until;
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
      } while (after);
      if (historyRequest === controller) history = events;
    })()
      .catch(() => {
        if (!controller.signal.aborted) historyError = true;
      })
      .finally(() => {
        if (historyRequest !== controller) return;
        historyPromise = null;
        historyRequest = null;
        renderChart();
      });
  }

  $("gallery-back").addEventListener("click", () => {
    pauseShowcase();
    setExpanded(false, true);
    weapon = null;
    $("gallery-explore").hidden = true;
    $("gallery-chooser").hidden = false;
    $("gallery-weapons")
      .querySelector("button")
      ?.focus({ preventScroll: true });
  });
  $("gallery-prev").addEventListener("click", () => setIndex(index - 1));
  $("gallery-next").addEventListener("click", () => setIndex(index + 1));
  $("gallery-jump").addEventListener("change", (event) =>
    setIndex(Number(event.target.value)),
  );
  $("gallery-history-retry").addEventListener("click", () => {
    ensureHistory();
    renderChart();
  });
  for (const [id, change] of [
    ["gallery-inventory-minus", -1],
    ["gallery-inventory-plus", 1],
  ]) {
    $(id).addEventListener("click", () => {
      const skin = weaponSkins[index];
      if (!skin || skin.untradable) return;
      const key = skinKey(skin);
      setInventoryCount(key, getInventoryCount(key) + change);
    });
  }
  $("gallery-stage").addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setIndex(index + (event.key === "ArrowRight" ? 1 : -1));
  });
  $("gallery-stage").addEventListener(
    "touchstart",
    (event) => {
      swipeStart = event.changedTouches[0]?.clientX ?? null;
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    if (expanded) zoomGeometry();
  });
  $("gallery-stage").addEventListener(
    "touchend",
    (event) => {
      if (swipeStart === null) return;
      const distance = event.changedTouches[0].clientX - swipeStart;
      swipeStart = null;
      if (Math.abs(distance) < 45) return;
      suppressClick = true;
      setIndex(index + (distance < 0 ? 1 : -1));
      setTimeout(() => (suppressClick = false), 350);
    },
    { passive: true },
  );

  renderWeapons();
  return {
    enter() {
      active = true;
      if (weapon && !history && !weaponSkins[index]?.untradable)
        ensureHistory();
    },
    leave() {
      active = false;
      pauseShowcase();
      setExpanded(false, true);
      historyRequest?.abort();
      historyRequest = null;
      historyPromise = null;
    },
    refresh(nextSkins) {
      const selectedKey = weaponSkins[index] && skinKey(weaponSkins[index]);
      skins = [...nextSkins, ...EXCLUSIVE_SKINS, ...DEFAULT_SKINS];
      renderWeapons();
      historyRequest?.abort();
      historyRequest = null;
      historyPromise = null;
      history = null;
      historyError = false;
      if (weapon) {
        buildCovers(selectedKey);
        if (weapon && active && !weaponSkins[index]?.untradable)
          ensureHistory();
      }
    },
    updateInventory,
  };
}
