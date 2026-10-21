import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, DoubleSide, QuadraticBezierCurve3, Vector3 } from 'three'
import type { Group, Mesh, MeshBasicMaterial, ShaderMaterial } from 'three'
import type { FactionId } from '../game'
import { glowTexture } from './textures'

type TrailStyle = 'ember' | 'crystal' | 'vine' | 'radiant' | 'shadow' | 'sand' | 'tide' | 'metal'
const STYLES: Readonly<Record<FactionId, TrailStyle>> = {
  fury: 'ember', arcane: 'crystal', nature: 'vine', order: 'radiant', shadow: 'shadow', void: 'shadow',
  duna: 'sand', fimbul: 'crystal', samsara: 'ember', jade: 'vine', olimpo: 'radiant',
  sol: 'radiant', bestiario: 'metal', plaga: 'vine', marea: 'tide', forja: 'metal',
}

interface AttackTrailProps {
  readonly from: readonly [number, number]
  readonly to: readonly [number, number]
  readonly tone: string
  readonly faction?: FactionId
  readonly durationMs: number
  readonly melee: boolean
}

const vertexShader = `
  varying vec2 vUv;
  uniform float uProgress;
  uniform float uStyle;
  uniform float uRadius;
  void main() {
    vUv=uv;
    vec3 p=position;
    float taper=pow(1.0-clamp((uProgress-uv.x)/0.35,0.0,1.0),1.2);
    p-=normal*uRadius*(1.0-(0.1+0.9*taper));
    if(uStyle==2.0 || uStyle==6.0) p+=normal*sin(uv.x*35.0-uProgress*7.0)*0.018*taper;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
  }
`
const fragmentShader = `
  varying vec2 vUv;
  uniform float uProgress;
  uniform float uStyle;
  uniform vec3 uTone;
  void main() {
    float behind=uProgress-vUv.x;
    if(behind<0.0 || behind>0.35) discard;
    float tail=1.0-smoothstep(0.02,0.35,behind);
    float fade=1.0-smoothstep(0.87,1.0,uProgress);
    float strand=0.15+0.85*pow(0.5+0.5*cos(vUv.y*18.85+vUv.x*28.0),4.0);
    if(uStyle==0.0) strand*=0.7+0.22*sin(vUv.x*93.0-uProgress*40.0+sin(vUv.y*7.0+vUv.x*17.0)*3.0);
    if(uStyle==1.0 || uStyle==7.0) strand*=step(0.16,fract(vUv.x*21.0));
    if(uStyle==4.0) strand*=0.4+0.6*sin(vUv.x*45.0+vUv.y*12.56);
    if(uStyle==5.0) strand*=step(0.45,fract(sin(vUv.x*987.0+vUv.y*735.0)*1287.0));
    vec3 light=mix(uTone,uTone+vec3(0.3),pow(tail,7.0)*0.25);
    gl_FragColor=vec4(light,tail*fade*strand*0.9);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/** El rastro ocupa el camino recorrido, no un anillo que persigue a una bola.
 * La cabeza y la estela tienen material y ritmo propios, sin tapar el tablero. */
export function AttackTrail({ from, to, tone, faction, durationMs, melee }: AttackTrailProps) {
  const style = faction ? STYLES[faction] : 'radiant'
  const styleIndex = ['ember', 'crystal', 'vine', 'radiant', 'shadow', 'sand', 'tide', 'metal'].indexOf(style)
  const radius = style === 'tide' ? 0.075 : 0.055
  const [fromX, fromZ] = from
  const [toX, toZ] = to
  const start = useRef<number | null>(null)
  const head = useRef<Group>(null)
  const trail = useRef<ShaderMaterial>(null)
  const slash = useRef<Mesh>(null)
  const path = useMemo(() => {
    const dx = toX - fromX
    const dz = toZ - fromZ
    const length = Math.max(0.001, Math.hypot(dx, dz))
    const curl = style === 'metal' ? 0.65 : style === 'shadow' ? -1.6 : 1.6
    return new QuadraticBezierCurve3(
    // Con una cresta de 1 m, las cartas verticales ocultaban todo el viaje
    // al disparar por una columna. La trayectoria debe despejar sus siluetas.
    new Vector3(fromX, 0.95, fromZ),
    new Vector3((fromX + toX) / 2 - dz / length * curl, style === 'metal' ? 2.25 : 2.6, (fromZ + toZ) / 2 + dx / length * curl),
    new Vector3(toX, 0.85, toZ),
    )
  }, [fromX, fromZ, toX, toZ, style])
  const uniforms = useMemo(() => ({ uProgress: { value: 0 }, uStyle: { value: styleIndex }, uRadius: { value: radius }, uTone: { value: new Color(tone) } }), [styleIndex, tone, radius])
  const position = useMemo(() => new Vector3(), [])
  const tangent = useMemo(() => new Vector3(), [])
  useFrame(() => {
    if (start.current === null) start.current = performance.now()
    const progress = Math.min(1, (performance.now() - start.current) / Math.max(1, durationMs))
    // Carga y recuperación comparten el pulso de la embestida física.
    if (slash.current) {
      const pulse = Math.sin(Math.PI * Math.max(0, Math.min(1, (progress - 0.23) / 0.58)))
      ;(slash.current.material as MeshBasicMaterial).opacity = pulse * 0.85
      slash.current.scale.setScalar(0.65 + pulse * 0.55)
      slash.current.rotation.z = Math.atan2(to[1] - from[1], to[0] - from[0]) + progress * 0.7
    }
    const travel = Math.min(1, Math.max(0, (progress - 0.12) / 0.76))
    if (trail.current) trail.current.uniforms.uProgress!.value = travel
    if (head.current) {
      head.current.visible = travel > 0 && travel < 1
      path.getPoint(travel, position)
      path.getTangent(travel, tangent)
      head.current.position.copy(position)
      head.current.lookAt(tangent.add(position))
      head.current.scale.setScalar(Math.min(1, travel * 8) * (1 - Math.max(0, (travel - 0.88) / 0.12)))
    }
  })
  if (melee) return <mesh ref={slash} position={[to[0], 0.72, to[1]]} rotation={[0.65, 0, 0]}>
    <torusGeometry args={[0.36, 0.018, 3, 32, Math.PI * 1.35]} />
    <meshBasicMaterial color={tone} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
  </mesh>
  return <>
    <mesh>
      <tubeGeometry args={[path, 48, radius, 5, false]} />
      <shaderMaterial ref={trail} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}
        transparent depthWrite={false} side={DoubleSide} />
    </mesh>
    <group ref={head} scale={0}>
      {style === 'metal' ? <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.075, 0.34, 4]} />
        <meshStandardMaterial color="#c6a777" metalness={0.65} roughness={0.32} emissive={tone} emissiveIntensity={0.28} />
      </mesh> : style === 'crystal' ? <mesh scale={[0.085, 0.085, 0.2]}>
        <octahedronGeometry />
        <meshStandardMaterial color="#d9f3ff" metalness={0.25} roughness={0.16} emissive={tone} emissiveIntensity={1.2} />
      </mesh> : <sprite scale={[0.32, 0.42, 1]}>
        <spriteMaterial map={glowTexture(style === 'shadow' ? 'shadow' : style === 'ember' ? 'ember' : style === 'vine' ? 'nature' : style === 'radiant' || style === 'sand' ? 'gold' : 'arcane')}
          color={tone} transparent blending={AdditiveBlending} depthWrite={false} />
      </sprite>}
      <pointLight color={tone} intensity={2} distance={2.1} decay={2} />
    </group>
  </>
}
