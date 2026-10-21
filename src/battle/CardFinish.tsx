import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BoxGeometry, Color, DoubleSide, ExtrudeGeometry, MeshStandardMaterial, Path, Shape, Vector2, type ShaderMaterial } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { boardTileRoughness, masonryTexture } from './textures'

// La ventana queda abierta: una placa completa con brillo sobre el arte
// lavaba las ilustraciones y hacía indistinguibles cartas de facciones distintas.
const frameShape = () => {
  const shape = new Shape()
  shape.moveTo(-0.395, -0.51)
  shape.lineTo(0.395, -0.51)
  shape.lineTo(0.415, -0.49)
  shape.lineTo(0.415, 0.49)
  shape.lineTo(0.395, 0.51)
  shape.lineTo(-0.395, 0.51)
  shape.lineTo(-0.415, 0.49)
  shape.lineTo(-0.415, -0.49)
  shape.closePath()
  const hole = new Path()
  hole.moveTo(-0.367, -0.452)
  hole.lineTo(-0.367, 0.452)
  hole.lineTo(0.367, 0.452)
  hole.lineTo(0.367, -0.452)
  hole.closePath()
  shape.holes.push(hole)
  return shape
}

// Compartido por todas las cartas: dos draw calls por ficha y ninguna
// geometría por remache, para que un tablero lleno conserve el rendimiento.
const trimGeometry = new ExtrudeGeometry(frameShape(), {
  depth: 0.006, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.004,
  bevelSegments: 2, steps: 1, curveSegments: 1,
})

const assembledFrame = (unique: boolean) => {
  const corners = [-1, 1].flatMap((x) => [-1, 1].map((y) => {
    const width = unique ? 0.041 : 0.026
    return new BoxGeometry(width, width, 0.012).toNonIndexed()
      .rotateZ(Math.PI / 4).translate(x * 0.389, y * 0.477, 0.013)
  }))
  const merged = mergeGeometries([trimGeometry, ...corners])!
  corners.forEach((geometry) => geometry.dispose())
  return merged
}
const regularFrame = assembledFrame(false)
const uniqueFrame = assembledFrame(true)
const frameMaterials = new Map<string, MeshStandardMaterial>()

const frameMaterial = (mine: boolean, structure: boolean) => {
  const key = `${mine}-${structure}`
  let material = frameMaterials.get(key)
  if (!material) {
    material = new MeshStandardMaterial({
      color: mine ? '#bc995f' : '#a36e60', metalness: 0.04,
      roughness: structure ? 0.66 : 0.42, roughnessMap: boardTileRoughness('forge', 0),
    })
    frameMaterials.set(key, material)
  }
  return material
}

export function CardFrameTrim({ mine, unique, structure }: { mine: boolean; unique: boolean; structure: boolean }) {
  return <group dispose={null}>
    {[1, -1].map((side) => <group key={side} position={[0, side * 0.037, 0]} rotation={[-side * Math.PI / 2, 0, 0]}>
      <mesh geometry={unique ? uniqueFrame : regularFrame} material={frameMaterial(mine, structure)} castShadow receiveShadow />
    </group>)}
  </group>
}

const plinthPoints = [
  [-0.4, -0.2], [0.4, -0.2], [0.46, -0.14], [0.46, 0.14],
  [0.4, 0.2], [-0.4, 0.2], [-0.46, 0.14], [-0.46, -0.14],
] as const
const plinthShape = (rim: boolean) => {
  const shape = new Shape(plinthPoints.map(([x, y]) => new Vector2(x, y)))
  if (rim) shape.holes.push(new Path(plinthPoints.map(([x, y]) => new Vector2(x * 0.9, y * 0.73)).reverse()))
  return shape
}
const plinthBody = new ExtrudeGeometry(plinthShape(false), {
  depth: 0.075, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2, steps: 1,
})
const plinthRim = new ExtrudeGeometry(plinthShape(true), {
  depth: 0.009, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 1, steps: 1,
})

