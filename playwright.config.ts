import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts', fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: 'http://localhost:3040', viewport: { width: 1280, height: 720 }, channel: process.env.PLAYWRIGHT_CHANNEL || undefined, permissions: ['screen-wake-lock'], screenshot: 'only-on-failure' },
  webServer: { command: 'npx slidev example.md --port 3040', url: 'http://localhost:3040', reuseExistingServer: !process.env.CI, timeout: 120000 },
})
