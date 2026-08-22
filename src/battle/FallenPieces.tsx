import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useRef, useState } from 'react'
import { AdditiveBlending, MathUtils } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { CARD_BY_ID, type AnimationEvent, type BoardPiece } from '../game'
import { CELL_SIZE, gridToWorldX, gridToWorldZ } from './grid/gridCoordinates'
import { glowTexture } from './textures'
import { withBase } from '../utils/assets'

/** Cuánto tarda una ficha derribada en desaparecer del todo, en milisegundos. */
const FALL_MS = 900

/** Mismas proporciones que la ficha viva, para que la caída sea continua. */
const CARD_SCALE = CELL_SIZE / 1.0
const CARD_STAND_TILT = 1.22
const CARD_STAND_RISE = 0.51 * CARD_SCALE * Math.sin(Math.abs(CARD_STAND_TILT))

interface Fallen {
  readonly id: string
  readonly instanceId: string
  readonly cardId: string
  readonly mine: boolean
  readonly x: number
  readonly z: number
  /**
   * Cuándo empieza a caer. Mientras es `undefined` la ficha sigue en pie: la
   * pieza desaparece del tablero en cuanto se aplica la jugada, pero su
   * animación de muerte no llega hasta que la cola termina de reproducir el
   * ataque y el daño. Sin esta espera había un hueco de más de medio segundo
   * en el que la defensora ya no estaba y el atacante seguía embistiendo a
   * nadie.
   */
  readonly fallingSince?: number
}

let nextId = 0

/**
 * Qué piezas acaban de morir: estaban en el tablero, ya no están, y hay una
 * destrucción esperando en la cola (o reproduciéndose) que las nombra.
 *
 * Lo segundo importa: una pieza también puede salir del tablero por volver a
 * la mano o por un teletransporte, y en esos casos no hay que dibujar ninguna
 * caída. La condición es «desapareció Y el motor dice que fue destruida».
 */
export const piecesDying = (
  known: ReadonlyMap<string, BoardPiece>,
  board: readonly BoardPiece[],
  events: readonly AnimationEvent[],
): readonly BoardPiece[] => {
  const vivas = new Set(board.map((piece) => piece.instanceId))
  const destruidas = new Set(
    events
      .filter((event) => event.type === 'destroy' && event.targetId)
      .map((event) => event.targetId as string),
  )
  const muertas: BoardPiece[] = []
  for (const [instanceId, piece] of known) {
    if (vivas.has(instanceId)) continue
    if (!destruidas.has(instanceId)) continue
    muertas.push(piece)
  }
  return muertas
}

/**
 * Una ficha derribada: se vence hacia atrás como un standee al que tiran, se
 * hunde en la casilla y se apaga, con un fogonazo en el momento del golpe.
 */
