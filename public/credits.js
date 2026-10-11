const $ = (id) => document.getElementById(id);

export function createCredits() {
  const groups = $("credits-groups");
  const status = $("credits-status");
  const retry = $("credits-retry");
  let data = null;
  let loading = false;
  let lastChecked = 0;

  function render() {
    const fragment = document.createDocumentFragment();
    for (const group of data.groups) {
      const card = document.createElement("section");
      card.className = "credits-group";
      const heading = document.createElement("h3");
      heading.textContent = group.role;
      const names = document.createElement("ul");
      for (const member of group.members) {
        const item = document.createElement("li");
        item.textContent = member;
        names.append(item);
      }
      card.append(heading, names);
      fragment.append(card);
    }
    groups.replaceChildren(fragment);
    status.hidden = !!data.groups.length;
    if (!data.groups.length) status.textContent = "No credits listed yet.";
  }

  async function load() {
    if (loading) return;
    loading = true;
    retry.disabled = true;
    status.hidden = false;
    status.textContent = data ? "Checking for updates…" : "Loading credits…";
    try {
      const response = await fetch("/api/credits", { cache: "no-store" });
      if (!response.ok) throw new Error("Credits request failed");
      const next = await response.json();
      if (
        !Array.isArray(next.groups) ||
        !next.groups.every(
          (group) =>
            typeof group.role === "string" && Array.isArray(group.members),
        )
      )
        throw new Error("Credits response was incomplete");
      data = next;
      lastChecked = Date.now();
      retry.hidden = true;
      render();
    } catch {
      status.textContent = data
        ? "Could not check for updates. Showing the last loaded credits."
        : "Credits are unavailable. Please try again.";
      status.hidden = false;
      retry.hidden = false;
    } finally {
      loading = false;
      retry.disabled = false;
    }
  }

  retry.addEventListener("click", load);
  return {
    enter() {
      if (!data || Date.now() - lastChecked >= 120000) load();
    },
  };
}
