import { Html, OrbitControls, useCursor, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, PerspectiveCamera as ThreePerspectiveCamera, Plane, Raycaster, Vector2, Vector3 } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { BOARD_CELL_COUNT, BOARD_SIZE, CARD_BY_ID, COMMANDER_BY_ID } from '../game'
import type { AnimationEvent, BoardPiece, MatchState, PlayerId, Position } from '../game'
import type { GraphicsQuality, ScenarioId } from '../store/preferences'
import { withBase } from '../utils/assets'
import { DamageNumbers } from './DamageNumbers'
import { EventEffects } from './EventEffects'
import {
  BOARD_WORLD_HALF,
  CAMERA_FOV,
  CAMERA_MAX_DISTANCE,
  CAMERA_MIN_DISTANCE,
  CAMERA_POSITION,
  CAMERA_TARGET,
  CELL_SIZE,
  gridToWorldX,
  gridToWorldZ,
  nexusWorldZ,
  TILE_SIZE,
  worldToGrid,
} from './grid/gridCoordinates'
import { slabTexture } from './textures'
import styles from './Board3D.module.css'

const AetherCitadel = lazy(() =>
  import('./scenarios/AetherCitadel').then((m) => ({ default: m.AetherCitadel })),
)
const SanctuaryScenario = lazy(() =>
  import('./scenarios/SanctuaryScenario').then((m) => ({ default: m.SanctuaryScenario })),
)
const CalderaScenario = lazy(() =>
  import('./scenarios/CalderaScenario').then((m) => ({ default: m.CalderaScenario })),
)

interface Board3DProps {
  state: MatchState
  /** Bando de la partida que controla este navegador: decide qué Nexo queda cerca de la cámara. */
  localPlayerId: PlayerId
  selectedPieceId?: string
  validCells: readonly Position[]
  /**
   * Qué significan las casillas iluminadas ahora mismo. Antes «mover aquí» y
   * «desplegar aquí» compartían el mismo azul, aunque son acciones distintas
   * y llegan desde sitios distintos (una unidad del tablero o una carta de la
   * mano).
   */
  cellIntent: 'move' | 'deploy'
  validTargets: readonly string[]
  /** Unidades propias con acciones disponibles: reciben el anillo de listas. */
  readyPieceIds: ReadonlySet<string>
  onCell: (position: Position) => void
  onPiece: (pieceId: string) => void
  onNexus: (playerId: PlayerId) => void
  /** Casilla bajo el puntero, para saber dónde se suelta una carta arrastrada. */
  onCellHover?: (position?: Position) => void
  /** Hay una carta en la mano siendo arrastrada: la cámara no debe orbitar. */
  dragging?: boolean
  reducedMotion: boolean
  quality: GraphicsQuality
  scenario: ScenarioId
  /** Evento visual en reproducción, entregado por el director de animaciones. */
  activeEvent?: AnimationEvent
}

const boardX = gridToWorldX
const boardZ = gridToWorldZ

/** Posiciones de las 64 casillas, estables entre renders para memoizar celdas. */
const CELL_POSITIONS: readonly Position[] = Array.from({ length: BOARD_CELL_COUNT }, (_, index) => ({
  x: index % BOARD_SIZE,
  y: Math.floor(index / BOARD_SIZE),
}))
const cellKey = (position: Position) => `${position.x},${position.y}`

/** Las cartas se diseñaron para un paso de casilla de 1.18; se reescalan al actual.
    Subido dos veces (1.18 → 1.08 → 1.0) porque en una captura real del tablero las
    unidades eran rectángulos de ~30 px frente a las cartas de la mano de ~150:
    no se distinguía qué había desplegado sin leer el nombre. El marco mide 0.83
    de ancho, así que a esta escala sigue dejando junta libre con la casilla vecina. */
const CARD_SCALE = CELL_SIZE / 1.0

/**
 * Inclinación tipo «standee»: 0 = tumbada del todo, PI/2 = de pie recta.
 *
 * Enderezada de 60° a ~70°: la cámara mira desde unos 35° sobre el horizonte,
 * así que cuanto más vertical esté la carta más superficie de arte le ofrece
 * sin ocupar ni un milímetro más de casilla — la huella en el suelo es
 * `alto × cos(inclinación)`, que ENCOGE al enderezarla.
 */
const CARD_STAND_TILT = 1.22
/** Compensa que, al inclinar la carta desde su centro, el borde inferior se hunda en la casilla. */
const CARD_STAND_RISE = 0.51 * CARD_SCALE * Math.sin(Math.abs(CARD_STAND_TILT))

/**
 * Mitad del tablero que pertenece a quien mira la pantalla. El jugador
 * despliega en la fila 7 y el rival en la 0, así que las filas 4-7 son «casa»
 * para 'player' y las 0-3 lo son para el invitado ('ai').
 */
const isOwnHalf = (y: number, localPlayerId: PlayerId): boolean =>
  localPlayerId === 'player' ? y >= BOARD_SIZE / 2 : y < BOARD_SIZE / 2

