const $ = (id) => document.getElementById(id);
const PHOTO_FALLBACK = "/skin-photos/unknown.png";

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

export function createSkinGallery({ photoUrl, skinKey, fmt }) {
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

  function resetParallax() {
    cancelAnimationFrame(parallaxFrame);
    parallaxFrame = 0;
    if (!parallaxCover) return;
    for (const name of [
      "--parallax-rotate-x",
      "--parallax-rotate-y",
      "--parallax-x",
      "--parallax-y",
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
      reducedMotion.matches
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
      const featured = [...group].sort(
        (a, b) => (b.value ?? -1) - (a.value ?? -1),
      )[0];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-weapon";
      button.setAttribute("aria-label", `Explore ${name} skins`);
      const text = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = name;
      const count = document.createElement("small");
      count.textContent = `${group.length} ${group.length === 1 ? "SKIN" : "SKINS"} / EXPLORE ↗`;
      text.append(title, count);
      button.append(text, photoFor(featured, photoUrl));
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
    ensureHistory();
  }

  function buildCovers(preferredKey) {
    resetParallax();
    weaponSkins = skins
      .filter((skin) => skin.weapon === weapon)
      .sort(
        (a, b) =>
          (b.value ?? -1) - (a.value ?? -1) || a.name.localeCompare(b.name),
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
      button.setAttribute("aria-label", `${skin.name}, ${skin.weapon}`);
      const inner = document.createElement("span");
      inner.className = "gallery-cover-inner";
      const label = document.createElement("span");
      label.className = "gallery-cover-label";
      label.textContent = skin.name;
      inner.append(photoFor(skin, photoUrl), label);
      button.append(inner);
      button.addEventListener("pointermove", (event) =>
        moveParallax(event, button, skinIndex),
      );
      button.addEventListener("pointerleave", () => {
        if (parallaxCover === button) resetParallax();
      });
      button.addEventListener("click", () => {
        if (suppressClick) return;
        setIndex(skinIndex);
      });
      stage.append(button);
      return button;
    });
    renderCurrent();
  }

  function setIndex(next) {
    const bounded = Math.min(Math.max(next, 0), weaponSkins.length - 1);
    if (bounded === index) return;
    index = bounded;
    renderCurrent();
  }

  function renderCurrent() {
    resetParallax();
    const skin = weaponSkins[index];
    if (!skin) return;
    coverButtons.forEach((button, buttonIndex) => {
      const offset = buttonIndex - index;
      button.hidden = Math.abs(offset) > 2;
      if (!button.hidden) button.dataset.offset = String(offset);
      button.tabIndex = offset === 0 ? 0 : -1;
      if (offset === 0) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
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
    if (!skin) return;
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
      if (weapon && !history) ensureHistory();
    },
    leave() {
      active = false;
      resetParallax();
      historyRequest?.abort();
      historyRequest = null;
      historyPromise = null;
    },
    refresh(nextSkins) {
      const selectedKey = weaponSkins[index] && skinKey(weaponSkins[index]);
      skins = nextSkins;
      renderWeapons();
      historyRequest?.abort();
      historyRequest = null;
      historyPromise = null;
      history = null;
      historyError = false;
      if (weapon) {
        buildCovers(selectedKey);
        if (weapon && active) ensureHistory();
      }
    },
  };
}
