import { Html, OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef, useState } from 'react'
import { MathUtils } from 'three'
import type { Group, Mesh } from 'three'
import { CARD_BY_ID } from '../game'
import type { AnimationEvent, BoardPiece, MatchState, PlayerId, Position } from '../game'
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
}

const isSameCell = (a: Position, b: Position) => a.x === b.x && a.y === b.y
const boardX = (x: number) => (x - 2) * 1.18
const boardZ = (y: number) => (y - 2) * 1.18

function BoardCell({ position, valid, occupied, onClick }: { position: Position; valid: boolean; occupied: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const color = valid ? (hovered ? '#f6d77e' : '#4e9ed0') : hovered && !occupied ? '#465267' : '#293344'
  return (
    <mesh
      position={[boardX(position.x), 0, boardZ(position.y)]}
      receiveShadow
      onClick={(event) => { event.stopPropagation(); onClick() }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[1.08, valid ? .13 : .08, 1.08]} />
      <meshStandardMaterial color={color} roughness={.66} metalness={.18} emissive={valid ? '#1b6384' : '#111b2a'} emissiveIntensity={valid ? 1.05 : .62} />
    </mesh>
  )
}

function BoardCard({ piece, selected, targetable, onClick, reducedMotion }: { piece: BoardPiece; selected: boolean; targetable: boolean; onClick: () => void; reducedMotion: boolean }) {
  const card = CARD_BY_ID[piece.cardId]
  const texture = useTexture(card?.art.fallback ?? '/assets/cards/art/fuente-furia.svg')
  const group = useRef<Group>(null)
  const target = useMemo(() => ({ x: boardX(piece.position.x), z: boardZ(piece.position.y) }), [piece.position.x, piece.position.y])
  useFrame((_, delta) => {
    const node = group.current
    if (!node) return
    const speed = reducedMotion ? 100 : 8
    node.position.x = MathUtils.damp(node.position.x, target.x, speed, delta)
    node.position.z = MathUtils.damp(node.position.z, target.z, speed, delta)
    node.position.y = MathUtils.damp(node.position.y, selected ? .26 : .15, speed, delta)
    node.rotation.y = MathUtils.damp(node.rotation.y, selected ? (piece.owner === 'player' ? -.08 : .08) : 0, speed, delta)
  })
  if (!card) return null
  const health = card.type === 'structure' ? piece.currentHealth : piece.currentHealth
  return (
    <group ref={group} position={[target.x, .15, target.z]} onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onClick() }}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[.83, .07, 1.02]} />
        <meshStandardMaterial color={card.faction === 'fury' ? '#5a2116' : '#173858'} metalness={.35} roughness={.42} emissive={selected || targetable ? (card.faction === 'fury' ? '#ff572f' : '#39baff') : '#000000'} emissiveIntensity={selected || targetable ? .55 : 0} />
      </mesh>
      <mesh position={[0, .038, 0]} rotation={[-Math.PI / 2, 0, piece.owner === 'ai' ? Math.PI : 0]}>
        <planeGeometry args={[.73, .9]} />
        <meshStandardMaterial map={texture} roughness={.62} />
      </mesh>
      <Html center position={[0, .15, 0]} distanceFactor={7.2} className={styles.cardLabel}>
        <div>{card.name}</div><div className={styles.cardStats}><span>⚔ {Math.max(0, (card.attack ?? 0) + piece.attackModifier)}</span><span>♥ {health}</span></div>
      </Html>
    </group>
  )
}

function Nexus({ playerId, health, onClick }: { playerId: PlayerId; health: number; onClick: () => void }) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => { if (group.current) group.current.rotation.y = clock.elapsedTime * (playerId === 'player' ? .18 : -.18) })
  const z = playerId === 'player' ? 3.3 : -3.3
  const color = playerId === 'player' ? '#f28b42' : '#58c9ff'
  return (
    <group ref={group} position={[0, .43, z]} onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onClick() }}>
      <mesh castShadow><octahedronGeometry args={[.46, 1]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.25} roughness={.18} metalness={.28} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.68, .025, 8, 64]} /><meshStandardMaterial color="#d8bb76" emissive="#8e6a2d" emissiveIntensity={.7} /></mesh>
      <Html center position={[0, .72, 0]} distanceFactor={7} className={styles.nexusLabel}><div>{playerId === 'player' ? 'TU NEXO' : 'NEXO RIVAL'} · {health}</div></Html>
    </group>
  )
}

