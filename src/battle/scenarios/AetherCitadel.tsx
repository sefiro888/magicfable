import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, DoubleSide, RepeatWrapping } from 'three'
import { usePageVisibility } from '../usePageVisibility'
import type { Group, Mesh, MeshBasicMaterial, PointLight } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { cloudTexture, dawnSkyTexture, goldFloorInlayTexture, marbleTexture } from '../textures'

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
      <fog attach="fog" args={['#8d9ec4', 34, 96]} />
      <mesh rotation={[0, -2.2, 0]}>
        <sphereGeometry args={[70, 32, 20]} />
        <meshBasicMaterial map={dawnSkyTexture()} side={1} fog={false} />
      </mesh>
      {/* El sol estaba en 4,8 y, sumado al relleno, la escena llegaba a 6,3
          sobre piedra clara: con el mapeado ACES eso se va al blanco y
          desatura, que es por lo que las columnas y las losas salian como
          cartulina crema sin volumen. Bajado a 3, en linea con las demas
          escenas, para que el rango util vuelva a caer donde hay textura. */}
      <ambientLight intensity={0.32} color="#aeb9d8" />
      <hemisphereLight intensity={0.28} color="#d8e2ff" groundColor="#4a3c2e" />
      {/* Sol de amanecer desde arriba-derecha, como en la referencia. */}
      <directionalLight
        position={[15, 11, -8]}
        intensity={3}
        color="#ffcf96"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        // Por coherencia con las otras cuatro escenas: evita el acné de
        // sombra en las superficies casi paralelas a la luz.
        shadow-bias={-0.0006}
      />
      {/* Relleno frío desde el lado del portal. */}
      <directionalLight position={[-14, 9, 10]} intensity={0.42} color="#8fa8e8" />
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

/** Radio de la plaza: el tablero más el andén de mármol que lo enmarca. */
const PLAZA_RADIUS = BOARD_WORLD_HALF + 1.35

/** Mármol y oro: la pareja de materiales de la Ciudadela. */
const GOLD = { color: '#a8802e', roughness: 0.32, metalness: 0.9, emissive: '#3a2708', emissiveIntensity: 0.25 } as const

const repeatedMarble = (x: number, y: number) => {
  const texture = marbleTexture().clone()
  texture.needsUpdate = true
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(x, y)
  return texture
}

/**
 * La plaza: disco de mármol con el canto moldurado y los escalones que bajan
 * al vacío. Hasta ahora el tablero flotaba sobre nada — literalmente, solo
 * había cielo debajo de las casillas.
 */
function Plaza({ quality }: { quality: GraphicsQuality }) {
  const marble = useMemo(() => repeatedMarble(4, 4), [])
  return (
    <group>
      <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[PLAZA_RADIUS, 60]} />
        <meshStandardMaterial map={marble} color="#f2e9da" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Moldura del canto: dos cilindros que vuelan sobre el cuerpo. */}
      <mesh position={[0, -0.24, 0]}>
        <cylinderGeometry args={[PLAZA_RADIUS + 0.14, PLAZA_RADIUS + 0.05, 0.24, 60]} />
        <meshStandardMaterial map={marble} color="#e6dbc8" roughness={0.6} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[PLAZA_RADIUS - 0.05, PLAZA_RADIUS - 0.55, 0.62, 48]} />
        <meshStandardMaterial map={marble} color="#cfc2ab" roughness={0.7} metalness={0.06} />
      </mesh>
      {/* Cuerpo que se hunde hacia las nubes: la ciudadela está flotando. */}
      <mesh position={[0, -1.9, 0]}>
        <coneGeometry args={[PLAZA_RADIUS - 0.55, 2.6, 12]} />
        <meshStandardMaterial color="#9b8f7c" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Escalinata del lado de la cámara. */}
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[0, -0.22 - step * 0.22, PLAZA_RADIUS + 0.3 + step * 0.42]}>
          <boxGeometry args={[3.8 - step * 0.45, 0.22, 0.62]} />
          <meshStandardMaterial map={marble} color="#e9dfcd" roughness={0.6} metalness={0.07} />
        </mesh>
      ))}
    </group>
  )
}

