import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Sprite, SpriteMaterial } from 'three'
import type { GraphicsQuality } from '../../store/preferences'
import { cloudTexture } from '../textures'
import { usePageVisibility } from '../usePageVisibility'

export interface PlumeVent {
  readonly position: readonly [number, number, number]
  readonly height: number
  readonly spread: number
  readonly density: number
  readonly color: string
  readonly seed: number
}

/** Bancos superpuestos de humo/vapor: suben, se ensanchan y se disipan.
 * Las capas están en el mundo y respetan la profundidad del tablero; un cono
 * aditivo sólido tapaba el paisaje y parecía un foco de discoteca. */
export function AtmosphericPlumes({ vents, quality, reducedMotion }: {
  readonly vents: readonly PlumeVent[]
  readonly quality: GraphicsQuality
  readonly reducedMotion: boolean
}) {
  const group = useRef<Group>(null)
  const visible = usePageVisibility()
  const layers = quality === 'high' ? 4 : quality === 'medium' ? 3 : 1
  const entries = useMemo(() => vents.flatMap((vent) => Array.from({ length: layers }, (_, index) => ({
    vent, phase: (index + 0.4) / layers,
  }))), [vents, layers])
  useFrame(({ clock }) => {
    if (!visible.current || !group.current) return
    group.current.children.forEach((child, index) => {
      const sprite = child as Sprite
      const { vent, phase } = entries[index]!
      const age = reducedMotion ? phase : (clock.elapsedTime * 0.08 + phase + vent.seed * 0.13) % 1
      const drift = Math.sin(age * Math.PI * 1.5 + vent.seed) * age * vent.spread * 0.23
      sprite.position.set(vent.position[0] + drift, vent.position[1] + age * vent.height,
        vent.position[2] + Math.cos(age * Math.PI + vent.seed) * age * vent.spread * 0.14)
      const width = vent.spread * (0.35 + age * 0.9)
      sprite.scale.set(width, width * (1.1 + age * 0.4), 1)
      const material = sprite.material as SpriteMaterial
      material.opacity = Math.pow(Math.sin(age * Math.PI), 0.8) * vent.density / Math.pow(layers, 0.4)
      material.rotation = Math.sin(age * 2 + vent.seed) * 0.12
    })
  })
  return <group ref={group}>{entries.map(({ vent, phase }, index) => {
    const width = vent.spread * (0.35 + phase * 0.9)
    return <sprite key={index} position={[vent.position[0], vent.position[1] + phase * vent.height, vent.position[2]]}
      scale={[width, width * (1.1 + phase * 0.4), 1]}>
      <spriteMaterial map={cloudTexture()} color={vent.color} transparent depthWrite={false}
        opacity={Math.pow(Math.sin(phase * Math.PI), 0.8) * vent.density / Math.pow(layers, 0.4)} />
    </sprite>
  })}</group>
}
