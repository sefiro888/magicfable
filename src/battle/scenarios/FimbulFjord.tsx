import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BackSide, DoubleSide, RepeatWrapping } from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { auroraSkyTexture, monolithTexture, packedSnowTexture } from '../textures'

interface FimbulProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/**
 * Fiordo de Fimbul: un lago helado bajo la aurora, en plena noche polar.
 *
 * Lo que lo separa de los otros cuatro escenarios es, otra vez, la LUZ — pero
 * llevada al extremo contrario que la Caldera. Aquí no hay una fuente caliente
 * que lo domine todo: la aurora tiñe el cielo de verde y violeta, la nieve
 * devuelve casi toda esa luz por rebote, y el resultado es una escena clara
 * pero FRÍA, sin una sola sombra cálida. El hielo del suelo es además el
 * material más reflectante del juego, que es justo lo que el mapa de rugosidad
 * de las losas está para lucir.
 *
 * Escala: el tablero mide poco más de 7 unidades de lado. Todo lo que se
 * construya aquí se mide contra eso — los menhires rondan las 2 unidades para
 * enmarcar sin tapar la partida.
 */

/** Radio de la plataforma de hielo: deja un anillo alrededor del tablero. */
const FLOE_RADIUS = BOARD_WORLD_HALF + 1.5

/**
 * Hielo del lago: azulado, muy liso, poco rugoso.
 *
 * El tono es bastante más oscuro de lo que parecería lógico para hielo, y es
 * a propósito: esto es una NOCHE polar. La textura de nieve ya es casi blanca,
 * así que con un color claro encima el lago se quemaba a blanco puro, tapaba
 * la aurora del cielo y mataba toda la atmósfera nocturna. Aquí el blanco lo
 * pone la luz que le llega, no el material.
 */
const ICE = { color: '#63788c', roughness: 0.16, metalness: 0.02 } as const
/**
 * Piedra de los menhires. Bastante más clara de lo que pide la intuición: la
 * textura de runas ya es oscura de por sí, y al multiplicarla por un gris
 * medio los menhires salían como slabs NEGRAS que se comían la escena. Aquí
 * el color es el que levanta la piedra, no el que la tiñe.
 */
const RUNESTONE = { color: '#b9c2cc', roughness: 0.92, metalness: 0.04 } as const

const repeated = (texture: ReturnType<typeof packedSnowTexture>, x: number, y: number) => {
  const clone = texture.clone()
  clone.needsUpdate = true
  clone.wrapS = RepeatWrapping
  clone.wrapT = RepeatWrapping
  clone.repeat.set(x, y)
  return clone
}

/**
 * Cúpula del cielo con la aurora. Va con `fog={false}`: si la niebla helada se
 * comiera también el cielo, la aurora —que es TODO el color de la escena—
 * desaparecería y quedaría una noche gris plana.
 */
function SkyDome() {
  return (
    // Ojo: `side={BackSide}` YA hace que se vea desde dentro. Añadirle además
    // un `scale={[-1,1,1]}` invierte la geometría una segunda vez y el cielo
    // se vuelve invisible desde la cámara — que es exactamente lo que pasaba
    // en el primer intento (fondo lavado, sin aurora).
    <mesh>
      <sphereGeometry args={[72, 32, 20]} />
      <meshBasicMaterial map={auroraSkyTexture()} side={BackSide} fog={false} />
    </mesh>
  )
}

/**
 * Aurora viva: dos velos que ondulan despacio por encima del fiordo. Es lo
 * único que se mueve en toda la escena, así que va MUY lento a propósito —
 * una aurora rápida parecería un efecto de partículas, no un cielo.
 */
