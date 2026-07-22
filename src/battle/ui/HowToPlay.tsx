import { useEffect, useRef } from 'react'
import styles from './HowToPlay.module.css'

/** Clave de localStorage que recuerda si ya se mostró la guía automáticamente. */
export const HOWTO_SEEN_KEY = 'cronicas-nexo-howto-visto'

export const hasSeenHowTo = (): boolean => {
  try {
    return localStorage.getItem(HOWTO_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export const markHowToSeen = (): void => {
  try {
    localStorage.setItem(HOWTO_SEEN_KEY, '1')
  } catch {
    /* almacenamiento no disponible: la guía volverá a aparecer, no es grave */
  }
}

interface Step {
  readonly n: string
  readonly title: string
  readonly body: string
}

const STEPS: readonly Step[] = [
  {
    n: '1',
    title: 'Canaliza Esencia',
    body: 'Cada turno puedes jugar una fuente de Esencia de tu mano. La Esencia es el maná que paga tus cartas, así que juega una fuente siempre que puedas.',
  },
  {
    n: '2',
    title: 'Despliega tus cartas',
    body: 'Selecciona una unidad de la mano y colócala en tu fila inicial. Cuesta Esencia; el número del círculo es su precio. Las unidades luchan; los hechizos resuelven un efecto y se descartan.',
  },
  {
    n: '3',
    title: 'Mueve y ataca',
    body: 'Selecciona una unidad del tablero para ver a dónde puede moverse y a quién puede atacar. Las unidades recién invocadas suelen esperar un turno, salvo que tengan Impulso o Golpe Veloz.',
  },
  {
    n: '4',
    title: 'Quiebra el Nexo',
    body: 'Cada bando tiene un Nexo con 25 de Vida. Lleva tus unidades hasta el borde rival y golpea su Nexo. El primero en reducir el Nexo enemigo a cero gana la crónica.',
  },
]

interface HowToPlayProps {
  readonly onClose: () => void
}

export function HowToPlay({ onClose }: HowToPlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="howto-title">
        <header className={styles.head}>
          <small>Cómo jugar</small>
          <h2 id="howto-title">Tu primera crónica</h2>
          <p>Cuatro pasos y estás listo para quebrar el Nexo rival.</p>
        </header>
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.n} className={styles.step}>
              <span className={styles.num} aria-hidden="true">{step.n}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <button ref={closeRef} className={styles.confirm} type="button" onClick={onClose}>
          Entendido, a jugar
        </button>
      </section>
    </div>
  )
}
