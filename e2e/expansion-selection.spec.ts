import { expect, test } from '@playwright/test';

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`las tres facciones nuevas presentan ilustraciones y permiten elegir mazo a ${width} × ${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/play');
    for (const name of ['El Gremio de la Chispa', 'El Cuadro de Picas', 'Los Cantores de Pohjola']) {
      const heading = page.getByRole('heading', { name, exact: true });
      const deck = heading.locator('..').locator('..');
      await heading.scrollIntoViewIfNeeded();
      const images = deck.locator('img');
      await expect(images).toHaveCount(3);
      await expect.poll(() => images.evaluateAll((elements) => elements.every((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await heading.click();
      await expect(deck.getByRole('button', { name: 'Entrar al tablero' })).toBeVisible();
      await expect(deck).toContainText('50');
      await expect(deck).toContainText('20');
      await deck.screenshot({ path: `e2e/__shots__/seleccion-${name.includes('Gremio') ? 'goblins' : name.includes('Cuadro') ? 'tercios' : 'kalevala'}-${width}x${height}.png` });
    }
  });
}