function EffectPulse({ event, reducedMotion }: { event?: AnimationEvent; reducedMotion: boolean }) {
  const mesh = useRef<Mesh>(null)
  const elapsed = useRef(0)
  useFrame((_, delta) => {
    if (!mesh.current || !event || reducedMotion) return
    elapsed.current += delta * 1000
    const progress = Math.min(1, elapsed.current / Math.max(250, event.durationMs))
    mesh.current.scale.setScalar(.2 + progress * 2.4)
    const material = Array.isArray(mesh.current.material) ? mesh.current.material[0] : mesh.current.material
    if (material) material.opacity = 1 - progress
  })
  if (!event || reducedMotion) return null
  const point = event.to ?? event.from ?? { x: 2, y: 2 }
  const fury = event.effectId?.includes('fire') || event.effectId?.includes('fury') || event.effectId?.includes('ember')
  return <mesh ref={mesh} position={[boardX(point.x), .12, boardZ(point.y)]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.28, .39, 32]} /><meshBasicMaterial transparent color={fury ? '#ff713b' : '#65d5ff'} opacity={.9} depthWrite={false} /></mesh>
}

function Scene(props: Board3DProps) {
  const lastEvent = props.state.animations[props.state.animations.length - 1]
  return (
    <>
      <color attach="background" args={['#080a11']} />
      <fog attach="fog" args={['#080a11', 8, 18]} />
      <ambientLight intensity={1.25} color="#a8b9dc" />
      <hemisphereLight intensity={.85} color="#c6dcff" groundColor="#3b2117" />
      <spotLight position={[-4, 8, 5]} intensity={62} angle={.58} penumbra={.8} castShadow color="#ffe3b2" />
      <pointLight position={[4, 2, -4]} color="#50bfff" intensity={22} distance={9} />
      <pointLight position={[-4, 2, 4]} color="#ff653d" intensity={20} distance={9} />
      <mesh position={[0, -.16, 0]} receiveShadow><cylinderGeometry args={[4.45, 4.7, .24, 8]} /><meshStandardMaterial color="#171d2a" emissive="#080d17" emissiveIntensity={.45} roughness={.78} metalness={.18} /></mesh>
      {Array.from({ length: 25 }, (_, index) => {
        const position = { x: index % 5, y: Math.floor(index / 5) }
        return <BoardCell key={index} position={position} valid={props.validCells.some((cell) => isSameCell(cell, position))} occupied={props.state.board.some((piece) => isSameCell(piece.position, position))} onClick={() => props.onCell(position)} />
      })}
      <Suspense fallback={null}>{props.state.board.map((piece) => <BoardCard key={piece.instanceId} piece={piece} selected={piece.instanceId === props.selectedPieceId} targetable={props.validTargets.includes(piece.instanceId)} onClick={() => props.onPiece(piece.instanceId)} reducedMotion={props.reducedMotion} />)}</Suspense>
      <Nexus playerId="player" health={props.state.players.player.nexusHealth} onClick={() => props.onNexus('player')} />
      <Nexus playerId="ai" health={props.state.players.ai.nexusHealth} onClick={() => props.onNexus('ai')} />
      <EffectPulse key={lastEvent?.id ?? 'no-effect'} event={lastEvent} reducedMotion={props.reducedMotion} />
      <OrbitControls makeDefault enablePan={false} enableZoom minPolarAngle={.72} maxPolarAngle={1.03} minDistance={7.8} maxDistance={10.2} target={[0, 0, 0]} />
    </>
  )
}

export function Board3D(props: Board3DProps) {
  return <div className={styles.viewport} data-testid="battle-board"><Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 7.4, 7.2], fov: 44 }} gl={{ antialias: true, alpha: false }}><Scene {...props} /></Canvas></div>
}
