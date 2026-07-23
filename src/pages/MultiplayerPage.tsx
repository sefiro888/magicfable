import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoom, joinRoom, type Room, type RoomStatus } from '../multiplayer/room'
import styles from './MultiplayerPage.module.css'

type Mode = 'idle' | 'hosting' | 'joining'

export function MultiplayerPage() {
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
            <p className={styles.note}>
              La sala ya conecta a los dos jugadores. La partida sincronizada en el tablero llega en el próximo paso.
            </p>
          )}
          <button className={styles.leaveButton} onClick={handleLeave}>Salir de la sala</button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