/**
 * Tinte de territorio: cálido en tu mitad, frío en la del rival.
 *
 * El tablero eran 64 losas idénticas y no había forma de saber de un vistazo
 * dónde acababa tu campo — con 8 filas y unidades que avanzan una casilla por
 * turno, eso es información que hace falta en cada jugada. Se mantiene la
 * variación por casilla para que el suelo no quede plano.
 */
const ZONE_TINTS = {
  own: ['#ffeed2', '#f8e4c6', '#f2dcbe'],
  enemy: ['#d8e2f7', '#ccd8f0', '#c6d3ee'],
} as const

/**
 * Casilla del tablero. Memoizada: con los conjuntos precalculados y el handler
 * estable solo se re-renderiza cuando cambia su propio estado (válida,
 * ocupada, abrasada), no en cada evento visual de la partida.
 */
const BoardCell = memo(function BoardCell({ position, valid, occupied, scorched, subtle, own, deployRow, threatened, intent, onCell, onHover }: { position: Position; valid: boolean; occupied: boolean; scorched: boolean; subtle: boolean; own: boolean; deployRow: boolean; threatened: boolean; intent: 'move' | 'deploy'; onCell: (position: Position) => void; onHover?: (position?: Position) => void }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && valid)
  const onClick = () => onCell(position)
  const zone = own ? 'own' : 'enemy'
  // Desplegar se marca en verde y mover en azul: son acciones distintas y
  // antes compartían color, así que la casilla iluminada no decía cuál era.
  const validColor = intent === 'deploy' ? '#7ee6a8' : '#8fd4ff'
  const validEmissive = intent === 'deploy' ? '#1c7a4a' : '#1f6f9e'
  if (subtle) {
    // Aether Citadel: la casilla ES una losa de roca tallada, opaca y a ras
    // de la plaza; la junta oscura entre losas es la piedra del GLB que asoma.
    const slab = slabTexture(((position.x * 3 + position.y * 5) % 4) as 0 | 1 | 2 | 3)
    const tint = ZONE_TINTS[zone][(position.x * 7 + position.y * 13) % 3]!
    const color = valid ? (hovered ? '#ffe9a8' : validColor) : scorched ? '#c96a4a' : hovered && !occupied ? '#ffe9c0' : tint
    const emissive = valid
      ? validEmissive
      : scorched ? '#7a2c12'
      : hovered && !occupied ? '#4a3c22'
      : threatened ? '#5e1414'
      : deployRow ? '#4a3410'
      : '#000000'
    return (
      <mesh
        position={[boardX(position.x), valid ? 0.035 : 0.012, boardZ(position.y)]}
        receiveShadow
        onClick={(event) => { event.stopPropagation(); onClick() }}
        onPointerEnter={() => { setHovered(true); onHover?.(position) }}
        onPointerLeave={() => { setHovered(false); onHover?.(undefined) }}
      >
        <boxGeometry args={[TILE_SIZE, 0.06, TILE_SIZE]} />
        <meshStandardMaterial
          map={slab}
          bumpMap={slab}
          bumpScale={6}
          color={color}
          roughness={0.9}
          metalness={0.05}
          emissive={emissive}
          emissiveIntensity={valid ? 0.9 : scorched ? 0.8 : hovered ? 0.5 : threatened ? 0.55 : deployRow ? 0.3 : 0}
        />
      </mesh>
    )
  }
  const base = own ? '#4c4235' : '#3a3f4c'
  const color = valid ? (hovered ? '#f6d77e' : intent === 'deploy' ? '#4bbf83' : '#4e9ed0') : hovered && !occupied ? '#645b44' : scorched ? '#4a2018' : base
  const emissive = valid
    ? (intent === 'deploy' ? '#166647' : '#1b6384')
    : scorched ? '#68240f'
    : threatened ? '#5e1414'
    : deployRow ? '#4a3410'
    : own ? '#2a231a' : '#1e2330'
  return (
    <mesh
      position={[boardX(position.x), 0, boardZ(position.y)]}
      receiveShadow
      onClick={(event) => { event.stopPropagation(); onClick() }}
      onPointerEnter={() => { setHovered(true); onHover?.(position) }}
      onPointerLeave={() => { setHovered(false); onHover?.(undefined) }}
    >
      <boxGeometry args={[TILE_SIZE, valid ? 0.13 : 0.08, TILE_SIZE]} />
      <meshStandardMaterial
        color={color}
        roughness={0.66}
        metalness={0.18}
        emissive={emissive}
        emissiveIntensity={valid ? 1.05 : scorched ? 0.9 : threatened ? 0.85 : deployRow ? 0.78 : 0.62}
      />
    </mesh>
  )
})

/**
 * Costura del mediocampo: separa visualmente las dos mitades del tablero.
 * Cae exactamente en z=0 (entre las filas 3 y 4) por cómo está centrada la
 * cuadrícula, así que no hace falta calcular nada.
 */
