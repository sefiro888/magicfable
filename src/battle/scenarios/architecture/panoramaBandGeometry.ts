import { CylinderGeometry, DataTexture, LinearFilter, NoColorSpace, RGBAFormat } from 'three'

let band: CylinderGeometry | undefined, mask: DataTexture | undefined

/** La esfera curvaba las columnas de las pinturas.
 * La banda cilíndrica conserva generatrices verticales, coloca el centro a
 * los37° de la cámara real y pierde sus extremos dentro de la imagen. */
export function panoramaBandGeometry() {
  if (band) return band
  band = new CylinderGeometry(50, 50, 62, 128, 1, true)
  band.translate(0, -39, 0)
  const uv = band.getAttribute('uv')
  // Compensa la distinta costura angular de SphereGeometry/CylinderGeometry
  // para comparar exactamente la misma parte de la pintura.
  for (let i = 0; i < uv.count; i += 1) uv.setX(i, uv.getX(i) + 0.25)
  return band
}

export function panoramaBandMask() {
  if (mask) return mask
  const size = 256, data = new Uint8Array(size * 4)
  for (let y = 0; y < size; y += 1) {
    const v = y / (size - 1)
    const low = Math.min(1, Math.max(0, v / 0.055))
    const high = Math.min(1, Math.max(0, (1 - v) / 0.07))
    const alpha = Math.round(low * low * (3 - 2 * low) * high * high * (3 - 2 * high) * 255)
    data[y * 4] = data[y * 4 + 1] = data[y * 4 + 2] = alpha
    data[y * 4 + 3] = 255
  }
  mask = new DataTexture(data, 1, size, RGBAFormat)
  mask.colorSpace = NoColorSpace
  mask.magFilter = mask.minFilter = LinearFilter
  mask.needsUpdate = true
  return mask
}
