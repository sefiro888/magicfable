import { TorusGeometry } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { stoneMaps } from '../../materials/stoneMaterial'
import { carvedGhatColumnGeometry, chhatriRoofGeometry, ghatTerraceGeometry, sacredWheelGeometry } from './wheelGeometry'
import { masonryBlockGeometry } from './stoneGeometry'

const molding = new TorusGeometry(1.25, 0.03, 6, 96)
const step = masonryBlockGeometry(17, 0.2, 0.58)
const hub = new TorusGeometry(0.24, 0.025, 6, 32)
const plinth = masonryBlockGeometry(3, 0.26, 0.78)
const wheelFoot = masonryBlockGeometry(3.1, 0.95, 1.1)

/** La rueda es piedra continua y las escaleras bajan
 * hacia el río; se reservan las caras amplias para leer desgaste y volumen. */
export function GhatArchitecture({ quality }: { readonly quality: GraphicsQuality }) {
  const stone = stoneMaps('sandstone')
  return <>
    <mesh name="ghat-stone-terrace" receiveShadow={quality !== 'low'}>
      <primitive object={ghatTerraceGeometry()} attach="geometry" />
      <meshStandardMaterial {...stone} color="#a7968d" bumpScale={0.024} roughness={0.9} />
    </mesh>
    {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[0, -0.3 - i * 0.2, -5.25 - i * 0.5]}
      geometry={step} receiveShadow={quality !== 'low'} castShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color={i % 2 ? '#b8a298' : '#b2a69b'} bumpScale={0.025} roughness={0.9} />
    </mesh>)}
    <mesh geometry={wheelFoot} position={[-6.15, -0.93, -3.5]} receiveShadow={quality !== 'low'} castShadow={quality !== 'low'}>
      <meshStandardMaterial {...stone} color="#9e8b80" roughness={0.94} bumpScale={0.03} />
    </mesh>
    <group position={[-6.15, 1.02, -3.5]} rotation={[0, 0.15, 0]}>
      <mesh name="samsara-sacred-wheel" castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <primitive object={sacredWheelGeometry()} attach="geometry" />
        <meshStandardMaterial {...stone} color="#b9a599" bumpScale={0.025} roughness={0.88} />
      </mesh>
      <mesh geometry={molding} position={[0, 0, 0.16]}><meshStandardMaterial {...stone} color="#d6b99e" roughness={0.83} bumpScale={0.016} /></mesh>
      <mesh geometry={hub} position={[0, 0, 0.16]}><meshStandardMaterial {...stone} color="#d6b99e" roughness={0.83} bumpScale={0.016} /></mesh>
      <mesh geometry={plinth} position={[0, -1.44, 0]} castShadow={quality !== 'low'}><meshStandardMaterial {...stone} color="#9e8b80" roughness={0.9} bumpScale={0.024} /></mesh>
      {Array.from({ length: 24 }, (_, i) => {
        const a = i / 24 * Math.PI * 2
        return <mesh key={i} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0.2]} rotation={[0, 0, a]} scale={[0.06, 0.13, 0.025]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial {...stone} color="#cbb19a" roughness={0.85} />
        </mesh>
      })}
    </group>
    <group position={[6.15, -0.5, -3.6]}>
      <mesh position={[0, -0.45, 0]} receiveShadow={quality !== 'low'} castShadow={quality !== 'low'}>
        <cylinderGeometry args={[1.18, 1.26, 1, 8]} />
        <meshStandardMaterial {...stone} color="#9e8b80" roughness={0.94} bumpScale={0.03} />
      </mesh>
      <mesh position={[0, 0.07, 0]} receiveShadow={quality !== 'low'}><cylinderGeometry args={[1.14, 1.2, 0.22, 8]} /><meshStandardMaterial {...stone} color="#a9978c" roughness={0.9} bumpScale={0.025} /></mesh>
      {[-0.58, 0.58].flatMap((x) => [-0.58, 0.58].map((z) => <mesh key={`${x}:${z}`} position={[x, 0.18, z]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <primitive object={carvedGhatColumnGeometry()} attach="geometry" />
        <meshStandardMaterial {...stone} color="#b6a194" roughness={0.84} bumpScale={0.025} />
      </mesh>))}
      <mesh name="ghat-chhatri-roof" position={[0, 1.8, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <primitive object={chhatriRoofGeometry()} attach="geometry" />
        <meshStandardMaterial {...stone} color="#a9988e" roughness={0.83} bumpScale={0.025} />
      </mesh>
    </group>
  </>
}
