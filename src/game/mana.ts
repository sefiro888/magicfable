import { FACTION_IDS } from './types';
import type { FactionId, ManaCost, PaymentPlan, ResourceState } from './types';

export interface ManaPoolSummary {
  readonly available: number;
  readonly total: number;
  readonly exhausted: number;
  readonly byFaction: Readonly<Record<FactionId, { readonly available: number; readonly total: number }>>;
}

export interface ManaPaymentResult {
  readonly plan: PaymentPlan;
  readonly resources: readonly ResourceState[];
}

export const summarizeMana = (resources: readonly ResourceState[]): ManaPoolSummary => {
  const byFaction = Object.fromEntries(
    FACTION_IDS.map((faction) => [faction, { available: 0, total: 0 }]),
  ) as Record<FactionId, { available: number; total: number }>;
  for (const resource of resources) {
    const current = byFaction[resource.faction];
    current.total += 1;
    if (!resource.exhausted) current.available += 1;
  }
  const available = resources.filter((resource) => !resource.exhausted).length;
  return {
    available,
    total: resources.length,
    exhausted: resources.length - available,
    byFaction,
  };
};

export const planManaPayment = (
  resources: readonly ResourceState[],
  cost: ManaCost,
): PaymentPlan => {
  const available = resources.filter((resource) => !resource.exhausted);
  const selected = new Set<string>();
  const missingColored: Partial<Record<FactionId, number>> = {};

  for (const faction of FACTION_IDS) {
    const required = cost.colored[faction] ?? 0;
    const candidates = available.filter(
      (resource) => resource.faction === faction && !selected.has(resource.instanceId),
    );
    for (const resource of candidates.slice(0, required)) selected.add(resource.instanceId);
    if (candidates.length < required) missingColored[faction] = required - candidates.length;
  }

  const genericCandidates = available.filter((resource) => !selected.has(resource.instanceId));
  for (const resource of genericCandidates.slice(0, cost.generic)) selected.add(resource.instanceId);
  const missingGeneric = Math.max(0, cost.generic - genericCandidates.length);
  return {
    payable: missingGeneric === 0 && Object.keys(missingColored).length === 0,
    resourceIds: [...selected],
    missingGeneric,
    missingColored,
  };
};

export const payMana = (
  resources: readonly ResourceState[],
  cost: ManaCost,
): ManaPaymentResult => {
  const plan = planManaPayment(resources, cost);
  if (!plan.payable) return { plan, resources };
  const spent = new Set(plan.resourceIds);
  return {
    plan,
    resources: resources.map((resource) =>
      spent.has(resource.instanceId) ? { ...resource, exhausted: true } : resource,
    ),
  };
};

export const restoreMana = (resources: readonly ResourceState[]): readonly ResourceState[] =>
  resources.map((resource) => (resource.exhausted ? { ...resource, exhausted: false } : resource));
