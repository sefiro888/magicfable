import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  /**
   * Cada prueba levanta un tablero WebGL real y, sin GPU, Chromium lo rasteriza
   * por software. Con los escenarios nuevos (plaza, columnata, lago, lava) eso
   * pesa lo suyo. Al activar la niebla real, dos contextos simultáneos llegaron
   * a tardar 3–6 s por pulsación: una sonda leyó la posición correcta, pero su
   * respuesta tardó 4,1 s y agotó la espera total. Un contexto evita esa
   * contención sin ampliar los límites ni reducir la calidad comprobada.
   */
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    // El shell antiguo forzaba SwiftShader incluso con una Radeon disponible.
    // Chromium moderno usa la GPU real cuando existe y conserva fallback en CI.
    channel: 'chromium',
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
