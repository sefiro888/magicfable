import { ExtrudeGeometry, Shape, TorusGeometry } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { stoneMaps } from '../../materials/stoneMaterial'
import { masonryBlockGeometry } from './stoneGeometry'
import { solarVesselGeometry } from './solarCraftGeometry'

const rings = [1.185, 0.885, 0.385].map((radius, index) => new TorusGeometry(radius, index ? 0.012 : 0.023, 6, 96))
const petal = new Shape()
petal.moveTo(0, 0)
petal.bezierCurveTo(-0.09, 0.075, -0.075, 0.17, 0, 0.215)
petal.bezierCurveTo(0.075, 0.17, 0.09, 0.075, 0, 0)
const flower = new ExtrudeGeometry(petal, { depth: 0.025, bevelEnabled: true,
  bevelSize: 0.009, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 12 })
const narrowJamb = masonryBlockGeometry(0.075, 1.15, 0.11)
const wideJamb = masonryBlockGeometry(0.07, 1.22, 0.1)
const lintel = masonryBlockGeometry(1.36, 0.085, 0.13)
const sill = masonryBlockGeometry(1.43, 0.09, 0.23)

/** Relieve de espesor real: los cantos recogen la luz lateral y rompen la
 * lectura de una moneda impresa sin aumentar el tamaño del calendario. */
export function SolarCalendarCarving({ quality }: { readonly quality: GraphicsQuality }) {
  const stone = stoneMaps('limestone')
  return <group position={[0, 0, 0.147]}>
    {rings.map((geometry, i) => <mesh key={i} geometry={geometry} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color="#ded5bd" roughness={0.86} bumpScale={0.009} />
    </mesh>)}
    {[0, 1, 2, 3].map((i) => <mesh key={i} geometry={flower} rotation={[0, 0, i * Math.PI / 2]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color="#d5cbb0" roughness={0.89} bumpScale={0.009} />
    </mesh>)}
  </group>
}

export function SolarPortalTrim({ quality }: { readonly quality: GraphicsQuality }) {
  const stone = stoneMaps('limestone')
  return <>
    {[-1, 1].map((side) => <group key={side}>
      <mesh geometry={narrowJamb} position={[side * 0.54, 0.57, 0.945]} castShadow={quality !== 'low'}>
        <meshStandardMaterial {...stone} color="#d6c9ac" roughness={0.85} bumpScale={0.012} />
      </mesh>
      <mesh geometry={wideJamb} position={[side * 0.645, 0.6, 0.91]} castShadow={quality !== 'low'}>
        <meshStandardMaterial {...stone} color="#b6a991" roughness={0.87} bumpScale={0.012} />
      </mesh>
    </group>)}
    <mesh geometry={lintel} position={[0, 1.15, 0.96]} castShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color="#d6c9ac" roughness={0.85} bumpScale={0.012} />
    </mesh>
    <mesh geometry={sill} position={[0, 0.015, 0.94]} receiveShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color="#b9ad95" roughness={0.9} bumpScale={0.018} />
    </mesh>
  </>
}

export function SolarVessel({ quality }: { readonly quality: GraphicsQuality }) {
  const basalt = stoneMaps('basalt'), limestone = stoneMaps('limestone')
  return <group position={[6.1, -0.4, -3.6]}>
    <mesh position={[0, -0.05, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <cylinderGeometry args={[0.91, 0.96, 0.15, 12]} />
      <meshStandardMaterial {...basalt} color="#858983" roughness={0.91} bumpScale={0.021} />
    </mesh>
    <mesh position={[0, 0.15, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <cylinderGeometry args={[0.73, 0.87, 0.27, 12]} />
      <meshStandardMaterial {...basalt} color="#777d79" roughness={0.87} bumpScale={0.018} />
    </mesh>
    <mesh position={[0, 0.315, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <cylinderGeometry args={[0.79, 0.77, 0.09, 12]} />
      <meshStandardMaterial {...basalt} color="#95978b" roughness={0.85} bumpScale={0.014} />
    </mesh>
    <mesh position={[0, 0.36, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={solarVesselGeometry(quality === 'low')} attach="geometry" />
      <meshStandardMaterial {...limestone} color="#5d9c90" roughness={0.46} metalness={0.035} bumpScale={0.006} />
    </mesh>
  </group>
}
