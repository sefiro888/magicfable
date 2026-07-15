import { Sparkles, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { AdditiveBlending, DoubleSide, MeshPhysicalMaterial, RepeatWrapping } from 'three'
import type { Group, Mesh, MeshStandardMaterial, Object3D, PointLight } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { withBase } from '../../utils/assets'
import { cloudTexture, dawnSkyTexture, glowTexture, masonryTexture, portalSwirlTexture } from '../textures'
import { SanctuaryScenario } from './SanctuaryScenario'

const CITADEL_URL = withBase('/assets/scenarios/aether-citadel.glb')

interface AetherCitadelProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  event?: AnimationEvent
}

/** Posiciones clave del GLB en coordenadas three.js (Blender +Y ⇒ three −Z). */
const PORTAL = { x: -8.2, y: 3.6, z: -11.9 }
const RIGHT_CRYSTAL = { x: 10.8, y: 2.4, z: 0.6 }
const WEST_CRYSTAL = { x: -10.2, y: 1.9, z: 1.0 }

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

/** Vórtice animado del portal, superpuesto al marco de piedra del GLB. */
function PortalVortex({ reducedMotion, flare }: { reducedMotion: boolean; flare: number }) {
  const outer = useRef<Mesh>(null)
  const inner = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  useFrame((_, delta) => {
    if (!reducedMotion) {
      if (outer.current) outer.current.rotation.z -= delta * 0.5
      if (inner.current) inner.current.rotation.z += delta * 0.85
    }
    if (light.current) light.current.intensity = 26 + flare * 30
  })
  return (
    <group position={[PORTAL.x, PORTAL.y, PORTAL.z]}>
      <mesh ref={outer} position={[0, 0, 0.35]}>
        <circleGeometry args={[1.78, 40]} />
        <meshBasicMaterial map={portalSwirlTexture()} transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <mesh ref={inner} position={[0, 0, 0.5]}>
        <circleGeometry args={[1.05, 32]} />
        <meshBasicMaterial map={portalSwirlTexture()} transparent opacity={0.7} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={light} position={[0, 0, 2.2]} color="#6db8ff" intensity={26} distance={16} decay={2} />
    </group>
  )
}

/** Resplandor pulsante sobre los cristales monumentales del GLB. */
function CrystalGlow({ position, scale, flare, reducedMotion }: { position: readonly [number, number, number]; scale: number; flare: number; reducedMotion: boolean }) {
  const halo = useRef<Object3D>(null)
  useFrame(({ clock }) => {
    if (!halo.current) return
    const pulse = reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 1.6 + position[0]) * 0.12
    halo.current.scale.setScalar(scale * pulse * (1 + flare * 0.3))
  })
  return (
    <group position={[position[0], position[1], position[2]]}>
      <sprite ref={halo} scale={[scale, scale, scale]}>
        <spriteMaterial map={glowTexture('arcane')} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
      <pointLight color="#5fb6ff" intensity={14 + flare * 12} distance={9} decay={2} />
    </group>
  )
}

