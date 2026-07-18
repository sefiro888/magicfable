import { useEffect, useRef } from 'react'

/**
 * Hook que pausa las animaciones decorativas cuando la pestaña no está visible.
 * Ahorra energía y CPU cuando el usuario está en otra pestaña.
 */
export const usePageVisibility = () => {
  const visibleRef = useRef(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      visibleRef.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return visibleRef
}
