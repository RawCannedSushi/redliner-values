const $ = (id) => document.getElementById(id);

function node(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}

function field(label, values, className) {
  const container = node("div", `scam-entry-field ${className}`);
  container.append(node("span", "scam-field-label", label));
  if (!values.length) {
    container.append(node("p", "scam-field-empty", "—"));
  } else {
    for (const value of values) container.append(node("p", "", value));
  }
  return container;
}

export function createScamList() {
  const search = $("scam-search");
  const entries = $("scam-entries");
  const status = $("scam-status");
  const retry = $("scam-retry");
  let data = null;
  let loading = false;
  let lastChecked = 0;

  function renderEntries() {
    if (!data) return;
    const query = search.value.trim().toLocaleLowerCase();
    const matching = data.entries.filter((entry) =>
      [entry.infraction, ...entry.accounts, ...entry.context, ...entry.notes]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
    const fragment = document.createDocumentFragment();
    for (const entry of matching) {
      const article = node("article", "scam-entry");
      article.append(
        field(
          data.headings[0] || "Infraction",
          [entry.infraction],
          "scam-infraction",
        ),
        field(
          data.headings[1] || "Roblox & Discord",
          entry.accounts,
          "scam-accounts",
        ),
        field(
          data.headings[2] || "Explanation / context",
          entry.context,
          "scam-context",
        ),
        field(data.headings[3] || "Extra notes", entry.notes, "scam-notes"),
      );
      fragment.append(article);
    }
    entries.replaceChildren(fragment);
    $("scam-count").textContent = query
      ? `${matching.length} of ${data.entries.length} entries`
      : `${data.entries.length} ${data.entries.length === 1 ? "entry" : "entries"}`;
    if (!matching.length) {
      status.textContent = query
        ? "No entries match that search."
        : "No entries listed yet.";
      status.hidden = false;
    } else if (retry.hidden) {
      status.hidden = true;
    }
  }

  function renderDetails() {
    $("scam-intro").textContent = data.title;
    const report = $("scam-report");
    report.hidden = !data.report;
    $("scam-report-text").textContent = data.report;
    const link = $("scam-report-link");
    link.hidden = !data.reportUrl;
    if (data.reportUrl) link.href = data.reportUrl;

    const guide = $("scam-guidance");
    guide.hidden = !data.guideTitle && !data.definitions.length;
    $("scam-guide-title").textContent = data.guideTitle;
    const definitions = document.createDocumentFragment();
    for (const item of data.definitions) {
      const card = node("article", "scam-definition");
      card.append(node("h4", "", item.heading), node("p", "", item.body));
      definitions.append(card);
    }
    $("scam-definitions").replaceChildren(definitions);

    const disclaimer = $("scam-disclaimer");
    disclaimer.hidden = !data.disclaimer;
    $("scam-disclaimer-title").textContent = data.disclaimer?.heading || "";
    $("scam-disclaimer-body").textContent = data.disclaimer?.body || "";
  }

  async function load() {
    if (loading) return;
    loading = true;
    retry.disabled = true;
    status.hidden = false;
    status.textContent = data
      ? "Checking for updates…"
      : "Loading the scam list…";
    try {
      const response = await fetch("/api/scam-list", { cache: "no-store" });
      if (!response.ok) throw new Error("Scam list request failed");
      const next = await response.json();
      if (!Array.isArray(next.entries) || !Array.isArray(next.headings))
        throw new Error("Scam list response was incomplete");
      data = next;
      lastChecked = Date.now();
      retry.hidden = true;
      renderDetails();
      renderEntries();
    } catch {
      status.textContent = data
        ? "Could not check for updates. Showing the last loaded list."
        : "The scam list is unavailable. Please try again.";
      status.hidden = false;
      retry.hidden = false;
    } finally {
      loading = false;
      retry.disabled = false;
    }
  }

  search.addEventListener("input", renderEntries);
  retry.addEventListener("click", load);
  return {
    enter() {
      if (!data || Date.now() - lastChecked >= 120000) load();
    },
  };
}
