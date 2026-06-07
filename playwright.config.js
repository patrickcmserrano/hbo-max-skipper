import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 20000,
  // Chrome extensions não funcionam em modo headless.
  use: { headless: false },
  webServer: {
    command: 'python3 -m http.server 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
  },
});
