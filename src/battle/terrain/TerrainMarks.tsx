import { memo } from 'react'

import {
  barkTexture,
  basaltTexture,
  forgeIronTexture,
  marbleTexture,
  monolithTexture,
  mossStoneTexture,
  packedSnowTexture,
  sandstoneTexture,
  type BoardTileStyle,
} from '../textures'
import { TILE_SIZE } from '../grid/gridCoordinates'
import type { Position } from '../../game/types'

/**
 * Obstáculos del tablero, uno por sitio.
 *
 * Antes había EXACTAMENTE dos objetos para las seis escenas: cuatro
 * icosaedros de mampostería para los escombros y una empalizada de cinco
 * estacas de madera para la cobertura. Lo único que cambiaba entre un sitio y
 * otro era el tinte, así que en el Fiordo se clavaban estacas de madera en el
 * hielo, en la Caldera ardía un parapeto de troncos encima de la lava y en la
 * Necrópolis se levantaba el mismo cercado de campaña que en el bosque. El
 * suelo, el cielo y la atmósfera ya eran propios de cada escena; el terreno
 * era lo último que seguía delatando que estaba pegado encima.
 *
 * Ahora cada estilo tiene su forma, su material y su textura:
 *
 * | escena     | escombro                   | cobertura                    |
 * |------------|----------------------------|------------------------------|
 * | stone      | tambores de columna rotos  | balaustrada de mármol        |
 * | basalt     | esquirlas con rescoldo     | baluarte de hierro forjado   |
 * | moss       | megalitos derribados       | muro de piedra seca          |
 * | sand       | sillares de arenisca       | tapia de adobe               |
 * | ice        | témpanos astillados        | cresta de presión            |
 * | forest     | rocas cubiertas de musgo   | tronco caído con zarzas      |
 *
 * Todas las piezas se generan a partir de la posición de la casilla, así que
 * dos obstáculos del mismo tipo nunca salen calcados, y el número de mallas
 * por casilla se mantiene donde estaba (entre 4 y 8) para no encarecer el
 * dibujado: hay varias de estas a la vez en pantalla toda la partida.
 */

/** Aspecto del terreno por escena: color, rugosidad y relleno de sombra. */
export const TERRAIN_LOOK: Readonly<
  Record<
    BoardTileStyle,
    {
      readonly rubble: string
      readonly cover: string
      readonly coverTop: string
      readonly emissive: string
      readonly rough: number
      readonly metal: number
    }
  >
> = {
  // Mármol de la propia plaza, con la veta cálida del amanecer.
  stone: { rubble: '#cfc3ad', cover: '#ddd0b6', coverTop: '#ece0c6', emissive: '#3a332a', rough: 0.82, metal: 0.04 },
  // Roca volcánica partida, con el rescoldo aún dentro.
  basalt: { rubble: '#57433f', cover: '#6b4f42', coverTop: '#7d5e4c', emissive: '#4a1c08', rough: 0.92, metal: 0.06 },
  // Piedra del santuario tomada por el musgo.
  moss: { rubble: '#7d8478', cover: '#6f7a63', coverTop: '#899471', emissive: '#26301f', rough: 0.96, metal: 0.03 },
  // Adobe y sillar de arenisca, del mismo color que el patio.
  sand: { rubble: '#c8ad7c', cover: '#c0a473', coverTop: '#d8bd88', emissive: '#4a3a1e', rough: 0.94, metal: 0.03 },
  // Bloques de hielo partido: claros, muy poco rugosos y sin emisivo cálido.
  ice: { rubble: '#a6c2d6', cover: '#9ab6cc', coverTop: '#c2d8e8', emissive: '#1e3242', rough: 0.28, metal: 0.02 },
  // Piedra del claro comida por el musgo, y madera de rama para el tronco.
  forest: { rubble: '#8a8a66', cover: '#6f5a3c', coverTop: '#87704b', emissive: '#22301c', rough: 0.97, metal: 0.02 },
}

