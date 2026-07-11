import { Html, OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { CARD_BY_ID } from '../game'
import type { AnimationEvent, BoardPiece, MatchState, PlayerId, Position } from '../game'
import type { GraphicsQuality } from '../store/preferences'
import { withBase } from '../utils/assets'
import { EventEffects } from './EventEffects'
import { Sanctuary } from './Sanctuary'
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
  /** Evento visual en reproducción, entregado por el director de animaciones. */
  activeEvent?: AnimationEvent
}

const isSameCell = (a: Position, b: Position) => a.x === b.x && a.y === b.y
const boardX = (x: number) => (x - 2) * 1.18
const boardZ = (y: number) => (y - 2) * 1.18

function BoardCell({ position, valid, occupied, scorched, onClick }: { position: Position; valid: boolean; occupied: boolean; scorched: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
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
      <boxGeometry args={[1.08, valid ? 0.13 : 0.08, 1.08]} />
      <meshStandardMaterial
        color={color}
        roughness={0.66}
        metalness={0.18}
        emissive={emissive}
        emissiveIntensity={valid ? 1.05 : scorched ? 0.9 : 0.62}
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
      <Html center position={[0, 0.15, 0]} distanceFactor={7.2} className={styles.cardLabel}>
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
  const z = playerId === 'player' ? 3.3 : -3.3
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

function Scene(props: Board3DProps) {
  const scorchedCells = props.state.tileEffects.filter((tile) => tile.kind === 'scorched')
  return (
    <>
      <color attach="background" args={['#070b1c']} />
      <fog attach="fog" args={['#0a0f22', 10, 30]} />
      <ambientLight intensity={1.45} color="#bfc7de" />
      <hemisphereLight intensity={0.85} color="#c9dcff" groundColor="#4a3420" />
      <spotLight position={[-4, 8, 5]} intensity={66} angle={0.58} penumbra={0.8} castShadow={props.quality !== 'low'} color="#ffe3b2" />
      <pointLight position={[4, 2, -4]} color="#50bfff" intensity={20} distance={9} />
      <pointLight position={[-4, 2, 4]} color="#ffb46a" intensity={16} distance={9} />
      <Sanctuary quality={props.quality} reducedMotion={props.reducedMotion} event={props.activeEvent} />
      {Array.from({ length: 25 }, (_, index) => {
        const position = { x: index % 5, y: Math.floor(index / 5) }
        return (
          <BoardCell
            key={index}
            position={position}
            valid={props.validCells.some((cell) => isSameCell(cell, position))}
            occupied={props.state.board.some((piece) => isSameCell(piece.position, position))}
            scorched={scorchedCells.some((tile) => isSameCell(tile.position, position))}
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
      <OrbitControls makeDefault enablePan={false} enableZoom minPolarAngle={0.72} maxPolarAngle={1.03} minDistance={7.8} maxDistance={10.2} target={[0, 0, 0]} />
    </>
  )
}

export function Board3D(props: Board3DProps) {
  const dpr: [number, number] = props.quality === 'high' ? [1, 2] : props.quality === 'medium' ? [1, 1.5] : [0.75, 1]
  return (
    <div className={styles.viewport} data-testid="battle-board">
      <Canvas shadows={props.quality !== 'low'} dpr={dpr} camera={{ position: [0, 7.4, 7.2], fov: 44 }} gl={{ antialias: props.quality !== 'low', alpha: false }}>
        <Scene {...props} />
      </Canvas>
    </div>
  )
}
