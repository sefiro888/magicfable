import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { TILE_SIZE } from './gridCoordinates'

const slabs = new Map<number, RoundedBoxGeometry>()

/** El canto capta luz real. Un sombreado pintado sobre una caja afilada
 * parecía un cojín y seguía oscuro aunque el sol iluminase ese borde. */
export function boardSlabGeometry(height: number) {
  let geometry = slabs.get(height)
  if (!geometry) {
    geometry = new RoundedBoxGeometry(TILE_SIZE, height, TILE_SIZE, 2, 0.035)
    slabs.set(height, geometry)
  }
  return geometry
}