interface ColumnSpec {
  readonly angle: number
  readonly radius: number
  readonly height: number
  /** Columna partida: se queda en tocón y pierde el capitel. */
  readonly broken: boolean
}

/**
 * Columnata que rodea la plaza. Varias están partidas: la Ciudadela es
 * antigua, no un edificio recién terminado. Las del lado de la cámara se
 * quedan en tocones para no tapar el tablero.
 */
function Colonnade({ columns, quality }: { columns: readonly ColumnSpec[]; quality: GraphicsQuality }) {
  const marble = useMemo(() => repeatedMarble(1, 3), [])
  return (
    <group>
      {columns.map((column, index) => {
        const x = Math.cos(column.angle) * column.radius
        const z = Math.sin(column.angle) * column.radius
        const shaft = column.broken ? column.height * 0.42 : column.height
        return (
          <group key={index} position={[x, 0, z]}>
            {/* Basa */}
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.34, 0.4, 0.18, 12]} />
              <meshStandardMaterial map={marble} color="#e4d9c5" roughness={0.65} metalness={0.06} />
            </mesh>
            {/* Fuste acanalado (12 lados basta para leerse a esta distancia) */}
            <mesh position={[0, shaft / 2 + 0.08, 0]} castShadow={quality === 'high'}>
              <cylinderGeometry args={[0.24, 0.28, shaft, 12, 1]} />
              <meshStandardMaterial map={marble} color="#efe5d3" roughness={0.6} metalness={0.07} />
            </mesh>
            {!column.broken && (
              <>
                {/* Capitel y ábaco */}
                <mesh position={[0, shaft + 0.16, 0]}>
                  <cylinderGeometry args={[0.36, 0.26, 0.2, 12]} />
                  <meshStandardMaterial map={marble} color="#f2e9da" roughness={0.55} metalness={0.08} />
                </mesh>
                <mesh position={[0, shaft + 0.31, 0]}>
                  <boxGeometry args={[0.78, 0.12, 0.78]} />
                  <meshStandardMaterial {...GOLD} />
                </mesh>
              </>
            )}
          </group>
        )
      })}
    </group>
  )
}

/**
 * El arco de la Ciudadela, tras el Nexo rival: dos pilares, un dintel dorado y
 * una lámina de luz de amanecer colgando en el vano. Es el hito propio del
 * sitio, el que en el Santuario es un dolmen y en la Caldera un yunque.
 */
function SunArch({ pulse, quality, reducedMotion }: { pulse: { readonly current: number }; quality: GraphicsQuality; reducedMotion: boolean }) {
  const veil = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  const marble = useMemo(() => repeatedMarble(1, 2), [])
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current) return
    const wave = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.08
    if (veil.current) {
      const material = veil.current.material as MeshBasicMaterial
      material.opacity = 0.32 + wave + pulse.current * 0.3
    }
    if (light.current) light.current.intensity = 14 + wave * 24 + pulse.current * 30
  })
  const z = -(BOARD_WORLD_HALF + 3.1)
  return (
    <group position={[0, 0, z]} scale={1.12}>
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.05, 0.3, 1.05]} />
            <meshStandardMaterial map={marble} color="#cdb68f" roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[0.7, 4, 0.7]} />
            <meshStandardMaterial map={marble} color="#d9c39c" roughness={0.55} metalness={0.1} />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <boxGeometry args={[0.92, 0.22, 0.92]} />
            <meshStandardMaterial {...GOLD} />
          </mesh>
        </group>
      ))}
      {/* Dintel y frontón. */}
      <mesh position={[0, 4.55, 0]}>
        <boxGeometry args={[5.1, 0.5, 0.9]} />
        <meshStandardMaterial map={marble} color="#d9c39c" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4.92, 0]}>
        <boxGeometry args={[4.4, 0.26, 0.7]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* Disco solar del remate. */}
      <mesh position={[0, 5.42, 0]}>
        <torusGeometry args={[0.42, 0.09, 10, 24]} />
        <meshStandardMaterial {...GOLD} emissive="#ffbe5c" emissiveIntensity={1.1} />
      </mesh>
      {/* Lámina de luz en el vano. */}
      <mesh ref={veil} position={[0, 2.2, 0]}>
        <planeGeometry args={[3.3, 4.1]} />
        <meshBasicMaterial color="#ffd79a" transparent opacity={0.32} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={light} position={[0, 2.4, 1]} color="#ffc978" intensity={14} distance={14} decay={2} />
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 26 : 12} scale={[3, 3.6, 0.9]} size={2.4} speed={reducedMotion ? 0 : 0.45} color="#ffe6bb" opacity={0.8} position={[0, 2.2, 0.35]} />
      )}
    </group>
  )
}

