export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const DRIVE_FILE = "archives-redliner-inventory.json";
const FORMAT = "archives-redliner-inventory-v1";
const API = "https://www.googleapis.com";
let gisPromise;

function loadGoogleIdentity() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const finish = (error) => {
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) {
        script.remove();
        reject(error);
      } else resolve();
    };
    const timer = setTimeout(
      () => finish(new Error("Google sign-in timed out. Try again.")),
      15000,
    );
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () =>
      finish(
        globalThis.google?.accounts?.oauth2
          ? null
          : new Error("Google sign-in is unavailable."),
      );
    script.onerror = () =>
      finish(new Error("Google sign-in could not load. Try again."));
    document.head.append(script);
  }).finally(() => {
    gisPromise = null;
  });
  return gisPromise;
}

export function checkedInventory(data) {
  if (
    !data ||
    data.format !== FORMAT ||
    !data.items ||
    typeof data.items !== "object" ||
    Array.isArray(data.items)
  )
    throw new Error("This is not a supported inventory backup.");
  const entries = Object.entries(data.items);
  if (entries.length > 10000) throw new Error("Inventory is too large.");
  const items = {};
  for (const [key, quantity] of entries) {
    const parts = key.split("\u001f");
    if (
      key.length > 500 ||
      parts.length !== 2 ||
      parts.some((part) => !part) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 9999
    )
      throw new Error("Inventory contains an invalid skin or quantity.");
    items[key] = quantity;
  }
  return items;
}

