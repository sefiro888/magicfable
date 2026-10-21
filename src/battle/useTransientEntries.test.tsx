import { act, cleanup, renderHook } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTransientEntries } from './useTransientEntries'

afterEach(() => { cleanup(); vi.useRealTimers() })

describe('efectos que atraviesan varios eventos de la cola', () => {
  it('cada golpe caduca aunque ya esté reproduciéndose el siguiente', () => {
    vi.useFakeTimers()
    const hook = renderHook(({ event }) => {
      const { entries, append } = useTransientEntries<{ id: string }>(1200)
      useEffect(() => { append({ id: event }) }, [event, append])
      return entries
    }, { initialProps: { event: 'golpe-1' } })
    act(() => vi.advanceTimersByTime(300))
    hook.rerender({ event: 'golpe-2' })
    act(() => vi.advanceTimersByTime(1))
    expect(hook.result.current.map((entry) => entry.id)).toEqual(['golpe-1', 'golpe-2'])
    act(() => vi.advanceTimersByTime(900))
    expect(hook.result.current.map((entry) => entry.id)).toEqual(['golpe-2'])
    act(() => vi.advanceTimersByTime(300))
    expect(hook.result.current).toEqual([])
  })

  it('salir de la batalla cancela tanto apariciones pendientes como caducidades', () => {
    vi.useFakeTimers()
    const hook = renderHook(() => useTransientEntries<{ id: string }>(2200))
    act(() => { hook.result.current.append({ id: 'marca' }) })
    expect(vi.getTimerCount()).toBe(2)
    hook.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