/** Estandarte colgado de un travesaño entre dos columnas, ondeando despacio. */
function Banner({ position, rotation, reducedMotion }: { position: readonly [number, number, number]; rotation: number; reducedMotion: boolean }) {
  const cloth = useRef<Mesh>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = cloth.current
    if (!node || reducedMotion || !visible.current) return
    // Ondeo barato: la tela gira unos grados sobre su eje vertical.
    node.rotation.y = Math.sin(clock.elapsedTime * 0.9 + position[0]) * 0.12
  })
  return (
    <group position={[position[0], position[1], position[2]]} rotation={[0, rotation, 0]}>
      {/* Travesaño horizontal, sostenido por dos postes que bajan hasta la
          plaza: colgado solo del aire, el estandarte parecía un recorte. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, -1.31, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 2.62, 8]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      ))}
      <mesh ref={cloth} position={[0, -0.92, 0.02]}>
        <planeGeometry args={[1.15, 1.8]} />
        <meshStandardMaterial color="#b9472f" roughness={0.85} metalness={0.05} side={DoubleSide} emissive="#571a10" emissiveIntensity={0.3} />
      </mesh>
      {/* Fleco inferior. */}
      <mesh position={[0, -1.84, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.15, 6]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
    </group>
  )
}

/**
 * Islas flotantes del fondo: peñascos con una torre encima y una cascada de
 * luz cayendo al vacío. Dan escala al sitio — sin ellas, el cielo era un telón
 * plano y la plaza podía estar en cualquier parte.
 */