type Look = (typeof TERRAIN_LOOK)[BoardTileStyle]

/** Ruido entero estable a partir de la casilla: mismo obstáculo, mismo dibujo. */
const seedOf = (position: Position, salt: number): number =>
  Math.abs(position.x * 73856093 + position.y * 19349663 + salt * 83492791) % 1000

/** Valor en [0,1) derivado de la semilla, para variar medidas sin azar real. */
const vary = (position: Position, salt: number): number => seedOf(position, salt) / 1000

// El parapeto se planta en el borde de la casilla que mira al rival, no en el
// centro: así deja sitio a la ficha y se lee como algo que la protege.
const COVER_Z = -TILE_SIZE * 0.3

// ---------------------------------------------------------------------------
// ESCOMBROS
// ---------------------------------------------------------------------------

/** Ciudadela: tambores de una columna acanalada, partidos y caídos. */
function ColumnDrums({ position, look }: { position: Position; look: Look }) {
  const marble = marbleTexture()
  return (
    <>
      {[0, 1, 2].map((index) => {
        const alto = 0.1 + vary(position, index) * 0.09
        const radio = 0.13 + vary(position, index + 30) * 0.04
        const angulo = vary(position, index + 60) * Math.PI * 2
        const dist = 0.1 + vary(position, index + 90) * 0.12
        // El tercero queda TUMBADO: una columna que se cae no se desmonta en
        // piezas de pie, y el contraste de ejes es lo que la hace legible.
        const tumbado = index === 2
        return (
          <mesh
            key={index}
            position={[Math.cos(angulo) * dist, tumbado ? radio : alto / 2, Math.sin(angulo) * dist]}
            rotation={tumbado ? [0, angulo, Math.PI / 2] : [0, angulo, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[radio, radio * 1.04, alto, 12]} />
            <meshStandardMaterial
              map={marble}
              bumpMap={marble}
              bumpScale={1.6}
              color={look.rubble}
              roughness={look.rough}
              metalness={look.metal}
              emissive={look.emissive}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}
    </>
  )
}

/** Caldera: esquirlas de basalto clavadas, con la junta al rojo por debajo. */
function BasaltShards({ position, look }: { position: Position; look: Look }) {
  const rock = basaltTexture()
  return (
    <>
      {[0, 1, 2, 3].map((index) => {
        const alto = 0.18 + vary(position, index) * 0.16
        const angulo = vary(position, index + 40) * Math.PI * 2
        const dist = 0.09 + vary(position, index + 70) * 0.13
        const ladeo = (vary(position, index + 100) - 0.5) * 0.5
        return (
          <mesh
            key={index}
            position={[Math.cos(angulo) * dist, alto / 2, Math.sin(angulo) * dist]}
            rotation={[ladeo, angulo, ladeo * 0.6]}
            castShadow
            receiveShadow
          >
            {/* Cuatro caras y no más: el basalto se rompe en prismas de
                aristas vivas, y una esquirla redondeada parecería un canto
                rodado, que es justo lo contrario. */}
            <coneGeometry args={[0.075 + vary(position, index + 130) * 0.03, alto, 4]} />
            <meshStandardMaterial
              map={rock}
              bumpMap={rock}
              bumpScale={2.4}
              color={look.rubble}
              roughness={look.rough}
              metalness={look.metal}
              emissive="#c23c08"
              emissiveIntensity={0.42}
              flatShading
            />
          </mesh>
        )
      })}
      {/* Rescoldo en el suelo, bajo las esquirlas: la piedra está recién
          partida y la grieta todavía no se ha enfriado. */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 14]} />
        <meshBasicMaterial color="#ff6a1e" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </>
  )
}

/** Santuario: fragmentos de un megalito derribado, con sus runas. */
function ToppledMegaliths({ position, look }: { position: Position; look: Look }) {
  return (
    <>
      {[0, 1, 2].map((index) => {
        const largo = 0.22 + vary(position, index) * 0.16
        const angulo = vary(position, index + 45) * Math.PI * 2
        const dist = 0.08 + vary(position, index + 85) * 0.12
        const grueso = 0.09 + vary(position, index + 125) * 0.04
        return (
          <mesh
            key={index}
            position={[Math.cos(angulo) * dist, grueso / 2, Math.sin(angulo) * dist]}
            rotation={[vary(position, index + 165) * 0.3, angulo, Math.PI / 2 + (vary(position, index + 205) - 0.5) * 0.4]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[grueso, largo, grueso * 0.8]} />
            <meshStandardMaterial
              map={monolithTexture(seedOf(position, index))}
              color={look.rubble}
              roughness={look.rough}
              metalness={look.metal}
              emissive={look.emissive}
              emissiveIntensity={0.34}
            />
          </mesh>
        )
      })}
    </>
  )
}

/** Necrópolis: sillares de arenisca desprendidos de la tapia. */
function SandstoneBlocks({ position, look }: { position: Position; look: Look }) {
  const stone = sandstoneTexture()
  return (
    <>
      {[0, 1, 2, 3].map((index) => {
        const ancho = 0.14 + vary(position, index) * 0.08
        const alto = 0.08 + vary(position, index + 35) * 0.07
        const angulo = vary(position, index + 75) * Math.PI * 2
        const dist = 0.08 + vary(position, index + 115) * 0.13
        return (
          <mesh
            key={index}
            position={[Math.cos(angulo) * dist, alto / 2, Math.sin(angulo) * dist]}
            rotation={[0, angulo, (vary(position, index + 155) - 0.5) * 0.24]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[ancho, alto, ancho * 0.72]} />
            <meshStandardMaterial
              map={stone}
              bumpMap={stone}
              bumpScale={2}
              color={look.rubble}
              roughness={look.rough}
              metalness={look.metal}
              emissive={look.emissive}
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}
    </>
  )
}

/** Fiordo: témpanos astillados, como los que levanta el hielo al romperse. */
function IceShards({ position, look }: { position: Position; look: Look }) {
  const snow = packedSnowTexture()
  return (
    <>
      {[0, 1, 2, 3].map((index) => {
        const alto = 0.16 + vary(position, index) * 0.15
        const angulo = vary(position, index + 50) * Math.PI * 2
        const dist = 0.08 + vary(position, index + 95) * 0.13
        const ladeo = (vary(position, index + 140) - 0.5) * 0.7
        return (
          <mesh
            key={index}
            position={[Math.cos(angulo) * dist, alto / 2, Math.sin(angulo) * dist]}
            rotation={[ladeo, angulo, ladeo * 0.8]}
            castShadow
            receiveShadow
          >
            {/* Placas finas, no bloques: el hielo de un lago se levanta en
                láminas cuando se parte. */}
            <boxGeometry args={[0.16 + vary(position, index + 180) * 0.07, alto, 0.045]} />
            <meshStandardMaterial
              map={snow}
              color={look.rubble}
              roughness={look.rough}
              metalness={look.metal}
              emissive="#3d6f8f"
              emissiveIntensity={0.3}
              flatShading
            />
          </mesh>
        )
      })}
    </>
  )
}

/** Claro: cantos rodados con la cara de arriba cubierta de musgo. */
function MossyBoulders({ position, look }: { position: Position; look: Look }) {
  const stone = mossStoneTexture()
  return (
    <>
      {[0, 1, 2].map((index) => {
        const radio = 0.11 + vary(position, index) * 0.07
        const angulo = vary(position, index + 55) * Math.PI * 2
        const dist = 0.07 + vary(position, index + 105) * 0.12
        return (
          <group key={index} position={[Math.cos(angulo) * dist, 0, Math.sin(angulo) * dist]} rotation={[0, angulo, 0]}>
            <mesh position={[0, radio * 0.78, 0]} scale={[1, 0.78, 0.88]} castShadow receiveShadow>
              <icosahedronGeometry args={[radio, 1] /* subdividido: un canto de río es REDONDO, no facetado */} />
              <meshStandardMaterial
                map={stone}
                bumpMap={stone}
                bumpScale={2.2}
                color={look.rubble}
                roughness={look.rough}
                metalness={look.metal}
                emissive={look.emissive}
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Casquete de musgo: solo arriba, que es donde le da la luz. */}
            <mesh position={[0, radio * 1.14, 0]} scale={[1, 0.42, 0.9]}>
              <sphereGeometry args={[radio * 0.82, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#5f7a3e" roughness={0.98} metalness={0} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// COBERTURA
// ---------------------------------------------------------------------------

/** Ciudadela: balaustrada de mármol con balaustres torneados. */
function MarbleBalustrade({ position, look }: { position: Position; look: Look }) {
  const marble = marbleTexture()
  const alto = 0.26 + vary(position, 11) * 0.05
  return (
    <group position={[0, 0, COVER_Z]}>
      {/* Zócalo y pasamanos: los dos cilindros van TUMBADOS, y para eso hace
          falta el giro de PI/2 en Z — en Three.js un cilindro nace vertical. */}
      {[0.02, alto].map((y, index) => (
        <mesh key={index} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.86, index === 1 ? 0.11 : 0.13]} />
          <meshStandardMaterial
            map={marble}
            color={look.coverTop}
            roughness={look.rough}
            metalness={look.metal}
            emissive={look.emissive}
            emissiveIntensity={0.28}
          />
        </mesh>
      ))}
      {[-0.3, -0.1, 0.1, 0.3].map((x) => (
        <group key={x} position={[x, 0.03, 0]}>
          <mesh position={[0, alto * 0.42, 0]} castShadow receiveShadow>
            {/* Cintura estrecha y base ancha: es lo que distingue un balaustre
                de un simple palo. */}
            <cylinderGeometry args={[0.032, 0.052, alto * 0.84, 8]} />
            <meshStandardMaterial
              map={marble}
              color={look.cover}
              roughness={look.rough}
              metalness={look.metal}
              emissive={look.emissive}
              emissiveIntensity={0.28}
            />
          </mesh>
          <mesh position={[0, alto * 0.62, 0]} castShadow>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial
              map={marble}
              color={look.coverTop}
              roughness={look.rough}
              metalness={look.metal}
              emissive={look.emissive}
              emissiveIntensity={0.28}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Caldera: baluarte de hierro forjado, aún caliente por abajo. */
function IronBulwark({ position, look }: { position: Position; look: Look }) {
  const iron = forgeIronTexture()
  const alto = 0.3 + vary(position, 3) * 0.05
  return (
    <group position={[0, 0, COVER_Z]}>
      <mesh position={[0, alto / 2, 0]} rotation={[0.06, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.82, alto, 0.05]} />
        <meshStandardMaterial
          map={iron}
          bumpMap={iron}
          bumpScale={2.6}
          color={look.cover}
          roughness={0.62}
          // Sin mapa de entorno el metal se apaga en vez de brillar, así que
          // el hierro se sugiere con rugosidad baja y rescoldo, no con
          // metalness: subirla dejaría la plancha negra.
          metalness={0.08}
          emissive="#8f2c06"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Postes que la clavan al suelo. */}
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} position={[x, alto * 0.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.035, 0.045, alto * 1.1, 6]} />
          <meshStandardMaterial
            map={iron}
            color={look.coverTop}
            roughness={0.66}
            metalness={0.08}
            emissive="#7a2404"
            emissiveIntensity={0.36}
          />
        </mesh>
      ))}
      {/* La base sigue al rojo: es lo que la ata a la colada de debajo. */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.86, 0.16]} />
        <meshBasicMaterial color="#ff7a24" transparent opacity={0.34} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Santuario: muro de piedra seca, sin argamasa, tomado por el musgo. */
function DrystoneWall({ position, look }: { position: Position; look: Look }) {
  const stone = mossStoneTexture()
  // Dos hiladas a rompejunta: la de arriba va desplazada media piedra, que es
  // como se traba un muro de verdad y lo que evita que parezca una rejilla.
  const hiladas = [
    { y: 0.055, offsets: [-0.32, -0.16, 0, 0.16, 0.32], alto: 0.11 },
    { y: 0.16, offsets: [-0.24, -0.08, 0.08, 0.24], alto: 0.1 },
  ]
  return (
    <group position={[0, 0, COVER_Z]}>
      {hiladas.map((hilada, fila) =>
        hilada.offsets.map((x, index) => (
          <mesh
            key={`${fila}-${x}`}
            position={[x, hilada.y, (vary(position, fila * 10 + index) - 0.5) * 0.03]}
            rotation={[0, (vary(position, fila * 10 + index + 200) - 0.5) * 0.3, (vary(position, fila * 10 + index + 300) - 0.5) * 0.12]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.15 + vary(position, fila * 10 + index + 400) * 0.04, hilada.alto, 0.11]} />
            <meshStandardMaterial
              map={stone}
              bumpMap={stone}
              bumpScale={2.4}
              color={fila === 1 ? look.coverTop : look.cover}
              roughness={look.rough}
              metalness={look.metal}
              emissive={look.emissive}
              emissiveIntensity={0.3}
              flatShading
            />
          </mesh>
        )),
      )}
    </group>
  )
}

/** Necrópolis: tapia de adobe con las hiladas marcadas y algún ladrillo caído. */
function AdobeWall({ position, look }: { position: Position; look: Look }) {
  const stone = sandstoneTexture()
  const alto = 0.29
  return (
    <group position={[0, 0, COVER_Z]}>
      <mesh position={[0, alto / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, alto, 0.1]} />
        <meshStandardMaterial
          map={stone}
          bumpMap={stone}
          bumpScale={3}
          color={look.cover}
          roughness={look.rough}
          metalness={look.metal}
          emissive={look.emissive}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Albardilla: el remate que protege la tapia de la lluvia. Sobresale a
          los dos lados, y ese vuelo es lo que da la sombra que la define. */}
      <mesh position={[0, alto + 0.028, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.86, 0.055, 0.14]} />
        <meshStandardMaterial
          map={stone}
          color={look.coverTop}
          roughness={look.rough}
          metalness={look.metal}
          emissive={look.emissive}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Mella en lo alto: una tapia de una necrópolis lleva siglos cayéndose. */}
      <mesh position={[0.22 + vary(position, 7) * 0.2, alto - 0.03, 0.055]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.06]} />
        <meshStandardMaterial map={stone} color={look.cover} roughness={look.rough} metalness={look.metal} />
      </mesh>
    </group>
  )
}

/** Fiordo: cresta de presión, las placas que el hielo levanta al comprimirse. */
function PressureRidge({ position, look }: { position: Position; look: Look }) {
  const snow = packedSnowTexture()
  return (
    <group position={[0, 0, COVER_Z]}>
      {[-0.26, -0.02, 0.24].map((x, index) => {
        const alto = 0.26 + vary(position, index) * 0.1
        // Las placas se apoyan UNAS EN OTRAS, inclinadas en direcciones
        // alternas: eso es lo que hace una cresta de presión y no una valla.
        const ladeo = (index % 2 === 0 ? 1 : -1) * (0.3 + vary(position, index + 20) * 0.16)
        return (
          <mesh
            key={x}
            position={[x, alto * 0.42, 0]}
            rotation={[0, (vary(position, index + 60) - 0.5) * 0.5, ladeo]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.3, alto, 0.06]} />
            <meshStandardMaterial
              map={snow}
              color={index === 1 ? look.coverTop : look.cover}
              roughness={look.rough}
              metalness={look.metal}
              emissive="#3d6f8f"
              emissiveIntensity={0.32}
              flatShading
            />
          </mesh>
        )
      })}
      {/* Nieve acumulada al pie, donde el viento la deja. */}
      <mesh position={[0, 0.03, 0.05]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[0.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dfeef8" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}

/** Claro: un tronco caído con sus muñones de rama y zarzas creciendo encima. */
function FallenLog({ position, look }: { position: Position; look: Look }) {
  const bark = barkTexture()
  const radio = 0.085
  return (
    <group position={[0, 0, COVER_Z]} rotation={[0, (vary(position, 9) - 0.5) * 0.3, 0]}>
      {/* El tronco: cilindro TUMBADO (giro de PI/2 en Z, si no saldría de pie). */}
      <mesh position={[0, radio + 0.01, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[radio, radio * 1.15, 0.86, 10]} />
        <meshStandardMaterial
          map={bark}
          bumpMap={bark}
          bumpScale={3.4}
          color={look.cover}
          roughness={look.rough}
          metalness={look.metal}
          emissive={look.emissive}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Muñones de rama cortados, que es lo que impide que parezca una tubería. */}
      {[-0.24, 0.06, 0.3].map((x, index) => (
        <mesh
          key={x}
          position={[x, radio + 0.07, (vary(position, index + 15) - 0.5) * 0.08]}
          rotation={[(vary(position, index + 25) - 0.5) * 0.8, 0, 0.5 + vary(position, index + 35) * 0.5]}
          castShadow
        >
          <cylinderGeometry args={[0.022, 0.03, 0.16 + vary(position, index + 45) * 0.1, 6]} />
          <meshStandardMaterial map={bark} color={look.coverTop} roughness={look.rough} metalness={look.metal} />
        </mesh>
      ))}
      {/* Zarzas: matas bajas que salen por delante del tronco. */}
      {[-0.3, -0.05, 0.22].map((x, index) => (
        <mesh key={`z${x}`} position={[x, 0.09, 0.07]} scale={[1, 0.9, 0.6]}>
          <icosahedronGeometry args={[0.075 + vary(position, index + 55) * 0.03, 0]} />
          <meshStandardMaterial color="#4e6b32" roughness={0.98} metalness={0} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------

/**
 * Marca del terreno de una casilla. El `memo` importa: hay varias de estas en
 * pantalla toda la partida y ninguna cambia salvo que cambie la escena.
 */
export const TerrainMarks = memo(function TerrainMarks({
  rubble,
  cover,
  position,
  terrainStyle,
}: {
  rubble: boolean
  cover: boolean
  position: Position
  terrainStyle: BoardTileStyle
}) {
  const look = TERRAIN_LOOK[terrainStyle]
  if (rubble) {
    return (
      <group position={[0, 0.06, 0]}>
        {terrainStyle === 'stone' ? (
          <ColumnDrums position={position} look={look} />
        ) : terrainStyle === 'basalt' ? (
          <BasaltShards position={position} look={look} />
        ) : terrainStyle === 'moss' ? (
          <ToppledMegaliths position={position} look={look} />
        ) : terrainStyle === 'sand' ? (
          <SandstoneBlocks position={position} look={look} />
        ) : terrainStyle === 'ice' ? (
          <IceShards position={position} look={look} />
        ) : (
          <MossyBoulders position={position} look={look} />
        )}
      </group>
    )
  }
  if (cover) {
    return (
      <group position={[0, 0.06, 0]}>
        {terrainStyle === 'stone' ? (
          <MarbleBalustrade position={position} look={look} />
        ) : terrainStyle === 'basalt' ? (
          <IronBulwark position={position} look={look} />
        ) : terrainStyle === 'moss' ? (
          <DrystoneWall position={position} look={look} />
        ) : terrainStyle === 'sand' ? (
          <AdobeWall position={position} look={look} />
        ) : terrainStyle === 'ice' ? (
          <PressureRidge position={position} look={look} />
        ) : (
          <FallenLog position={position} look={look} />
        )}
      </group>
    )
  }
  return null
})
