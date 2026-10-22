import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, DataTexture, LinearFilter, Matrix4, NoColorSpace, PerspectiveCamera, Plane, RepeatWrapping, RGBAFormat, ShaderMaterial, UniformsLib, UniformsUtils, Vector3, Vector4, WebGLRenderTarget } from 'three'
import type { Mesh } from 'three'
import type { GraphicsQuality } from '../../store/preferences'
import { usePageVisibility } from '../usePageVisibility'

let ripples: DataTexture | undefined
function rippleField() {
  if (ripples) return ripples
  const size = 128
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size * Math.PI * 2
      const v = y / size * Math.PI * 2
      const dx = Math.cos(u * 5 + v * 2) * 0.21 + Math.cos(u * 11 - v * 3) * 0.11
      const dz = Math.cos(u * 5 + v * 2) * 0.14 - Math.cos(u * 11 - v * 3) * 0.09 + Math.sin(v * 13 + u) * 0.08
      const i = (y * size + x) * 4
      data[i] = (0.5 + dx * 0.5) * 255
      data[i + 1] = (0.5 + dz * 0.5) * 255
      data[i + 2] = data[i + 3] = 255
    }
  }
  ripples = new DataTexture(data, size, size, RGBAFormat)
  ripples.colorSpace = NoColorSpace
  ripples.wrapS = ripples.wrapT = RepeatWrapping
  ripples.magFilter = ripples.minFilter = LinearFilter
  ripples.needsUpdate = true
  return ripples
}