function FloatingIsles({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const marble = useMemo(() => repeatedMarble(1, 1), [])
  const isles = useMemo(
    () =>
      (
        [
          [-15, 3.2, -21, 1.5, true],
          [14.5, 5, -24, 1.9, true],
          [21, -1.2, -10, 1.6, false],
          [-20, -3, -5, 1.3, false],
          [3.5, 7.4, -31, 1.2, true],
        ] as const
      ).slice(0, quality === 'high' ? 5 : 3),
    [quality],
  )
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion || !visible.current) return
    node.children.forEach((child, index) => {
      const isle = isles[index]
      if (!isle) return
      child.position.y = isle[1] + Math.sin(clock.elapsedTime * 0.12 + index * 1.9) * 0.35
    })
  })
  if (quality === 'low') return null
  return (
    <group ref={group}>
      {isles.map(([x, y, z, scale, tower], index) => (
        <group key={index} position={[x, y, z]} scale={scale}>
          {/* Peñasco: cono invertido, ancho arriba. */}
          <mesh rotation={[Math.PI, index, 0]}>
            <coneGeometry args={[2.2, 3.4, 7]} />
            <meshStandardMaterial color="#8d8271" roughness={0.95} metalness={0.04} fog={false} />
          </mesh>
          <mesh position={[0, 1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.2, 7]} />
            <meshStandardMaterial map={marble} color="#e8dfcd" roughness={0.7} metalness={0.06} fog={false} />
          </mesh>
          {tower && (
            <group position={[0.3, 1.75, -0.2]}>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.5, 0.62, 3, 10]} />
                <meshStandardMaterial map={marble} color="#efe5d3" roughness={0.6} metalness={0.07} fog={false} />
              </mesh>
              <mesh position={[0, 3.35, 0]}>
                <coneGeometry args={[0.78, 1.1, 10]} />
                <meshStandardMaterial color="#c98a4a" roughness={0.5} metalness={0.5} emissive="#5d3410" emissiveIntensity={0.4} fog={false} />
              </mesh>
            </group>
          )}
          {/* Cascada de luz que cae del islote. */}
          <mesh position={[-0.6, -2.6, 0.4]}>
            <planeGeometry args={[0.9, 5]} />
            <meshBasicMaterial color="#dff0ff" transparent opacity={0.22} depthWrite={false} fog={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Bandada lejana: siluetas mínimas que cruzan el cielo en bucle. */
function Birds({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion || !visible.current) return
    const t = clock.elapsedTime * 0.05
    node.children.forEach((child, index) => {
      const phase = (t + index * 0.08) % 1
      child.position.x = -34 + phase * 68
      child.position.y = 9 + Math.sin(phase * 6 + index) * 1.2
      child.rotation.z = Math.sin(clock.elapsedTime * 3 + index) * 0.35
    })
  })
  if (quality !== 'high') return null
  return (
    <group ref={group}>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[-30 + index * 2, 9, -30 - (index % 3) * 3]} scale={0.5 + (index % 3) * 0.12}>
          <coneGeometry args={[0.16, 0.9, 3]} />
          <meshBasicMaterial color="#5c5a63" fog={false} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Aether Citadel: la plaza alta de una ciudadela flotante al amanecer. Antes
 * era solo un domo de cielo con nubes — el tablero flotaba literalmente sobre
 * nada. Ahora hay suelo de mármol, columnata rota alrededor, un arco de luz
 * tras el Nexo rival e islas con torres en el horizonte que dan escala. Sigue
 * siendo el escenario más luminoso y despejado de los tres: la arquitectura
 * está toda por debajo de la línea del tablero o lejos, al fondo.
 */
export function AetherCitadel({ quality, reducedMotion, event }: AetherCitadelProps) {
  const pulse = useRef(0)
  useFrame((_, delta) => {
    pulse.current = Math.max(0, pulse.current - delta * 1.3)
  })
  useEffect(() => {
    if (event?.type === 'turn' || event?.type === 'nexus-damage' || event?.type === 'victory') {
      pulse.current = 1
    }
  }, [event])

  const columns = useMemo<readonly ColumnSpec[]>(() => {
    const count = quality === 'low' ? 10 : 18
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + 0.18
      // El lado de la cámara se queda en tocones: a altura completa, la
      // columnata se planta delante del tablero y tapa las casillas.
      // También cuentan como «lado de la cámara» las laterales: con el picado
      // real de la cámara, una columna entera a los lados se sale por arriba
      // del encuadre y se ve como un cilindro cortado.
      const nearCamera = Math.sin(angle) > -0.78
      return {
        angle,
        radius: PLAZA_RADIUS + 0.75 + (index % 2) * 0.25,
        height: nearCamera ? 0.6 + (index % 3) * 0.22 : 2.1 + (index % 4) * 0.38,
        broken: nearCamera || index % 5 === 2,
      }
    })
  }, [quality])

  return (
    <>
      <DawnAtmosphere quality={quality} />
      <FloatingIsles quality={quality} reducedMotion={reducedMotion} />
      <Birds quality={quality} reducedMotion={reducedMotion} />
      <Plaza quality={quality} />
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
      <Colonnade columns={columns} quality={quality} />
      <SunArch pulse={pulse} quality={quality} reducedMotion={reducedMotion} />
      {quality !== 'low' && (
        <>
          <Banner position={[-(PLAZA_RADIUS + 0.9), 2.62, -2.6]} rotation={Math.PI / 2} reducedMotion={reducedMotion} />
          <Banner position={[PLAZA_RADIUS + 0.9, 2.62, -2.6]} rotation={-Math.PI / 2} reducedMotion={reducedMotion} />
        </>
      )}
      <DawnClouds quality={quality} reducedMotion={reducedMotion} />
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 60 : 30} scale={[11, 3.4, 11]} size={1.6} speed={reducedMotion ? 0 : 0.28} color="#ffe2b0" opacity={0.4} position={[0, 1.6, 0]} />
      )}
    </>
  )
}
