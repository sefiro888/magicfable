export interface RandomStep {
  readonly state: number;
  readonly value: number;
}

const normalizeSeed = (seed: number): number => {
  const normalized = Math.trunc(seed) >>> 0;
  return normalized === 0 ? 0x6d2b79f5 : normalized;
};

/** A small deterministic PRNG step suitable for replayable matches (not cryptography). */
export const nextRandom = (seed: number): RandomStep => {
  let state = normalizeSeed(seed);
  state += 0x6d2b79f5;
  let mixed = state;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return { state: state >>> 0, value: ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296 };
};

export const shuffleSeeded = <T>(values: readonly T[], seed: number): T[] => {
  const shuffled = [...values];
  let state = seed;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const step = nextRandom(state);
    state = step.state;
    const swapIndex = Math.floor(step.value * (index + 1));
    const current = shuffled[index] as T;
    shuffled[index] = shuffled[swapIndex] as T;
    shuffled[swapIndex] = current;
  }
  return shuffled;
};

export const deriveSeed = (seed: number, salt: number): number => {
  let value = normalizeSeed(seed) ^ Math.imul(salt + 1, 0x9e3779b1);
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b);
  value ^= value >>> 13;
  return value >>> 0;
};
