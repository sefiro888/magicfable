import type { FactionId } from '../game'
import type { ScenarioId } from '../store/preferences'

/**
 * Qué escenario le pega a cada facción.
 *
 * El ajuste «Automático» existe porque el sitio donde se pelea decía muy poco
 * de la partida: se jugaba a Duna en una ciudadela de mármol al amanecer
 * porque era el valor por defecto y nadie había bajado a cambiarlo. Con esto,
 * cada facción trae su casa puesta y la elección manual sigue estando para
 * quien la quiera.
 */
const HOME: Readonly<Record<FactionId, Exclude<ScenarioId, 'auto'>>> = {
  fury: 'caldera',
  arcane: 'aether-citadel',
  nature: 'grove',
  order: 'aether-citadel',
  shadow: 'sanctuary',
  void: 'sanctuary',
  duna: 'duna',
  fimbul: 'fimbul',
  samsara: 'duna',
  // Corte celestial china en una plaza de mármol grecolatina: era el sitio
  // más equivocado posible. Ya tiene el suyo.
  jade: 'jade-court',
  // Olimpo es mármol pentélico, columnas acanaladas y azul egeo, y estaba en
  // una isla nórdica de noche. La Ciudadela ya era su sitio, solo faltaba
  // mudarlo: no ha hecho falta escenario nuevo.
  olimpo: 'aether-citadel',
  sol: 'caldera',
  // Bestias de ventisca y bosque helado: el fiordo les pega más que el
  // Santuario, que además cargaba con seis facciones muy distintas.
  bestiario: 'fimbul',
  plaga: 'duna',
  marea: 'shore',
  // Compartía la Caldera con Furia, y su propio dosier avisaba del choque:
  // Furia es volcánica (el fuego manda) y Forja industrial (el fuego lo
  // mandan). Ahora tiene su patio.
  forja: 'foundry',
}

/**
 * Escenario efectivo de una partida. Manda siempre lo que el jugador haya
 * elegido a mano; 'auto' es lo único que consulta la facción.
 */
export const resolveScenario = (
  scenario: ScenarioId,
  faction: FactionId | undefined,
): Exclude<ScenarioId, 'auto'> => {
  if (scenario !== 'auto') return scenario
  return (faction && HOME[faction]) ?? 'aether-citadel'
}
