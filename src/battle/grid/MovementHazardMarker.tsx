import { Html } from '@react-three/drei';
import type { MovementHazard } from '../../game/movementHazard';
import { TILE_SIZE } from './gridCoordinates';
import styles from '../Board3D.module.css';

/** El aviso vive encima del material y del foco azul: las texturas, sombras
 * y modo sin animación no pueden borrar un destino que mata una unidad. */
export function MovementHazardMarker({ hazard, surfaceY }: { readonly hazard: MovementHazard; readonly surfaceY: number }) {
  const fatal = hazard.deaths > 0;
  const color = fatal ? '#ff4b40' : '#ffbd4a';
  const loss = hazard.losses.reduce((sum, piece) => sum + piece.amount, 0);
  return <group position={[0, surfaceY, 0]}>
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh raycast={() => null}>
        <planeGeometry args={[TILE_SIZE * .94, TILE_SIZE * .94]} />
        <meshBasicMaterial color={color} transparent opacity={fatal ? .65 : .4} toneMapped={false} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3].map((side) => <group key={side} rotation={[0, 0, side * Math.PI / 2]}>
        <mesh position={[0, TILE_SIZE * .45, .003]} renderOrder={30} raycast={() => null}>
          <planeGeometry args={[TILE_SIZE * .94, .045]} />
          <meshBasicMaterial color={color} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh position={[TILE_SIZE * .12, TILE_SIZE * .23, .004]} rotation={[0, 0, Math.PI / 3]} renderOrder={30} raycast={() => null}>
          <planeGeometry args={[TILE_SIZE * .35, .035]} />
          <meshBasicMaterial color={color} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
      </group>)}
    </group>
    <Html position={[TILE_SIZE * .36, .02, TILE_SIZE * .3]} distanceFactor={9.6} zIndexRange={[22, 15]} style={{ pointerEvents: 'none' }}>
      <span className={styles.cellHazard} data-testid="movement-hazard" data-cell={`${hazard.position.x},${hazard.position.y}`}
        data-fatal={fatal || undefined} role="img" aria-label={`${fatal ? 'Muerte al mover' : 'Pérdida de Vida al mover'}: ${loss} de Vida. Casilla ${hazard.position.x + 1}, ${hazard.position.y + 1}`}>
        {fatal ? '☠' : `⚠ −${loss}`}
      </span>
    </Html>
  </group>;
}