const vertexShader = /* glsl */`
  uniform mat4 uReflectionMatrix;
  varying vec3 vWorld;
  varying vec4 vReflection;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vReflection = uReflectionMatrix * world;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const fragmentShader = /* glsl */`
  uniform sampler2D uRipples;
  uniform sampler2D uReflection;
  uniform vec3 uColor;
  uniform float uHasReflection;
  uniform float uTime;
  uniform float uRadius;
  varying vec3 vWorld;
  varying vec4 vReflection;
  #include <fog_pars_fragment>
  void main() {
    vec2 flow = vec2(uTime * 0.002, -uTime * 0.003);
    vec2 slope = texture2D(uRipples, vWorld.xz * 0.075 + flow).rg - 0.5;
    slope += (texture2D(uRipples, vWorld.xz * 0.14 - flow * 0.6).gr - 0.5) * 0.35;
    vec3 normal = normalize(vec3(slope.x * 0.22, 1.0, slope.y * 0.22));
    vec3 view = normalize(cameraPosition - vWorld);
    float fresnel = 0.09 + 0.65 * pow(1.0 - max(dot(view, normal), 0.0), 5.0);
    vec3 color = uColor * (0.8 + slope.y * 0.3);
    float crest = pow(1.0 - abs(sin(vWorld.z * 6.0 + sin(vWorld.x * 1.3) * 0.5 + uTime * 0.2)), 24.0);
    crest *= pow(0.5 + 0.5 * sin(vWorld.x * 2.7 - vWorld.z * 0.8), 2.0);
    color += vec3(0.006, 0.012, 0.016) * crest;
    if (uHasReflection > 0.5 && vReflection.w > 0.0) {
      vec2 uv = vReflection.xy / vReflection.w + slope * 0.007;
      vec3 reflected = texture2D(uReflection, clamp(uv, 0.001, 0.999)).rgb;
      color = mix(color, reflected, fresnel);
    }
    vec3 moon = normalize(vec3(-0.35, 0.65, -0.68));
    float glint = pow(max(dot(reflect(-moon, normal), view), 0.0), 70.0);
    color += vec3(0.35, 0.46, 0.59) * glint * 0.35;
    float alpha = 1.0 - smoothstep(uRadius * 0.73, uRadius, length(vWorld.xz));
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

/** Un único reflejo planar para todo el lago. Se libera al salir y no vuelve
 * a calcular sombras. Alta/media limitan resolución/frecuencia; baja conserva
 * Fresnel y ondas sin otro render. El reflejo contiene geometría de la escena,
 * no una copia pegada sobre cada losa. */
export function ReflectiveWater({ quality, reducedMotion, level = -0.72, radius = 15, color = '#203849' }: {
  readonly quality: GraphicsQuality
  readonly reducedMotion: boolean
  readonly level?: number
  readonly radius?: number
  readonly color?: string
}) {
  const water = useRef<Mesh>(null)
  const surface = useRef<ShaderMaterial>(null)
  const visible = usePageVisibility()
  const lastCapture = useRef(-Infinity)
  const target = useMemo(() => quality === 'low' ? undefined : new WebGLRenderTarget(quality === 'high' ? 512 : 256, quality === 'high' ? 512 : 256), [quality])
  const reflection = useMemo(() => ({
    camera: new PerspectiveCamera(), plane: new Plane(), clip: new Vector4(), q: new Vector4(),
    direction: new Vector3(), look: new Vector3(), matrix: new Matrix4(),
  }), [])
  const reflectionState = useRef(reflection)
  const material = useMemo(() => new ShaderMaterial({
    uniforms: { ...UniformsUtils.clone(UniformsLib.fog),
      uRipples: { value: rippleField() }, uReflection: { value: target?.texture ?? null },
      uReflectionMatrix: { value: reflection.matrix }, uHasReflection: { value: target ? 1 : 0 },
      uTime: { value: 0 }, uRadius: { value: radius }, uColor: { value: new Color(color) },
    }, vertexShader, fragmentShader, fog: true, transparent: true, depthWrite: false,
  }), [target, reflection, radius, color])
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => () => target?.dispose(), [target])
  useFrame(({ camera, gl, scene, clock }) => {
    if (!visible.current || !water.current || !surface.current) return
    surface.current.uniforms.uTime!.value = reducedMotion ? 0 : clock.elapsedTime
    if (!target || !(camera instanceof PerspectiveCamera) || camera.position.y <= level) return
    const now = performance.now()
    if (!reducedMotion && now - lastCapture.current < (quality === 'high' ? 1000 / 24 : 1000 / 12)) return
    lastCapture.current = now
    const state = reflectionState.current
    const mirror = state.camera
    camera.getWorldDirection(state.direction)
    state.look.copy(camera.position).add(state.direction)
    state.look.y = level * 2 - state.look.y
    mirror.position.copy(camera.position)
    mirror.position.y = level * 2 - mirror.position.y
    mirror.up.copy(camera.up)
    mirror.up.y *= -1
    mirror.lookAt(state.look)
    mirror.far = camera.far
    mirror.updateMatrixWorld()
    mirror.projectionMatrix.copy(camera.projectionMatrix)
    state.matrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
      .multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse)
    // La cámara reflejada recorta la geometría bajo el agua. Sin plano oblicuo
    // la base sumergida se dibuja por encima de su propio reflejo.
    state.plane.set(new Vector3(0, 1, 0), -level).applyMatrix4(mirror.matrixWorldInverse)
    const plane = state.plane
    const clip = state.clip.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant)
    const projection = mirror.projectionMatrix.elements
    state.q.set((Math.sign(clip.x) + projection[8]!) / projection[0]!,
      (Math.sign(clip.y) + projection[9]!) / projection[5]!, -1, (1 + projection[10]!) / projection[14]!)
    clip.multiplyScalar(2 / clip.dot(state.q))
    projection[2] = clip.x
    projection[6] = clip.y
    projection[10] = clip.z + 1
    projection[14] = clip.w
    const previousTarget = gl.getRenderTarget()
    const shadows = gl.shadowMap.autoUpdate
    const xr = gl.xr.enabled
    water.current.visible = false
    try {
      gl.xr.enabled = false
      gl.shadowMap.autoUpdate = false
      gl.setRenderTarget(target)
      gl.clear()
      gl.render(scene, mirror)
    } finally {
      gl.setRenderTarget(previousTarget)
      gl.shadowMap.autoUpdate = shadows
      gl.xr.enabled = xr
      water.current.visible = true
    }
  })
  return <mesh ref={water} position={[0, level, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[radius, quality === 'low' ? 48 : 80]} />
    <primitive ref={surface} object={material} attach="material" />
  </mesh>
}
