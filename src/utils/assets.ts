/**
 * Resuelve una ruta absoluta de `public/` respetando la base del despliegue.
 * En local la base es `/`; en GitHub Pages es `/magicfable/`. Los datos de
 * cartas siguen declarando rutas `/assets/...` (validadas por Zod) y la capa
 * de presentación las adapta aquí.
 */
export const withBase = (path: string): string =>
  path.startsWith('/') ? import.meta.env.BASE_URL + path.slice(1) : path
