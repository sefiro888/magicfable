import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  /**
   * Cada prueba levanta un tablero WebGL real y, sin GPU, Chromium lo rasteriza
   * por software. Con los escenarios nuevos (plaza, columnata, lago, lava) eso
   * pesa lo suyo: con los ~5 workers por defecto los navegadores se robaban la
   * CPU entre ellos y alguna prueba agotaba su tiempo sin que nada estuviera
   * roto. Tres workers y un minuto por prueba dejan margen de sobra.
   */
  workers: 3,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
