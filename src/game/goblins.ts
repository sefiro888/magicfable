import { deriveSeed, nextRandom } from './random';
import { CARD_BY_ID } from './cards';
import type { CardEffect, MatchState, PlayerId } from './types';

export type SparkFace = 'cara' | 'cruz';
export const sparkEffects = (effects: readonly CardEffect[], face: SparkFace): readonly CardEffect[] => {
  const result: CardEffect[] = [];
  let active = true;
  let matches = true;
  for (const effect of effects) {
    if (effect.kind === 'spark') { matches = face === effect.face; active = matches; }
    else if (effect.kind === 'otherwise') active = !matches;
    else if (effect.kind === 'always') active = true;
    else if (active) result.push(effect);
  }
  return result;
};
export interface SparkRoll {
  /** Las tiradas se conservan por separado: elegir entre dos no equivale a repetir hasta acertar. */
  readonly faces: readonly SparkFace[];
  readonly nextSeed: number;
}

/** La semilla devuelta debe guardarse con la partida antes de aplicar la cara
 * elegida; así las repeticiones y partidas contra la IA no tiran otra moneda. */
export const rollSpark = (seed: number, rollTwice: boolean): SparkRoll => {
  const first = nextRandom(seed);
  const faces: SparkFace[] = [first.value < 0.5 ? 'cara' : 'cruz'];
  if (!rollTwice) return { faces, nextSeed: first.state };
  const second = nextRandom(first.state);
  faces.push(second.value < 0.5 ? 'cara' : 'cruz');
  return { faces, nextSeed: second.state };
};

/** La elección solo puede referirse a una tirada ya realizada: ni el jugador
 * ni la IA pueden introducir una cara que no haya salido. */
export const chooseSparkFace = (roll: SparkRoll, choice: number): SparkFace | undefined =>
  Number.isInteger(choice) && choice >= 0 ? roll.faces[choice] : undefined;

/** La semilla de Chispa avanza una vez por resultado y no modifica la
 * semilla de creación del tablero. Varias fuentes de doble tirada no apilan. */
export const startSpark = (state: MatchState, owner: PlayerId): { readonly state: MatchState; readonly roll: SparkRoll } => {
  const player = state.players[owner];
  const commanderBonus = player.commanderId === 'bromuro-el-afortunado' && !player.sparkRolledThisTurn;
  const doubleAura = state.board.some((piece) => piece.owner === owner && !piece.statuses.some((status) => status.kind === 'silenced')
    && (piece.cardId === 'ingeniera-jefa' || piece.cardId === 'maquina-de-la-suerte'));
  const roll = rollSpark(state.sparkRandomState ?? deriveSeed(state.seed, 911), commanderBonus || doubleAura);
  return {
    roll,
    state: { ...state, sparkRandomState: roll.nextSeed, players: {
      ...state.players, [owner]: { ...player, sparkRolledThisTurn: true },
    } },
  };
};

/** El poder no debe reemplazar una concesión permanente por una temporal. */
export const grantPetardazoAll = (state: MatchState, owner: PlayerId): MatchState => ({
  ...state,
  board: state.board.map((piece) => piece.owner === owner && CARD_BY_ID[piece.cardId]?.type === 'unit'
    ? { ...piece, grantedPetardazo: piece.grantedPetardazo === 'permanent' ? 'permanent' : 'turn' }
    : piece),
});
