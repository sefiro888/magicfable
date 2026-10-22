import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  /**
   * Cada prueba levanta un tablero WebGL real y, sin GPU, Chromium lo rasteriza
   * por software. Con los escenarios nuevos (plaza, columnata, lago, lava) eso
   * pesa lo suyo. Con el lienzo a ancho completo, tres navegadores llegaron
   * a tardar varios segundos por pulsación bajo rasterizado por CPU y hasta
   * retrasaban la carga de rutas. Dos evitan esa contención sin ampliar los
   * límites de las comprobaciones ni reducir la calidad que estas verifican.
   */
  workers: 2,
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