function AuroraVeils({ reducedMotion }: { reducedMotion: boolean }) {
  const first = useRef<Mesh>(null)
  const second = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    if (first.current) {
      first.current.position.x = Math.sin(t * 0.06) * 5
      const material = first.current.material as MeshStandardMaterial
      material.opacity = 0.34 + Math.sin(t * 0.17) * 0.1
    }
    if (second.current) {
      second.current.position.x = Math.cos(t * 0.045) * 7
      const material = second.current.material as MeshStandardMaterial
      material.opacity = 0.26 + Math.cos(t * 0.13) * 0.09
    }
  })
  return (
    <group>
      {/* Estaban a 15 y 19 de altura: desde la camara eso cae unos 12 grados
          POR ENCIMA de la horizontal, y el encuadre mira en picado, asi que
          del cielo solo se ve una franja fina justo sobre el horizonte. La
          aurora quedaba entera fuera de cuadro — se dibujaba y no la veia
          nadie. Bajadas a esa franja, y con mas cuerpo para que se noten. */}
      <mesh ref={first} position={[0, 7.5, -27]} rotation={[0.16, 0, 0.06]}>
        <planeGeometry args={[52, 16]} />
        <meshBasicMaterial color="#6bf0b4" transparent opacity={0.34} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} fog={false} />
      </mesh>
      <mesh ref={second} position={[6, 10.5, -34]} rotation={[0.1, 0, -0.1]}>
        <planeGeometry args={[44, 18]} />
        <meshBasicMaterial color="#a880ff" transparent opacity={0.26} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} fog={false} />
      </mesh>
    </group>
  )
}

/**
 * El lago helado que se pierde hasta la niebla, con la plataforma de hielo
 * donde se juega encima. Dos piezas y no una: el lago lejano es liso y muy
 * reflectante, y la plataforma lleva la nieve pisada del campo de batalla.
 */
function FrozenLake({ quality }: { quality: GraphicsQuality }) {
  const snow = useMemo(() => repeated(packedSnowTexture(), 14, 14), [])
  const floeSnow = useMemo(() => repeated(packedSnowTexture(), 3, 3), [])
  return (
    <group>
      {/* Lago: se extiende hasta bien pasada la niebla para que no se vea el
          borde, pero SIN llegar al radio de la cúpula del cielo — si coinciden,
          los dos planos pelean por el mismo píxel en el horizonte. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[64, quality === 'low' ? 32 : 64]} />
        <meshStandardMaterial map={snow} color={ICE.color} roughness={ICE.roughness} metalness={ICE.metalness} />
      </mesh>
      {/* Plataforma de hielo bajo el tablero. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[FLOE_RADIUS, quality === 'low' ? 24 : 48]} />
        <meshStandardMaterial map={floeSnow} color="#8296a8" roughness={0.42} metalness={0.03} />
      </mesh>
      {/* Canto de la placa: le da grosor, para que no sea una calcomanía. */}
      <mesh position={[0, -0.44, 0]} receiveShadow={quality !== 'low'}>
        <cylinderGeometry args={[FLOE_RADIUS, FLOE_RADIUS * 0.97, 0.42, quality === 'low' ? 24 : 48, 1, true]} />
        <meshStandardMaterial color="#54697d" roughness={0.34} metalness={0.04} side={DoubleSide} />
      </mesh>
    </group>
  )
}

/**
 * Témpanos partidos alrededor de la placa: trozos de hielo levantados en
 * ángulo, que es como se rompe un lago helado de verdad — nunca en fichas
 * planas y ordenadas.
 */
