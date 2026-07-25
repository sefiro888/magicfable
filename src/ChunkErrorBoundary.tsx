import { Component, type ReactNode } from 'react'

const RELOAD_FLAG = 'cronicas-chunk-reload'

const isChunkLoadError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|failed to fetch|importing a module script failed|loading chunk/i.test(message)
}

interface Props {
  readonly children: ReactNode
}

interface State {
  readonly hasError: boolean
}

/**
 * Tras cada despliegue, los nombres de los archivos de cada página cambian
 * (llevan un hash). Si esta pestaña llevaba abierta desde antes de un
 * despliegue nuevo y navega a una página cargada de forma diferida (las
 * rutas usan `lazy()`), el navegador pide el fragmento con el hash
 * antiguo, que el servidor ya no tiene: la promesa de `import()` se
 * rechaza y, sin este límite, React se queda con la pantalla en negro
 * para siempre. Se recarga una sola vez para partir del index.html
 * actual, que ya apunta a los hashes vigentes.
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown): void {
    if (!isChunkLoadError(error)) return
    if (window.sessionStorage.getItem(RELOAD_FLAG)) return
    window.sessionStorage.setItem(RELOAD_FLAG, '1')
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) return null
    return this.props.children
  }
}

/** Tras un arranque normal, deja libre el próximo aviso de esta clase. */
export const clearChunkReloadFlag = (): void => {
  window.sessionStorage.removeItem(RELOAD_FLAG)
}
