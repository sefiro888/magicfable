import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, ShaderMaterial, UniformsLib, UniformsUtils } from 'three'
import type { GraphicsQuality } from '../../store/preferences'
import { useBattleStrain } from '../scenarios/BattleClimate'
import { usePageVisibility } from '../usePageVisibility'

let field: DataTexture | undefined
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount
const smooth = (value: number) => value * value * (3 - 2 * value)
function hash(x: number, y: number, seed: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 79.3) * 43758.5453
  return value - Math.floor(value)
}
function periodicNoise(u: number, v: number, frequency: number, seed: number) {
  const x = u * frequency
  const y = v * frequency
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const sample = (dx: number, dy: number) => hash(((ix + dx) % frequency + frequency) % frequency, ((iy + dy) % frequency + frequency) % frequency, seed)
  return mix(mix(sample(0, 0), sample(1, 0), smooth(x - ix)), mix(sample(0, 1), sample(1, 1), smooth(x - ix)), smooth(y - iy))
}
function flowTexture() {
  if (field) return field
  const size = 128
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        const seed = 23 + channel * 13
        const value = periodicNoise(x / size, y / size, 8, seed) * 0.6
          + periodicNoise(x / size, y / size, 16, seed + 1) * 0.28
          + periodicNoise(x / size, y / size, 32, seed + 2) * 0.12
        data[(y * size + x) * 4 + channel] = Math.round(value * 255)
      }
      data[(y * size + x) * 4 + 3] = 255
    }
  }
  field = new DataTexture(data, size, size, RGBAFormat)
  field.colorSpace = NoColorSpace
  field.wrapS = field.wrapT = RepeatWrapping
  field.minFilter = LinearMipmapLinearFilter
  field.magFilter = LinearFilter
  field.generateMipmaps = true
  field.needsUpdate = true
  return field
}

const vertexShader = /* glsl */`
  varying vec2 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const fragmentShader = /* glsl */`
  uniform sampler2D uField;
  uniform float uTime;
  uniform float uFlare;
  uniform float uDetail;
  varying vec2 vWorld;
  #include <fog_pars_fragment>
  void main() {
    vec2 current = vec2(uTime * 0.004, -uTime * 0.006);
    vec2 warp = texture2D(uField, vWorld * 0.018 + current).rg - 0.5;
    float field = texture2D(uField, vWorld * 0.055 + warp * 0.22 + current * 1.4).b;
    float grain = texture2D(uField, vWorld * 0.18 - current * 0.5).r;
    if (uDetail > 0.5) {
      field += (texture2D(uField, vWorld * 0.14 + warp * 0.12 - current * 0.7).r - 0.5) * 0.14;
    }
    float distanceToFlow = abs(field - 0.5);
    float pixel = max(fwidth(distanceToFlow), 0.002);
    float heat = 1.0 - smoothstep(0.003 - pixel, 0.025 + pixel, distanceToFlow);
    heat *= smoothstep(0.28, 0.52, grain);
    float core = pow(heat, 3.2);
    // Las balsas de costra son oscuras y frías. Solo los canales dejan ver
    // magma blanco-dorado: emitir naranja desde toda la superficie parecía neón.
    vec3 crust = mix(vec3(0.018, 0.016, 0.019), vec3(0.053, 0.04, 0.036), grain);
    vec3 molten = mix(vec3(0.8, 0.035, 0.003), vec3(1.9, 0.55, 0.055), core);
    vec3 color = mix(crust, molten * (1.0 + uFlare * 0.22), heat);
    // La colada cercana se pierde en la garganta pintada. Un disco de 30 m
    // tapaba el paisaje entero y sus bordes eran evidentes en modo foto.
    float bank = 1.0 - smoothstep(7.8, 13.0, length(vWorld));
    gl_FragColor = vec4(color, bank);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

/** Advección de un campo térmico propio. Se hornea el ruido una vez y se
 * consulta tres/cuatro veces por píxel, sin fBm iterativo sobre todo el lienzo. */
export function LavaSurface({ quality, reducedMotion, flare, radius = 13, level = -2.4 }: {
  readonly quality: GraphicsQuality
  readonly reducedMotion: boolean
  readonly flare: { readonly current: number }
  readonly radius?: number
  readonly level?: number
}) {
  const strain = useBattleStrain()
  const visible = usePageVisibility()
  const surface = useRef<ShaderMaterial>(null)
  const material = useMemo(() => new ShaderMaterial({
    uniforms: { ...UniformsUtils.clone(UniformsLib.fog),
      uField: { value: flowTexture() }, uTime: { value: 0 },
      uFlare: { value: 0 }, uDetail: { value: quality === 'low' ? 0 : 1 },
    }, vertexShader, fragmentShader, fog: true, transparent: true, depthWrite: false,
  }), [quality])
  useEffect(() => () => material.dispose(), [material])
  useFrame(({ clock }) => {
    if (!visible.current || !surface.current) return
    surface.current.uniforms.uTime!.value = reducedMotion ? 0 : clock.elapsedTime
    surface.current.uniforms.uFlare!.value = Math.min(1, strain * 0.4 + (reducedMotion ? 0 : Math.max(0, flare.current)))
  })
  return <mesh position={[0, level, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[radius, quality === 'low' ? 32 : 64]} />
    <primitive ref={surface} attach="material" object={material} />
  </mesh>
}
