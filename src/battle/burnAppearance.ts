import { CARD_BY_ID, type AnimationEvent } from '../game'

const FIRE_EFFECT = /(^|[-_\s])(fire|flame|ember|magma|caldera|ash|cinder|slag|eruption|volcanic|heat|scorch|scorched|combust|lava|flare|burn|burning|commander-fury-power)([-_\s]|$)/
export const SCORCH_DURATION_MS = 8000

/** Una casilla abrasada es un resto del hechizo, no un estado de la unidad.
 * El papel solo se chamusca tras daño ígneo que atravesó las protecciones. */
export function isScorchImpact(event?: AnimationEvent): boolean {
  if (event?.type !== 'damage' || (event.amount ?? 0) <= 0) return false
  const card = event.cardId ? CARD_BY_ID[event.cardId] : undefined
  return FIRE_EFFECT.test(`${event.effectId ?? ''} ${card?.vfx.attackEffect ?? ''} ${card?.vfx.impactEffect ?? ''}`)
}

export function scorchAppearance(ageMs: number) {
  const age = Math.max(0, ageMs)
  return {
    embers: Math.max(0, 1 - age / 1500),
    char: Math.max(0, Math.min(1, 1 - (age - 1200) / (SCORCH_DURATION_MS - 1200))),
  }
}