function Midline() {
  return (
    <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[BOARD_WORLD_HALF * 2, 0.045]} />
      <meshBasicMaterial color="#e8c98a" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}

/**
 * Carta física sobre el tablero. Memoizada: el deslizamiento y los pulsos
 * viven en useFrame, así que el re-render solo hace falta cuando cambian
 * la pieza o sus marcas (selección, objetivo, disponibilidad).
 */
const BoardCard = memo(function BoardCard({ piece, selected, targetable, ready, active, mine, onPiece, reducedMotion }: { piece: BoardPiece; selected: boolean; targetable: boolean; ready: boolean; active: boolean; mine: boolean; onPiece: (pieceId: string) => void; reducedMotion: boolean }) {
  const card = CARD_BY_ID[piece.cardId]
  const texture = useTexture(withBase(card?.art.webp ?? '/assets/cards/art/fuente-furia.webp'))
  const group = useRef<Group>(null)
  const frame = useRef<Mesh>(null)
  const readyRing = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const target = useMemo(() => ({ x: boardX(piece.position.x), z: boardZ(piece.position.y) }), [piece.position.x, piece.position.y])
  const frozen = piece.statuses.some((status) => status.kind === 'frozen')
  const stunned = piece.statuses.some((status) => status.kind === 'stunned')
  const cursed = piece.statuses.some((status) => status.kind === 'cursed')
  const shielded = piece.statuses.reduce((total, status) => total + (status.kind === 'shielded' ? status.amount : 0), 0)
  const spent = active && piece.attackedThisTurn
  useFrame(({ clock }, delta) => {
    const node = group.current
    if (!node) return
    const speed = reducedMotion ? 100 : 8
    const lift = selected ? 0.3 : hovered ? 0.22 : 0.15
    node.position.x = MathUtils.damp(node.position.x, target.x, speed, delta)
    node.position.z = MathUtils.damp(node.position.z, target.z, speed, delta)
    node.position.y = MathUtils.damp(node.position.y, lift, speed, delta)
    node.rotation.y = MathUtils.damp(node.rotation.y, selected ? (piece.owner === 'player' ? -0.08 : 0.08) : 0, speed, delta)
    // Agotada: la carta descansa ligeramente girada, como una carta «tapeada».
    node.rotation.z = MathUtils.damp(node.rotation.z, spent ? 0.16 : 0, speed, delta)
    if (frame.current && !reducedMotion) {
      const material = frame.current.material as MeshStandardMaterial
      if (targetable) material.emissiveIntensity = 0.55 + Math.sin(clock.elapsedTime * 5.2) * 0.28
    }
    if (readyRing.current) {
      const material = readyRing.current.material as MeshBasicMaterial
      material.opacity = reducedMotion ? 0.32 : 0.24 + (Math.sin(clock.elapsedTime * 2.1) + 1) * 0.09
    }
  })
  if (!card) return null
  const onClick = () => onPiece(piece.instanceId)
  const maxHealth = card.health ?? card.resistance ?? 1
  const damaged = piece.currentHealth < maxHealth
  // El marco distingue "mía" de "del rival" a simple vista (a petición del
  // usuario: costaba distinguirlas) — dorado/bronce para las propias, rojo
  // oscuro para las rivales. Antes salía de la facción (solo Furia vs. resto),
  // que no decía nada sobre quién la controla.
  const frameColor = mine ? '#6b4a1e' : '#5a1a1a'
  const glow = selected || targetable
  const glowColor = targetable ? '#ffd257' : mine ? '#f1c15f' : '#ff6b65'
  // Brillo ambiental permanente y suave (no solo al seleccionar/objetivo):
  // así se distingue mío/rival incluso en reposo, sin esperar a interactuar.
  const ownershipGlow = mine ? '#caa04a' : '#ff5a4d'
  return (
    <group
      ref={group}
      position={[target.x, 0.15, target.z]}
      onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onClick() }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Standee: frame + arte, inclinados (prueba) en vez de tumbados del todo.
          Se eleva CARD_STAND_RISE para que, al girar desde su centro, el borde
          inferior quede a ras de la casilla en vez de hundirse en ella. */}
      <group position={[0, CARD_STAND_RISE, 0]} scale={CARD_SCALE} rotation={[CARD_STAND_TILT, 0, 0]}>
        <mesh ref={frame} castShadow receiveShadow>
          <boxGeometry args={[0.83, 0.07, 1.02]} />
          <meshStandardMaterial
            color={frozen ? '#2b4a63' : frameColor}
            metalness={0.35}
            roughness={0.42}
            emissive={glow ? glowColor : frozen ? '#79e7ff' : ownershipGlow}
            emissiveIntensity={glow ? 0.55 : frozen ? 0.35 : 0.16}
          />
        </mesh>
        {/* El arte NUNCA se gira según el dueño de la pieza: sin rotación del
            grupo exterior (partida en solitario, o el anfitrión en PvP), la
            orientación de este plano es independiente de dónde esté en el
            tablero — solo depende de su propia jerarquía de rotaciones, no
            de la posición. Un giro condicionado al dueño ("pieza rival →
            180°") llevaba tiempo dejando el arte de las piezas rivales al
            revés tanto en solitario como en PvP (confirmado por captura del
            usuario), verificado numéricamente con Three.js real antes de
            quitarlo: con el giro fijo en 0 para TODAS las piezas, los cuatro
            casos (propia/rival × anfitrión/invitado) dan la misma
            orientación "hacia arriba", la correcta. */}
        {/* El arte se auto-ilumina (emissiveMap con el mismo mapa): con solo
            `map` dependía de la luz del escenario y en Aether Citadel o la
            Caldera las unidades salían casi negras — ilegibles en la captura
            real. Así la ilustración se lee igual en los tres escenarios sin
            tocar la iluminación de ninguno. */}
        <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.73, 0.9]} />
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture}
            emissive="#ffffff"
            emissiveIntensity={spent ? 0.3 : 0.6}
            roughness={0.62}
            color={frozen ? '#9fd4ef' : spent ? '#8f8f96' : '#ffffff'}
          />
        </mesh>
        {frozen && (
          <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.83, 1.02]} />
            <meshStandardMaterial color="#bdeaff" transparent opacity={0.32} roughness={0.2} metalness={0.4} emissive="#9fd8ff" emissiveIntensity={0.5} />
          </mesh>
        )}
      </group>
      {/* Anillos de selección/disponibilidad: se quedan tumbados en la casilla aunque la carta se incline. */}
      <group scale={CARD_SCALE}>
        {selected && (
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.62, 0.72, 36]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.85} depthWrite={false} />
          </mesh>
        )}
        {ready && !selected && (
          <mesh ref={readyRing} position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.56, 0.63, 36]} />
            <meshBasicMaterial color="#efe3bd" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        )}
      </group>
      {/* zIndexRange bajo: sin él, drei usa z-index millonarios que tapan los modales.
          A la altura del borde superior del standee (2×CARD_STAND_RISE), no de la
          carta tumbada de antes: si no, el nombre y las estadísticas quedan
          flotando muy por encima de la carta en vez de justo sobre ella. */}
      <Html center position={[0, CARD_STAND_RISE * 2 + 0.05, 0]} distanceFactor={8.6} zIndexRange={[14, 0]} className={styles.cardLabel}>
        <div className={styles.cardName} data-mine={mine || undefined} data-frozen={frozen || undefined} data-spent={spent || undefined}>{card.name}</div>
        <div className={styles.cardStats}>
          {card.attack !== undefined && <span className={styles.attackStat}>⚔ {Math.max(0, card.attack + piece.attackModifier)}</span>}
          <span className={damaged ? styles.damagedStat : styles.healthStat}>♥ {piece.currentHealth}</span>
        </div>
        {/* Estados: solo aparecen cuando los hay, en su propia fila para que no
            empujen a las estadísticas. «Aturdida» faltaba desde que se añadió
            la palabra clave: la unidad no podía atacar y nada lo indicaba. */}
        {(frozen || stunned || shielded > 0 || cursed || spent) && (
          <div className={styles.cardStatuses}>
            {frozen && <span className={styles.frozenStat} title="Congelada: no puede mover ni atacar">❄</span>}
            {stunned && <span className={styles.stunnedStat} title="Aturdida: no puede atacar este turno (sí moverse)">✷</span>}
            {shielded > 0 && <span className={styles.shieldStat} title={`Escudo: absorbe ${shielded} de daño`}>⛨ {shielded}</span>}
            {cursed && <span className={styles.cursedStat} title="Maldita: pierde Vida al final de cada turno">☠</span>}
            {spent && <span className={styles.spentStat} title="Ya ha actuado este turno">◒</span>}
          </div>
        )}
      </Html>
    </group>
  )
})

