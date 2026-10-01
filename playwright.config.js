import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/browser",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:8788",
    browserName: "chromium",
    headless: true,
    reducedMotion: "reduce",
  },
  webServer: {
    command: "node test/serve.mjs",
    url: "http://127.0.0.1:8788",
    reuseExistingServer: false,
  },
});