/** Una estructura queda anclada a un zócalo tallado; conserva su carta entera. */
export function CardPlinth({ mine }: { mine: boolean }) {
  const key = `plinth-${mine}`
  let material = frameMaterials.get(key)
  if (!material) {
    material = new MeshStandardMaterial({ color: mine ? '#554938' : '#393d48', map: masonryTexture(), roughness: 0.88, metalness: 0.03 })
    frameMaterials.set(key, material)
  }
  return <group position={[0, -0.075, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
    <mesh geometry={plinthBody} material={material} castShadow receiveShadow dispose={null} />
    <mesh geometry={plinthRim} position={[0, 0, 0.082]} castShadow receiveShadow dispose={null}
      material={frameMaterial(mine, true)} />
  </group>
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;
  uniform float uDamage;
  uniform float uFrozen;
  uniform float uInfected;
  uniform float uTime;
  uniform vec3 uFrost;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
               mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
  }
  void main() {
    vec2 uv = vUv;
    float edge = min(min(uv.x,1.0-uv.x), min(uv.y,1.0-uv.y));
    float grain = noise(uv*95.0);
    float border = 1.0-smoothstep(0.015,0.12,edge);
    float chips = step(0.67,noise(uv*48.0))*border*uDamage;
    float fracture = abs(uv.x - (0.12 + uv.y*0.22 + noise(vec2(uv.y*22.0,4.0))*0.022));
    float crack = (1.0-smoothstep(0.001,0.005,fracture))*uDamage*0.75;
    float frost = uFrozen*(1.0-smoothstep(0.025,0.19,edge + noise(uv*22.0)*0.055));
    float crystals = step(0.72,noise(uv*75.0))*frost;
    float veins = 1.0-smoothstep(0.025,0.09,abs(noise(uv*18.0)-0.5));
    float infection = uInfected*border*veins*(0.65+sin(uTime*0.7)*0.08);
    vec3 color = mix(vec3(0.08,0.055,0.04),uFrost,clamp(frost+crystals,0.0,1.0));
    color = mix(color,vec3(0.37,0.54,0.12),infection);
    color += crystals*0.22+grain*frost*0.13;
    float alpha = clamp(chips*0.65+crack+frost*0.65+infection*0.8,0.0,0.88);
    if(alpha<0.01) discard;
    gl_FragColor = vec4(color,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function CardSurfaceWear({ damage, frozen, infected, reducedMotion }: {
  damage: number; frozen: boolean; infected: boolean; reducedMotion: boolean
}) {
  const materials = useRef<(ShaderMaterial | null)[]>([])
  const uniforms = useMemo(() => ({
    uDamage: { value: Math.max(0, Math.min(1, damage)) }, uFrozen: { value: frozen ? 1 : 0 },
    uInfected: { value: infected ? 1 : 0 }, uTime: { value: 0 }, uFrost: { value: new Color('#a7d6e5') },
  }), [damage, frozen, infected])
  useFrame(({ clock }) => {
    for (const material of materials.current) {
      if (material) material.uniforms.uTime!.value = reducedMotion ? 0 : clock.elapsedTime
    }
  })
  if (damage <= 0 && !frozen && !infected) return null
  return <>{[1, -1].map((side, index) => <mesh key={side} position={[0, side * 0.057, 0]} rotation={[-Math.PI / 2, side > 0 ? 0 : Math.PI, 0]}>
    <planeGeometry args={[0.816, 1.006]} />
    <shaderMaterial ref={(material) => { materials.current[index] = material }} uniforms={uniforms}
      vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} side={DoubleSide} />
  </mesh>)}</>
}

const wardVertex = `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vec4 positionInView = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = -positionInView.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * positionInView;
  }
`
const wardFragment = `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  uniform float uStrength;
  uniform float uTime;
  void main() {
    float rim = pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),2.8);
    vec2 cell = vUv*vec2(18.0,10.0);
    cell.x += mod(floor(cell.y),2.0)*0.5;
    vec2 tile = abs(fract(cell)-0.5);
    float facets = smoothstep(0.46,0.49,max(tile.x,tile.y));
    float sweep = pow(max(0.0,sin(vUv.y*16.0-uTime*0.8)),18.0);
    float alpha = rim*(0.28+uStrength*0.035)+facets*0.07+sweep*rim*0.18;
    vec3 color = mix(vec3(0.12,0.43,0.58),vec3(0.68,0.89,0.96),rim);
    gl_FragColor = vec4(color,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function CardWard({ strength, scale, reducedMotion }: { strength: number; scale: number; reducedMotion: boolean }) {
  const material = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uStrength: { value: Math.min(strength, 5) }, uTime: { value: 0 } }), [strength])
  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime!.value = reducedMotion ? 0 : clock.elapsedTime
  })
  return <mesh position={[0, 0.16, 0]} scale={scale}>
    <sphereGeometry args={[0.72, 24, 16]} />
    {/* El Fresnel concentra la luz en el borde: una esfera opaca azul tapaba
        el arte y se leía como plástico. El centro queda casi transparente. */}
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={wardVertex} fragmentShader={wardFragment}
      transparent depthWrite={false} side={DoubleSide} />
  </mesh>
}
