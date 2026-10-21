import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, DoubleSide, Vector4, type Mesh, type ShaderMaterial } from 'three'
import type { FactionId, Position } from '../game'
import { gridToWorldX, gridToWorldZ } from './grid/gridCoordinates'

// Ritmo geométrico, torsión, crecimiento orgánico y discontinuidad. Son
// vocabularios de material, no reglas: prismas, brotes, engranajes y umbrales
// conservan un trazado propio incluso al quitarles el color de facción.
const FORMS: Readonly<Record<FactionId, readonly [number, number, number, number]>> = {
  fury: [3, 0.7, 0, 1], arcane: [6, 0, 0, 0], nature: [5, 0.4, 1, 0],
  order: [4, 0, 0, 0], shadow: [2, -0.6, 0.4, 1], void: [2, 1.8, 0, 1],
  duna: [8, 0, 0, 1], fimbul: [4, -0.5, 0, 1], samsara: [8, 0.5, 0.5, 0],
  jade: [4, 0.2, 0.4, 0], olimpo: [6, -0.2, 0, 1], sol: [12, 0, 0, 1],
  bestiario: [3, -0.8, 1, 1], plaga: [5, -0.4, 1, 1], marea: [3, 1.2, 1, 0],
  forja: [12, 0, 0, 0],
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;
  uniform float uProgress;
  uniform vec3 uTone;
  uniform vec4 uForm;
  float stroke(float d,float width) {
    return 1.0-smoothstep(width,width+0.008,abs(d));
  }
  void main() {
    vec2 p=(vUv-0.5)*2.0;
    float r=length(p);
    float a=atan(p.y,p.x)+r*uForm.y;
    float t=uProgress;
    float reveal=smoothstep(0.0,0.18,t);
    float fade=1.0-smoothstep(0.58,1.0,t);
    float sweep=smoothstep(r-0.08,r+0.02,t*3.0);
    float outer=stroke(r-0.79,0.004)+stroke(r-0.75,0.003)*0.55;
    float inner=stroke(r-0.48,0.003)+stroke(r-0.45,0.002)*0.5;
    float sector=fract((a+3.141593)/6.283185*24.0);
    float ticks=stroke(sector-0.5,0.045)*step(0.65,r)*step(r,0.73);
    float orbit=stroke(r-0.60,0.005)*step(0.22,fract(a*1.90986+t*0.18));
    float facet=cos(a*uForm.x+t*uForm.y*0.3);
    float crest=stroke(r-(0.30+0.06*facet+uForm.z*0.025*sin(a*3.0+r*8.0)),0.006);
    crest*=mix(1.0,step(0.12,fract(a*uForm.x/6.283185)),uForm.w);
    float rays=stroke(sin(a*uForm.x),0.018)*step(0.34,r)*step(r,0.43);
    float inscription=stroke(fract(a*3.8197+r*6.0)-0.5,0.035)
      *step(0.52,r)*step(r,0.67)*step(0.3,fract(a*7.6394));
    float grain=fract(sin(dot(floor(vUv*280.0),vec2(12.9898,78.233)))*43758.5453);
    float etching=(outer+inner+ticks+orbit+crest+rays+inscription)*mix(0.65,1.0,grain);
    float wave=stroke(r-(0.22+t*0.85),0.012)*(1.0-t);
    float alpha=clamp((etching*0.8+wave*0.5)*reveal*fade*sweep,0.0,0.85);
    if(alpha<0.01) discard;
    vec3 color=mix(uTone,uTone*0.45+vec3(0.55),min(1.0,etching*0.45));
    gl_FragColor=vec4(color,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/**
 * Sello grabado por capas: el movimiento revela el trazado en vez de inflar
 * una columna opaca que tapa la carta. Un plano, sin luces ni texturas nuevas,
 * mantiene el coste estable incluso con varias invocaciones seguidas.
 */
export function RitualSeal({ cell, tone, durationMs, reducedMotion, faction = 'arcane', warmup = false }: {
  cell: Position; tone: string; durationMs: number; reducedMotion: boolean; faction?: FactionId; warmup?: boolean
}) {
  const mesh = useRef<Mesh>(null)
  const material = useRef<ShaderMaterial>(null)
  const warmupFrames = useRef(0)
  const start = useRef<number | null>(null)
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 }, uTone: { value: new Color(tone) }, uForm: { value: new Vector4(...FORMS[faction]) },
  }), [tone, faction])
  useFrame(() => {
    if (warmup) {
      // Dos dibujos completamente transparentes preparan el programa durante
      // la carga: la primera invocación no tiene que pagar la compilación del
      // shader. Después deja de emitir draw calls.
      if (mesh.current) mesh.current.visible = warmupFrames.current++ < 2
      return
    }
    if (!material.current || reducedMotion) return
    const now = performance.now()
    start.current ??= now
    material.current.uniforms.uProgress!.value = Math.min(1, (now - start.current) / Math.max(durationMs, 1))
  })
  if (reducedMotion) return null
  return <mesh ref={mesh} position={[gridToWorldX(cell.x), 0.105, gridToWorldZ(cell.y)]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[2.1, 2.1]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false} side={DoubleSide} />
  </mesh>
}
