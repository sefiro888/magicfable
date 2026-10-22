import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Object3D } from 'three'
import type { SpotLight } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { stoneMaps } from '../../materials/stoneMaterial'
import { glowTexture } from '../../textures'
import { usePageVisibility } from '../../usePageVisibility'
import { beaconRibGeometry, shoreShelfGeometry } from './shoreGeometry'

/** Costillas curvas de hueso en torno a una linterna
 * de bronce erosionado; el faro moderno de franjas rojas rompía la facción. */
export function BoneBeacon({ quality, reducedMotion }: {
  readonly quality: GraphicsQuality; readonly reducedMotion: boolean
}) {
  const sweep = useRef<SpotLight>(null)
  const visible = usePageVisibility()
  const target = useMemo(() => new Object3D(), [])
  const bone = stoneMaps('limestone'), slate = stoneMaps('granite')
  useFrame(({ clock }) => {
    const angle = reducedMotion ? 0.7 : clock.elapsedTime * 0.18
    if (!visible.current) return
    target.position.set(5.9 + Math.cos(angle) * 7, -0.45, -5.6 + Math.sin(angle) * 7)
    target.updateMatrixWorld()
  })
  return <>
    <primitive object={target} />
    <group position={[5.9, -0.6, -5.6]} rotation={[0, -0.35, 0]}>
      {[0, 1, 2].map((layer) => <mesh key={layer} scale={[0.27, 0.7, 0.24]}
        receiveShadow={quality !== 'low'} castShadow={quality === 'high'}>
        <primitive object={shoreShelfGeometry(layer)} attach="geometry" />
        <meshStandardMaterial {...slate} color="#626c6b" bumpScale={0.045} roughness={0.67} />
      </mesh>)}
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} name={`shore-beacon-rib-${i}`}
        rotation={[0, i / 6 * Math.PI * 2, 0]}
        castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <primitive object={beaconRibGeometry()} attach="geometry" />
        <meshStandardMaterial {...bone} color="#c7c0a5" bumpScale={0.025} roughness={0.83} />
      </mesh>)}
      {[2.0, 2.7].map((height) => <mesh key={height} position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}
        castShadow={quality !== 'low'}>
        <torusGeometry args={[0.62, 0.045, 8, quality === 'low' ? 20 : 40]} />
        <meshStandardMaterial color="#786a46" metalness={0.58} roughness={0.62} />
      </mesh>)}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = i / 8 * Math.PI * 2
        return <mesh key={i} position={[Math.cos(angle) * 0.6, 2.35, Math.sin(angle) * 0.6]}>
          <cylinderGeometry args={[0.018, 0.025, 0.7, 5]} />
          <meshStandardMaterial color="#817350" metalness={0.48} roughness={0.62} />
        </mesh>
      })}
      <mesh name="shore-beacon-lens" position={[0, 2.45, 0]} scale={[0.32, 0.36, 0.32]}>
        <sphereGeometry args={[1, quality === 'low' ? 12 : 24, 16]} />
        <meshStandardMaterial color="#e9be77" emissive="#e39836" emissiveIntensity={0.95} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 2.35, 0]} color="#ffd59b" intensity={1.1} distance={4} decay={2} />
      <sprite position={[0, 2.35, 0]} scale={[1.3, 1.3, 1]}>
        <spriteMaterial map={glowTexture('gold')} blending={AdditiveBlending}
          opacity={0.26} transparent depthWrite={false} />
      </sprite>
    </group>
    {quality !== 'low' && <spotLight ref={sweep} name="shore-beacon-sweep" position={[5.9, 1.75, -5.6]}
      target={target} intensity={24} angle={0.18} penumbra={0.8} distance={15} color="#ffe1a8" />}
  </>
}
