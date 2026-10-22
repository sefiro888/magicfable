import { useEffect, useMemo } from 'react'
import { BufferGeometry, CatmullRomCurve3, DoubleSide, ExtrudeGeometry, Float32BufferAttribute, Shape, TubeGeometry, Vector3 } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { timberMaps } from '../../materials/timberMaterial'

const WOOD = { color: '#918877', roughness: 0.91, metalness: 0.02 } as const
const IRON = { color: '#4a5054', roughness: 0.57, metalness: 0.63 } as const
const SNOW = { color: '#bacbd4', roughness: 0.97 } as const
const cache = new Map<string, BufferGeometry>()

function hullPoint(t: number, v: number, side: number) {
  const end = Math.pow(Math.abs(t * 2 - 1), 3)
  return new Vector3((t - 0.5) * 6.2, 0.05 + end * 0.65 + Math.pow(v, 1.45) * 0.7,
    side * Math.pow(Math.sin(t * Math.PI), 0.55) * 0.9 * Math.sin(v * Math.PI / 2))
}

/** Casco abierto, quilla curva y ocho tracas solapadas. Una caja tapada no
 * transmite carpintería naval y pierde su silueta al girar la cámara. */
function hullGeometry(side: number) {
  const key = `hull:${side}`
  const stored = cache.get(key)
  if (stored) return stored
  const positions: number[] = []
  const uv: number[] = []
  const indices: number[] = []
  const length = 40
  const rows = 16
  for (let v = 0; v <= rows; v += 1) {
    for (let t = 0; t <= length; t += 1) {
      const point = hullPoint(t / length, v / rows, side)
      positions.push(point.x, point.y, point.z)
      uv.push(t / length * 3, v / rows)
      if (t < length && v < rows) {
        const a = v * (length + 1) + t
        if (side > 0) indices.push(a, a + 1, a + length + 1, a + 1, a + length + 2, a + length + 1)
        else indices.push(a, a + length + 1, a + 1, a + 1, a + length + 1, a + length + 2)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  cache.set(key, geometry)
  return geometry
}

function railGeometry(row: number, side: number) {
  const key = `rail:${row}:${side}`
  const stored = cache.get(key)
  if (stored) return stored
  const curve = new CatmullRomCurve3(Array.from({ length: 25 }, (_, i) => hullPoint(i / 24, row / 8, side)))
  const geometry = new TubeGeometry(curve, 40, row === 8 ? 0.039 : 0.014, 5, false)
  cache.set(key, geometry)
  return geometry
}

function prowGeometry() {
  const stored = cache.get('prow')
  if (stored) return stored
  const shape = new Shape()
  shape.moveTo(2.9, 0.73)
  shape.bezierCurveTo(3.15, 1.3, 3.05, 2.03, 3.35, 2.46)
  shape.bezierCurveTo(3.47, 2.61, 3.65, 2.57, 3.78, 2.52)
  shape.lineTo(3.83, 2.37)
  shape.lineTo(3.54, 2.35)
  shape.lineTo(3.7, 2.2)
  shape.lineTo(3.46, 2.2)
  shape.bezierCurveTo(3.27, 1.83, 3.42, 1.08, 3.08, 0.68)
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: 0.13, bevelEnabled: true,
    bevelSize: 0.018, bevelThickness: 0.018, bevelSegments: 3, curveSegments: 12 })
  geometry.translate(0, 0, -0.065)
  cache.set('prow', geometry)
  return geometry
}

export function FrozenLongship({ quality }: { readonly quality: GraphicsQuality }) {
  const timber = timberMaps()
  const ribs = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const t = 0.12 + i * 0.095
    const points = Array.from({ length: 13 }, (_, j) => {
      const side = j < 6 ? -1 : 1
      const v = Math.abs(j - 6) / 6
      const point = hullPoint(t, v, side)
      point.y += 0.025
      return point
    })
    return new TubeGeometry(new CatmullRomCurve3(points), 16, 0.026, 5, false)
  }), [])
  useEffect(() => () => ribs.forEach((rib) => rib.dispose()), [ribs])
  return <group position={[0, -1, -8.2]}>
    {[-1, 1].map((side) => <group key={side}>
      <mesh castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <primitive object={hullGeometry(side)} attach="geometry" />
        <meshStandardMaterial {...WOOD} {...timber} bumpScale={0.012} side={DoubleSide} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => <mesh key={i}>
        <primitive object={railGeometry(i + 1, side)} attach="geometry" />
        <meshStandardMaterial {...WOOD} color={i === 7 ? '#77756b' : '#393a36'} />
      </mesh>)}
      <mesh scale={[side, 1, 1]} castShadow={quality !== 'low'}>
        <primitive object={prowGeometry()} attach="geometry" />
        <meshStandardMaterial {...WOOD} {...timber} bumpScale={0.012} color="#756b58" />
      </mesh>
      <mesh position={[side * 3.57, 2.46, 0.09]}>
        <sphereGeometry args={[0.033, 8, 6]} /><meshStandardMaterial color="#af9456" roughness={0.59} metalness={0.5} />
      </mesh>
    </group>)}
    {ribs.map((geometry, i) => <mesh key={i}><primitive object={geometry} attach="geometry" />
      <meshStandardMaterial {...IRON} /></mesh>)}
    {[-1.7, -0.85, 0, 0.85, 1.7].map((x) => <group key={x} position={[x, 0.65, 0]}>
      <mesh><boxGeometry args={[0.2, 0.11, 1.25]} /><meshStandardMaterial {...WOOD} /></mesh>
      <mesh position={[0, 0.067, 0]}><boxGeometry args={[0.23, 0.035, 1.1]} /><meshStandardMaterial {...SNOW} /></mesh>
    </group>)}
  </group>
}
