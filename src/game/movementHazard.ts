import { CARD_BY_ID } from './cards';
import { applyAction } from './engine';
import { formationActive, hasFormation } from './tercios';
import type { MatchState, PlayerId, Position } from './types';

export interface MovementHealthLoss {
  readonly pieceId: string;
  readonly name: string;
  readonly amount: number;
  readonly dies: boolean;
  readonly losesFormation: boolean;
}
export interface MovementHazard {
  readonly position: Position;
  readonly losses: readonly MovementHealthLoss[];
  readonly movingPieceDies: boolean;
  readonly deaths: number;
}

/** Un movimiento legal puede romper Formación y quitar Vida a la que se
 * mueve o a sus vecinas. Ensayar la acción real respeta Farnesio, las auras
 * y las caídas en cadena, sin inventar daño de lava ni consumir la partida. */
export const previewMovementHazard = (state: MatchState, playerId: PlayerId, pieceId: string, to: Position): MovementHazard | undefined => {
  const result = applyAction({ ...state, animations: [] }, { type: 'move', playerId, pieceId, to });
  if (!result.ok) return undefined;
  const losses: MovementHealthLoss[] = [];
  for (const before of state.board) {
    if (before.owner !== playerId) continue;
    const after = result.state.board.find((piece) => piece.instanceId === before.instanceId);
    const amount = Math.max(0, before.currentHealth - (after?.currentHealth ?? 0));
    if (!amount) continue;
    losses.push({ pieceId: before.instanceId, name: CARD_BY_ID[before.cardId]?.name ?? 'Unidad aliada', amount,
      dies: !after,
      losesFormation: hasFormation(before) && formationActive(state, before)
        && (!after || !formationActive(result.state, after)),
    });
  }
  if (!losses.length) return undefined;
  return { position: to, losses, movingPieceDies: losses.some((loss) => loss.pieceId === pieceId && loss.dies),
    deaths: losses.filter((loss) => loss.dies).length };
};
