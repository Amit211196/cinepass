/// <reference types="node" />

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.BACKEND_BASE_URL || 'http://127.0.0.1:8080',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});
