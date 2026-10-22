import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, ExtrudeGeometry, RepeatWrapping, Shape, TubeGeometry, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { GraphicsQuality } from '../../../store/preferences'
import { stoneMaps } from '../../materials/stoneMaterial'
import { timberMaps } from '../../materials/timberMaterial'
import { roofTileTexture } from '../../textures'
import { jadeRoofGeometry, jadeRoofHeight, moonGateGeometry } from './jadeGeometry'

const beam = new RoundedBoxGeometry(4.4, 0.17, 2.55, 2, 0.03)
const base = new RoundedBoxGeometry(4.7, 0.28, 2.8, 2, 0.04)
const bracket = new RoundedBoxGeometry(0.65, 0.095, 0.15, 2, 0.025)
const coping = new RoundedBoxGeometry(3.4, 0.16, 0.62, 2, 0.045)
const gateStones = Array.from({ length: 24 }, (_, i) => {
  const shape = new Shape(), start = i / 24 * Math.PI * 2 + 0.006, end = (i + 1) / 24 * Math.PI * 2 - 0.006
  shape.absarc(0, 1.12, 1.055, start, end, false)
  shape.lineTo(Math.cos(end) * 1.27, 1.12 + Math.sin(end) * 1.27)
  shape.absarc(0, 1.12, 1.27, end, start, true)
  shape.closePath()
  return new ExtrudeGeometry(shape, { depth: 0.075, bevelEnabled: true,
    bevelSize: 0.012, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 8 })
})

/** Pórtico próximo con apoyos dougong en tres niveles.
 * La laca y los aleros explican su cultura sin una fila de faroles gigantes. */
export function JadePavilion({ quality }: { readonly quality: GraphicsQuality }) {
  const timber = timberMaps(), stone = stoneMaps('limestone')
  const tiles = useMemo(() => {
    const map = roofTileTexture().clone()
    map.wrapS = map.wrapT = RepeatWrapping
    map.repeat.set(2.2, 1.6)
    map.needsUpdate = true
    return map
  }, [])
  useEffect(() => () => tiles.dispose(), [tiles])
  const caps = useMemo(() => {
    const count = quality === 'low' ? 14 : 28
    return Array.from({ length: count }, (_, i) => {
      const x = (i / (count - 1) * 2 - 1) * 2.65
      const points = Array.from({ length: 25 }, (_, j) => {
        const z = (j / 24 * 2 - 1) * 1.7
        return new Vector3(x, jadeRoofHeight(x, z) + 0.018, z)
      })
      return new TubeGeometry(new CatmullRomCurve3(points), quality === 'low' ? 16 : 32, 0.021, 5, false)
    })
  }, [quality])
  useEffect(() => () => caps.forEach((cap) => cap.dispose()), [caps])
  return <group position={[0, -0.4, -6.3]}>
    <mesh receiveShadow={quality !== 'low'} castShadow={quality !== 'low'}>
      <primitive object={base} attach="geometry" />
      <meshStandardMaterial {...stone} color="#b2b5ad" bumpScale={0.025} roughness={0.88} />
    </mesh>
    {[-1.85, 1.85].flatMap((x) => [-0.95, 0.95].map((z) => <group key={`${x}:${z}`} position={[x, 0, z]}>
      <mesh position={[0, 0.82, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <cylinderGeometry args={[0.13, 0.16, 1.45, quality === 'low' ? 12 : 24]} />
        <meshStandardMaterial {...timber} color="#a2372d" bumpScale={0.012} roughness={0.36} />
      </mesh>
      {[0, 1, 2].map((level) => <mesh key={level} position={[0, 1.5 + level * 0.1, 0]}
        rotation={[0, level % 2 ? Math.PI / 2 : 0, 0]} castShadow={quality !== 'low'}>
        <primitive object={bracket} attach="geometry" />
        <meshStandardMaterial {...timber} color={level === 1 ? '#6d7461' : '#8c3c2d'} bumpScale={0.01} roughness={0.48} />
      </mesh>)}
    </group>))}
    <mesh position={[0, 1.7, 0]} castShadow={quality !== 'low'}>
      <primitive object={beam} attach="geometry" />
      <meshStandardMaterial {...timber} color="#74362b" bumpScale={0.012} roughness={0.42} />
    </mesh>
    <group position={[0, 1.76, 0]}>
      <mesh name="jade-pavilion-roof" castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <primitive object={jadeRoofGeometry(quality === 'low')} attach="geometry" />
        <meshStandardMaterial map={tiles} color="#446b60" roughness={0.34} metalness={0.04} />
      </mesh>
      {caps.map((geometry, i) => <mesh key={i} geometry={geometry} castShadow={quality === 'high'}>
        <meshStandardMaterial color="#59766b" roughness={0.31} metalness={0.04} />
      </mesh>)}
    </group>
  </group>
}

export function JadeMoonGate({ quality }: { readonly quality: GraphicsQuality }) {
  const stone = stoneMaps('limestone')
  return <group position={[-6.25, -0.45, -3.9]} rotation={[0, 0.2, 0]}>
    <mesh name="jade-moon-gate" castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={moonGateGeometry()} attach="geometry" />
      <meshStandardMaterial {...stone} color="#b5c0b3" bumpScale={0.025} roughness={0.87} />
    </mesh>
    {gateStones.map((geometry, i) => <mesh key={i} geometry={geometry} position={[0, 0, 0.19]} castShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color={i % 3 ? '#b5c3b6' : '#a2b2a7'} bumpScale={0.025} roughness={0.8} />
    </mesh>)}
    <mesh position={[0, 2.67, 0]} geometry={coping} castShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color="#84998e" bumpScale={0.025} roughness={0.74} />
    </mesh>
  </group>
}
