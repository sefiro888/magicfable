import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles/global.css'

/**
 * El service worker (`registerType: 'autoUpdate'` en vite.config.ts) llama a
 * `skipWaiting()` + `clientsClaim()` en cuanto una versión nueva termina de
 * instalarse: toma el control de cualquier pestaña ya abierta al momento,
 * SIN recargarla. Esa pestaña sigue ejecutando el JS/CSS viejo ya cargado en
 * memoria mientras el nuevo SW controla las peticiones de red — si esa app
 * vieja intenta cargar después un fragmento con `lazy()` (p. ej. al navegar
 * de "Jugar" a la batalla), pide un archivo con el hash de la build
 * anterior que el SW ya no tiene precacheado (`cleanupOutdatedCaches()`) ni
 * el servidor sirve (despliegue estático, no versionado): la petición falla
 * y, sin esto, solo un F5 manual arranca desde el index.html vigente. Se
 * recarga automáticamente en cuanto el navegador confirma el cambio de
 * controlador, así el usuario nunca llega a pisar esa ventana rota.
 */
if ('serviceWorker' in navigator) {
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
}

const root = document.getElementById('root')

if (!root) throw new Error('No se encontró el contenedor principal')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
