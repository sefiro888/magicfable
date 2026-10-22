import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { GraphicsQuality } from '../../../store/preferences'
import { forgedMetalMaps } from '../../materials/forgedMetal'
import { usePageVisibility } from '../../usePageVisibility'
import { gearGeometry } from './foundryGeometry'

const support = new RoundedBoxGeometry(2.5, 0.18, 0.55, 2, 0.035)
const foot = new RoundedBoxGeometry(0.2, 1.45, 0.23, 2, 0.025)

/** Dos ruedas de24/12 dientes comparten módulo y
 * relación2:1; girarlas al mismo ritmo haría atravesarse los dientes. */
export function CoupledGears({ quality, reducedMotion }: {
  readonly quality: GraphicsQuality; readonly reducedMotion: boolean
}) {
  const large = useRef<Mesh>(null), small = useRef<Mesh>(null)
  const visible = usePageVisibility()
  const iron = forgedMetalMaps('iron'), bronze = forgedMetalMaps('bronze')
  useFrame(({ clock }) => {
    if (!visible.current) return
    const angle = reducedMotion ? 0 : clock.elapsedTime * 0.13
    if (large.current) large.current.rotation.z = angle
    if (small.current) small.current.rotation.z = -angle * 2 + Math.PI / 12
  })
  return <group position={[-6.2, 0.55, -3.4]} rotation={[0, 0.08, 0]}>
    <mesh ref={large} name="foundry-drive-gear" castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={gearGeometry(0.98, 24)} attach="geometry" />
      <meshStandardMaterial {...iron} color="#d3d1c5" envMapIntensity={2.2} roughness={0.78} metalness={0.72} bumpScale={0.018} />
    </mesh>
    <mesh ref={small} name="foundry-driven-gear" position={[1.47, 0, 0]} rotation={[0, 0, Math.PI / 12]}
      castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={gearGeometry(0.49, 12)} attach="geometry" />
      <meshStandardMaterial {...bronze} color="#d4c8b4" envMapIntensity={2.2} roughness={0.83} metalness={0.64} bumpScale={0.018} />
    </mesh>
    {[0, 1.47].map((x) => <group key={x} position={[x, 0, -0.2]}>
      <mesh position={[0, -0.6, 0]} castShadow={quality !== 'low'}>
        <primitive object={foot} attach="geometry" />
        <meshStandardMaterial {...iron} color="#777a75" metalness={0.55} roughness={0.88} bumpScale={0.02} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.28]}>
        <cylinderGeometry args={[0.13, 0.13, 0.19, 6]} />
        <meshStandardMaterial {...bronze} color="#b0a48a" metalness={0.6} roughness={0.7} />
      </mesh>
    </group>)}
    <mesh position={[0.735, -1.02, -0.14]} castShadow={quality !== 'low'}>
      <primitive object={support} attach="geometry" />
      <meshStandardMaterial {...iron} color="#737670" metalness={0.5} roughness={0.85} />
    </mesh>
  </group>
}
