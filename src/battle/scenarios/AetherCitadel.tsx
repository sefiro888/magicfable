import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { usePageVisibility } from '../usePageVisibility'
import type { Group } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { cloudTexture, dawnSkyTexture, goldFloorInlayTexture } from '../textures'

interface AetherCitadelProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  event?: AnimationEvent
}

/** Atmósfera de amanecer: cielo, niebla, sol cálido y relleno azul. */
function DawnAtmosphere({ quality }: { quality: GraphicsQuality }) {
  return (
    <>
      <color attach="background" args={['#3b4468']} />
      <fog attach="fog" args={['#7885a8', 26, 88]} />
      <mesh rotation={[0, -2.2, 0]}>
        <sphereGeometry args={[70, 32, 20]} />
        <meshBasicMaterial map={dawnSkyTexture()} side={1} fog={false} />
      </mesh>
      <ambientLight intensity={0.48} color="#aeb9d8" />
      <hemisphereLight intensity={0.4} color="#d8e2ff" groundColor="#5a4a3a" />
      {/* Sol de amanecer desde arriba-derecha, como en la referencia. */}
      <directionalLight
        position={[15, 14, -8]}
        intensity={4.8}
        color="#ffcf96"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      {/* Relleno frío desde el lado del portal. */}
      <directionalLight position={[-14, 9, 10]} intensity={0.6} color="#8fa8e8" />
    </>
  )
}

/** Mar de nubes al amanecer alrededor de la plataforma. */
function DawnClouds({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const visible = usePageVisibility()
  const clouds = useMemo(
    () =>
      Array.from({ length: quality === 'high' ? 20 : 12 }, (_, index) => ({
        angle: (index / (quality === 'high' ? 20 : 12)) * Math.PI * 2 + index * 0.9,
        radius: 13 + (index % 5) * 2.6,
        y: -3.4 + (index % 3) * 1.3,
        scale: 10 + (index % 4) * 4.2,
        speed: 0.004 + (index % 3) * 0.003,
        warm: index % 3 === 0,
      })),
    [quality],
  )
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion || !visible.current) return
    node.children.forEach((child, index) => {
      const cloud = clouds[index]!
      const angle = cloud.angle + clock.elapsedTime * cloud.speed
      child.position.set(Math.cos(angle) * cloud.radius, cloud.y, Math.sin(angle) * cloud.radius)
    })
  })
  if (quality === 'low') return null
  const foreground: readonly (readonly [number, number, number, number, boolean])[] = [
    [-7.5, -1.7, 9.5, 15, true],
    [0.5, -2.1, 11.5, 18, false],
    [8, -1.5, 9, 14, true],
    [-13, -1.2, 4, 12, false],
    [13.5, -1.3, 3.5, 13, true],
  ]
  return (
    <>
      <group ref={group}>
        {clouds.map((cloud, index) => (
          <sprite
            key={index}
            position={[Math.cos(cloud.angle) * cloud.radius, cloud.y, Math.sin(cloud.angle) * cloud.radius]}
            scale={[cloud.scale, cloud.scale * 0.42, 1]}
          >
            <spriteMaterial
              map={cloudTexture()}
              transparent
              opacity={cloud.warm ? 0.72 : 0.58}
              color={cloud.warm ? '#ffd9b0' : '#e8eefb'}
              depthWrite={false}
              fog={false}
            />
          </sprite>
        ))}
      </group>
      {/* Banco de nubes estático en primer plano, pegado a los bordes. */}
      {foreground.map(([x, y, z, scale, warm], index) => (
        <sprite key={`fg-${index}`} position={[x, y, z]} scale={[scale, scale * 0.38, 1]}>
          <spriteMaterial
            map={cloudTexture()}
            transparent
            opacity={warm ? 0.85 : 0.7}
            color={warm ? '#ffdfba' : '#eef2fc'}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
    </>
  )
}

/**
 * Aether Citadel: un domo de cielo al amanecer con nubes y polvo de luz
 * flotando sobre la plaza — sin arquitectura ni escombros alrededor del
 * tablero, para que toda la atención quede en las cartas.
 */
export function AetherCitadel({ quality, reducedMotion }: AetherCitadelProps) {
  return (
    <>
      <DawnAtmosphere quality={quality} />
      {/* Incrustación dorada grabada en el mandil de la plaza, alrededor del tablero. */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11.6, 11.6]} />
        <meshStandardMaterial
          map={goldFloorInlayTexture()}
          transparent
          depthWrite={false}
          roughness={0.35}
          metalness={0.85}
          emissive="#8a6420"
          emissiveIntensity={0.55}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <DawnClouds quality={quality} reducedMotion={reducedMotion} />
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 60 : 30} scale={[11, 3.4, 11]} size={1.6} speed={reducedMotion ? 0 : 0.28} color="#ffe2b0" opacity={0.4} position={[0, 1.6, 0]} />
      )}
    </>
  )
}
