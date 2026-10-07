import { fetchSkins } from "./sheet.js";
import { fetchScamList } from "./scam-list.js";
import { getHistoryPage, recordSnapshot } from "./history.js";

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.method !== "GET")
      return json({ error: "Use GET." }, 405, { Allow: "GET" });
    let cacheUrl;
    let load;
    if (url.pathname === "/api/skins") {
      // Refresh rechecks this shared cache; visitors cannot bypass upstream protection.
      cacheUrl = `${url.origin}/api/skins`;
      load = () => fetchSkins(env);
    } else if (url.pathname === "/api/scam-list") {
      cacheUrl = `${url.origin}/api/scam-list`;
      load = () => fetchScamList(env);
    } else if (url.pathname === "/api/history") {
      const range = url.searchParams.get("range") || "7";
      if (!["1", "3", "7", "30", "90", "all"].includes(range))
        return json({ error: "Invalid history range." }, 400);
      const until =
        url.searchParams.get("until") ||
        new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
      const after = url.searchParams.get("after");
      const isTimestamp = (value) =>
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
        Number.isFinite(Date.parse(value));
      if (
        !isTimestamp(until) ||
        (after && (!isTimestamp(after) || after >= until))
      )
        return json({ error: "Invalid history cursor." }, 400);
      const params = new URLSearchParams({ range, until });
      if (after) params.set("after", after);
      cacheUrl = `${url.origin}/api/history?${params}`;
      load = () => getHistoryPage(env.DB, { range, until, after });
    } else return json({ error: "Not found." }, 404);

    try {
      const cache = caches.default;
      const cached = await cache.match(cacheUrl);
      if (cached) return cached;
      const response = json(await load(), 200, {
        "Cache-Control": "public, max-age=120",
      });
      ctx.waitUntil(cache.put(cacheUrl, response.clone()));
      return response;
    } catch (error) {
      console.error("Data request failed", url.pathname, error.message);
      return json(
        { error: "The requested data is unavailable. Please retry shortly." },
        502,
      );
    }
  },
  async scheduled(controller, env) {
    const skins = await fetchSkins(env);
    await recordSnapshot(env.DB, skins, new Date(controller.scheduledTime));
  },
};
