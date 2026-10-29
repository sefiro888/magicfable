import type { BoardPiece } from '../game'
import type { CardStatus } from '../components/Card'

/** Se consulta la copia elegida, no otra con el mismo dibujo: dos unidades
 * iguales pueden llevar protecciones y penalizaciones diferentes. */
export function inspectionStatuses(piece?: BoardPiece): readonly CardStatus[] {
  if (!piece) return []
  const statuses: CardStatus[] = piece.statuses.map((status): CardStatus => {
    switch (status.kind) {
      case 'frozen': return 'frozen'
      case 'stunned': return 'stunned'
      case 'silenced': return { id: 'silenced', label: 'Silenciada', tone: 'negative' }
      case 'anchored': return { id: 'anchored', label: 'Inamovible', tone: 'positive' }
      case 'shielded': return { id: 'shielded', label: `Escudo ${status.amount}` }
      case 'cursed': return { id: 'cursed', label: `Maldición ${status.amount}`, icon: '☠', tone: 'negative' }
      case 'infected': return { id: 'infected', label: 'Infectada', icon: '☣', tone: 'negative' }
    }
  })
  if (piece.attackedThisTurn) statuses.push('exhausted')
  return statuses
}
