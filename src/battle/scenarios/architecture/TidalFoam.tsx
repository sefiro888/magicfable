import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { ShaderMaterial, UniformsLib, UniformsUtils } from 'three'
import type { AnimationEvent } from '../../../game'
import type { GraphicsQuality } from '../../../store/preferences'
import { usePageVisibility } from '../../usePageVisibility'
import { shoreFoamGeometry } from './shoreGeometry'

const vertex = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const fragment = /* glsl */`
  uniform float uTime;
  uniform float uSurge;
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  void main() {
    vec2 p = vWorld.xz;
    float grain = noise(p * 6.5 + uTime * vec2(0.035, -0.06));
    float coast = noise(p * 1.7) * 0.8 + grain * 0.17;
    float phase = dot(p, vec2(0.85, 1.4)) - uTime * 0.55 + coast;
    float front = pow(0.5 + 0.5 * cos(phase), 8.0);
    float broken = smoothstep(0.5, 0.79, grain * 0.65 + noise(p * 2.7) * 0.35);
    float fade = smoothstep(0.0, 0.13, vUv.y) * (1.0 - smoothstep(0.72, 1.0, vUv.y));
    float lace = smoothstep(0.23, 0.68, noise(p * 35.0 + vec2(uTime * 0.04, -uTime * 0.07)));
    float alpha = front * broken * fade * lace * (0.62 + uSurge * 0.25);
    gl_FragColor = vec4(vec3(0.68, 0.77, 0.75), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

/** La espuma avanza en frentes rotos siguiendo la
 * costa. Un aro blanco opaco convertía la marejada en una pista circular. */
export function TidalFoam({ quality, reducedMotion, event }: {
  readonly quality: GraphicsQuality; readonly reducedMotion: boolean; readonly event?: AnimationEvent
}) {
  const surge = useRef(0)
  const surface = useRef<ShaderMaterial>(null)
  const visible = usePageVisibility()
  const material = useMemo(() => new ShaderMaterial({
    uniforms: { ...UniformsUtils.clone(UniformsLib.fog), uTime: { value: 0 }, uSurge: { value: 0 } },
    vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, fog: true,
  }), [])
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory') surge.current = 1
  }, [event])
  useFrame(({ clock }, delta) => {
    if (!visible.current || !surface.current) return
    surge.current = Math.max(0, surge.current - delta * 0.35)
    surface.current.uniforms.uTime!.value = reducedMotion ? 0 : clock.elapsedTime
    surface.current.uniforms.uSurge!.value = reducedMotion ? 0 : surge.current
  })
  return <mesh name="shore-foam">
    <primitive ref={surface} object={material} attach="material" />
    <primitive object={shoreFoamGeometry(quality === 'low')} attach="geometry" />
  </mesh>
}
