# Make the value sheet private

The website is ready to read values through a dedicated Google service account. The sheet owner does **not** need access to your Google Cloud project. They only need to give the account Viewer access to the sheet.

Do these steps in order. Keep the sheet publicly readable until the private connection has been tested, so the live values and 15-minute history updates keep working during setup.

1. In [Google Cloud Console](https://console.cloud.google.com/), choose the **redliner-values** project at the top.
2. Open [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=redliner-values) and click **Enable** if it is not already enabled.
3. Open [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=redliner-values) and click **Create service account**. Name it `redliner-values-reader`, then click **Done**. You do not need to give it a project role.
4. Open the new service account and copy its email address. It will end in `.gserviceaccount.com`. Send only that email address to the sheet owner. Ask them to open the sheet, click **Share**, add the address as a **Viewer**, and click **Send**. They should leave the sheet's general access as it is for now.
5. Back in the service account, open **Keys** → **Add key** → **Create new key** → **JSON**. Save the downloaded JSON file outside the GitHub repository. Treat it like a password: do not upload it to GitHub, paste it into chat, or send it to the sheet owner.
6. Add the _entire JSON file_ as a Cloudflare Worker secret named `GOOGLE_SERVICE_ACCOUNT_JSON`. One way is to open a terminal in the `redliner-values` project and run `npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON < /absolute/path/to/downloaded-key.json`. You can also add it in Cloudflare's Worker **Settings → Variables and Secrets**; choose **Secret**, paste the whole JSON, and save. The Worker name is `archives-redliner-values`. Cloudflare already has the `SHEET_ID` secret.
7. After the secret is saved, check `https://archivesvalues.com/api/skins`. It should return the current skin list. Wait at least two minutes after adding the secret before relying on this check, because the public API response is briefly cached. Check again after a value change or compare a known current value. Do not change sheet sharing if the API returns an error or stale values.
8. Once private reading is confirmed, the owner can change the sheet's **General access** to **Restricted**. Keep the service account as a Viewer. Check the website's value list and chart again, then check after the next 15-minute history update.

Only the site server uses the service-account key. Visitors still see the published values and historical chart data through the site; they cannot open the underlying private sheet through the site. The owner can continue editing the sheet normally. The sheet's old link may still exist in GitHub history or messages, but restricting sharing prevents those links from opening it without permission.