/**
 * Nexo: antes era ~20 mallas por bando rotando/pulsando cada fotograma sin
 * parar (icosaedro + núcleo + 3 anillos + 4 esquirlas orbitando, x2 Nexos),
 * lo que costaba fotogramas todo el partido para un adorno de fondo. Ahora
 * es un pedestal estático (sin useFrame) con el retrato del comandante como
 * superposición HTML —no como textura WebGL: cargar dos texturas más de
 * comandante saturaba el renderizado por software en equipos modestos—.
 * El destello al recibir daño es una clase CSS puntual, no una animación
 * continua en el hilo de render de Three.js.
 */
function Nexus({
  playerId,
  mine,
  health,
  targetable,
  onClick,
  commanderArt,
  activeEvent,
}: {
  playerId: PlayerId
  /** Si este Nexo es el de quien mira la pantalla (no siempre coincide con el bando 'player' del motor: en multijugador el invitado es 'ai'). */
  mine: boolean
  health: number
  targetable: boolean
  onClick: () => void
  commanderArt: string
  activeEvent?: AnimationEvent
}) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && targetable)
  const [justHit, setJustHit] = useState(false)
  const lastEvent = useRef<AnimationEvent | undefined>(undefined)
  useEffect(() => {
    if (
      activeEvent &&
      activeEvent !== lastEvent.current &&
      activeEvent.targetId === `${playerId}-nexus` &&
      (activeEvent.type === 'nexus-damage' || activeEvent.type === 'victory')
    ) {
      lastEvent.current = activeEvent
      setJustHit(true)
      const timer = window.setTimeout(() => setJustHit(false), 380)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [activeEvent, playerId])
  const z = nexusWorldZ(playerId)
  const color = mine ? '#f2a24a' : '#58c9ff'
  const ringEmissive = mine ? '#9a7326' : '#3f7fb0'
  return (
    <group position={[0, 0, z]}>
      {/* Pedestal de tres niveles: base ancha, fuste y corona con almenas. */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.98, 1.2, 0.22, 8]} />
        <meshStandardMaterial color="#161b28" roughness={0.9} metalness={0.12} emissive="#0a0e18" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.62, 0.82, 0.3, 8]} />
        <meshStandardMaterial color="#1e2434" roughness={0.82} metalness={0.16} emissive="#0c1120" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.74, 0.6, 0.12, 8]} />
        <meshStandardMaterial color="#2a3145" roughness={0.7} metalness={0.25} emissive={ringEmissive} emissiveIntensity={0.35} />
      </mesh>
      {/* Corona de esquirlas de cristal alrededor del borde del pedestal (estática). */}
      {[...Array(8).keys()].map((index) => {
        const angle = (index / 8) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.66, 0.56, Math.sin(angle) * 0.66]} rotation={[0, -angle, 0.16]}>
            <coneGeometry args={[0.07, 0.24, 4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} roughness={0.3} metalness={0.3} />
          </mesh>
        )
      })}
      {/* Volumen invisible: conserva el clic/hover en 3D sin gastar una textura. */}
      <mesh
        position={[0, 0.66, 0]}
        visible={false}
        onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onClick() }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.9, 0.5, 1.1]} />
      </mesh>
      <Html center position={[0, 0.66, 0]} distanceFactor={6.5} zIndexRange={[14, 0]} className={styles.nexusCard}>
        <div data-targetable={targetable || undefined} data-hit={justHit || undefined}>
          <img src={withBase(commanderArt)} alt="" />
        </div>
      </Html>
      <Html center position={[0, 1.28, 0]} distanceFactor={7} zIndexRange={[14, 0]} className={styles.nexusLabel}>
        <div data-targetable={targetable || undefined}>{mine ? 'TU NEXO' : 'NEXO RIVAL'} · {health}</div>
      </Html>
      <pointLight position={[0, 1.1, 0]} color={color} intensity={5} distance={4} decay={2} />
    </group>
  )
}

