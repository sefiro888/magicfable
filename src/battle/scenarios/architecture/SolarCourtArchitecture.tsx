import type { GraphicsQuality } from '../../../store/preferences'
import { solarReliefMaps } from '../../materials/solarRelief'
import { stoneMaps } from '../../materials/stoneMaterial'
import { CourtyardGround } from './CourtyardGround'
import { jadeTerraceGeometry } from './jadeGeometry'
import { masonryBlockGeometry } from './stoneGeometry'
import { SolarCalendarCarving, SolarPortalTrim, SolarVessel } from './SolarCarvings'
import { solarShrineGeometry } from './solarCourtGeometry'

const shrineRoof = masonryBlockGeometry(2.5, 0.2, 2.05)
const shrineBase = masonryBlockGeometry(6.1, 0.35, 3.2)
const stair = masonryBlockGeometry(4.45, 0.16, 0.38)
const ledge = masonryBlockGeometry(2.38, 0.13, 1.96)
const calendarBase = masonryBlockGeometry(2.8, 0.35, 1)
const wing = masonryBlockGeometry(0.75, 0.8, 3.2)
const crest = masonryBlockGeometry(0.16, 0.32, 0.18)
const jamb = masonryBlockGeometry(0.15, 1.08, 0.14)

/** Templos gemelos, estuco y mosaico mantienen el
 * recinto solar vivo; no reutilizar lava ni ruinas de selva para Quinto Sol. */
export function SolarCourtArchitecture({ quality }: { readonly quality: GraphicsQuality }) {
  const limestone = stoneMaps('limestone'), basalt = stoneMaps('basalt')
  return <>
    <CourtyardGround paved quality={quality} finish="limestone" tint="#c3b8a1" />
    <mesh name="solar-stucco-terrace" receiveShadow={quality !== 'low'}>
      <primitive object={jadeTerraceGeometry()} attach="geometry" />
      <meshStandardMaterial {...limestone} color="#bdb29b" bumpScale={0.018} roughness={0.88} />
    </mesh>
    <group position={[0, -0.3, -5.8]}>
      <mesh geometry={shrineBase} position={[0, 0.59, 0]} receiveShadow={quality !== 'low'} castShadow={quality !== 'low'}>
        <meshStandardMaterial {...basalt} color="#8c8980" bumpScale={0.025} roughness={0.9} />
      </mesh>
      {[-2.65, 2.65].map((x) => <mesh key={x} geometry={wing} position={[x, 0.2, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <meshStandardMaterial {...limestone} color="#b1a58e" roughness={0.9} bumpScale={0.025} />
      </mesh>)}
      {Array.from({ length: 7 }, (_, i) => <mesh key={i} geometry={stair} position={[0, -0.05 + i * 0.12, 2.05 - i * 0.28]} receiveShadow={quality !== 'low'} castShadow={quality !== 'low'}>
        <meshStandardMaterial {...limestone} color="#b8ab93" bumpScale={0.02} roughness={0.9} />
      </mesh>)}
      {[-1.45, 1.45].map((x) => <group key={x} position={[x, 0.8, -0.2]}>
        <mesh name={`solar-shrine-${x}`} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
          <primitive object={solarShrineGeometry()} attach="geometry" />
          <meshStandardMaterial {...limestone} color="#d2c6ad" bumpScale={0.018} roughness={0.86} />
        </mesh>
        <SolarPortalTrim quality={quality} />
        <mesh position={[0, 0.51, -0.8]}><planeGeometry args={[0.7, 1.03]} /><meshStandardMaterial color="#1e2526" roughness={1} /></mesh>
        {[-0.42, 0.42].map((edge) => <mesh key={edge} geometry={jamb} position={[edge, 0.53, 0.91]} castShadow={quality !== 'low'}>
          <meshStandardMaterial {...limestone} color="#53867d" roughness={0.7} bumpScale={0.018} />
        </mesh>)}
        <mesh geometry={shrineRoof} position={[0, 1.58, 0]} castShadow={quality !== 'low'}>
          <meshStandardMaterial {...basalt} color="#918d7d" bumpScale={0.022} roughness={0.84} />
        </mesh>
        {[0, 1].map((i) => <mesh key={i} geometry={ledge} position={[0, 1.28 + i * 0.16, 0.02]} castShadow={quality !== 'low'}>
          <meshStandardMaterial {...limestone} color={i ? '#9b3931' : '#397f7a'} roughness={0.8} bumpScale={0.015} />
        </mesh>)}
        {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-0.96 + i * 0.24, 1.43, 1.02]}>
          <boxGeometry args={[0.13, 0.1, 0.035]} />
          <meshStandardMaterial color={i % 2 ? '#bcac7f' : '#317f7b'} roughness={0.65} />
        </mesh>)}
        {Array.from({ length: 9 }, (_, i) => <mesh key={`crest:${i}`} geometry={crest} position={[-0.96 + i * 0.24, 1.82, -0.14]} castShadow={quality !== 'low'}>
          <meshStandardMaterial {...limestone} color={i % 2 ? '#c6bda6' : '#b6aa91'} roughness={0.77} bumpScale={0.015} />
        </mesh>)}
      </group>)}
    </group>
    <group position={[-6.15, 1.04, -3.5]} rotation={[0, 0.15, 0]}>
      <mesh name="solar-calendar-relief" rotation={[Math.PI / 2, 0, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <cylinderGeometry args={[1.26, 1.26, 0.24, quality === 'low' ? 48 : 96]} />
        <meshStandardMaterial {...solarReliefMaps()} color="#f4eee0" bumpScale={0.09} roughness={0.85} />
      </mesh>
      <SolarCalendarCarving quality={quality} />
      <mesh geometry={calendarBase} position={[0, -1.4, 0]} castShadow={quality !== 'low'}>
        <meshStandardMaterial {...basalt} color="#78786e" roughness={0.9} bumpScale={0.025} />
      </mesh>
    </group>
    <SolarVessel quality={quality} />
  </>
}
