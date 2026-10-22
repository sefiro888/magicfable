import { CanvasTexture, LinearFilter, NoColorSpace } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'

let cookie: CanvasTexture | undefined
function canopyMask() {
  if (cookie) return cookie
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se pudo crear la máscara del dosel')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 512, 512)
  context.filter = 'blur(2px)'
  // Racimos de hojas interrumpen luz real; no son planos aditivos que tapen
  // las cartas ni sombras pintadas encima de sus nombres.
  for (let cluster = 0; cluster < 34; cluster += 1) {
    const x = (Math.sin(cluster * 127.1) * 43758.5453 % 1 + 1) % 1 * 512
    const y = (Math.sin(cluster * 311.7 + 3) * 43758.5453 % 1 + 1) % 1 * 512
    for (let leaf = 0; leaf < 7; leaf += 1) {
      const angle = cluster * 2.39996 + leaf * 0.9
      context.save()
      context.translate(x + Math.cos(angle) * 23, y + Math.sin(angle) * 18)
      context.rotate(angle)
      context.fillStyle = 'rgba(0,0,0,0.7)'
      context.beginPath()
      context.ellipse(0, 0, 7 + leaf % 3, 16 + leaf % 4 * 2, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
  }
  cookie = new CanvasTexture(canvas)
  cookie.colorSpace = NoColorSpace
  cookie.magFilter = cookie.minFilter = LinearFilter
  return cookie
}

/** Luz filtrada que modula materiales y respeta oclusión. Un cono luminoso
 * sólido no explicaba las sombras del dosel y parecía un foco de escenario. */
export function FilteredSunlight({ quality }: { readonly quality: GraphicsQuality }) {
  if (quality === 'low') return null
  return <spotLight name="grove-filtered-sun" position={[-7, 13, 5]}
    color="#ffedc1" intensity={205} angle={0.62} penumbra={0.65} distance={42}
    map={canopyMask()} castShadow shadow-mapSize-width={quality === 'high' ? 512 : 256}
    shadow-mapSize-height={quality === 'high' ? 512 : 256} shadow-bias={-0.0006} />
}
