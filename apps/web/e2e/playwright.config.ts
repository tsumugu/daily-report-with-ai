import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../../api',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'npm start',
      cwd: '..',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
    },
  ],
});

