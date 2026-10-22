import { LatheGeometry, Vector2 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { GraphicsQuality } from '../../../store/preferences'
import { forgedMetalMaps } from '../../materials/forgedMetal'
import { stoneMaps } from '../../materials/stoneMaterial'
import { CourtyardGround } from './CourtyardGround'
import { jadeTerraceGeometry } from './jadeGeometry'

const rail = new RoundedBoxGeometry(0.12, 0.13, 2.55, 2, 0.025)
const post = new RoundedBoxGeometry(0.22, 0.69, 0.22, 2, 0.035)
const foot = new RoundedBoxGeometry(0.17, 0.4, 0.17, 2, 0.035)
const handleBar = new RoundedBoxGeometry(0.1, 0.1, 0.58, 2, 0.025)
// El perfil vuelve por el interior hasta el fondo: el bronce tiene pared y
// abertura reales, en vez de un cilindro tapado con un disco negro encima.
const vessel = new LatheGeometry([
  [0, 0.13], [0.27, 0.13], [0.43, 0.23], [0.54, 0.51], [0.51, 0.83],
  [0.55, 0.85], [0.55, 0.92], [0.45, 0.92], [0.45, 0.82],
  [0.47, 0.51], [0.36, 0.29], [0.22, 0.22], [0, 0.22],
].map(([x, y]) => new Vector2(x, y)), 48)

export function JadeCourtFloor({ quality }: { readonly quality: GraphicsQuality }) {
  const stone = stoneMaps('limestone')
  return <>
    <CourtyardGround paved quality={quality} finish="limestone" tint="#9ca79e" />
    <mesh name="jade-stone-terrace" receiveShadow={quality !== 'low'}>
      <primitive object={jadeTerraceGeometry()} attach="geometry" />
      <meshStandardMaterial {...stone} color="#929e92" bumpScale={0.016} roughness={0.55} metalness={0.02} />
    </mesh>
    {[-1, 1].flatMap((side) => [-2.7, 0].map((z) => <group key={`${side}:${z}`} position={[side * 4.8, -0.08, z]}>
      <mesh position={[0, 0.48, 0]} geometry={rail} castShadow={quality !== 'low'}>
        <meshStandardMaterial {...stone} color="#bac2b3" bumpScale={0.015} roughness={0.78} />
      </mesh>
      {[-1.3, 0, 1.3].map((at) => <mesh key={at} position={[0, 0.19, at]} geometry={post} castShadow={quality !== 'low'}>
        <meshStandardMaterial {...stone} color="#b6bcae" bumpScale={0.015} roughness={0.8} />
      </mesh>)}
    </group>))}
  </>
}

export function JadeBronzeDing({ quality }: { readonly quality: GraphicsQuality }) {
  const bronze = forgedMetalMaps('bronze')
  return <group position={[6.15, -0.4, -3.5]} rotation={[0, -0.3, 0]} scale={1.45}>
    <mesh name="jade-bronze-ding" geometry={vessel} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <meshStandardMaterial {...bronze} color="#c9d7ba" roughness={0.63} metalness={0.42} envMapIntensity={3.2} bumpScale={0.012} />
    </mesh>
    {[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 3) * 0.32, 0.01, Math.sin(i * Math.PI * 2 / 3) * 0.32]} geometry={foot} castShadow={quality !== 'low'}>
      <meshStandardMaterial {...bronze} color="#b4c4a4" roughness={0.7} metalness={0.55} envMapIntensity={3.2} />
    </mesh>)}
    {[-1, 1].map((side) => <group key={side} position={[side * 0.49, 0.94, 0]}>
      <mesh geometry={handleBar} position={[0, 0.23, 0]}><meshStandardMaterial {...bronze} color="#c9d7ba" roughness={0.65} metalness={0.42} envMapIntensity={3.2} /></mesh>
      {[-1, 1].map((z) => <mesh key={z} position={[0, 0.09, z * 0.24]} scale={[0.65, 0.5, 0.65]} geometry={foot}>
        <meshStandardMaterial {...bronze} color="#c9d7ba" roughness={0.65} metalness={0.42} envMapIntensity={3.2} />
      </mesh>)}
    </group>)}
    <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.32, 32]} />
      <meshStandardMaterial color="#544d46" roughness={1} />
    </mesh>
  </group>
}
