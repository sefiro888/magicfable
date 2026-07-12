import { Html, OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { BOARD_CELL_COUNT, BOARD_SIZE, CARD_BY_ID } from '../game'
import type { AnimationEvent, BoardPiece, MatchState, PlayerId, Position } from '../game'
import type { GraphicsQuality, ScenarioId } from '../store/preferences'
import { withBase } from '../utils/assets'
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
import styles from './Board3D.module.css'

interface Board3DProps {
  state: MatchState
  selectedPieceId?: string
  validCells: readonly Position[]
  validTargets: readonly string[]
  onCell: (position: Position) => void
  onPiece: (pieceId: string) => void
  onNexus: (playerId: PlayerId) => void
  reducedMotion: boolean
  quality: GraphicsQuality
  scenario: ScenarioId
  /** Evento visual en reproducción, entregado por el director de animaciones. */
  activeEvent?: AnimationEvent
}

const isSameCell = (a: Position, b: Position) => a.x === b.x && a.y === b.y
const boardX = gridToWorldX
const boardZ = gridToWorldZ

/** Las cartas se diseñaron para un paso de casilla de 1.18; se reescalan al actual. */
const CARD_SCALE = CELL_SIZE / 1.18

function BoardCell({ position, valid, occupied, scorched, subtle, onClick }: { position: Position; valid: boolean; occupied: boolean; scorched: boolean; subtle: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const color = valid ? (hovered ? '#f6d77e' : '#4e9ed0') : hovered && !occupied ? (subtle ? '#8f96ab' : '#645b44') : scorched ? '#4a2018' : subtle ? '#6b7186' : '#464038'
  const emissive = valid ? '#1b6384' : scorched ? '#68240f' : subtle ? '#2a3040' : '#26201a'
  // Sobre Aether Citadel la piedra del GLB es el suelo: la casilla neutra es casi invisible.
  const idleOpacity = subtle ? (hovered ? 0.42 : 0.14) : 1
  return (
    <mesh
      position={[boardX(position.x), 0, boardZ(position.y)]}
      receiveShadow={!subtle}
      onClick={(event) => { event.stopPropagation(); onClick() }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[TILE_SIZE, valid ? 0.13 : subtle ? 0.045 : 0.08, TILE_SIZE]} />
      <meshStandardMaterial
        color={color}
        roughness={0.66}
        metalness={0.18}
        emissive={emissive}
        emissiveIntensity={valid ? 1.05 : scorched ? 0.9 : 0.62}
        transparent={subtle && !valid && !scorched}
        opacity={valid || scorched ? 1 : idleOpacity}
      />
    </mesh>
  )
}

function BoardCard({ piece, selected, targetable, active, onClick, reducedMotion }: { piece: BoardPiece; selected: boolean; targetable: boolean; active: boolean; onClick: () => void; reducedMotion: boolean }) {
  const card = CARD_BY_ID[piece.cardId]
  const texture = useTexture(withBase(card?.art.fallback ?? '/assets/cards/art/fuente-furia.svg'))
  const group = useRef<Group>(null)
  const frame = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
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
  })
  if (!card) return null
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
      </group>
      <Html center position={[0, 0.15, 0]} distanceFactor={8.6} className={styles.cardLabel}>
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
}

function Nexus({ playerId, health, targetable, onClick }: { playerId: PlayerId; health: number; targetable: boolean; onClick: () => void }) {
  const group = useRef<Group>(null)
  const crystal = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * (playerId === 'player' ? 0.18 : -0.18)
    if (crystal.current) {
      const material = crystal.current.material as MeshStandardMaterial
      material.emissiveIntensity = targetable ? 1.6 + Math.sin(clock.elapsedTime * 5) * 0.5 : 1.25
    }
  })
  const z = nexusWorldZ(playerId)
  const color = playerId === 'player' ? '#f28b42' : '#58c9ff'
  return (
    <group position={[0, 0, z]}>
      {/* Pedestal de piedra */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.72, 0.9, 0.34, 8]} />
        <meshStandardMaterial color="#1a1f2e" roughness={0.85} metalness={0.1} emissive="#0c101c" emissiveIntensity={0.5} />
      </mesh>
      <group ref={group} position={[0, 0.62, 0]} onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onClick() }}>
        <mesh ref={crystal} castShadow>
          <octahedronGeometry args={[0.46, 1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.25} roughness={0.18} metalness={0.28} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.68, 0.025, 8, 64]} />
          <meshStandardMaterial color="#d8bb76" emissive="#8e6a2d" emissiveIntensity={0.7} />
        </mesh>
        <Html center position={[0, 0.72, 0]} distanceFactor={7} className={styles.nexusLabel}>
          <div data-targetable={targetable || undefined}>{playerId === 'player' ? 'TU NEXO' : 'NEXO RIVAL'} · {health}</div>
        </Html>
      </group>
      <pointLight position={[0, 1.1, 0]} color={color} intensity={6} distance={4.5} decay={2} />
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
  const scorchedCells = props.state.tileEffects.filter((tile) => tile.kind === 'scorched')
  const subtleCells = props.scenario === 'aether-citadel'
  return (
    <>
      <Suspense fallback={<LoadingStage />}>
        {props.scenario === 'aether-citadel' ? (
          <AetherCitadel quality={props.quality} reducedMotion={props.reducedMotion} event={props.activeEvent} />
        ) : (
          <SanctuaryScenario quality={props.quality} reducedMotion={props.reducedMotion} event={props.activeEvent} />
        )}
      </Suspense>
      {Array.from({ length: BOARD_CELL_COUNT }, (_, index) => {
        const position = { x: index % BOARD_SIZE, y: Math.floor(index / BOARD_SIZE) }
        return (
          <BoardCell
            key={index}
            position={position}
            valid={props.validCells.some((cell) => isSameCell(cell, position))}
            occupied={props.state.board.some((piece) => isSameCell(piece.position, position))}
            scorched={scorchedCells.some((tile) => isSameCell(tile.position, position))}
            subtle={subtleCells}
            onClick={() => props.onCell(position)}
          />
        )
      })}
      <Suspense fallback={null}>
        {props.state.board.map((piece) => (
          <BoardCard
            key={piece.instanceId}
            piece={piece}
            selected={piece.instanceId === props.selectedPieceId}
            targetable={props.validTargets.includes(piece.instanceId)}
            active={piece.owner === props.state.activePlayer}
            onClick={() => props.onPiece(piece.instanceId)}
            reducedMotion={props.reducedMotion}
          />
        ))}
      </Suspense>
      <Nexus playerId="player" health={props.state.players.player.nexusHealth} targetable={false} onClick={() => props.onNexus('player')} />
      <Nexus playerId="ai" health={props.state.players.ai.nexusHealth} targetable={props.validTargets.includes('ai-nexus')} onClick={() => props.onNexus('ai')} />
      {props.activeEvent && <EventEffects key={props.activeEvent.id} event={props.activeEvent} reducedMotion={props.reducedMotion} />}
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
