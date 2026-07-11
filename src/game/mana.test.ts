import { describe, expect, it } from 'vitest';
import { payMana, planManaPayment, restoreMana, summarizeMana } from './mana';
import { shuffleSeeded } from './random';
import type { ResourceState } from './types';

const resource = (id: string, faction: ResourceState['faction'], exhausted = false): ResourceState => ({
  instanceId: id,
  cardId: `fuente-${faction}`,
  faction,
  exhausted,
});

describe('azar reproducible', () => {
  it('baraja de forma determinista sin mutar la entrada', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...original];
    expect(shuffleSeeded(original, 817)).toEqual(shuffleSeeded(original, 817));
    expect(shuffleSeeded(original, 817)).not.toEqual(shuffleSeeded(original, 818));
    expect(original).toEqual(copy);
  });
});

describe('pago de maná', () => {
  it('reserva primero el color obligatorio y paga lo genérico con el resto', () => {
    const resources = [resource('f1', 'fury'), resource('f2', 'fury'), resource('a1', 'arcane')];
    const plan = planManaPayment(resources, { generic: 1, colored: { fury: 2 } });
    expect(plan).toEqual({ payable: true, resourceIds: ['f1', 'f2', 'a1'], missingGeneric: 0, missingColored: {} });
    const paid = payMana(resources, { generic: 1, colored: { fury: 2 } });
    expect(paid.resources.every((entry) => entry.exhausted)).toBe(true);
    expect(resources.every((entry) => !entry.exhausted)).toBe(true);
  });

  it('no permite sustituir un requisito de color por fuentes de otro color', () => {
    const plan = planManaPayment(
      [resource('a1', 'arcane'), resource('a2', 'arcane'), resource('a3', 'arcane')],
      { generic: 1, colored: { fury: 1 } },
    );
    expect(plan.payable).toBe(false);
    expect(plan.missingColored).toEqual({ fury: 1 });
    expect(plan.missingGeneric).toBe(0);
  });

  it('ignora fuentes agotadas y no altera nada cuando el pago falla', () => {
    const resources = [resource('f1', 'fury', true), resource('f2', 'fury')];
    const result = payMana(resources, { generic: 0, colored: { fury: 2 } });
    expect(result.plan.payable).toBe(false);
    expect(result.resources).toBe(resources);
  });

  it('resume y restaura las fuentes al inicio del turno', () => {
    const resources = [resource('f1', 'fury', true), resource('f2', 'fury'), resource('a1', 'arcane', true)];
    expect(summarizeMana(resources)).toMatchObject({ available: 1, total: 3, exhausted: 2 });
    expect(summarizeMana(resources).byFaction.fury).toEqual({ available: 1, total: 2 });
    expect(restoreMana(resources).every((entry) => !entry.exhausted)).toBe(true);
  });
});
