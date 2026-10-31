import type { FactionId } from '../game'

type ArrivalStyle = 'weight' | 'growth' | 'veil' | 'tide'
const STYLES: Readonly<Record<FactionId, ArrivalStyle>> = {
  fury: 'weight', arcane: 'veil', nature: 'growth', order: 'weight',
  shadow: 'veil', void: 'veil', duna: 'weight', fimbul: 'weight',
  samsara: 'growth', jade: 'growth', olimpo: 'weight', sol: 'weight',
  bestiario: 'growth', plaga: 'growth', marea: 'tide', forja: 'weight',
  goblins: 'weight', tercios: 'weight', kalevala: 'veil',
}

/**
 * Fracción del evento en la que la pieza toca la losa. La onda de choque, el
 * polvo y la sacudida se sincronizan con este instante; si se mueve aquí, el
 * impacto se desacopla de la caída y parece que el suelo reacciona solo.
 */
export const ARRIVAL_LANDING = 0.58
const APPEAR = 0.1

/**
 * Altura de partida por estilo. Con 0,7 la entrada se leía como un pequeño
 * asentamiento y nadie notaba que llegaba una unidad; 2,6 cae desde fuera del
 * primer plano sin salirse del encuadre de la cámara a 37°.
 */
const DROP: Readonly<Record<ArrivalStyle, number>> = { weight: 2.6, veil: 1.7, tide: 1.3, growth: 0 }

/**
 * Pose de una pieza que llega al tablero. Las fuerzas caen con gravedad
 * (aceleran) y rebotan al tocar; las de crecimiento brotan desde la losa; las
 * de velo descienden girando. La estructura siempre cae a plomo: su zócalo
 * tiene que asentar a ras del suelo.
 */
export function arrivalMotion(faction: FactionId, progress: number, structure: boolean) {
  const style = structure ? 'weight' : STYLES[faction]
  const fall = Math.max(0, Math.min(1, (progress - APPEAR) / (ARRIVAL_LANDING - APPEAR)))
  const after = Math.max(0, (progress - ARRIVAL_LANDING) / (1 - ARRIVAL_LANDING))
  // Rebote amortiguado: dos botes que se apagan antes del siguiente evento.
  const bounce = after > 0 ? Math.abs(Math.sin(after * Math.PI * 2)) * Math.pow(1 - after, 2.2) : 0
  if (style === 'growth') {
    const ease = 1 - Math.pow(1 - fall, 3)
    return {
      visible: progress >= APPEAR,
      height: bounce * 0.05,
      scale: 0.2 + ease * 0.8 + bounce * 0.05,
      turn: 0,
      lean: (1 - ease) * -0.22,
      labelOpacity: Math.max(0, Math.min(1, (progress - 0.6) / 0.25)),
    }
  }
  // Caída libre: la altura baja con el cuadrado del tiempo, que es lo que el
  // ojo reconoce como peso. Un ease-out llegaba frenando, como si flotara.
  const height = fall < 1 ? DROP[style] * (1 - fall * fall) : bounce * (structure ? 0.06 : 0.16)
  // Al tocar suelo se aplasta un instante: vende el impacto mejor que el polvo.
  const squash = after > 0 && after < 0.25 ? Math.sin((after / 0.25) * Math.PI) * 0.07 : 0
  return {
    visible: progress >= APPEAR,
    height,
    scale: (fall < 1 ? 0.86 + fall * 0.14 : 1) - squash,
    turn: style === 'veil' ? (1 - fall) * 1.6 : style === 'tide' ? Math.sin(fall * Math.PI) * 0.18 : 0,
    lean: fall < 1 ? (1 - fall) * 0.12 : 0,
    labelOpacity: Math.max(0, Math.min(1, (progress - 0.68) / 0.22)),
  }
}
