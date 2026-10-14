const $ = (id) => document.getElementById(id);
const SITE_DEVELOPER = "Sushi (@ttvsushi)";
const SITE_CONTRIBUTORS = [
  "Lee (@liamgraves) - Weapon video help",
  "Gluin (@gluin_025) - Weapon video help",
];
const LOWERCASE_NAMES = new Set(["vspec", "vsped", "spaccy", "sinzeri"]);
const MEMBER_HANDLES = new Map([
  ["vspec", "@countkatanas"],
  ["mohamay", "@Mohamay"],
  ["sinzeri", "@sinzeri"],
  ["rio", "@perksaholic"],
  ["zerby", "@_zerby_"],
  ["gatecross", "@baehearts4u"],
  ["yuu", "@ti9g"],
  ["emilismk", "@emilismk"],
  ["spaccy", "@spaccy"],
]);

function displayMember(member) {
  const name = member.split(" (")[0];
  const lowercaseName = name.toLowerCase();
  const displayName = LOWERCASE_NAMES.has(lowercaseName)
    ? lowercaseName
    : name.charAt(0).toUpperCase() + name.slice(1);
  const suffix = member.slice(name.length);
  const handle = MEMBER_HANDLES.get(lowercaseName);
  if (!handle || /\(@[^)]*\)/.test(member)) return displayName + suffix;
  return `${displayName} (${handle})${suffix}`;
}

export function createCredits() {
  const groups = $("credits-groups");
  const status = $("credits-status");
  const retry = $("credits-retry");
  let data = null;
  let loading = false;
  let lastChecked = 0;

  function render() {
    const displayGroups = data.groups.map(({ role, members }) => ({
      role,
      members: [...members],
    }));
    let developer = displayGroups.find(
      ({ role }) => role.trim().toLowerCase() === "website developer",
    );
    if (!developer) {
      developer = { role: "Website Developer", members: [] };
      displayGroups.push(developer);
    }
    if (!developer.members.includes(SITE_DEVELOPER))
      developer.members.push(SITE_DEVELOPER);
    let contributor = displayGroups.find(
      ({ role }) => role.trim().toLowerCase() === "website contributor",
    );
    if (!contributor) {
      contributor = { role: "Website Contributor", members: [] };
      displayGroups.push(contributor);
    }
    for (const member of SITE_CONTRIBUTORS) {
      if (!contributor.members.includes(member))
        contributor.members.push(member);
    }

    const fragment = document.createDocumentFragment();
    for (const group of displayGroups) {
      const card = document.createElement("section");
      card.className = "credits-group";
      const heading = document.createElement("h3");
      heading.textContent = group.role;
      const names = document.createElement("ul");
      for (const member of group.members) {
        const item = document.createElement("li");
        item.textContent = displayMember(member);
        names.append(item);
      }
      card.append(heading, names);
      fragment.append(card);
    }
    groups.replaceChildren(fragment);
    status.hidden = true;
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
