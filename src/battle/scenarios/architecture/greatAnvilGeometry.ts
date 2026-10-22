import { ExtrudeGeometry, LatheGeometry, Path, Shape, Vector2 } from 'three'
import type { BufferGeometry } from 'three'

interface AnvilGeometry {
  readonly body: BufferGeometry
  readonly face: BufferGeometry
  readonly horn: BufferGeometry
}
let cached: AnvilGeometry | undefined

function metalUV(geometry: BufferGeometry) {
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const uv = geometry.getAttribute('uv')
  for (let index = 0; index < position.count; index += 1) {
    const nx = Math.abs(normal.getX(index))
    const ny = Math.abs(normal.getY(index))
    const nz = Math.abs(normal.getZ(index))
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    if (ny >= nx && ny >= nz) uv.setXY(index, x * 0.8, z * 0.8)
    else if (nx >= nz) uv.setXY(index, z * 0.8, y * 0.8)
    else uv.setXY(index, x * 0.8, y * 0.8)
  }
  uv.needsUpdate = true
  geometry.computeBoundingBox()
  return geometry
}

/** Masa continua con cintura curvada, mesa con un hueco real y cuerno
 * horizontal de sección decreciente. El antiguo cono vertical no se leía
 * como una herramienta y las cajas apiladas parecían bloques de juguete. */
export function greatAnvilGeometry(): AnvilGeometry {
  if (cached) return cached
  const silhouette = new Shape()
  silhouette.moveTo(-1.35, 0)
  silhouette.lineTo(0.92, 0)
  silhouette.lineTo(0.88, 0.18)
  silhouette.bezierCurveTo(0.42, 0.29, 0.27, 0.49, 0.28, 0.76)
  silhouette.bezierCurveTo(0.29, 1.03, 0.64, 1.19, 1.15, 1.23)
  silhouette.lineTo(1.15, 1.45)
  silhouette.lineTo(-1.5, 1.45)
  silhouette.lineTo(-1.5, 1.23)
  silhouette.lineTo(-0.94, 1.23)
  silhouette.bezierCurveTo(-0.54, 1.17, -0.34, 0.94, -0.37, 0.69)
  silhouette.bezierCurveTo(-0.4, 0.4, -0.69, 0.24, -1.29, 0.18)
  silhouette.closePath()
  const body = new ExtrudeGeometry(silhouette, {
    depth: 1.05, steps: 1, curveSegments: 10, bevelEnabled: true,
    bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 2,
  })
  body.translate(0, 0, -0.525)

  const table = new Shape()
  table.moveTo(-1.5, -0.525)
  table.lineTo(1.15, -0.525)
  table.lineTo(1.15, 0.525)
  table.lineTo(-1.5, 0.525)
  table.closePath()
  const socket = new Path()
  socket.moveTo(-1.16, -0.1)
  socket.lineTo(-1.16, 0.1)
  socket.lineTo(-0.96, 0.1)
  socket.lineTo(-0.96, -0.1)
  socket.closePath()
  table.holes.push(socket)
  const face = new ExtrudeGeometry(table, {
    depth: 0.17, steps: 1, bevelEnabled: true,
    bevelSize: 0.009, bevelThickness: 0.009, bevelSegments: 2,
  })
  face.rotateX(-Math.PI / 2)
  face.translate(0, 1.45, 0)

  const profile: readonly (readonly [number, number])[] = [[0, 0.36], [0.14, 0.34], [0.4, 0.29], [0.72, 0.21], [1, 0.12], [1.27, 0.015], [1.29, 0]]
  const radiusAt = (axis: number) => {
    for (let index = 1; index < profile.length; index += 1) {
      const previous = profile[index - 1]!
      const next = profile[index]!
      if (axis <= next[0]) return previous[1] + (next[1] - previous[1]) * (axis - previous[0]) / (next[0] - previous[0])
    }
    return 0
  }
  const horn = new LatheGeometry([new Vector2(0, 0), ...profile.map(([axis, radius]) => new Vector2(radius, axis))], 48)
  horn.rotateZ(-Math.PI / 2)
  const vertices = horn.getAttribute('position')
  for (let index = 0; index < vertices.count; index += 1) {
    const axis = Math.max(0, vertices.getX(index))
    // La mesa continúa hasta la punta. Centrar todos los círculos a la misma
    // altura producía un cuerno que sobresalía por encima de la cara de trabajo.
    vertices.setXYZ(index, axis + 1.1, vertices.getY(index) + 1.62 - radiusAt(axis), vertices.getZ(index))
  }
  horn.computeVertexNormals()
  cached = { body: metalUV(body), face: metalUV(face), horn: metalUV(horn) }
  return cached
}