/** Sacudida sutil de cámara en los golpes al Nexo. Respeta el movimiento reducido. */
/**
 * CAMERA_FOV/CAMERA_POSITION se afinaron mirando una pantalla ancha (desktop):
 * a ese aspect ratio el tablero llena el encuadre sin recortarse. En un móvil
 * en vertical el aspect ratio es muy estrecho (p. ej. 0.46) y una cámara en
 * perspectiva a esa misma distancia y FOV recorta los lados del tablero — solo
 * se ve entero si el jugador aleja la cámara a mano.
 *
 * En vertical sobra alto de sobra (la pantalla es más alta que ancha), así que
 * en vez de alejar la cámara (que encoge el tablero en pantalla) se acerca
 * (MOBILE_DISTANCE, menor que la distancia de escritorio) para que el tablero
 * se vea grande, y se ensancha el FOV vertical lo justo para que ese ancho
 * quepa entero a esa distancia más corta — el hueco vertical de sobra que deja
 * un FOV más ancho es justo el que regala una pantalla vertical.
 */
/**
 * Puntos que el encuadre debe contener sí o sí.
 *
 * Es una lista y no una caja a propósito: una caja obliga a meter en cuadro
 * las cuatro esquinas a la altura del Nexo, donde no hay absolutamente nada, y
 * eso empujaba la cámara casi un metro más atrás encogiendo el tablero un 8%
 * para nada. Aquí las esquinas del tablero solo piden el alto de una unidad
 * de pie, y los Nexos —que solo ocupan el centro en X— piden su altura
 * completa únicamente ahí.
 */
const FRAME_POINTS: readonly (readonly [number, number, number])[] = (() => {
  const points: [number, number, number][] = []
  const edge = BOARD_WORLD_HALF + 0.15
  /** Alto de una unidad de pie con su chapa de nombre encima. */
  const pieceTop = 1.05
  for (const x of [-edge, edge]) {
    for (const z of [-edge, edge]) {
      for (const y of [0, pieceTop]) points.push([x, y, z])
    }
  }
  const nexusZ = Math.abs(nexusWorldZ('player')) + 0.3
  for (const x of [-0.75, 0.75]) {
    for (const z of [-nexusZ, nexusZ]) {
      for (const y of [0, 1.45]) points.push([x, y, z])
    }
  }
  return points
})()
/** Aire alrededor del tablero: 1 = pegado al borde exacto. */
const FRAME_MARGIN = 1.05
/** FOV vertical máximo en pantallas muy estrechas, antes de que deforme. */
const MOBILE_FOV_MAX = 82

