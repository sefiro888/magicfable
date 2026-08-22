import { beforeEach, describe, expect, it } from 'vitest'
import { STARTER_DECKS } from '../game'
import {
  BLESSINGS,
  TOWER_FLOORS,
  blessingEffect,
  opponentForFloor,
  towerMaxHealth,
  towerOpponents,
  useTower,
} from './tower'

const DECK = 'furia-caldera'

beforeEach(() => {
  useTower.setState({ run: undefined, best: 0 })
})

describe('orden de rivales', () => {
  it('son todos los comandantes, con el espejo al final', () => {
    const rivales = towerOpponents(DECK, 7)
    expect(rivales).toHaveLength(STARTER_DECKS.length)
    expect(rivales[rivales.length - 1]).toBe(DECK)
    // Los cinco primeros son distintos entre sí y ninguno es el propio.
    const previos = rivales.slice(0, -1)
    expect(new Set(previos).size).toBe(previos.length)
    expect(previos).not.toContain(DECK)
  })

  it('la misma semilla da siempre la misma Torre', () => {
    expect(towerOpponents(DECK, 42)).toEqual(towerOpponents(DECK, 42))
  })

  it('semillas distintas cambian el orden', () => {
    const ordenes = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => towerOpponents(DECK, seed).join()))
    expect(ordenes.size).toBeGreaterThan(1)
  })
})

describe('subida de la Torre', () => {
  it('empieza en el piso 1 con la Vida completa del comandante', () => {
    useTower.getState().start(DECK, 7)
    const run = useTower.getState().run!
    expect(run.floor).toBe(1)
    expect(run.health).toBe(towerMaxHealth(DECK))
    expect(run.awaitingBlessing).toBe(false)
    expect(opponentForFloor(run, 1)).toBeDefined()
  })

  it('ganar un piso conserva la Vida que quede y pide bendición', () => {
    useTower.getState().start(DECK, 7)
    useTower.getState().finishFloor(true, 18)
    const run = useTower.getState().run!
    expect(run.health).toBe(18)
    expect(run.awaitingBlessing).toBe(true)
    // El piso no avanza hasta elegir bendición.
    expect(run.floor).toBe(1)
    expect(run.defeated).toHaveLength(1)
  })

  it('la bendición cura y avanza de piso, sin pasar del máximo', () => {
    useTower.getState().start(DECK, 7)
    useTower.getState().finishFloor(true, 18)
    useTower.getState().chooseBlessing('mend')
    const run = useTower.getState().run!
    expect(run.floor).toBe(2)
    expect(run.health).toBe(28)
    expect(run.awaitingBlessing).toBe(false)

    // Curar con la Vida casi llena no la desborda.
    useTower.getState().finishFloor(true, towerMaxHealth(DECK) - 2)
    useTower.getState().chooseBlessing('mend')
    expect(useTower.getState().run!.health).toBe(towerMaxHealth(DECK))
  })

  it('la oleada castiga al rival del piso siguiente en vez de curarte', () => {
    useTower.getState().start(DECK, 7)
    useTower.getState().finishFloor(true, 20)
    useTower.getState().chooseBlessing('surge')
    const run = useTower.getState().run!
    expect(run.health).toBe(20)
    expect(run.enemyPenalty).toBe(blessingEffect('surge').enemyPenalty)
  })

  it('perder termina la Torre y guarda la marca alcanzada', () => {
    useTower.getState().start(DECK, 7)
    useTower.getState().finishFloor(true, 20)
    useTower.getState().chooseBlessing('mend')
    useTower.getState().finishFloor(false, 0)
    expect(useTower.getState().run).toBeUndefined()
    expect(useTower.getState().best).toBe(1)
  })

  it('completar el último piso cierra la Torre con la marca máxima', () => {
    useTower.getState().start(DECK, 7)
    for (let floor = 1; floor < TOWER_FLOORS; floor += 1) {
      useTower.getState().finishFloor(true, 25)
      useTower.getState().chooseBlessing('mend')
    }
    expect(useTower.getState().run!.floor).toBe(TOWER_FLOORS)
    useTower.getState().finishFloor(true, 12)
    expect(useTower.getState().run).toBeUndefined()
    expect(useTower.getState().best).toBe(TOWER_FLOORS)
  })

  it('abandonar borra la subida pero conserva la marca', () => {
    useTower.getState().start(DECK, 7)
    useTower.getState().finishFloor(true, 30)
    useTower.getState().chooseBlessing('mend')
    useTower.getState().abandon()
    expect(useTower.getState().run).toBeUndefined()
    expect(useTower.getState().best).toBe(1)
  })

  it('cada bendición tiene nombre y descripción para la pantalla', () => {
    for (const blessing of Object.values(BLESSINGS)) {
      expect(blessing.name).toBeTruthy()
      expect(blessing.description).toBeTruthy()
    }
  })
})
