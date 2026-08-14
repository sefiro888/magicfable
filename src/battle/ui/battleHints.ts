import { spellNeedsPiece, type BoardPiece, type CardDefinition } from '../../game'

/**
 * Hechizos que exigen señalar una ficha concreta del tablero antes de
 * resolverse. Reexporta la lista del motor en vez de mantener aquí una copia
 * propia: una copia separada (sin Maldición Sombra) llevaba a que el botón
 * «Resolver carta» apareciera para un hechizo que el motor iba a rechazar
 * igualmente por falta de objetivo.
 */
export const requiresPieceTarget = spellNeedsPiece

/** Cartas que ocupan casilla al jugarse (frente a hechizos y fuentes). */
export const isBoardCard = (card: CardDefinition): boolean => card.type === 'unit' || card.type === 'structure'

/**
 * Línea compacta de estadísticas de una ficha ya desplegada. Usa la vida y el
 * ataque reales (con modificadores aplicados), no los impresos en la carta.
 */
export const pieceStatLine = (piece: BoardPiece, card: CardDefinition): string => {
  const parts: string[] = []
  if (card.attack !== undefined) parts.push(`ATQ ${Math.max(0, card.attack + piece.attackModifier)}`)
  parts.push(`VID ${piece.currentHealth}`)
  if (card.range !== undefined) parts.push(`ALC ${card.range}`)
  if (card.movement !== undefined) parts.push(`MOV ${card.movement}`)
  return parts.join(' · ')
}

/** Línea compacta de estadísticas de una carta en la mano: valores impresos. */
export const cardStatLine = (card: CardDefinition): string => {
  const parts: string[] = []
  if (card.attack !== undefined) parts.push(`ATQ ${card.attack}`)
  if (card.health !== undefined) parts.push(`VID ${card.health}`)
  if (card.resistance !== undefined) parts.push(`RES ${card.resistance}`)
  if (card.range !== undefined) parts.push(`ALC ${card.range}`)
  if (card.movement !== undefined) parts.push(`MOV ${card.movement}`)
  return parts.join(' · ')
}

export interface ActionHintContext {
  readonly finished: boolean
  readonly isMyTurn: boolean
  /** Ficha consultada con un clic normal: solo información, sin acción asociada. */
  readonly viewedPiece?: BoardPiece
  readonly viewingForeign: boolean
  readonly selectedCard?: CardDefinition
  /** False solo cuando hay carta seleccionada y no alcanza la Esencia para pagarla. */
  readonly canPaySelectedCard: boolean
  readonly selectedPiece?: BoardPiece
  readonly moveCount: number
  readonly canAttackPiece: boolean
  readonly canAttackNexus: boolean
}

/**
 * Guía inmediata: qué puede hacer el jugador con la selección actual.
 *
 * El orden de las comprobaciones importa: consultar una ficha es válido en
 * cualquier turno y nunca desencadena una acción, así que se resuelve antes
 * incluso que el aviso de «turno rival» — así se pueden seguir mirando
 * unidades mientras el rival juega.
 */
export const actionHintFor = (context: ActionHintContext): string | undefined => {
  if (context.finished) return undefined
  if (context.viewedPiece) {
    return context.viewingForeign
      ? 'Consultando una unidad rival: solo información, no puedes actuar sobre ella.'
      : 'Consultando esta unidad.'
  }
  if (!context.isMyTurn) return 'Turno rival: observa sus movimientos.'
  if (context.selectedCard) {
    if (!context.canPaySelectedCard) return 'No tienes Esencia suficiente para esta carta.'
    if (isBoardCard(context.selectedCard)) return 'Elige una casilla iluminada en azul para desplegar.'
    if (requiresPieceTarget(context.selectedCard)) return 'Selecciona un objetivo resaltado en dorado.'
    return 'Pulsa «Resolver carta» para lanzarla.'
  }
  if (context.selectedPiece) {
    const frozen = context.selectedPiece.statuses.some((status) => status.kind === 'frozen')
    if (frozen) return 'Unidad congelada: no puede actuar este turno.'
    const canMove = context.moveCount > 0
    const canAttack = context.canAttackPiece || context.canAttackNexus
    if (canMove && canAttack) return 'Casillas azules: mover · Objetivos dorados: atacar.'
    if (canMove) return 'Elige una casilla azul para mover.'
    if (canAttack) return 'Elige un objetivo dorado para atacar.'
    if (context.selectedPiece.movedThisTurn || context.selectedPiece.attackedThisTurn) {
      return 'Esta unidad ya ha agotado sus acciones este turno.'
    }
    return 'Esta unidad no tiene acciones disponibles ahora mismo.'
  }
  return 'Selecciona una carta de tu mano o una unidad aliada.'
}
