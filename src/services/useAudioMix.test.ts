import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { __resetAudioForTests, currentMusicTheme, startAmbientMusic } from './audio'
import { useSoundtrack } from './useAudioMix'
import { usePreferences } from '../store/preferences'

/** AudioContext mínimo: aquí solo importa qué tema queda sonando, no el sonido. */
const installFakeAudio = () => {
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() })
  const node = () => {
    const self = {
      connect: vi.fn(() => self), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(),
      addEventListener: vi.fn(), frequency: param(), gain: param(), Q: param(),
      type: 'sine', buffer: null, threshold: param(), ratio: param(), attack: param(), release: param(),
    }
    return self
  }
  class FakeContext {
    state = 'running'
    currentTime = 0
    sampleRate = 48000
    destination = node()
    createGain() { return node() }
    createOscillator() { return node() }
    createBufferSource() { return node() }
    createBiquadFilter() { return node() }
    createConvolver() { return node() }
    createDynamicsCompressor() { return node() }
    createBuffer(channels: number, length: number) {
      const data = new Float32Array(length)
      return { getChannelData: () => data, length, numberOfChannels: channels }
    }
    resume() { return Promise.resolve() }
    close() { return Promise.resolve() }
  }
  ;(window as unknown as { AudioContext: unknown }).AudioContext = FakeContext
}

afterEach(() => {
  __resetAudioForTests()
  usePreferences.getState().reset()
})

describe('capa ambiental', () => {
  it('suena mientras está habilitada y calla al deshabilitarse', () => {
    installFakeAudio()
    const view = renderHook(({ on }: { on: boolean }) => useSoundtrack('menu', on), {
      initialProps: { on: true },
    })
    expect(currentMusicTheme()).toBe('menu')
    view.rerender({ on: false })
    expect(currentMusicTheme()).toBeNull()
  })

  it('al apagarse no corta la música que ya puso otra pantalla', () => {
    installFakeAudio()
    const view = renderHook(({ on }: { on: boolean }) => useSoundtrack('menu', on), {
      initialProps: { on: true },
    })
    // La batalla arranca su tema de escenario: es el que manda ahora.
    startAmbientMusic('caldera')
    view.rerender({ on: false })
    expect(currentMusicTheme()).toBe('caldera')
  })

  it('con la música a cero no arranca nada', () => {
    installFakeAudio()
    usePreferences.getState().setVolume('musicVolume', 0)
    renderHook(() => useSoundtrack('menu', true))
    expect(currentMusicTheme()).toBeNull()
  })

  it('silenciar todo también calla el fondo', () => {
    installFakeAudio()
    const view = renderHook(() => useSoundtrack('sanctuary', true))
    expect(currentMusicTheme()).toBe('sanctuary')
    usePreferences.getState().setMuted(true)
    view.rerender()
    expect(currentMusicTheme()).toBeNull()
  })
})
