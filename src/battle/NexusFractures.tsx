import { useMemo } from 'react'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }
`
const fragmentShader = `
  varying vec2 vUv;
  uniform float uDamage;
  void main() {
    float cell=floor(vUv.x*16.0);
    float seed=fract(sin(cell*12.9898+3.0)*43758.5453);
    float path=0.5+sin(vUv.y*22.0+cell*1.3)*0.12+sin(vUv.y*51.0+cell)*0.055;
    float d=abs(fract(vUv.x*16.0)-path);
    float fissure=1.0-smoothstep(0.012,0.045,d);
    float branches=1.0-smoothstep(0.008,0.026,abs(d-0.14+vUv.y*0.18));
    float exposed=smoothstep(seed*0.8,seed*0.8+0.12,uDamage);
    float lengthMask=1.0-smoothstep(0.3+uDamage*0.7,0.4+uDamage*0.7,vUv.y);
    float alpha=(fissure+branches*0.45)*exposed*lengthMask;
    if(alpha<0.02) discard;
    float critical=smoothstep(0.48,0.95,uDamage);
    vec3 color=mix(vec3(0.025,0.018,0.015),vec3(0.95,0.22,0.055),critical);
    gl_FragColor=vec4(color,alpha*0.95);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/**
 * Tres envolventes siguen exactamente las superficies del pedestal: las
 * fisuras no flotan como un aura. El margen radial de 0,003 evita z-fighting
 * sin ensanchar la silueta. La Vida solo controla el desgaste ya resuelto.
 */
export function NexusFractures({ damage }: { damage: number }) {
  const uniforms = useMemo(() => ({ uDamage: { value: Math.max(0, Math.min(1, damage)) } }), [damage])
  if (damage <= 0) return null
  return <>{[
    { y: 0.04, top: 0.983, bottom: 1.203, height: 0.221 },
    { y: 0.26, top: 0.623, bottom: 0.823, height: 0.301 },
    { y: 0.46, top: 0.743, bottom: 0.603, height: 0.121 },
  ].map((layer) => <mesh key={layer.y} position={[0, layer.y, 0]}>
    <cylinderGeometry args={[layer.top, layer.bottom, layer.height, 8, 1, true]} />
    <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} />
  </mesh>)}</>
}
