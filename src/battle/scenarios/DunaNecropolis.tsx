import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { RepeatWrapping } from 'three'
import type { Mesh, MeshStandardMaterial } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { desertSandTexture, desertSkyTexture, sandstoneTexture } from '../textures'

interface DunaProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/**
 * Necrópolis de Duna: un patio de arenisca abierto al desierto, a mediodía.
 *
 * La idea que lo separa de los otros tres escenarios es la LUZ. La Ciudadela
 * es un amanecer suave, el Santuario una noche fría y la Caldera un interior
 * rojo; aquí el sol cae vertical y aplasta, con sombras cortas y duras, calima
 * dorada en el aire y ni una sola fuente de luz mágica. Todo el color viene
 * del cielo y de la piedra.
 */

/**
 * Radio del patio empedrado: deja un anillo de losas alrededor del tablero.
 *
 * El tablero mide poco más de 7 unidades de lado, así que TODO lo que se
 * construya aquí tiene que medirse contra eso: una columna de 6 unidades no es
 * monumental, es una torre que tapa la partida.
 */
const COURT_RADIUS = BOARD_WORLD_HALF + 1.35

/** Arenisca del recinto: más clara y rosada que la arena, para que el patio
    se despegue del suelo en vez de fundirse con él. */
const SANDSTONE = { color: '#efd6ab', roughness: 0.94, metalness: 0.03 } as const
/** Oro batido de remates y capiteles: lo único que brilla en todo el sitio. */
const GOLD = { color: '#f0cd7a', roughness: 0.35, metalness: 0.75 } as const

const repeated = (texture: ReturnType<typeof sandstoneTexture>, x: number, y: number) => {
  const clone = texture.clone()
  clone.needsUpdate = true
  clone.wrapS = RepeatWrapping
  clone.wrapT = RepeatWrapping
  clone.repeat.set(x, y)
  return clone
}

/**
 * Cúpula del cielo. Va con `fog={false}` a propósito: si la calima también se
 * la comiera, el azul de arriba desaparecería y volveríamos a la mancha
 * amarilla plana sin profundidad.
 */
function SkyDome() {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[70, 32, 20]} />
      <meshBasicMaterial map={desertSkyTexture()} fog={false} />
    </mesh>
  )
}

