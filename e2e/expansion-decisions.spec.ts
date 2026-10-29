import { expect, test } from '@playwright/test';
import { CARD_BY_ID, STARTER_DECKS, applyAction, createMatch, type BoardPiece, type MatchState } from '../src/game';

for (const faction of ['tercios', 'kalevala'] as const) {
  for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
    test(`${faction}: resuelve dos elecciones distintas a ${width} × ${height}`, async ({ page }) => {
      const deck = STARTER_DECKS.find((candidate) => candidate.faction === faction)!;
      const base = createMatch(deck, STARTER_DECKS[0]!, 42);
      const cardId = faction === 'tercios' ? 'maestre-de-campo' : 'canto-de-la-helada';
      const owner = faction === 'tercios' ? 'player' : 'ai';
      const board: BoardPiece[] = [3, 4].map((y, index) => ({
        instanceId: `unidad-${index}`, cardId: 'rodelero', owner, position: { x: 3, y },
        currentHealth: CARD_BY_ID.rodelero!.health!, attackModifier: 0, enteredOnTurn: 0,
        movedThisTurn: false, attackedThisTurn: false, statuses: [],
      }));
      const initial: MatchState = { ...base, board, terrain: [], players: { ...base.players, player: {
        ...base.players.player, mulliganTaken: true, hand: [{ instanceId: 'carta', cardId }],
        resources: Array.from({ length: 10 }, (_, index) => ({ instanceId: `r-${index}`, cardId: `fuente-${faction}`, faction, exhausted: false })),
      } } };
      const played = applyAction(initial, { type: 'play-card', playerId: 'player', cardInstanceId: 'carta', ...(faction === 'tercios' ? { position: { x: 3, y: 7 } } : {}) });
      expect(played.ok).toBe(true);
      await page.setViewportSize({ width, height });
      await page.addInitScript(({ match, deckId }) => {
        localStorage.setItem('cronicas-nexo-howto-visto', '1');
        localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: { selectedDeckId: deckId, muted: true, reducedMotion: true, graphicsQuality: 'medium', confirmEndTurn: false }, version: 7 }));
        localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: { match, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0 }, version: 2 }));
      }, { match: { ...played.state, animations: [] }, deckId: deck.id });
      await page.goto('/battle');
      const dialog = page.getByRole('dialog', { name: 'Elección táctica' });
      await expect(dialog).toBeVisible({ timeout: 25000 });
      await dialog.getByRole('combobox', { name: 'Unidad de la elección' }).selectOption('unidad-0');
      await page.screenshot({ path: `e2e/__shots__/${faction}-eleccion-${width}x${height}.png` });
      await dialog.getByRole('button', { name: 'Confirmar selección' }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('option[value="unidad-0"]')).toHaveCount(0);
      await dialog.getByRole('combobox', { name: 'Unidad de la elección' }).selectOption('unidad-1');
      await dialog.getByRole('button', { name: 'Confirmar selección' }).click();
      await expect(dialog).toBeHidden();
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cronicas-nexo-match')!).state.match as MatchState);
      expect(saved.pendingDecisions).toHaveLength(0);
      if (faction === 'tercios') expect(saved.board.filter((piece) => piece.grantedFormation)).toHaveLength(2);
      else expect(saved.sunkenUnits).toHaveLength(2);
    });
  }
}
