import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BackSide, DoubleSide, RepeatWrapping } from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { barkTexture, canopyTexture, forestFloorTexture, masonryTexture } from '../textures'

interface GroveProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/**
 * Claro del Bosque: un círculo de losas antiguas que el bosque casi se ha
 * tragado, bajo el dosel.
 *
 * Este escenario existe por una razón concreta de paleta: los otros cinco son
 * amanecer pastel, noche azul, lava roja, desierto dorado y hielo blanco —
 * ninguno es VERDE. Naturaleza, una de las seis facciones originales, no tenía
 * casa propia y peleaba en el Santuario rúnico, que además cargaba con cuatro
 * facciones de carácter muy distinto.
 *
 * La luz es lo que lo define: no hay cielo, hay copas. El sol entra en haces
 * por los claros del dosel y todo lo demás queda en penumbra verde. Es el
 * único sitio del juego donde la luz llega FILTRADA.
 *
 * Escala: el tablero mide poco más de 7 unidades de lado, así que los troncos
 * se plantan fuera del claro y suben lo justo para cerrar el techo sin tapar
 * la partida.
 */

/** Radio del claro empedrado: deja un anillo de losas alrededor del tablero. */
const GROVE_RADIUS = BOARD_WORLD_HALF + 1.4

const repeated = (texture: ReturnType<typeof forestFloorTexture>, x: number, y: number) => {
  const clone = texture.clone()
  clone.needsUpdate = true
  clone.wrapS = RepeatWrapping
  clone.wrapT = RepeatWrapping
  clone.repeat.set(x, y)
  return clone
}

/**
 * Cúpula del dosel. Hace de cielo: mirando arriba se ven hojas y los claros
 * por donde entra el sol, nunca azul.
 */
function CanopyDome() {
  return (
    <mesh>
      <sphereGeometry args={[62, 32, 20]} />
      <meshBasicMaterial map={canopyTexture()} side={BackSide} fog={false} />
    </mesh>
  )
}