/** El mar de arena hasta el horizonte, con las dunas que lo rompen. */
function SandSea({ quality }: { quality: GraphicsQuality }) {
  const sand = useMemo(() => repeated(desertSandTexture(), 26, 26), [])
  const dunes = useMemo(() => {
    const count = quality === 'low' ? 7 : 16
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + 0.42
      return {
        angle,
        radius: COURT_RADIUS + 7 + (index % 5) * 4.5,
        // Anchas y muy bajas: una duna alta parecería una colina y rompería
        // la sensación de llanura infinita.
        width: 5 + (index % 4) * 3.5,
        height: 0.45 + (index % 3) * 0.3,
      }
    })
  }, [quality])
  return (
    <group>
      <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[52, 72]} />
        <meshStandardMaterial map={sand} color="#d3ab6d" roughness={0.98} metalness={0} />
      </mesh>
      {dunes.map((dune, index) => (
        <mesh
          key={index}
          position={[Math.cos(dune.angle) * dune.radius, -0.62, Math.sin(dune.angle) * dune.radius]}
          scale={[dune.width, dune.height, dune.width * 0.55]}
          rotation={[0, dune.angle, 0]}
        >
          <sphereGeometry args={[1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial map={sand} color="#cda468" roughness={0.98} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

/** El patio: losas de arenisca bajo el tablero, con su reborde tallado. */
function Court({ quality }: { quality: GraphicsQuality }) {
  const stone = useMemo(() => repeated(sandstoneTexture(), 5, 5), [])
  const band = useMemo(() => repeated(sandstoneTexture(), 12, 1), [])
  return (
    <group>
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[COURT_RADIUS, 64]} />
        <meshStandardMaterial map={stone} {...SANDSTONE} />
      </mesh>
      {/* Canto del zócalo: separa el patio de la arena. */}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[COURT_RADIUS, COURT_RADIUS * 0.99, 0.6, 64]} />
        <meshStandardMaterial map={band} color="#c9a86a" roughness={0.95} metalness={0.03} />
      </mesh>
      {/* Escalón inferior, más ancho: da al patio aire de recinto elevado. */}
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[COURT_RADIUS + 0.9, COURT_RADIUS + 1.1, 0.3, 64]} />
        <meshStandardMaterial map={band} color="#bf9e62" roughness={0.96} metalness={0.03} />
      </mesh>
      {/* Anillo de oro embutido en el suelo: la marca del Tribunal. */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[COURT_RADIUS - 0.62, COURT_RADIUS - 0.44, 72]} />
        <meshStandardMaterial {...GOLD} emissive="#8a6a1e" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

/**
 * Sala hipóstila: dos hileras de columnas gigantes a los lados. Son la silueta
 * que identifica el sitio, igual que los monolitos en el Santuario. Van solo a
 * izquierda y derecha, nunca delante, para no tapar el tablero.
 */
function Hypostyle({ quality }: { quality: GraphicsQuality }) {
  const stone = useMemo(() => repeated(sandstoneTexture(), 2, 6), [])
  const columns = useMemo(() => {
    const perSide = quality === 'low' ? 3 : 5
    const specs: { x: number; z: number; height: number; radius: number }[] = []
    for (let side = 0; side < 2; side += 1) {
      const x = (side === 0 ? -1 : 1) * (COURT_RADIUS + 1.35)
      for (let index = 0; index < perSide; index += 1) {
        // Escalonadas hacia el fondo: las de delante más bajas, para dejar la
        // vista limpia desde la cámara.
        const z = -4.2 + index * 2.1
        specs.push({ x, z, height: 2.2 + (perSide - index) * 0.42, radius: 0.34 })
      }
    }
    return specs
  }, [quality])
  return (
    <group>
      {columns.map((column, index) => (
        <group key={index} position={[column.x, 0, column.z]}>
          {/* Basa */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[column.radius * 1.28, column.radius * 1.34, 0.4, 16]} />
            <meshStandardMaterial map={stone} {...SANDSTONE} />
          </mesh>
          {/* Fuste, con una entasis muy leve */}
          <mesh position={[0, column.height / 2, 0]} castShadow={quality !== 'low'}>
            <cylinderGeometry args={[column.radius * 0.9, column.radius, column.height, 18]} />
            <meshStandardMaterial map={stone} {...SANDSTONE} />
          </mesh>
          {/* Capitel papiriforme: se abre arriba, como el ramo de papiro */}
          <mesh position={[0, column.height + 0.42, 0]} castShadow={quality !== 'low'}>
            <cylinderGeometry args={[column.radius * 1.5, column.radius * 0.85, 0.9, 18]} />
            <meshStandardMaterial map={stone} color="#e2c68f" roughness={0.9} metalness={0.05} />
          </mesh>
          {/* Ábaco dorado */}
          <mesh position={[0, column.height + 0.95, 0]}>
            <boxGeometry args={[column.radius * 3, 0.2, column.radius * 3]} />
            <meshStandardMaterial {...GOLD} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Obelisco con la punta dorada: el remate vertical del conjunto. */
function Obelisk({ position, height }: { position: readonly [number, number, number]; height: number }) {
  const stone = useMemo(() => repeated(sandstoneTexture(), 1, 4), [])
  return (
    <group position={position as [number, number, number]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial map={stone} {...SANDSTONE} />
      </mesh>
      <mesh position={[0, height / 2 + 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, height, 4]} />
        <meshStandardMaterial map={stone} {...SANDSTONE} />
      </mesh>
      {/* Piramidión: la punta de oro que devuelve el sol. */}
      <mesh position={[0, height + 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.27, 0.46, 4]} />
        <meshStandardMaterial {...GOLD} emissive="#c9962c" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

/**
 * Esfinge esquemática: cuerpo tumbado, pecho, cabeza y tocado. Sin detalle
 * fino a propósito — se ve de lejos y en silueta, y una cara mal resuelta
 * canta mucho más que una forma limpia.
 */
function Sphinx({ position, facing }: { position: readonly [number, number, number]; facing: number }) {
  const stone = useMemo(() => repeated(sandstoneTexture(), 2, 2), [])
  return (
    <group position={position as [number, number, number]} rotation={[0, facing, 0]}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.9, 0.2, 0.85]} />
        <meshStandardMaterial map={stone} color="#c39f61" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.47, 0]} castShadow>
        <boxGeometry args={[1.7, 0.46, 0.65]} />
        <meshStandardMaterial map={stone} {...SANDSTONE} />
      </mesh>
      {/* Pecho levantado y cabeza, en el extremo que mira al patio. */}
      <mesh position={[0.7, 0.76, 0]} castShadow>
        <boxGeometry args={[0.54, 0.86, 0.6]} />
        <meshStandardMaterial map={stone} {...SANDSTONE} />
      </mesh>
      <mesh position={[0.8, 1.3, 0]} castShadow>
        <boxGeometry args={[0.41, 0.41, 0.38]} />
        <meshStandardMaterial map={stone} color="#e0c48e" roughness={0.88} metalness={0.05} />
      </mesh>
      {/* Nemes: el tocado a rayas, sugerido con dos placas laterales. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0.77, 1.23, side * 0.25]}>
          <boxGeometry args={[0.39, 0.51, 0.09]} />
          <meshStandardMaterial {...GOLD} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Muro del recinto: una banda baja de arenisca en sombra que cierra el fondo.
 *
 * Aquí no cabe nada monumental y no es por falta de ganas: la cámara mira 37°
 * hacia abajo, así que por encima del Nexo rival solo quedan unos cincuenta
 * píxeles de escena. Un pilono, unas pirámides o cualquier silueta alta se
 * salen del encuadre y aparecen decapitados. Un muro bajo cabe entero, y hace
 * el trabajo que hacía falta: dar al fondo una franja oscura contra la que el
 * tablero se recorta, en vez de arena del mismo tono hasta el borde.
 */
function PrecinctWall({ quality }: { quality: GraphicsQuality }) {
  const stone = useMemo(() => repeated(sandstoneTexture(), 10, 1), [])
  return (
    <group position={[0, -0.62, -8.6]}>
      {/* Cuerpo del muro, con el talud característico. */}
      <mesh position={[0, 0.62, 0]} castShadow={quality !== 'low'}>
        <boxGeometry args={[26, 1.24, 0.9]} />
        <meshStandardMaterial map={stone} color="#a8895a" roughness={0.96} metalness={0.02} />
      </mesh>
      {/* Cornisa de gola: el remate volado, un tono más claro. */}
      <mesh position={[0, 1.32, 0.06]}>
        <boxGeometry args={[26.4, 0.22, 1.1]} />
        <meshStandardMaterial map={stone} color="#d7b478" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Toro dorado bajo la cornisa: la única línea que brilla del fondo. */}
      <mesh position={[0, 1.13, 0.48]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 26, 8]} />
        <meshStandardMaterial {...GOLD} emissive="#7d5f16" emissiveIntensity={0.3} />
      </mesh>
      {/* Contrafuertes: rompen los 26 metros de muro liso. */}
      {[-9, -4.4, 4.4, 9].map((x) => (
        <mesh key={x} position={[x, 0.68, 0.42]}>
          <boxGeometry args={[0.7, 1.36, 0.5]} />
          <meshStandardMaterial map={stone} color="#9c7d50" roughness={0.96} metalness={0.02} />
        </mesh>
      ))}
      {/* Puerta: un hueco en sombra en el eje, alineado con el Nexo rival. */}
      <mesh position={[0, 0.52, 0.47]}>
        <planeGeometry args={[1.7, 1.04]} />
        <meshStandardMaterial color="#241a0c" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

/**
 * El disco solar en el cenit. No es una esfera lejana como la luna del
 * Santuario: es un disco plano y cegador justo encima, porque el mediodía es
 * el tema del escenario.
 */
function SunDisc({ flare }: { flare: { readonly current: number } }) {
  const halo = useRef<Mesh>(null)
  useFrame(() => {
    const material = halo.current?.material as MeshStandardMaterial | undefined
    if (material) material.emissiveIntensity = 2.2 + flare.current * 1.6
  })
  return (
    <group position={[0, 16, -10]} rotation={[Math.PI / 2.6, 0, 0]}>
      <mesh>
        <circleGeometry args={[1.9, 40]} />
        <meshBasicMaterial color="#fff6d8" toneMapped={false} />
      </mesh>
      <mesh ref={halo} position={[0, 0, -0.1]}>
        <circleGeometry args={[4, 40]} />
        <meshStandardMaterial color="#ffdf9a" emissive="#ffd06a" emissiveIntensity={2.2} transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function DunaNecropolis({ quality, reducedMotion, event }: DunaProps) {
  // Un golpe fuerte hace vibrar el sol: es la única reacción del sitio, y va
  // hacia arriba en vez de encenderse por dentro como la Caldera.
  const flare = useRef(0)
  useFrame((_, delta) => {
    flare.current = Math.max(0, flare.current - delta * 1.3)
  })
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory' || event?.type === 'destroy') {
      flare.current = 1
    }
  }, [event])

  return (
    <>
      <color attach="background" args={['#cfd8dc']} />
      {/* Calima: lo lejano se disuelve en el tono del horizonte, que es lo que
          hace que el desierto parezca no acabarse nunca. Empieza lejos: si
          muerde antes, se traga las pirámides y el patio queda encerrado en
          una pared amarilla. */}
      <fog attach="fog" args={['#efdcb4', 30, 88]} />
      <ambientLight intensity={1.5} color="#ffe9c0" />
      <hemisphereLight intensity={1.3} color="#fff0cc" groundColor="#d9b478" />
      {/* Sol cenital: casi vertical, para que las sombras salgan cortas y duras. */}
      <directionalLight
        position={[1.5, 14, -4]}
        intensity={3.4}
        color="#fff3d2"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
      />
      {/* Rebote del suelo: la arena devuelve mucha luz y evita sombras negras. */}
      <directionalLight position={[-6, 2, 9]} intensity={1.1} color="#f6d9a6" />

      <SkyDome />
      <SunDisc flare={flare} />
      <SandSea quality={quality} />
      <Court quality={quality} />
      <Hypostyle quality={quality} />

      <PrecinctWall quality={quality} />
      <Obelisk position={[-(COURT_RADIUS + 0.75), 0, -3.4]} height={4.1} />
      <Obelisk position={[COURT_RADIUS + 0.75, 0, -3.4]} height={4.1} />

      <Sphinx position={[-(COURT_RADIUS + 1.7), -0.4, 3.1]} facing={-0.5} />
      <Sphinx position={[COURT_RADIUS + 1.7, -0.4, 3.1]} facing={Math.PI + 0.5} />

      {/* Polvo en suspensión: partículas doradas muy lentas, el aire caliente
          del mediodía. No hay chispas mágicas en Duna. */}
      {quality !== 'low' && (
        <>
          <Sparkles
            count={quality === 'high' ? 60 : 28}
            scale={[COURT_RADIUS * 2.4, 3.4, COURT_RADIUS * 2.4]}
            size={1.6}
            speed={reducedMotion ? 0 : 0.12}
            color="#ffe6ad"
            opacity={0.45}
            position={[0, 1.5, 0]}
          />
          <Sparkles
            count={quality === 'high' ? 34 : 16}
            scale={[COURT_RADIUS * 4, 1.6, COURT_RADIUS * 4]}
            size={2.6}
            speed={reducedMotion ? 0 : 0.08}
            color="#f4d79c"
            opacity={0.28}
            position={[0, -0.2, 0]}
          />
        </>
      )}
    </>
  )
}
