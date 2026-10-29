import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CARD_BY_ID, validSpellTargets, type GameAction, type MatchState } from '../../game';
import { sparkEffects, type SparkFace } from '../../game/goblins';
import { withBase } from '../../utils/assets';
import styles from '../BattlePage.module.css';

export function SparkDialog({ match, onChoose }: { readonly match: MatchState; readonly onChoose: (action: GameAction) => void }) {
  const pending = match.pendingSpark;
  const [face, setFace] = useState<SparkFace>(pending?.faces[0] ?? 'cara');
  const [selectedTarget, setSelectedTarget] = useState('');
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.querySelector<HTMLElement>('input,button')?.focus({ preventScroll: true });
    return () => previous?.focus({ preventScroll: true });
  }, []);
  if (!pending) return null;
  const instance = match.players[pending.owner].hand.find((card) => card.instanceId === pending.cardInstanceId);
  const card = instance ? CARD_BY_ID[instance.cardId] : undefined;
  if (!card) return null;
  const resolved = { ...card, effects: sparkEffects(card.effects, face) };
  const targets = card.type === 'instant' ? validSpellTargets(match, pending.owner, resolved) : [];
  const targetId = targets.find((piece) => piece.instanceId === selectedTarget)?.instanceId ?? targets[0]?.instanceId;
  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.key !== 'Tab') return;
    const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('input,select,button') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === items.length - 1)) {
      event.preventDefault();
      items[event.shiftKey ? items.length - 1 : 0]?.focus();
    }
  };
  return <div className={styles.resultBackdrop}>
    <section ref={dialog} className={`${styles.scry} ${styles.decisionDialog}`} role="dialog" aria-modal="true" aria-label="Resolver Chispa" onKeyDown={trapFocus}>
      <header className={styles.decisionHeader}>
        <img src={withBase(card.art.webp)} alt="" />
        <div><small>Chispa · {card.name}</small>
          <h2>{pending.faces.length > 1 ? 'Elige entre tus tiradas' : 'Resultado de la tirada'}</h2></div>
      </header>
      <p className={styles.decisionRules}>{card.rules}</p>
      <fieldset className={styles.sparkFaces}><legend>Resultado</legend>{[...new Set(pending.faces)].map((value) => <label key={value}>
        <input type="radio" name="spark-face" value={value} checked={face === value} onChange={() => setFace(value)} /> {value === 'cara' ? 'Cara' : 'Cruz'}
      </label>)}</fieldset>
      {targets.length > 0 && <label className={styles.decisionField}>Objetivo <select aria-label="Objetivo de Chispa" value={targetId} onChange={(event) => setSelectedTarget(event.target.value)}>
        {targets.map((piece) => <option key={piece.instanceId} value={piece.instanceId}>{CARD_BY_ID[piece.cardId]?.name} · casilla {piece.position.x + 1}, {piece.position.y + 1}</option>)}
      </select></label>}
      <div className={styles.decisionActions}><button className={styles.confirmMulligan} onClick={() => onChoose({ type: 'choose-spark', playerId: pending.owner, face, target: targetId ? { kind: 'piece', pieceId: targetId } : undefined })}>Resolver {face}</button></div>
    </section>
  </div>;
}
