import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMMANDER_BY_ID, STARTER_DECKS } from '../game'
import { createRoom, joinRoom, type Room, type RoomStatus } from '../multiplayer/room'
import { useMatchStore } from '../store/match'
import { useNetworkStore } from '../store/network'
import { usePreferences } from '../store/preferences'
import styles from './MultiplayerPage.module.css'

type Mode = 'idle' | 'hosting' | 'joining'

export function MultiplayerPage() {
  const navigate = useNavigate()
  const preferences = usePreferences()
  const [mode, setMode] = useState<Mode>('idle')
  const [room, setRoom] = useState<Room>()
  const [status, setStatus] = useState<RoomStatus>('waiting')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string>()
  const [copied, setCopied] = useState(false)
  const roomRef = useRef<Room>(undefined)

  useEffect(() => () => roomRef.current?.leave(), [])

  const attach = useCallback((next: Room) => {
    roomRef.current?.leave()
    roomRef.current = next
    setRoom(next)
    setStatus(next.getStatus())
    next.onStatusChange(setStatus)
  }, [])

  const handleCreate = () => {
    setError(undefined)
    setMode('hosting')
    attach(createRoom())
  }

  const handleJoin = () => {
    const code = joinCode.trim()
    if (code.length < 4) {
      setError('El código de sala tiene al menos 4 caracteres.')
      return
    }
    setError(undefined)
    setMode('joining')
    attach(joinRoom(code))
  }

  const handleLeave = () => {
    roomRef.current?.leave()
    roomRef.current = undefined
    setRoom(undefined)
    setMode('idle')
    setJoinCode('')
    setError(undefined)
  }

  const enterBattle = () => {
    if (!room) return
    // Sin este reset, una partida en solitario que quedara persistida de una
    // sesión anterior parecería ya en marcha (con su propio mulligan resuelto)
    // en vez de esperar a la partida en red recién sembrada por el anfitrión.
    useMatchStore.getState().reset()
    useNetworkStore.getState().setRoom(room, room.role)
    // La sala ya no es responsabilidad de esta pantalla: BattlePage se encarga
    // de salir de ella cuando la partida termine o se abandone.
    roomRef.current = undefined
    navigate('/battle')
  }

  const copyCode = async () => {
    if (!room) return
    try {
      await navigator.clipboard.writeText(room.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('No se pudo copiar. Copia el código a mano.')
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <small>Multijugador · en pruebas</small>
        <h1>Juega contra un amigo</h1>
        <p>Crea una sala y comparte el código, o entra con el código que te han pasado.</p>
      </header>

      <section className={styles.deckPicker} aria-label="Elige tu mazo para esta escaramuza">
        <span className={styles.deckPickerLabel}>Tu mazo para esta partida</span>
        <div className={styles.deckOptions}>
          {STARTER_DECKS.map((deck) => {
            const commander = COMMANDER_BY_ID[deck.commanderId]
            const selected = deck.id === preferences.selectedDeckId
            return (
              <button
                key={deck.id}
                className={`${styles.deckOption} ${styles[deck.faction]}`}
                data-selected={selected}
                aria-pressed={selected}
                onClick={() => preferences.setSelectedDeck(deck.id)}
                title={deck.name}
              >
                {commander?.name ?? deck.name}
              </button>
            )
          })}
        </div>
      </section>

      {mode === 'idle' && (
        <div className={styles.choices}>
          <button className={styles.choice} onClick={handleCreate}>
            <strong>Crear sala</strong>
            <span>Genera un código nuevo y espera a que tu rival se una.</span>
          </button>
          <div className={styles.choice}>
            <strong>Unirse a sala</strong>
            <span>Introduce el código que te ha compartido tu rival.</span>
            <div className={styles.joinRow}>
              <input
                className={styles.codeInput}
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                maxLength={8}
                aria-label="Código de sala"
              />
              <button className={styles.joinButton} onClick={handleJoin}>Unirse</button>
            </div>
          </div>
        </div>
      )}

      {mode !== 'idle' && room && (
        <div className={styles.lobby}>
          <div className={styles.codeDisplay}>
            <small>Código de la sala</small>
            <div className={styles.codeRow}>
              <strong>{room.code}</strong>
              {mode === 'hosting' && (
                <button className={styles.copyButton} onClick={copyCode}>{copied ? '¡Copiado!' : 'Copiar'}</button>
              )}
            </div>
          </div>
          <div className={styles.status} data-connected={status === 'connected'}>
            {status === 'connected' ? '● Rival conectado' : '○ Esperando al rival…'}
          </div>
          {status === 'connected' && (
            <>
              <p className={styles.note}>Jugarás con el mazo elegido arriba. Confirma con tu rival que no hayáis elegido la misma facción.</p>
              <button className={styles.joinButton} onClick={enterBattle}>Entrar a la batalla</button>
            </>
          )}
          <button className={styles.leaveButton} onClick={handleLeave}>Salir de la sala</button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
