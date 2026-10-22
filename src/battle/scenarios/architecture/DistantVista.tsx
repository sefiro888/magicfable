import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BackSide, DataTexture, LinearFilter, MirroredRepeatWrapping, NoColorSpace, RGBAFormat, SRGBColorSpace } from 'three'
import type { Mesh } from 'three'
import { centerPanoramaAtCamera } from './panoramaPosition'
import { withBase } from '../../../utils/assets'

let mask: DataTexture | undefined
function edgeMask() {
  if (mask) return mask
  const size = 256
  const data = new Uint8Array(size * 4)
  for (let y = 0; y < size; y += 1) {
    const latitude = y / (size - 1)
    // El desvanecido termina dentro de la imagen: permitir el clamp fuera
    // de la banda estiraba las últimas torres en rayas hacia el cénit.
    const lower = Math.min(1, Math.max(0, (latitude - 25 / 180) / 0.035))
    const upper = Math.min(1, Math.max(0, (80 / 180 - latitude) / 0.035))
    const alpha = Math.round(lower * lower * (3 - 2 * lower) * upper * upper * (3 - 2 * upper) * 255)
    const offset = y * 4
    data[offset] = data[offset + 1] = data[offset + 2] = alpha
    data[offset + 3] = 255
  }
  mask = new DataTexture(data, 1, size, RGBAFormat)
  mask.colorSpace = NoColorSpace
  mask.magFilter = mask.minFilter = LinearFilter
  mask.needsUpdate = true
  return mask
}

/** Cinturón panorámico con orientación mundial. La cúpula sigue solo la
 * traslación de cámara, como un cielo infinito; nunca su giro. Un plano
 * distante revelaba su borde al orbitar y parecía un cartel inclinado. */
export function DistantVista({ image }: {
  readonly image: string
}) {
  const dome = useRef<Mesh>(null)
  const loaded = useTexture(withBase(image))
  const texture = useMemo(() => {
    const color = loaded.clone()
    color.colorSpace = SRGBColorSpace
    // El campo mira 37° hacia abajo: la pintura ocupa de 10° a 65° bajo
    // el horizonte. Los extremos reflejados comparten píxel y no abren juntas.
    color.wrapS = MirroredRepeatWrapping
    color.repeat.set(4, 180 / 55)
    color.offset.set(0.5, -25 / 55)
    color.needsUpdate = true
    return color
  }, [loaded])
  useEffect(() => () => texture.dispose(), [texture])
  useFrame(({ camera }) => {
    if (dome.current) centerPanoramaAtCamera(dome.current, camera)
  })
  return <mesh ref={dome} name="scenario-distant-vista" renderOrder={-20}>
    <sphereGeometry args={[69, 96, 64]} />
    <meshBasicMaterial map={texture} alphaMap={edgeMask()} side={BackSide} transparent depthWrite={false} fog={false} toneMapped={false} />
  </mesh>
}