function snapshot(data) {
  return {
    format: FORMAT,
    updatedAt:
      typeof data?.updatedAt === "string" &&
      Number.isFinite(Date.parse(data.updatedAt))
        ? data.updatedAt
        : null,
    items: checkedInventory(data),
  };
}
function fingerprint(data) {
  return JSON.stringify(
    Object.entries(data.items).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}
function requireEtag(data) {
  if (typeof data?.etag !== "string" || !/^"[^"\r\n]+"$/.test(data.etag))
    throw new Error(
      "Google did not provide a revision guard. No unguarded upload or deletion will be attempted.",
    );
  return data.etag;
}

export function createGoogleDriveSync({
  clientId,
  getLocal,
  applyRemote,
  chooseCopy,
  setStatus,
  setConnected,
  setBusy = () => {},
  uploadDelay = 700,
}) {
  const configured = /^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(
    clientId,
  );
  let accessToken = "",
    tokenExpiresAt = 0,
    baseline = null;
  let ready = false,
    epoch = 0,
    controller = new AbortController();
  let operation = null,
    uploadTimer,
    dirty = false,
    deleting = false;
  const current = (generation) => {
    if (generation !== epoch)
      throw new DOMException("Disconnected", "AbortError");
  };
  const validToken = () => accessToken && Date.now() < tokenExpiresAt - 60000;
  function pause() {
    ready = false;
    dirty = false;
    clearTimeout(uploadTimer);
  }
  function reset() {
    pause();
    epoch++;
    controller.abort();
    controller = new AbortController();
    accessToken = "";
    tokenExpiresAt = 0;
    baseline = null;
    setConnected(false);
  }
  async function request(path, options = {}) {
    if (!validToken())
      throw new Error("Google access expired. Reconnect to continue.");
    const generation = epoch;
    const response = await fetch(`${API}${path}`, {
      ...options,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
      headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
    });
    current(generation);
    if (response.status === 412)
      throw new Error(
        "Another device changed the Google copy. Click Sync to review both copies.",
      );
    if (response.status === 401)
      throw new Error(
        "Google access expired or was revoked. Reconnect to continue.",
      );
    if (response.status === 404)
      throw new Error(
        "The Google copy was removed. Reconnect explicitly to create a new copy.",
      );
    if (!response.ok)
      throw new Error(`Google Drive returned HTTP ${response.status}.`);
    return response;
  }
  async function json(path, options) {
    const generation = epoch;
    const response = await request(path, options);
    const body = await response.text();
    current(generation);
    if (body.length > 2000000)
      throw new Error("Google inventory response is too large.");
    return JSON.parse(body);
  }
  async function findFile() {
    const params = new URLSearchParams({
      spaces: "appDataFolder",
      q: `name = '${DRIVE_FILE}' and trashed = false`,
      fields: "files(id),nextPageToken",
      pageSize: "2",
    });
    const result = await json(`/drive/v3/files?${params}`);
    if (!Array.isArray(result.files))
      throw new Error("Google returned an invalid file list.");
    if (result.files.length > 1 || result.nextPageToken)
      throw new Error(
        "Multiple Google inventory copies exist. Sync is paused to preserve them. Export your local inventory before resolving duplicates.",
      );
    const id = result.files[0]?.id;
    if (result.files.length && (typeof id !== "string" || !id))
      throw new Error("Google returned an invalid file ID.");
    return id || null;
  }
  // Drive v2 exposes the file ETag in JSON. Never fall back to an unconditional write.
  async function metadata(id) {
    return requireEtag(
      await json(`/drive/v2/files/${encodeURIComponent(id)}?fields=etag`),
    );
  }
  async function read(id) {
    const etag = await metadata(id);
    const data = snapshot(
      await json(`/drive/v3/files/${encodeURIComponent(id)}?alt=media`),
    );
    if (etag !== (await metadata(id)))
      throw new Error(
        "Google inventory changed while loading. Click Sync to retry.",
      );
    return { id, etag, data };
  }
  async function write(data) {
    if (baseline) {
      const result = await json(
        `/upload/drive/v2/files/${encodeURIComponent(baseline.id)}?uploadType=media&fields=id,etag`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "If-Match": baseline.etag,
          },
          body: JSON.stringify(data),
        },
      );
      baseline = { id: baseline.id, etag: requireEtag(result), data };
      return;
    }
    if (await findFile())
      throw new Error(
        "Another device created a Google copy. Click Sync to review it.",
      );
    const boundary = `redliner_${crypto.randomUUID().replaceAll("-", "")}`;
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: DRIVE_FILE, parents: ["appDataFolder"], mimeType: "application/json" })}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--${boundary}--`;
    const created = await json(
      "/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      },
    );
    if (!created.id || (await findFile()) !== created.id)
      throw new Error(
        "Google copy could not be confirmed. Click Sync to review it.",
      );
    const saved = await read(created.id);
    if (fingerprint(saved.data) !== fingerprint(data))
      throw new Error(
        "Another device changed the new Google copy. Click Sync to review it.",
      );
    baseline = saved;
  }
  function run(task) {
    if (operation) return operation;
    const generation = epoch;
    setBusy(true);
    // Invoke now: OAuth popup must start during the user's click, before any await.
    operation = task()
      .catch((error) => {
        if (generation !== epoch) return;
        pause();
        if (!validToken() || /expired|revoked/.test(error.message)) reset();
        setStatus(`Google sync paused: ${error.message}`);
      })
      .finally(() => {
        operation = null;
        setBusy(false);
        if (generation === epoch && ready && dirty && !deleting) queueUpload();
      });
    return operation;
  }
  function authorize() {
    if (validToken()) return Promise.resolve();
    const generation = epoch,
      signal = controller.signal;
    return new Promise((resolve, reject) => {
      const abort = () =>
        reject(new DOMException("Disconnected", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      const finish = (error) => {
        signal.removeEventListener("abort", abort);
        error ? reject(error) : resolve();
      };
      const oauth = globalThis.google.accounts.oauth2;
      const tokenClient = oauth.initTokenClient({
        client_id: clientId,
        scope: DRIVE_SCOPE,
        include_granted_scopes: false,
        callback: (response) => {
          if (generation !== epoch) return;
          if (
            response.error ||
            !response.access_token ||
            !oauth.hasGrantedAllScopes(response, DRIVE_SCOPE) ||
            !(Number(response.expires_in) > 60)
          ) {
            finish(
              new Error(
                "Google did not grant the required app-data permission. Nothing was synced.",
              ),
            );
            return;
          }
          accessToken = response.access_token;
          tokenExpiresAt = Date.now() + Number(response.expires_in) * 1000;
          finish();
        },
        error_callback: () =>
          finish(
            new Error(
              "Google sign-in was closed or blocked. Try opening the website in a new tab.",
            ),
          ),
      });
      tokenClient.requestAccessToken({ prompt: "select_account" });
    });
  }
  function connect() {
    if (!configured) {
      setStatus("Google sync has not been configured by the site owner yet.");
      return Promise.resolve();
    }
    if (deleting) return Promise.resolve();
    return run(async () => {
      pause();
      const generation = epoch;
      if (!globalThis.google?.accounts?.oauth2) {
        await loadGoogleIdentity();
        current(generation);
        setStatus("Google sign-in is ready. Click Sync again to open Google.");
        return;
      }
      setStatus("Connecting securely to Google Drive…");
      await authorize();
      current(generation);
      setConnected(true);
      const local = snapshot(getLocal());
      const id = await findFile();
      const remote = id ? await read(id) : null;
      baseline = remote;
      let choice = remote ? "same" : "local";
      if (remote && fingerprint(remote.data) !== fingerprint(local)) {
        choice = await chooseCopy(remote.data, local, controller.signal);
        current(generation);
      }
      if (!["local", "remote", "same"].includes(choice)) {
        pause();
        setStatus(
          "Sync cancelled. Both inventories are unchanged; automatic uploads are paused.",
        );
        return;
      }
      if (fingerprint(snapshot(getLocal())) !== fingerprint(local))
        throw new Error(
          "This device changed during sync. Click Sync to review the latest copies.",
        );
      if (choice === "remote") {
        if ((await metadata(remote.id)) !== remote.etag)
          throw new Error(
            "Google inventory changed during your choice. Click Sync to review it again.",
          );
        // Local edits can happen while the revision check is in flight, too.
        if (fingerprint(snapshot(getLocal())) !== fingerprint(local))
          throw new Error(
            "This device changed during sync. Click Sync to review the latest copies.",
          );
        applyRemote(remote.data);
      } else if (choice === "local") await write(local);
      ready = true;
      dirty = fingerprint(snapshot(getLocal())) !== fingerprint(baseline.data);
      setStatus(
        choice === "remote"
          ? "Inventory restored from Google Drive. Sync is active."
          : "Inventory synced with Google Drive. Sync is active.",
      );
    });
  }
  function queueUpload() {
    if (!ready || deleting) return;
    dirty = true;
    clearTimeout(uploadTimer);
    uploadTimer = setTimeout(() => {
      if (operation || !ready || deleting) return;
      run(async () => {
        dirty = false;
        const local = snapshot(getLocal());
        if (fingerprint(local) !== fingerprint(baseline.data))
          await write(local);
        setStatus("Inventory synced with Google Drive.");
      });
    }, uploadDelay);
  }
  function disconnect() {
    reset();
    setStatus(
      "Google Drive disconnected on this page. Both inventory copies remain.",
    );
  }
  async function deleteRemote() {
    if (deleting) return;
    deleting = true;
    pause();
    const generation = epoch;
    // Let an already-sent upload finish before deleting its resulting revision.
    await operation;
    if (generation !== epoch) {
      deleting = false;
      return;
    }
    pause();
    try {
      await run(async () => {
        if (!baseline)
          throw new Error(
            "Connect and review the Google copy before deleting it.",
          );
        await request(`/drive/v2/files/${encodeURIComponent(baseline.id)}`, {
          method: "DELETE",
          headers: { "If-Match": baseline.etag },
        });
        reset();
        setStatus(
          "Google Drive inventory deleted and sync disconnected. Local inventory remains.",
        );
      });
    } finally {
      deleting = false;
    }
  }
  return { configured, connect, disconnect, deleteRemote, queueUpload };
}