/** Mar de nubes al amanecer alrededor de la ciudadela. */
function DawnClouds({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
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
    if (!node || reducedMotion) return
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
 * La arquitectura estática exportada desde Blender, revestida en runtime:
 * el glTF trae materiales PBR planos y aquí se les aplica la sillería
 * procedural, dorados emisivos y cristales físicos translúcidos.
 */
function CitadelModel({ quality }: { quality: GraphicsQuality }) {
  const { scene } = useGLTF(CITADEL_URL)
  useEffect(() => {
    const masonry = masonryTexture()
    masonry.wrapS = RepeatWrapping
    masonry.wrapT = RepeatWrapping
    const dressed = new Set<string>()
    scene.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      mesh.receiveShadow = quality !== 'low'
      mesh.castShadow = quality === 'high' && /Tower|Portal(Pylon|ArchOuter)|Col\d|Pedestal/.test(mesh.name)
      const material = mesh.material as MeshStandardMaterial
      if (!material?.name) return
      // Cristales: material físico translúcido, uno por malla para el brillo interno.
      if (material.name === 'AC_CrystalBlue') {
        if (!(mesh.material instanceof MeshPhysicalMaterial)) {
          mesh.material = new MeshPhysicalMaterial({
            color: '#8ecbff',
            roughness: 0.08,
            metalness: 0.05,
            transmission: 0.55,
            thickness: 1.2,
            ior: 1.45,
            emissive: '#2f7fe8',
            emissiveIntensity: 1.35,
            transparent: true,
            opacity: 0.96,
          })
        }
        return
      }
      if (dressed.has(material.name)) return
      dressed.add(material.name)
      if (/AC_StoneMain|AC_StoneLight|AC_RockUnder/.test(material.name)) {
        // Sillería solo en superficies grandes; en cilindros finos los UV
        // estiran los bloques y arruinan la lectura.
        const repeat = material.name === 'AC_RockUnder' ? 1.6 : 2.4
        material.map = masonry
        material.bumpMap = masonry
        material.bumpScale = 2.5
        material.map.repeat.set(repeat, repeat)
        // El mapa multiplica al color base: se aclara para que la sillería respire.
        material.color.multiplyScalar(2.1)
        material.needsUpdate = true
      } else if (/AC_StoneDark|AC_RuinFar/.test(material.name)) {
        material.color.multiplyScalar(1.2)
        material.needsUpdate = true
      } else if (material.name === 'AC_GoldInlay') {
        material.emissiveIntensity = 1.05
        material.roughness = 0.24
        material.needsUpdate = true
      } else if (material.name === 'AC_PortalCore') {
        material.emissiveIntensity = 5.5
        material.needsUpdate = true
      }
    })
  }, [scene, quality])
  return <primitive object={scene} />
}

interface BoundaryProps { fallback: ReactNode; children: ReactNode }

/** Si el GLB no puede cargarse, la batalla continúa en el Santuario. */
class ScenarioBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Aether Citadel no pudo cargarse; se usa el Santuario.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Aether Citadel: ciudadela flotante al amanecer. La arquitectura estática
 * vive en el GLB generado por tools/blender/generate_aether_citadel.py;
 * esta capa añade atmósfera, portal animado, cristales y nubes.
 */
export function AetherCitadel({ quality, reducedMotion, event }: AetherCitadelProps) {
  const flare = event?.type === 'nexus-damage' || event?.type === 'victory' ? 1 : 0
  return (
    <ScenarioBoundary fallback={<SanctuaryScenario quality={quality} reducedMotion={reducedMotion} event={event} />}>
      <DawnAtmosphere quality={quality} />
      <CitadelModel quality={quality} />
      <PortalVortex reducedMotion={reducedMotion} flare={flare} />
      <CrystalGlow position={[RIGHT_CRYSTAL.x, RIGHT_CRYSTAL.y, RIGHT_CRYSTAL.z]} scale={3.4} flare={flare} reducedMotion={reducedMotion} />
      <CrystalGlow position={[WEST_CRYSTAL.x, WEST_CRYSTAL.y, WEST_CRYSTAL.z]} scale={2.6} flare={flare} reducedMotion={reducedMotion} />
      <CrystalGlow position={[PORTAL.x, PORTAL.y + 3.7, PORTAL.z]} scale={1.6} flare={flare} reducedMotion={reducedMotion} />
      <DawnClouds quality={quality} reducedMotion={reducedMotion} />
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 60 : 30} scale={[11, 3.4, 11]} size={1.6} speed={reducedMotion ? 0 : 0.28} color="#ffe2b0" opacity={0.4} position={[0, 1.6, 0]} />
      )}
    </ScenarioBoundary>
  )
}

useGLTF.preload(CITADEL_URL)
