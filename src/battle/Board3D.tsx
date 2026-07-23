import { Html, OrbitControls, useCursor, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { BOARD_CELL_COUNT, BOARD_SIZE, CARD_BY_ID, COMMANDER_BY_ID } from '../game'
import type { AnimationEvent, BoardPiece, MatchState, PlayerId, Position } from '../game'
import type { GraphicsQuality, ScenarioId } from '../store/preferences'
import { withBase } from '../utils/assets'
import { DamageNumbers } from './DamageNumbers'
import { EventEffects } from './EventEffects'
import {
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
} from './grid/gridCoordinates'
import { AetherCitadel } from './scenarios/AetherCitadel'
import { SanctuaryScenario } from './scenarios/SanctuaryScenario'
import { CalderaScenario } from './scenarios/CalderaScenario'
import { slabTexture } from './textures'
import styles from './Board3D.module.css'

interface Board3DProps {
  state: MatchState
  selectedPieceId?: string
  validCells: readonly Position[]
  validTargets: readonly string[]
  /** Unidades propias con acciones disponibles: reciben el anillo de listas. */
  readyPieceIds: ReadonlySet<string>
  onCell: (position: Position) => void
  onPiece: (pieceId: string) => void
  onNexus: (playerId: PlayerId) => void
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

/** Las cartas se diseñaron para un paso de casilla de 1.18; se reescalan al actual. */
const CARD_SCALE = CELL_SIZE / 1.18

/** Tinte determinista por casilla para romper la repetición del pavimento. */
const SLAB_TINTS = ['#ffffff', '#f1efe9', '#e8e9f1'] as const

/**
 * Casilla del tablero. Memoizada: con los conjuntos precalculados y el handler
 * estable solo se re-renderiza cuando cambia su propio estado (válida,
 * ocupada, abrasada), no en cada evento visual de la partida.
 */
const BoardCell = memo(function BoardCell({ position, valid, occupied, scorched, subtle, onCell }: { position: Position; valid: boolean; occupied: boolean; scorched: boolean; subtle: boolean; onCell: (position: Position) => void }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && valid)
  const onClick = () => onCell(position)
  if (subtle) {
    // Aether Citadel: la casilla ES una losa de roca tallada, opaca y a ras
    // de la plaza; la junta oscura entre losas es la piedra del GLB que asoma.
    const slab = slabTexture(((position.x * 3 + position.y * 5) % 4) as 0 | 1 | 2 | 3)
    const tint = SLAB_TINTS[(position.x * 7 + position.y * 13) % 3]!
    const color = valid ? (hovered ? '#ffe9a8' : '#8fd4ff') : scorched ? '#c96a4a' : hovered && !occupied ? '#ffe9c0' : tint
    const emissive = valid ? '#1f6f9e' : scorched ? '#7a2c12' : hovered && !occupied ? '#4a3c22' : '#000000'
    return (
      <mesh
        position={[boardX(position.x), valid ? 0.035 : 0.012, boardZ(position.y)]}
        receiveShadow
        onClick={(event) => { event.stopPropagation(); onClick() }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
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
          emissiveIntensity={valid ? 0.9 : scorched ? 0.8 : hovered ? 0.5 : 0}
        />
      </mesh>
    )
  }
  const color = valid ? (hovered ? '#f6d77e' : '#4e9ed0') : hovered && !occupied ? '#645b44' : scorched ? '#4a2018' : '#464038'
  const emissive = valid ? '#1b6384' : scorched ? '#68240f' : '#26201a'
  return (
    <mesh
      position={[boardX(position.x), 0, boardZ(position.y)]}
      receiveShadow
      onClick={(event) => { event.stopPropagation(); onClick() }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[TILE_SIZE, valid ? 0.13 : 0.08, TILE_SIZE]} />
      <meshStandardMaterial
        color={color}
        roughness={0.66}
        metalness={0.18}
        emissive={emissive}
        emissiveIntensity={valid ? 1.05 : scorched ? 0.9 : 0.62}
      />
    </mesh>
  )
})

/**
 * Carta física sobre el tablero. Memoizada: el deslizamiento y los pulsos
 * viven en useFrame, así que el re-render solo hace falta cuando cambian
 * la pieza o sus marcas (selección, objetivo, disponibilidad).
 */
const BoardCard = memo(function BoardCard({ piece, selected, targetable, ready, active, onPiece, reducedMotion }: { piece: BoardPiece; selected: boolean; targetable: boolean; ready: boolean; active: boolean; onPiece: (pieceId: string) => void; reducedMotion: boolean }) {
  const card = CARD_BY_ID[piece.cardId]
  const texture = useTexture(withBase(card?.art.webp ?? '/assets/cards/art/fuente-furia.webp'))
  const group = useRef<Group>(null)
  const frame = useRef<Mesh>(null)
  const readyRing = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const target = useMemo(() => ({ x: boardX(piece.position.x), z: boardZ(piece.position.y) }), [piece.position.x, piece.position.y])
  const frozen = piece.statuses.some((status) => status.kind === 'frozen')
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
  const frameColor = card.faction === 'fury' ? '#5a2116' : '#173858'
  const glow = selected || targetable
  const glowColor = targetable ? '#ffd257' : card.faction === 'fury' ? '#ff572f' : '#39baff'
  return (
    <group
      ref={group}
      position={[target.x, 0.15, target.z]}
      onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onClick() }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <group scale={CARD_SCALE}>
        <mesh ref={frame} castShadow receiveShadow>
          <boxGeometry args={[0.83, 0.07, 1.02]} />
          <meshStandardMaterial
            color={frozen ? '#2b4a63' : frameColor}
            metalness={0.35}
            roughness={0.42}
            emissive={glow ? glowColor : frozen ? '#79e7ff' : '#000000'}
            emissiveIntensity={glow ? 0.55 : frozen ? 0.35 : 0}
          />
        </mesh>
        <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, piece.owner === 'ai' ? Math.PI : 0]}>
          <planeGeometry args={[0.73, 0.9]} />
          <meshStandardMaterial map={texture} roughness={0.62} color={frozen ? '#9fd4ef' : spent ? '#8f8f96' : '#ffffff'} />
        </mesh>
        {frozen && (
          <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.83, 1.02]} />
            <meshStandardMaterial color="#bdeaff" transparent opacity={0.32} roughness={0.2} metalness={0.4} emissive="#9fd8ff" emissiveIntensity={0.5} />
          </mesh>
        )}
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
      {/* zIndexRange bajo: sin él, drei usa z-index millonarios que tapan los modales. */}
      <Html center position={[0, 0.15, 0]} distanceFactor={8.6} zIndexRange={[14, 0]} className={styles.cardLabel}>
        <div className={styles.cardName} data-frozen={frozen || undefined} data-spent={spent || undefined}>{card.name}</div>
        <div className={styles.cardStats}>
          {card.attack !== undefined && <span className={styles.attackStat}>⚔ {Math.max(0, card.attack + piece.attackModifier)}</span>}
          <span className={damaged ? styles.damagedStat : styles.healthStat}>♥ {piece.currentHealth}</span>
          {frozen && <span className={styles.frozenStat}>❄</span>}
          {spent && <span className={styles.spentStat}>◒</span>}
        </div>
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
  health,
  targetable,
  onClick,
  commanderArt,
  activeEvent,
}: {
  playerId: PlayerId
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
  const color = playerId === 'player' ? '#f2a24a' : '#58c9ff'
  const ringEmissive = playerId === 'player' ? '#9a7326' : '#3f7fb0'
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
        <div data-targetable={targetable || undefined}>{playerId === 'player' ? 'TU NEXO' : 'NEXO RIVAL'} · {health}</div>
      </Html>
      <pointLight position={[0, 1.1, 0]} color={color} intensity={5} distance={4} decay={2} />
    </group>
  )
}

