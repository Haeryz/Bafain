import { defineConfig, devices } from "@playwright/test"

const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT || 5173)
const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT || 8000)
const frontendBaseUrl = `http://127.0.0.1:${FRONTEND_PORT}`
const backendBaseUrl = `http://127.0.0.1:${BACKEND_PORT}`

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: frontendBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "python main.py",
      cwd: "./backend",
      url: `${backendBaseUrl}/health`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: String(BACKEND_PORT),
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${FRONTEND_PORT}`,
      cwd: ".",
      url: frontendBaseUrl,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        VITE_API_BASE_URL: backendBaseUrl,
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
