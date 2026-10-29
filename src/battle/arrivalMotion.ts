import type { FactionId } from '../game'

type ArrivalStyle = 'weight' | 'growth' | 'veil' | 'tide'
const STYLES: Readonly<Record<FactionId, ArrivalStyle>> = {
  fury: 'weight', arcane: 'veil', nature: 'growth', order: 'weight',
  shadow: 'veil', void: 'veil', duna: 'weight', fimbul: 'weight',
  samsara: 'growth', jade: 'growth', olimpo: 'weight', sol: 'weight',
  bestiario: 'growth', plaga: 'growth', marea: 'tide', forja: 'weight',
  goblins: 'weight', tercios: 'weight', kalevala: 'veil',
}

/** El sello abre primero el espacio; la pieza llega después y asienta antes
 * del siguiente evento. La estructura conserva su zócalo a ras del suelo. */
export function arrivalMotion(faction: FactionId, progress: number, structure: boolean) {
  const t = Math.max(0, Math.min(1, (progress - 0.13) / 0.76))
  const ease = 1 - Math.pow(1 - t, 3)
  const style = structure ? 'weight' : STYLES[faction]
  const settle = Math.sin(Math.max(0, (t - 0.7) / 0.3) * Math.PI)
  return {
    visible: progress >= 0.13,
    height: style === 'weight' ? (1 - ease) * 0.7 - settle * 0.018 : (1 - ease) * 0.24,
    scale: style === 'growth' ? 0.72 + ease * 0.28 : 0.92 + ease * 0.08,
    turn: style === 'veil' ? (1 - ease) * 0.32 : style === 'tide' ? Math.sin(t * Math.PI) * 0.13 : 0,
    lean: style === 'growth' ? (1 - ease) * -0.16 : 0,
    labelOpacity: Math.max(0, Math.min(1, (progress - 0.6) / 0.25)),
  }
}