/**
 * Distancia mínima (a lo largo de la dirección de cámara) para que todos los
 * FRAME_POINTS entren en el encuadre.
 *
 * Antes esto eran dos casos cosidos a mano —un encuadre fijo para escritorio y
 * un apaño para móvil vertical—, y el fijo se quedaba corto: el Nexo propio
 * salía cortado por abajo. Aquí se calcula de verdad: para una cámara a
 * distancia `d` sobre una dirección fija, cada punto P impone
 * `d >= dot(P-objetivo, dir) + max(|x|/tanH, |y|/tanV)` en coordenadas de
 * cámara. El máximo sobre todos los puntos es la distancia buscada, exacta
 * para cualquier proporción de pantalla.
 */
const frameBasis = () => {
  const target = new Vector3(...CAMERA_TARGET)
  const dir = new Vector3(...CAMERA_POSITION).sub(target).normalize()
  const right = new Vector3(0, 1, 0).cross(dir).normalize()
  const up = new Vector3().copy(dir).cross(right).normalize()
  return { target, dir, right, up }
}

const fitDistance = (fovDegrees: number, aspect: number): number => {
  const { target, dir, right, up } = frameBasis()
  const tanV = Math.tan(MathUtils.degToRad(fovDegrees) / 2)
  const tanH = tanV * aspect
  let needed = 0
  for (const point of FRAME_POINTS) {
    const relative = new Vector3(...point).sub(target)
    const lateral = Math.abs(relative.dot(right)) / tanH
    const vertical = Math.abs(relative.dot(up)) / tanV
    needed = Math.max(needed, relative.dot(dir) + Math.max(lateral, vertical) * FRAME_MARGIN)
  }
  return needed
}

/** La otra cara del cálculo: ángulo mínimo para que todo quepa SIN alejarse más. */
const fitFov = (distance: number, aspect: number): number => {
  const { target, dir, right, up } = frameBasis()
  let tanV = 0
  for (const point of FRAME_POINTS) {
    const relative = new Vector3(...point).sub(target)
    const depth = distance - relative.dot(dir)
    if (depth <= 0.1) return MOBILE_FOV_MAX
    tanV = Math.max(
      tanV,
      (Math.abs(relative.dot(up)) * FRAME_MARGIN) / depth,
      (Math.abs(relative.dot(right)) * FRAME_MARGIN) / (depth * aspect),
    )
  }
  return MathUtils.radToDeg(Math.atan(tanV) * 2)
}

function ResponsiveCamera() {
  // Se aplica desde useFrame (no useEffect+useThree) a propósito: mutar
  // directamente el objeto `camera` que devuelve el hook useThree() choca con
  // la regla de lint react-hooks/immutability. Tomarlo del parámetro de
  // useFrame (como ya hace CameraRig más abajo) es el escape hatch estándar
  // de R3F para este tipo de mutación imperativa; la comparación con
  // appliedKey evita recalcular en cada frame, solo cuando cambia el tamaño.
  const appliedKey = useRef<string | null>(null)
  useFrame(({ camera, size }) => {
    if (!(camera instanceof ThreePerspectiveCamera)) return
    const key = `${size.width}x${size.height}`
    if (appliedKey.current === key) return
    appliedKey.current = key
    const aspect = size.width / size.height
    // Se prefiere SIEMPRE el ángulo estrecho por defecto y ajustar la
    // distancia: un ángulo ancho encoge todo lo que hay en pantalla. Solo si
    // ni retrocediendo al máximo cabe el tablero —el caso del móvil en
    // vertical, donde el ancho es lo que aprieta— se abre el ángulo, y solo
    // lo justo. Medido: en vertical, abrir el ángulo «porque sobra alto»
    // dejaba las casillas en 11 px; así se quedan en 17.
    let fov = CAMERA_FOV
    let distance = fitDistance(fov, aspect)
    if (distance > CAMERA_MAX_DISTANCE) {
      distance = CAMERA_MAX_DISTANCE
      fov = MathUtils.clamp(fitFov(distance, aspect), CAMERA_FOV, MOBILE_FOV_MAX)
    }
    distance = MathUtils.clamp(distance, CAMERA_MIN_DISTANCE, CAMERA_MAX_DISTANCE)
    const { target, dir } = frameBasis()
    camera.fov = fov
    camera.position.copy(target).addScaledVector(dir, distance)
    camera.updateProjectionMatrix()
  })
  return null
}