/** Suelo del bosque hasta la niebla, con el claro empedrado en el centro. */
function GroveFloor({ quality }: { quality: GraphicsQuality }) {
  const floor = useMemo(() => repeated(forestFloorTexture(), 16, 16), [])
  const clearing = useMemo(() => repeated(forestFloorTexture(), 4, 4), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[56, quality === 'low' ? 32 : 64]} />
        <meshStandardMaterial map={floor} color="#6d6a4e" roughness={0.98} metalness={0} />
      </mesh>
      {/* Plataforma del claro, un peldaño por encima del suelo del bosque. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[GROVE_RADIUS, quality === 'low' ? 24 : 48]} />
        <meshStandardMaterial map={clearing} color="#8b8468" roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[0, -0.44, 0]} receiveShadow={quality !== 'low'}>
        <cylinderGeometry args={[GROVE_RADIUS, GROVE_RADIUS * 0.97, 0.42, quality === 'low' ? 24 : 48, 1, true]} />
        <meshStandardMaterial map={masonryTexture()} color="#6f6a52" roughness={0.96} metalness={0.02} side={DoubleSide} />
      </mesh>
    </group>
  )
}

/**
 * Troncos alrededor del claro. Van muy juntos y muy altos a propósito: son
 * ellos los que cierran el sitio y explican por qué la luz llega a trozos.
 */
function Trunks({ quality }: { quality: GraphicsQuality }) {
  const bark = useMemo(() => barkTexture(), [])
  const trunks = useMemo(() => {
    // Los troncos se plantaban en círculo COMPLETO alrededor del claro, y la
    // cámara mira desde z positivo: los del arco cercano quedaban ENTRE la
    // cámara y el tablero, así que uno de ellos cruzaba la pantalla de arriba
    // abajo tapando media partida. Aquí solo se planta el arco que la cámara
    // ve de frente o de lado; el sector de delante se deja vacío porque cae
    // fuera de plano de todas formas.
    const total = quality === 'low' ? 10 : 20
    const planted: { position: readonly [number, number, number]; height: number; width: number; tilt: number; spin: number }[] = []
    for (let index = 0; index < total * 2 && planted.length < total; index += 1) {
      const angle = (index / (total * 2)) * Math.PI * 2 + (index % 3) * 0.09
      // sin(angle) > 0 es el lado de la cámara. Se descarta ese sector.
      if (Math.sin(angle) > 0.12) continue
      const radius = GROVE_RADIUS + 1.6 + (index % 4) * 1.5
      const height = 13 + (index % 5) * 4.5
      planted.push({
        position: [Math.cos(angle) * radius, height / 2 - 0.6, Math.sin(angle) * radius],
        height,
        width: 0.4 + (index % 4) * 0.16,
        // Ninguno recto ni orientado igual: un bosque plantado en fila canta.
        tilt: ((index % 5) - 2) * 0.035,
        spin: index * 1.3,
      })
    }
    return planted
  }, [quality])
  return (
    <group>
      {trunks.map((trunk, index) => (
        <group key={index} position={trunk.position} rotation={[trunk.tilt, trunk.spin, trunk.tilt * 0.7]}>
          <mesh castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
            <cylinderGeometry args={[trunk.width * 0.78, trunk.width, trunk.height, quality === 'low' ? 6 : 9]} />
            {/* Corteza de verdad, no mampostería: a esta escala unas juntas de
                sillar en un árbol cantan mucho. El `bumpMap` con la misma
                imagen da el relieve de los surcos sin geometría extra. */}
            {/* Color claro y un emisivo mínimo: la luz clave entra por encima
                del dosel, así que la cara del tronco que mira a la cámara no
                recibe casi nada y salían como siluetas NEGRAS en las que no
                se veía ni la corteza que se les puso. */}
            <meshStandardMaterial map={bark} bumpMap={bark} bumpScale={5} color="#c4ab86" roughness={0.95} metalness={0.02} emissive="#2e2418" emissiveIntensity={0.55} />
          </mesh>
          {/* Musgo en la cara baja del tronco, del lado del claro. La altura
              es FIJA, no proporcional al árbol: atada a `trunk.height` salían
              planchas verdes de siete metros en los troncos más altos, que
              desde la cámara se leían como paneles flotando. El musgo trepa
              lo mismo suba lo que suba el árbol. */}
          <mesh position={[0, -trunk.height * 0.5 + 0.85, trunk.width * 0.72]}>
            <planeGeometry args={[trunk.width * 1.15, 1.7]} />
            <meshStandardMaterial color="#4e6c2e" roughness={0.98} metalness={0} transparent opacity={0.72} side={DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Haces de luz que bajan por los claros del dosel. Son el rasgo que define la
 * escena, así que van con `AdditiveBlending` y muy abiertos: lo que se ve no
 * es el haz, es el polvo suspendido dentro de él.
 */
function SunShafts({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const shafts = useMemo(() => {
    const total = quality === 'low' ? 3 : 6
    return Array.from({ length: total }, (_, index) => {
      const angle = (index / total) * Math.PI * 2 + 0.7
      const radius = 1.2 + (index % 3) * 1.9
      return {
        position: [Math.cos(angle) * radius, 5.4, Math.sin(angle) * radius] as const,
        scale: 0.7 + (index % 4) * 0.3,
        tilt: 0.1 + (index % 3) * 0.05,
      }
    })
  }, [quality])
  useFrame(({ clock }) => {
    if (reducedMotion || !group.current) return
    // Respiración muy lenta: las hojas se mueven arriba y el haz parpadea.
    const t = clock.elapsedTime
    group.current.children.forEach((child, index) => {
      const material = (child as Mesh).material as MeshStandardMaterial
      material.opacity = 0.1 + Math.sin(t * 0.35 + index * 1.7) * 0.045
    })
  })
  return (
    <group ref={group}>
      {shafts.map((shaft, index) => (
        <mesh key={index} position={shaft.position} rotation={[shaft.tilt, index * 0.9, 0]} scale={shaft.scale}>
          <coneGeometry args={[1.5, 11, 12, 1, true]} />
          <meshBasicMaterial
            color="#fff3c8"
            transparent
            opacity={0.11}
            blending={AdditiveBlending}
            depthWrite={false}
            side={DoubleSide}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Helechos y matorral bajo al borde del claro. */
function Undergrowth({ quality }: { quality: GraphicsQuality }) {
  const clumps = useMemo(() => {
    const total = quality === 'low' ? 14 : 34
    return Array.from({ length: total }, (_, index) => {
      const angle = (index / total) * Math.PI * 2 + (index % 5) * 0.2
      const radius = GROVE_RADIUS + 0.35 + (index % 5) * 0.7
      return {
        position: [Math.cos(angle) * radius, -0.42, Math.sin(angle) * radius] as const,
        scale: 0.4 + (index % 4) * 0.22,
        spin: index * 0.8,
      }
    })
  }, [quality])
  return (
    <group>
      {clumps.map((clump, index) => (
        <group key={index} position={clump.position} rotation={[0, clump.spin, 0]} scale={clump.scale}>
          {/* Hojas ESTRECHAS y abiertas en abanico desde la base. En el primer
              intento eran tres cuadros de 0,22 × 0,9: a la escala del tablero
              se leían como cartulinas verdes flotando, no como un helecho.
              Una hoja es mucho más larga que ancha, y un matojo son muchas
              saliendo del mismo punto en distintas direcciones. */}
          {[0, 1, 2, 3, 4, 5].map((blade) => {
            const lean = 0.3 + (blade % 3) * 0.22
            const largo = 0.72 + (blade % 4) * 0.2
            return (
              <mesh
                key={blade}
                rotation={[0, (blade / 6) * Math.PI * 2, lean]}
                // Se levanta media hoja para que el pie quede en el suelo y
                // no cortada por la mitad al inclinarla desde su centro.
                position={[Math.sin(lean) * largo * 0.4, largo * 0.42, 0]}
              >
                <planeGeometry args={[0.085, largo]} />
                <meshStandardMaterial
                  color={blade % 2 === 0 ? '#3f6b2c' : '#527f36'}
                  roughness={0.95}
                  metalness={0}
                  side={DoubleSide}
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

/** Piedras cubiertas de musgo repartidas por el borde del claro. */
function MossyStones({ quality }: { quality: GraphicsQuality }) {
  const stones = useMemo(() => {
    const total = quality === 'low' ? 5 : 11
    return Array.from({ length: total }, (_, index) => {
      const angle = (index / total) * Math.PI * 2 + 1.1
      const radius = GROVE_RADIUS - 0.2 + (index % 3) * 0.5
      return {
        position: [Math.cos(angle) * radius, -0.32, Math.sin(angle) * radius] as const,
        // Más bajas y menos regulares: con la escala anterior y el sombreado
        // plano se leían como cristales verdes clavados, no como cantos.
        scale: [0.42 + (index % 4) * 0.16, 0.22 + (index % 3) * 0.1, 0.36 + (index % 5) * 0.12] as const,
        spin: index * 1.7,
      }
    })
  }, [quality])
  return (
    <group>
      {stones.map((stone, index) => (
        <mesh
          key={index}
          position={stone.position}
          rotation={[index * 0.3, stone.spin, index * 0.2]}
          scale={stone.scale}
          castShadow={quality === 'high'}
          receiveShadow={quality !== 'low'}
        >
          <icosahedronGeometry args={[0.5, 0]} />
          {/* Pardo con verde encima, no verde a secas: una piedra con musgo
              sigue siendo piedra, y el verde saturado la convertía en gema. */}
          <meshStandardMaterial color="#6b6a52" roughness={0.98} metalness={0.02} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function VerdantGrove({ quality, reducedMotion }: GroveProps) {
  return (
    <>
      <color attach="background" args={['#0d160c']} />
      {/* Niebla verde y cercana: el bosque no se acaba, se pierde. */}
      <fog attach="fog" args={['#1e2f1a', 15, 46]} />

      {/* Luz FILTRADA, que es lo que define el sitio: el sol entra fuerte y
          muy vertical por los claros del dosel, y el relleno se mantiene bajo
          —como en el resto de escenas— para que la penumbra de debajo de los
          árboles siga siendo penumbra. El rebote de la hemisférica va teñido
          de verde a propósito: en un bosque, la luz indirecta ha rebotado
          antes en un millón de hojas y llega con su color. */}
      {/* Subida respecto al primer ajuste: el sitio es un CLARO, o sea el
          punto del bosque donde MÁS luz entra, y estaba quedando tan oscuro
          como el interior de la espesura. Sigue muy por debajo de la luz
          clave para que el modelado no se pierda. */}
      <ambientLight intensity={0.52} color="#a8c78f" />
      <hemisphereLight intensity={0.92} color="#d8eeae" groundColor="#4a5733" />
      <directionalLight
        position={[3, 16, -2]}
        intensity={2.9}
        color="#fff0c0"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.0006}
      />
      {/* Rebote verde del follaje, desde un lado y bajo. */}
      <directionalLight position={[-9, 3, 7]} intensity={0.95} color="#8ec468" />

      <CanopyDome />
      <GroveFloor quality={quality} />
      <Trunks quality={quality} />
      <Undergrowth quality={quality} />
      <MossyStones quality={quality} />
      <SunShafts quality={quality} reducedMotion={reducedMotion} />

      {/* Polen y bichillos flotando en los haces de luz. */}
      {quality !== 'low' && (
        <Sparkles
          count={quality === 'high' ? 120 : 60}
          scale={[15, 7, 15]}
          position={[0, 3, 0]}
          size={2.6}
          speed={reducedMotion ? 0 : 0.16}
          opacity={0.55}
          color="#f2ffc4"
        />
      )}
    </>
  )
}
