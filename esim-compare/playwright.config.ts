import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    cwd: __dirname,
    env: {
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    },
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