function CameraRig({ event, reducedMotion }: { event?: AnimationEvent; reducedMotion: boolean }) {
  const shakeStart = useRef(-10)
  const base = useRef(new Vector3())
  const captured = useRef(false)
  useEffect(() => {
    if (!event) return
    if (event.type === 'nexus-damage' || (event.type === 'damage' && (event.amount ?? 0) >= 4)) {
      shakeStart.current = performance.now()
    }
  }, [event])
  useFrame(({ camera }) => {
    if (reducedMotion) return
    const since = (performance.now() - shakeStart.current) / 1000
    if (since > 0.5) {
      captured.current = false
      return
    }
    if (!captured.current) {
      base.current.copy(camera.position)
      captured.current = true
    }
    const decay = (1 - since / 0.5) * 0.05
    camera.position.set(
      base.current.x + (Math.random() - 0.5) * decay,
      base.current.y + (Math.random() - 0.5) * decay,
      base.current.z + (Math.random() - 0.5) * decay,
    )
  })
  return null
}

/**
 * Casilla sobre la que se está soltando una carta arrastrada desde la mano.
 *
 * Lo calcula por su cuenta en vez de fiarse del `hover` de las casillas: el
 * gesto empieza en un elemento HTML fuera del lienzo, y en ese caso react-three
 * no llega a emitir los eventos de entrada/salida sobre las mallas, así que el
 * tablero nunca se enteraba de dónde estaba el puntero. Aquí se lanza un rayo
 * contra el plano del suelo y se traduce el punto a coordenadas de casilla.
 */
function DropTargeting({ active, localPlayerId, onCell }: { active: boolean; localPlayerId: PlayerId; onCell: (position?: Position) => void }) {
  const { camera, gl } = useThree()
  useEffect(() => {
    if (!active) return
    const raycaster = new Raycaster()
    const pointer = new Vector2()
    const ground = new Plane(new Vector3(0, 1, 0), 0)
    const hit = new Vector3()
    const onMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      if (Math.abs(pointer.x) > 1 || Math.abs(pointer.y) > 1) {
        onCell(undefined)
        return
      }
      raycaster.setFromCamera(pointer, camera)
      if (!raycaster.ray.intersectPlane(ground, hit)) {
        onCell(undefined)
        return
      }
      // El invitado ve la escena girada 180°: el punto del mundo hay que
      // deshacerle ese giro antes de traducirlo a casilla.
      const flip = localPlayerId === 'ai' ? -1 : 1
      onCell(worldToGrid(hit.x * flip, hit.z * flip))
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      onCell(undefined)
    }
  }, [active, camera, gl, localPlayerId, onCell])
  return null
}

/** Base mínima mientras el GLB de Aether Citadel se descarga. */
function LoadingStage() {
  return (
    <>
      <color attach="background" args={['#3b4468']} />
      <ambientLight intensity={1.3} color="#aeb9d8" />
      <mesh position={[0, -0.58, 0]}>
        <boxGeometry args={[11.6, 1.1, 11.6]} />
        <meshStandardMaterial color="#5f6577" roughness={0.9} />
      </mesh>
    </>
  )
}

