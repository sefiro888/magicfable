import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { __resetAudioForTests, currentMusicTheme, startAmbientMusic } from './audio'
import { useSoundtrack } from './useAudioMix'
import { installFakeAudio } from '../test/fakeAudioContext'
import { usePreferences } from '../store/preferences'

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
