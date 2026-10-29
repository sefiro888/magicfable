import { ExtrudeGeometry, Path, Shape } from 'three'
import type { BoardTileStyle } from '../textures'
import { BOARD_WORLD_HALF } from './gridCoordinates'

// Una sola pieza enmarca las 64 casillas: evita sumar un borde y una llamada
// de render a cada losa y mantiene libre el espacio de las fichas.
const ring = (inside: number, outside: number, cut: number, depth: number) => {
  const shape = new Shape()
  shape.moveTo(-outside + cut, -outside)
  shape.lineTo(outside - cut, -outside)
  shape.lineTo(outside, -outside + cut)
  shape.lineTo(outside, outside - cut)
  shape.lineTo(outside - cut, outside)
  shape.lineTo(-outside + cut, outside)
  shape.lineTo(-outside, outside - cut)
  shape.lineTo(-outside, -outside + cut)
  shape.closePath()
  const hole = new Path()
  hole.moveTo(-inside, -inside)
  hole.lineTo(-inside, inside)
  hole.lineTo(inside, inside)
  hole.lineTo(inside, -inside)
  hole.closePath()
  shape.holes.push(hole)
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.012,
    bevelThickness: 0.008, bevelSegments: 2, steps: 1 })
}

const inner = BOARD_WORLD_HALF + 0.025
const outer = BOARD_WORLD_HALF + 0.28
const frame = ring(inner, outer, 0.12, 0.12)
const inlay = ring(inner + 0.13, inner + 0.15, 0.018, 0.004)

const finishes: Readonly<Record<BoardTileStyle, readonly [string, string]>> = {
  stone: ['#777269', '#c3a577'], basalt: ['#343638', '#9c6540'],
  moss: ['#52605d', '#8ca39b'], sand: ['#9a805c', '#c4a86d'],
  ice: ['#506c7c', '#a1c5d1'], forest: ['#514d3b', '#8f8a60'],
  tide: ['#465d61', '#91aaa6'], forge: ['#555654', '#bf9362'],
  glaze: ['#537269', '#d0aa69'], sandstone: ['#8b776c', '#c1a287'],
}

/** Bastidor biselado y filete mineral, bajo las losas y sus zonas interactivas. */
export function BoardRim({ style }: { readonly style: BoardTileStyle }) {
  // Un marco recto parecía una bandeja metálica sobre el lago y el bosque;
  // esos escenarios necesitan una transición natural específica.
  if (style === 'ice' || style === 'forest' || style === 'tide') return null
  const [stone, accent] = finishes[style]
  return <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} dispose={null}>
    <mesh geometry={frame} receiveShadow castShadow>
      <meshStandardMaterial color={stone} roughness={0.82} metalness={style === 'forge' ? 0.42 : 0.05} />
    </mesh>
    <mesh geometry={inlay} position={[0, 0, 0.122]}>
      <meshStandardMaterial color={accent} roughness={0.48} metalness={0.4} />
    </mesh>
  </group>
}