const FallenCard = memo(function FallenCard({ fallen, reducedMotion }: { fallen: Fallen; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const flash = useRef<Mesh>(null)
  const frame = useRef<Mesh>(null)
  const card = CARD_BY_ID[fallen.cardId]
  const texture = useTexture(withBase(card?.art.webp ?? '/assets/cards/art/fuente-furia.webp'))

  useFrame(() => {
    const node = group.current
    if (!node) return
    // En pie hasta que le toca caer: progreso 0 mientras espera su turno.
    const progress = fallen.fallingSince === undefined
      ? 0
      : Math.min(1, (performance.now() - fallen.fallingSince) / FALL_MS)
    // Se vence hacia atrás y se hunde: el standee cae de espaldas, no se
    // evapora en el sitio.
    const eased = progress * progress
    node.rotation.x = CARD_STAND_TILT - eased * (CARD_STAND_TILT + 0.25)
    node.position.y = CARD_STAND_RISE - eased * (CARD_STAND_RISE + 0.14)
    node.scale.setScalar(MathUtils.lerp(1, 0.86, eased))

    if (frame.current) {
      const material = frame.current.material as MeshStandardMaterial
      material.opacity = 1 - Math.max(0, (progress - 0.55) / 0.45)
      // La ficha se apaga a ceniza mientras cae.
      material.emissiveIntensity = Math.max(0, 0.5 - progress)
    }
    if (flash.current) {
      const material = flash.current.material as MeshBasicMaterial
      // Fogonazo del golpe: entra de inmediato y se va en el primer tercio.
      material.opacity = Math.max(0, 0.8 - progress * 2.6)
      flash.current.scale.setScalar(1 + progress * 2.4)
    }
  })

  const tint = fallen.mine ? '#f1c15f' : '#ff6b65'
  return (
    <group position={[fallen.x, 0, fallen.z]}>
      <group ref={group} position={[0, CARD_STAND_RISE, 0]} scale={CARD_SCALE} rotation={[CARD_STAND_TILT, 0, 0]}>
        <mesh ref={frame}>
          <boxGeometry args={[0.83, 0.07, 1.02]} />
          <meshStandardMaterial color="#2a2118" transparent opacity={1} emissive={tint} emissiveIntensity={0.5} metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Arte por las dos caras, igual que la ficha viva: al caer se ve
            precisamente el lado que antes estaba oculto. */}
        {[
          { key: 'front', y: 0.038, spin: 0 },
          { key: 'back', y: -0.038, spin: Math.PI },
        ].map(({ key, y, spin }) => (
          <mesh key={key} position={[0, y, 0]} rotation={[-Math.PI / 2, spin, 0]}>
            <planeGeometry args={[0.73, 0.9]} />
            <meshStandardMaterial map={texture} color="#8a8078" transparent opacity={0.9} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {!reducedMotion && (
        <mesh ref={flash} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 24]} />
          <meshBasicMaterial map={glowTexture(fallen.mine ? 'ember' : 'arcane')} transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
})

/**
 * Fichas que acaban de morir.
 *
 * El motor resuelve la jugada entera de golpe y la cola de animaciones la
 * reproduce después, así que la pieza destruida desaparece del tablero ANTES
 * de que se vea el golpe que la mata: en las capturas, la defensora ya no
 * estaba cuando el atacante todavía estaba embistiendo. Aquí se guarda lo
 * último que se supo de cada pieza y, cuando llega su evento de destrucción,
 * se dibuja una copia que cae — la ficha muere en pantalla en vez de
 * esfumarse.
 */
export const FallenPieces = memo(function FallenPieces({
  event,
  pendingEvents,
  board,
  localPlayerId,
  reducedMotion,
}: {
  event?: AnimationEvent
  /** Cola aún por reproducir: dice qué piezas van a morir antes de que se vea. */
  pendingEvents: readonly AnimationEvent[]
  board: readonly BoardPiece[]
  localPlayerId: 'player' | 'ai'
  reducedMotion: boolean
}) {
  const [fallen, setFallen] = useState<readonly Fallen[]>([])
  /** Lo último que se supo de cada pieza: cuando muere ya no está en `board`. */
  const lastKnown = useRef(new Map<string, BoardPiece>())
  /** Piezas que ya se han dado por caídas, para no duplicarlas. */
  const handled = useRef(new Set<string>())

  // 1) Una pieza que desaparece del tablero Y tiene una destrucción en la cola
  //    (o en curso) es una muerte: se queda en pie, en su casilla, esperando su
  //    animación. Si desaparece por otro motivo —volver a la mano, por
  //    ejemplo— no se dibuja nada, que es lo correcto.
  useEffect(() => {
    const map = lastKnown.current
    const nuevas: Fallen[] = []
    for (const piece of piecesDying(map, board, [...(event ? [event] : []), ...pendingEvents])) {
      if (handled.current.has(piece.instanceId)) continue
      handled.current.add(piece.instanceId)
      nuevas.push({
        id: `fallen-${nextId++}`,
        instanceId: piece.instanceId,
        cardId: piece.cardId,
        mine: piece.owner === localPlayerId,
        x: gridToWorldX(piece.position.x),
        z: gridToWorldZ(piece.position.y),
      })
    }
    for (const piece of board) map.set(piece.instanceId, piece)
    if (nuevas.length === 0) return undefined
    // Diferido con setTimeout(0): mismo patrón que DamageNumbers y RecentHits,
    // para no encadenar renders síncronos desde el cuerpo del efecto.
    const spawn = window.setTimeout(() => setFallen((current) => [...current, ...nuevas]), 0)
    return () => window.clearTimeout(spawn)
  }, [board, event, pendingEvents, localPlayerId])

  // 2) Cuando la cola llega a su evento de destrucción, la ficha se derrumba.
  useEffect(() => {
    if (!event || event.type !== 'destroy' || !event.targetId) return undefined
    const objetivo = event.targetId
    const marcar = window.setTimeout(() => {
      setFallen((current) => current.map((item) => (
        item.instanceId === objetivo && item.fallingSince === undefined
          ? { ...item, fallingSince: performance.now() }
          : item
      )))
    }, 0)
    const limpiar = window.setTimeout(() => {
      setFallen((current) => current.filter((item) => item.instanceId !== objetivo))
      handled.current.delete(objetivo)
    }, FALL_MS + 60)
    return () => {
      window.clearTimeout(marcar)
      window.clearTimeout(limpiar)
    }
  }, [event])

  // 3) Red de seguridad: si por lo que sea nunca llega el evento (animaciones
  //    saltadas, partida abandonada), nadie se queda en pie para siempre.
  useEffect(() => {
    if (fallen.length === 0) return undefined
    const timer = window.setTimeout(() => {
      setFallen((current) => current.filter((item) => item.fallingSince !== undefined))
      handled.current.clear()
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [fallen])

  return (
    <>
      {fallen.map((item) => (
        <FallenCard key={item.id} fallen={item} reducedMotion={reducedMotion} />
      ))}
    </>
  )
})
