const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_READ_SCOPE =
  "https://www.googleapis.com/auth/spreadsheets.readonly";
let cachedToken = null;
let pendingToken = null;

function base64url(input) {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

async function exchangeToken(credentials) {
  const pem = credentials.private_key;
  const email = credentials.client_email;
  if (
    typeof pem !== "string" ||
    !pem.includes("-----BEGIN PRIVATE KEY-----") ||
    typeof email !== "string" ||
    !email.endsWith(".gserviceaccount.com")
  )
    throw new Error("Google service account is not configured correctly.");

  const keyBytes = Uint8Array.from(
    atob(
      pem.replace(
        /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,
        "",
      ),
    ),
    (character) => character.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  if (credentials.private_key_id) header.kid = credentials.private_key_id;
  const claims = {
    iss: email,
    scope: SHEETS_READ_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${base64url(signature)}`,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(`Google authentication failed (${response.status}).`);
  const result = await response.json();
  if (typeof result.access_token !== "string" || !result.expires_in)
    throw new Error("Google did not return an access token.");
  cachedToken = {
    value: result.access_token,
    expiresAt: Date.now() + Math.max(0, result.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export async function googleAccessToken(secret) {
  if (cachedToken && Date.now() < cachedToken.expiresAt)
    return cachedToken.value;
  if (!pendingToken) {
    pendingToken = exchangeToken(JSON.parse(secret)).finally(() => {
      pendingToken = null;
    });
  }
  return pendingToken;
}