function Scene(props: Board3DProps) {
  // Conjuntos O(1) precalculados una vez por cambio de estado: evitan el
  // barrido .some() por cada una de las 64 casillas en cada render.
  const validSet = useMemo(() => new Set(props.validCells.map(cellKey)), [props.validCells])
  const occupiedSet = useMemo(() => new Set(props.state.board.map((piece) => cellKey(piece.position))), [props.state.board])
  const scorchedSet = useMemo(
    () => new Set(props.state.tileEffects.filter((tile) => tile.kind === 'scorched').map((tile) => cellKey(tile.position))),
    [props.state.tileEffects],
  )
  const targetSet = useMemo(() => new Set(props.validTargets), [props.validTargets])
  /**
   * Casillas que una unidad rival ya alcanza desde donde está: pisar ahí es
   * ofrecerse a que te golpeen. Antes esto solo se podía deducir contando
   * casillas a mano, carta por carta.
   *
   * Es una lectura geométrica (distancia Manhattan ≤ Alcance), no una
   * simulación del turno rival: no descuenta Guardias ni caminos bloqueados,
   * pero como aviso de «aquí te ven» acierta en lo que importa y se recalcula
   * gratis. Deliberadamente NO incluye a dónde podrían moverse antes de
   * atacar: marcaría medio tablero y dejaría de decir nada.
   */
  const threatenedSet = useMemo(() => {
    const cells = new Set<string>()
    for (const piece of props.state.board) {
      if (piece.owner === props.localPlayerId) continue
      const definition = CARD_BY_ID[piece.cardId]
      if (definition?.type !== 'unit' || definition.attack === undefined) continue
      const range = definition.range ?? 1
      for (let dx = -range; dx <= range; dx += 1) {
        for (let dy = -range; dy <= range; dy += 1) {
          const steps = Math.abs(dx) + Math.abs(dy)
          if (steps === 0 || steps > range) continue
          const x = piece.position.x + dx
          const y = piece.position.y + dy
          if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) continue
          cells.add(`${x},${y}`)
        }
      }
    }
    return cells
  }, [props.state.board, props.localPlayerId])
  const ownDeployRow = props.localPlayerId === 'player' ? BOARD_SIZE - 1 : 0
  const subtleCells = props.scenario === 'aether-citadel'
  return (
    <>
      {/* Todo el contenido jugable gira 180° cuando el invitado ('ai') mira la
          escena: así su propio Nexo queda cerca de la cámara, igual que le
          pasa al anfitrión con el suyo. La cámara y sus controles no son
          hijos de este grupo, así que el punto de vista real no se mueve. */}
      <group rotation={[0, props.localPlayerId === 'ai' ? Math.PI : 0, 0]}>
      <Suspense fallback={<LoadingStage />}>
        {props.scenario === 'aether-citadel' ? (
          <AetherCitadel quality={props.quality} reducedMotion={props.reducedMotion} event={props.activeEvent} />
        ) : props.scenario === 'caldera' ? (
          <CalderaScenario quality={props.quality} reducedMotion={props.reducedMotion} event={props.activeEvent} />
        ) : (
          <SanctuaryScenario quality={props.quality} reducedMotion={props.reducedMotion} event={props.activeEvent} />
        )}
      </Suspense>
      {CELL_POSITIONS.map((position) => {
        const key = cellKey(position)
        return (
          <BoardCell
            key={key}
            position={position}
            valid={validSet.has(key)}
            occupied={occupiedSet.has(key)}
            scorched={scorchedSet.has(key)}
            subtle={subtleCells}
            own={isOwnHalf(position.y, props.localPlayerId)}
            deployRow={position.y === ownDeployRow}
            threatened={!occupiedSet.has(key) && threatenedSet.has(key)}
            intent={props.cellIntent}
            onCell={props.onCell}
            onHover={props.onCellHover}
          />
        )
      })}
      <Midline />
      <Suspense fallback={null}>
        {props.state.board.map((piece) => (
          <BoardCard
            key={piece.instanceId}
            piece={piece}
            selected={piece.instanceId === props.selectedPieceId}
            targetable={targetSet.has(piece.instanceId)}
            ready={props.readyPieceIds.has(piece.instanceId)}
            active={piece.owner === props.state.activePlayer}
            mine={piece.owner === props.localPlayerId}
            onPiece={props.onPiece}
            reducedMotion={props.reducedMotion}
          />
        ))}
      </Suspense>
      <Nexus
        playerId="player"
        mine={props.localPlayerId === 'player'}
        health={props.state.players.player.nexusHealth}
        targetable={props.validTargets.includes('player-nexus')}
        onClick={() => props.onNexus('player')}
        commanderArt={COMMANDER_BY_ID[props.state.players.player.commanderId]?.art.webp ?? '/assets/cards/art/fuente-furia.webp'}
        activeEvent={props.activeEvent}
      />
      <Nexus
        playerId="ai"
        mine={props.localPlayerId === 'ai'}
        health={props.state.players.ai.nexusHealth}
        targetable={props.validTargets.includes('ai-nexus')}
        onClick={() => props.onNexus('ai')}
        commanderArt={COMMANDER_BY_ID[props.state.players.ai.commanderId]?.art.webp ?? '/assets/cards/art/fuente-arcana.webp'}
        activeEvent={props.activeEvent}
      />
      {props.activeEvent && <EventEffects key={props.activeEvent.id} event={props.activeEvent} reducedMotion={props.reducedMotion} />}
      <DamageNumbers event={props.activeEvent} />
      </group>
      <CameraRig event={props.activeEvent} reducedMotion={props.reducedMotion} />
      <ResponsiveCamera />
      {props.onCellHover && (
        <DropTargeting active={Boolean(props.dragging)} localPlayerId={props.localPlayerId} onCell={props.onCellHover} />
      )}
      {/* Con una carta en la mano siendo arrastrada, orbitar convertiría el
          gesto de soltarla en un giro de cámara. */}
      <OrbitControls makeDefault enabled={!props.dragging} enablePan={false} enableZoom minPolarAngle={0.72} maxPolarAngle={1.03} minDistance={CAMERA_MIN_DISTANCE} maxDistance={CAMERA_MAX_DISTANCE} target={[...CAMERA_TARGET]} />
    </>
  )
}

export function Board3D(props: Board3DProps) {
  const dpr: [number, number] = props.quality === 'high' ? [1, 2] : props.quality === 'medium' ? [1, 1.5] : [0.75, 1]
  return (
    <div className={styles.viewport} data-testid="battle-board">
      <Canvas shadows={props.quality !== 'low'} dpr={dpr} camera={{ position: [...CAMERA_POSITION], fov: CAMERA_FOV }} gl={{ antialias: props.quality !== 'low', alpha: false }}>
        <Scene {...props} />
      </Canvas>
    </div>
  )
}