/** Sacudida sutil de cámara en los golpes al Nexo. Respeta el movimiento reducido. */
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
  const subtleCells = props.scenario === 'aether-citadel'
  return (
    <>
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
            onCell={props.onCell}
          />
        )
      })}
      <Suspense fallback={null}>
        {props.state.board.map((piece) => (
          <BoardCard
            key={piece.instanceId}
            piece={piece}
            selected={piece.instanceId === props.selectedPieceId}
            targetable={targetSet.has(piece.instanceId)}
            ready={props.readyPieceIds.has(piece.instanceId)}
            active={piece.owner === props.state.activePlayer}
            onPiece={props.onPiece}
            reducedMotion={props.reducedMotion}
          />
        ))}
      </Suspense>
      <Nexus
        playerId="player"
        health={props.state.players.player.nexusHealth}
        targetable={false}
        onClick={() => props.onNexus('player')}
        commanderArt={COMMANDER_BY_ID[props.state.players.player.commanderId]?.art.webp ?? '/assets/cards/art/fuente-furia.webp'}
        activeEvent={props.activeEvent}
      />
      <Nexus
        playerId="ai"
        health={props.state.players.ai.nexusHealth}
        targetable={props.validTargets.includes('ai-nexus')}
        onClick={() => props.onNexus('ai')}
        commanderArt={COMMANDER_BY_ID[props.state.players.ai.commanderId]?.art.webp ?? '/assets/cards/art/fuente-arcana.webp'}
        activeEvent={props.activeEvent}
      />
      {props.activeEvent && <EventEffects key={props.activeEvent.id} event={props.activeEvent} reducedMotion={props.reducedMotion} />}
      <DamageNumbers event={props.activeEvent} />
      <CameraRig event={props.activeEvent} reducedMotion={props.reducedMotion} />
      <OrbitControls makeDefault enablePan={false} enableZoom minPolarAngle={0.72} maxPolarAngle={1.03} minDistance={CAMERA_MIN_DISTANCE} maxDistance={CAMERA_MAX_DISTANCE} target={[...CAMERA_TARGET]} />
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