function IceShards({ quality }: { quality: GraphicsQuality }) {
  const shards = useMemo(() => {
    const total = quality === 'low' ? 9 : 18
    return Array.from({ length: total }, (_, index) => {
      const angle = (index / total) * Math.PI * 2 + (index % 3) * 0.19
      const radius = FLOE_RADIUS + 1.1 + (index % 4) * 0.85
      return {
        position: [Math.cos(angle) * radius, -0.5 + (index % 3) * 0.12, Math.sin(angle) * radius] as const,
        rotation: [(index % 5) * 0.16, angle, 0.24 + (index % 4) * 0.13] as const,
        scale: 0.5 + (index % 5) * 0.24,
      }
    })
  }, [quality])
  return (
    <group>
      {shards.map((shard, index) => (
        <mesh key={index} position={shard.position} rotation={shard.rotation} scale={shard.scale} castShadow={quality === 'high'}>
          <coneGeometry args={[0.5, 1.5, 4]} />
          <meshStandardMaterial color="#a9c8de" roughness={0.2} metalness={0.03} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Menhires rúnicos hincados en el hielo, en dos hileras que enmarcan el
 * tablero sin cerrarlo. Reutilizan la textura de runas del Santuario: es la
 * misma cultura de piedra tallada, y generar otra no aportaría nada.
 */
function Runestones({ quality }: { quality: GraphicsQuality }) {
  const stones = useMemo(() => {
    const columns: { position: readonly [number, number, number]; height: number; tilt: number; seed: number }[] = []
    // Seis, no diez: en la primera prueba formaban un pasillo tan tupido que
    // el tablero parecía el fondo de un desfiladero. Enmarcan, no encierran.
    const total = quality === 'low' ? 4 : 6
    for (let index = 0; index < total; index += 1) {
      const side = index % 2 === 0 ? -1 : 1
      const step = Math.floor(index / 2)
      const height = 1.55 + (step % 3) * 0.36
      columns.push({
        position: [side * (FLOE_RADIUS + 1.5), height / 2 - 0.3, -2.4 + step * 2.6],
        height,
        // Ninguno recto: llevan siglos en un hielo que se mueve.
        tilt: ((index % 5) - 2) * 0.055,
        seed: index,
      })
    }
    return columns
  }, [quality])
  return (
    <group>
      {stones.map((stone, index) => (
        <group key={index} position={stone.position} rotation={[stone.tilt, stone.seed * 0.7, stone.tilt * 0.6]}>
          <mesh castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
            <boxGeometry args={[0.46, stone.height, 0.3]} />
            <meshStandardMaterial
              map={monolithTexture(stone.seed)}
              color={RUNESTONE.color}
              roughness={RUNESTONE.roughness}
              metalness={RUNESTONE.metalness}
            />
          </mesh>
          {/* Nieve posada en la cara de arriba: nada lleva años a la intemperie sin ella. */}
          <mesh position={[0, stone.height / 2 + 0.03, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.34]} />
            <meshStandardMaterial color="#eef5fb" roughness={0.85} metalness={0} />
          </mesh>
          {/* Las runas prenden con la luz de la aurora. */}
          <mesh position={[0, 0, 0.16]}>
            <planeGeometry args={[0.3, stone.height * 0.6]} />
            <meshBasicMaterial color="#7ff0c4" transparent opacity={0.24} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Pinos cargados de nieve al fondo. Son siluetas simples: están detrás de la
 * niebla y solo aportan el perfil dentado del horizonte, así que gastar
 * geometría en ellos no se vería.
 */
function Treeline({ quality }: { quality: GraphicsQuality }) {
  const trees = useMemo(() => {
    const total = quality === 'low' ? 24 : 54
    return Array.from({ length: total }, (_, index) => {
      const angle = (index / total) * Math.PI * 2
      const radius = 19 + (index % 5) * 3.1
      const height = 3.2 + (index % 6) * 0.85
      return {
        position: [Math.cos(angle) * radius, height / 2 - 1.1, Math.sin(angle) * radius] as const,
        height,
      }
    })
  }, [quality])
  return (
    <group>
      {trees.map((tree, index) => (
        <group key={index} position={tree.position}>
          <mesh>
            <coneGeometry args={[tree.height * 0.26, tree.height, 6]} />
            <meshStandardMaterial color="#2f4746" roughness={0.95} metalness={0} flatShading />
          </mesh>
          {/* Nieve en las ramas: el cono claro encima rompe la silueta negra. */}
          <mesh position={[0, tree.height * 0.16, 0]} scale={0.72}>
            <coneGeometry args={[tree.height * 0.26, tree.height * 0.62, 6]} />
            <meshStandardMaterial color="#dce8f2" roughness={0.9} metalness={0} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Montañas del fondo: la pared del fiordo, apenas insinuada tras la niebla. */
function FjordWalls({ quality }: { quality: GraphicsQuality }) {
  const peaks = useMemo(() => {
    const total = quality === 'low' ? 8 : 16
    return Array.from({ length: total }, (_, index) => {
      const angle = (index / total) * Math.PI * 2 + 0.2
      // Con la niebla retirada, estos picos dejaron de estar ocultos y con su
      // altura anterior (hasta 43, a solo 44 de radio) entraban en cuadro como
      // manchones negros colgando del borde de arriba. Mas lejos y mas bajos:
      // ahora hacen de horizonte, que es su papel, en vez de tapar el cielo.
      const radius = 54 + (index % 3) * 8
      const height = 11 + (index % 5) * 3.6
      return {
        position: [Math.cos(angle) * radius, height / 2 - 4, Math.sin(angle) * radius] as const,
        height,
        width: 13 + (index % 4) * 7,
      }
    })
  }, [quality])
  return (
    <group>
      {peaks.map((peak, index) => (
        <mesh key={index} position={peak.position} rotation={[0, index * 0.9, 0]}>
          <coneGeometry args={[peak.width, peak.height, 4]} />
          <meshStandardMaterial color="#5d7089" roughness={0.98} metalness={0} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function FimbulFjord({ quality, reducedMotion }: FimbulProps) {
  const snowfall = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (reducedMotion || !snowfall.current) return
    // La nevada deriva de lado muy despacio: cae, no revolotea.
    snowfall.current.position.x = Math.sin(clock.elapsedTime * 0.08) * 1.6
  })

  return (
    <>
      <color attach="background" args={['#06101e']} />
      {/* Niebla helada: empieza pronto y es densa. Es lo que convierte el
          horizonte en una pared de nada y hace que el fiordo no se acabe. */}
      {/* La niebla saturaba a 52 y las paredes del fiordo estan entre 44 y
          58: se las tragaba enteras, y el arbolado de 21 a 31 quedaba tan
          desvaido que no se distinguia del cielo. El resultado era un disco
          flotando en un vacio azul. Llevada a 92, el horizonte vuelve a tener
          montanas y bosque, que es lo que hace que esto parezca un fiordo. */}
      <fog attach="fog" args={['#16283f', 24, 92]} />

      {/* La luz clave es la aurora, que viene de ARRIBA y de un lado, teñida
          de verde. El relleno se mantiene bajo (como en Duna y Caldera) para
          que la nieve conserve su modelado en vez de quedar en blanco plano;
          la hemisférica con `groundColor` claro hace de rebote de la nieve,
          que en un paisaje nevado real es la mitad de la luz que hay. */}
      <ambientLight intensity={0.26} color="#9fc8e8" />
      <hemisphereLight intensity={0.4} color="#8ff0cc" groundColor="#5b708a" />
      <directionalLight
        position={[-8, 13, -6]}
        intensity={0.95}
        color="#cfeeff"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.0006}
      />
      {/* Verde de la aurora rebotando en el hielo, desde arriba y detrás. */}
      <directionalLight position={[5, 8, -12]} intensity={0.55} color="#6fe6b4" />
      {/* Frío del suelo: un violeta muy tenue que separa las sombras del negro. */}
      <pointLight position={[0, -2.2, 2]} color="#6a7fd0" intensity={12} distance={20} decay={2} />

      <SkyDome />
      <AuroraVeils reducedMotion={reducedMotion} />
      <FjordWalls quality={quality} />
      <Treeline quality={quality} />
      <FrozenLake quality={quality} />
      <IceShards quality={quality} />
      <Runestones quality={quality} />

      {/* Nevada: fina y constante. En calidad baja no se dibuja. */}
      {quality !== 'low' && (
        <group ref={snowfall}>
          <Sparkles
            count={quality === 'high' ? 140 : 70}
            scale={[16, 9, 16]}
            position={[0, 4, 0]}
            size={2.4}
            speed={reducedMotion ? 0 : 0.22}
            opacity={0.7}
            color="#ffffff"
          />
        </group>
      )}
    </>
  )
}
