// Paste into the existing Apps Script project and run once before retiring it.
function exportRedlinerHistory() {
  const history = getValueHistory();
  const file = DriveApp.createFile(
    "redliner-history.json",
    JSON.stringify(history),
    MimeType.PLAIN_TEXT,
  );
  console.log("Download your history export from: " + file.getUrl());
}
