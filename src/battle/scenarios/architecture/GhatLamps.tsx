import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide, LatheGeometry, Vector2 } from 'three'
import type { Group, Mesh } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { usePageVisibility } from '../../usePageVisibility'

const bowl = new LatheGeometry([[0, 0], [0.08, 0], [0.17, 0.04], [0.18, 0.11],
  [0.16, 0.12], [0.12, 0.06], [0, 0.05]].map(([x, y]) => new Vector2(x, y)), 24)
const flame = new LatheGeometry([[0, 0], [0.035, 0.02], [0.04, 0.06], [0.018, 0.11],
  [0, 0.17]].map(([x, y]) => new Vector2(x, y)), 12)

/** Cuencos pequeños llevados por una corriente lateral;
 * el aceite ilumina la mecha, sin discos aditivos gigantes sobre el río. */
export function GhatLamps({ quality, reducedMotion }: {
  readonly quality: GraphicsQuality
  readonly reducedMotion: boolean
}) {
  const moving = useRef<Group>(null), visible = usePageVisibility()
  const count = quality === 'low' ? 6 : quality === 'medium' ? 10 : 16
  useFrame(({ clock }) => {
    if (!moving.current || !visible.current) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    moving.current.children.forEach((child, i) => {
      const side = i % 2 ? 1 : -1
      child.position.set(side * (5.8 + (i * 0.713 % 1) * 1.5),
        -1.34 + Math.sin(t * 0.8 + i * 2.1) * (reducedMotion ? 0 : 0.015),
        -3.4 - ((i * 0.83 + t * (0.08 + i * 0.003)) % 5.2))
      child.rotation.y = i * 1.73 + t * 0.08
      const fire = child.getObjectByName('ghat-lamp-flame') as Mesh | undefined
      fire?.scale.setScalar(reducedMotion ? 1 : 1 + Math.sin(t * 5.3 + i * 2.7) * 0.07)
    })
  })
  return <group ref={moving} name="ghat-floating-lamps">
    {Array.from({ length: count }, (_, i) => <group key={i}
      position={[(i % 2 ? 1 : -1) * (5.8 + (i * 0.713 % 1) * 1.5), -1.34, -3.4 - (i * 0.83 % 5.2)]} rotation={[0, i * 1.73, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.35, 0.23, 1]}>
        <circleGeometry args={[1, 12]} />
        <meshStandardMaterial color="#606b41" roughness={0.85} side={DoubleSide} />
      </mesh>
      <mesh geometry={bowl} position={[0, 0.025, 0]}>
        <meshStandardMaterial color="#a97b56" roughness={0.9} />
      </mesh>
      <mesh name="ghat-lamp-flame" geometry={flame} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#ffdf9b" emissive="#ffac43" emissiveIntensity={1.8} roughness={1} />
      </mesh>
    </group>)}
  </group>
}
