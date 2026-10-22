import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type { Camera } from 'three'
import type { OrbitControls } from 'three-stdlib'
import type { AnimationEvent, PlayerId } from '../game'
import { CAMERA_TARGET, nexusWorldZ } from './grid/gridCoordinates'

interface FocusRun {
  readonly id: string
  readonly startedAt: number
  readonly durationMs: number
  readonly originalPosition: Vector3
  readonly originalTarget: Vector3
  readonly enabled: boolean
  readonly from: Vector3
  readonly fromTarget: Vector3
  readonly destination: Vector3
  readonly focus: Vector3
  viewport: string
  returning?: { readonly start: number; readonly position: Vector3; readonly target: Vector3 }
}

const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/** El Nexo cercano quedaba cortado por la mano y el lejano era diminuto.
 * El acercamiento muestra la rotura y devuelve después la vista del jugador. */
export function NexusFocus({ event, localPlayerId, reducedMotion, photoMode }: {
  readonly event?: AnimationEvent
  readonly localPlayerId: PlayerId
  readonly reducedMotion: boolean
  readonly photoMode?: boolean
}) {
  const requested = useRef<AnimationEvent | undefined>(undefined)
  const run = useRef<FocusRun | null>(null)
  const view = useRef<{ camera: Camera; controls: OrbitControls } | null>(null)
  useEffect(() => {
    requested.current = event?.type === 'victory' && !reducedMotion && !photoMode ? event : undefined
  }, [event, reducedMotion, photoMode])
  useEffect(() => () => {
    const current = run.current
    const currentView = view.current
    if (!current || !currentView) return
    currentView.camera.position.copy(current.originalPosition)
    currentView.controls.target.copy(current.originalTarget)
    currentView.camera.lookAt(current.originalTarget)
    currentView.camera.updateMatrixWorld()
    currentView.controls.enabled = current.enabled
  }, [])
  useFrame(({ camera, controls, size }) => {
    const orbit = controls as OrbitControls | undefined
    if (!orbit?.target) return
    view.current = { camera, controls: orbit }
    const now = performance.now()
    const request = requested.current
    const viewport = `${size.width}x${size.height}`
    const player = request?.targetId === 'player-nexus' ? 'player' : request?.targetId === 'ai-nexus' ? 'ai' : undefined
    if (request && player && run.current?.id !== request.id) {
      const focus = new Vector3(0, 0.45, nexusWorldZ(player) * (localPlayerId === 'ai' ? -1 : 1))
      const direction = camera.position.clone().sub(orbit.target).normalize()
      const distance = Math.max(4.8, Math.min(5.4, camera.position.distanceTo(orbit.target) * 0.45))
      run.current = {
        id: request.id, startedAt: now, durationMs: Math.max(1, request.durationMs),
        originalPosition: run.current?.originalPosition.clone() ?? camera.position.clone(),
        originalTarget: run.current?.originalTarget.clone() ?? orbit.target.clone(),
        enabled: run.current?.enabled ?? orbit.enabled,
        from: camera.position.clone(), fromTarget: orbit.target.clone(),
        destination: focus.clone().addScaledVector(direction, distance), focus, viewport,
      }
    }
    const current = run.current
    if (!current) return
    // ResponsiveCamera acaba de ajustar la proyección: conservar ese encuadre
    // si se cambia el tamaño de la ventana durante el cierre de partida.
    if (current.viewport !== viewport) {
      current.originalPosition.copy(camera.position)
      current.originalTarget.set(...CAMERA_TARGET)
      current.viewport = viewport
    }
    if (reducedMotion || photoMode) {
      camera.position.copy(current.originalPosition)
      orbit.target.copy(current.originalTarget)
      orbit.enabled = current.enabled
      camera.lookAt(orbit.target)
      camera.updateMatrixWorld()
      run.current = null
      return
    }
    orbit.enabled = false
    if (!request && !current.returning) {
      current.returning = { start: now, position: camera.position.clone(), target: orbit.target.clone() }
    }
    if (current.returning) {
      const progress = Math.min(1, (now - current.returning.start) / 280)
      camera.position.lerpVectors(current.returning.position, current.originalPosition, ease(progress))
      orbit.target.lerpVectors(current.returning.target, current.originalTarget, ease(progress))
      if (progress >= 1) {
        orbit.enabled = current.enabled
        run.current = null
      }
    } else {
      const progress = (now - current.startedAt) / current.durationMs
      const amount = ease(progress / 0.65)
      camera.position.lerpVectors(current.from, current.destination, amount)
      orbit.target.lerpVectors(current.fromTarget, current.focus, amount)
    }
    camera.lookAt(orbit.target)
    camera.updateMatrixWorld()
  }, -0.5)
  return null
}
