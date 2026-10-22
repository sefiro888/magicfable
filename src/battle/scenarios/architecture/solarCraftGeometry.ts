import { LatheGeometry, Vector2 } from 'three'

const cache = new Map<boolean, LatheGeometry>()

/** El perfil vuelve por el interior y cierra el fondo: un disco negro sobre
 * un cilindro parecía un cubo pintado y no tenía labio ni pared reales. */
export function solarVesselGeometry(low: boolean) {
  const stored = cache.get(low)
  if (stored) return stored
  const geometry = new LatheGeometry([
    [0, 0.035], [0.21, 0.035], [0.26, 0.065], [0.28, 0.1],
    [0.34, 0.14], [0.43, 0.23], [0.49, 0.36], [0.51, 0.41],
    [0.54, 0.425], [0.545, 0.46], [0.52, 0.485], [0.465, 0.485],
    [0.445, 0.45], [0.445, 0.39], [0.40, 0.27], [0.31, 0.17],
    [0.22, 0.125], [0, 0.125],
  ].map(([x, y]) => new Vector2(x, y)), low ? 40 : 80)
  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i), z = position.getZ(i), y = position.getY(i)
    const radius = Math.hypot(x, z)
    if (radius < 0.29 || y > 0.41) continue
    const relief = 0.009 * Math.sin(Math.atan2(z, x) * 20) * Math.sin((y - 0.1) / 0.32 * Math.PI)
    position.setXYZ(i, x * (1 + relief / radius), y, z * (1 + relief / radius))
  }
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  cache.set(low, geometry)
  return geometry
}
