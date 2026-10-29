import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CARD_BY_ID, COMMANDER_BY_ID, decisionOptions, type GameAction, type MatchState } from '../../game';
import styles from '../BattlePage.module.css';

const descriptions = { formation: 'Concede Formación', move: 'Elige una unidad y su destino', sink: 'Elige una unidad para Canto', line: 'Elige la fila o columna' };

export function TacticalDialog({ match, onChoose }: { readonly match: MatchState; readonly onChoose: (action: GameAction) => void }) {
  const [selectedPiece, setSelectedPiece] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.querySelector<HTMLElement>('select,button')?.focus({ preventScroll: true });
    return () => previous?.focus({ preventScroll: true });
  }, []);
  const decision = match.pendingDecisions?.[0];
  if (!decision) return null;
  const options = decisionOptions(match, decision);
  const pieceIds = [...new Set(options.flatMap((option) => option.pieceId ? [option.pieceId] : []))];
  const pieceId = pieceIds.includes(selectedPiece) ? selectedPiece : pieceIds[0];
  const destinations = options.filter((option) => option.pieceId === pieceId && option.to);
  const destination = destinations.find((option) => `${option.to!.x},${option.to!.y}` === selectedDestination) ?? destinations[0];
  const line = options.find((option) => `${option.axis}-${option.index}` === selectedLine) ?? options[0];
  const sourceName = CARD_BY_ID[decision.sourceCardId]?.name ?? COMMANDER_BY_ID[decision.sourceCardId]?.name ?? 'Elección táctica';
  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.key !== 'Tab') return;
    const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('select,button:not(:disabled)') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === items.length - 1)) {
      event.preventDefault(); items[event.shiftKey ? items.length - 1 : 0]?.focus();
    }
  };
  return <div className={styles.resultBackdrop}>
    <section ref={dialog} className={styles.scry} role="dialog" aria-modal="true" aria-label="Elección táctica" onKeyDown={trapFocus}>
      <small>{sourceName}</small><h2>{descriptions[decision.kind]}</h2>
      {decision.remaining > 1 && <p>Puedes seleccionar hasta {decision.remaining} unidades distintas.</p>}
      {decision.kind === 'line' ? <label>Zona <select aria-label="Fila o columna" value={`${line?.axis}-${line?.index}`} onChange={(event) => setSelectedLine(event.target.value)}>
        {options.map((option) => <option key={`${option.axis}-${option.index}`} value={`${option.axis}-${option.index}`}>{option.axis === 'row' ? 'Fila' : 'Columna'} {(option.index ?? 0) + 1}</option>)}
      </select></label> : <label>Unidad <select aria-label="Unidad de la elección" value={pieceId ?? ''} onChange={(event) => setSelectedPiece(event.target.value)}>
        {pieceIds.map((id) => { const piece = match.board.find((unit) => unit.instanceId === id)!; return <option key={id} value={id}>{CARD_BY_ID[piece.cardId]?.name} · casilla {piece.position.x + 1}, {piece.position.y + 1}</option>; })}
      </select></label>}
      {decision.kind === 'move' && <label>Destino <select aria-label="Destino de la unidad" value={destination?.to ? `${destination.to.x},${destination.to.y}` : ''} onChange={(event) => setSelectedDestination(event.target.value)}>
        {destinations.map((option) => <option key={`${option.to!.x},${option.to!.y}`} value={`${option.to!.x},${option.to!.y}`}>Casilla {option.to!.x + 1}, {option.to!.y + 1}</option>)}
      </select></label>}
      <button className={styles.confirmMulligan} disabled={!options.length} onClick={() => onChoose({ type: 'resolve-choice', playerId: decision.owner, decisionId: decision.id,
        ...(decision.kind === 'line' ? line : decision.kind === 'move' ? destination : { pieceId }),
      })}>Confirmar selección</button>
      {(decision.optional || !options.length) && <button onClick={() => onChoose({ type: 'resolve-choice', playerId: decision.owner, decisionId: decision.id, skip: true })}>Continuar sin otra selección</button>}
    </section>
  </div>;
}
