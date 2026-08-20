import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  __resetAudioForTests,
  cueDuration,
  currentMusicTheme,
  playSynthCue,
  setAudioMix,
  startAmbientMusic,
  stopAmbientMusic,
  voicesForCue,
  type SoundCue,
} from './audio'

const CUES: readonly SoundCue[] = [
  'draw', 'resource', 'summon', 'spell', 'move', 'attack', 'impact',
  'destroy', 'freeze', 'shield', 'reveal', 'turn', 'victory', 'defeat', 'ui',
]

/** Contadores de lo que el motor le pide a WebAudio, para poder afirmar sobre ello. */
interface Spy {
  contexts: number
  oscillators: number
  bufferSources: number
  gains: number
  resumed: number
}

/**
 * AudioContext de mentira: jsdom no trae WebAudio, así que el motor no se
 * puede probar de otra forma. Solo necesita responder a lo que el motor usa.
 */
const installFakeAudio = (): Spy => {
  const spy: Spy = { contexts: 0, oscillators: 0, bufferSources: 0, gains: 0, resumed: 0 }
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  })
  const node = () => {
    const self = {
      connect: vi.fn(() => self),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
      frequency: param(),
      gain: param(),
      Q: param(),
      type: 'sine',
      buffer: null as AudioBuffer | null,
      threshold: param(),
      ratio: param(),
      attack: param(),
      release: param(),
      knee: param(),
    }
    return self
  }

  class FakeContext {
    state = 'running'
    currentTime = 0
    sampleRate = 48000
    destination = node()
    constructor() { spy.contexts += 1 }
    createGain() { spy.gains += 1; return node() }
    createOscillator() { spy.oscillators += 1; return node() }
    createBufferSource() { spy.bufferSources += 1; return node() }
    createBiquadFilter() { return node() }
    createConvolver() { return node() }
    createDynamicsCompressor() { return node() }
    createBuffer(channels: number, length: number) {
      const data = new Float32Array(length)
      return { getChannelData: () => data, length, numberOfChannels: channels }
    }
    resume() { spy.resumed += 1; this.state = 'running'; return Promise.resolve() }
    close() { return Promise.resolve() }
  }

  ;(window as unknown as { AudioContext: unknown }).AudioContext = FakeContext
  return spy
}

afterEach(() => {
  __resetAudioForTests()
  vi.useRealTimers()
})

describe('timbre de las señales', () => {
  it('cada señal tiene al menos una voz y ninguna dura más de un segundo y medio', () => {
    for (const cue of CUES) {
      const voices = voicesForCue(cue)
      expect(voices.length, cue).toBeGreaterThan(0)
      expect(cueDuration(cue), cue).toBeGreaterThan(0)
      expect(cueDuration(cue), cue).toBeLessThanOrEqual(1.5)
    }
  })

  it('las señales de acción apilan varias capas, no un pitido suelto', () => {
    for (const cue of ['summon', 'attack', 'impact', 'destroy', 'victory'] as const) {
      expect(voicesForCue(cue).length, cue).toBeGreaterThanOrEqual(2)
    }
  })

  it('mantiene todas las frecuencias dentro del rango audible', () => {
    for (const cue of CUES) {
      for (const voice of voicesForCue(cue)) {
        expect(voice.freq, cue).toBeGreaterThan(20)
        expect(voice.freq, cue).toBeLessThan(20000)
        if (voice.toFreq !== undefined) {
          expect(voice.toFreq, cue).toBeGreaterThan(20)
          expect(voice.toFreq, cue).toBeLessThan(20000)
        }
        expect(voice.gain, cue).toBeGreaterThan(0)
        expect(voice.gain, cue).toBeLessThanOrEqual(1)
      }
    }
  })

  it('la victoria suena mayor y la derrota grave: no son la misma señal', () => {
    const victory = voicesForCue('victory')
    const defeat = voicesForCue('defeat')
    const highest = Math.max(...victory.map((voice) => voice.freq))
    const lowest = Math.min(...defeat.map((voice) => voice.freq))
    expect(highest).toBeGreaterThan(lowest)
  })
})

describe('motor', () => {
  it('reutiliza un único AudioContext para toda la sesión', () => {
    const spy = installFakeAudio()
    playSynthCue('attack')
    playSynthCue('impact')
    playSynthCue('destroy')
    expect(spy.contexts).toBe(1)
  })

  it('crea un nodo sonoro por cada voz de la señal', () => {
    const spy = installFakeAudio()
    playSynthCue('impact')
    const voices = voicesForCue('impact')
    const noise = voices.filter((voice) => voice.wave === 'noise').length
    expect(spy.oscillators).toBe(voices.length - noise)
    expect(spy.bufferSources).toBe(noise)
  })

  it('silenciado no reproduce nada', () => {
    const spy = installFakeAudio()
    setAudioMix({ muted: true })
    playSynthCue('victory')
    expect(spy.oscillators).toBe(0)
  })

  it('no revienta si el navegador no trae WebAudio', () => {
    ;(window as unknown as { AudioContext: unknown }).AudioContext = undefined
    expect(() => playSynthCue('ui')).not.toThrow()
    expect(() => startAmbientMusic('caldera')).not.toThrow()
  })
})

describe('música ambiental', () => {
  it('arranca, encadena acordes y se detiene por completo', () => {
    vi.useFakeTimers()
    const spy = installFakeAudio()
    startAmbientMusic('caldera')
    expect(currentMusicTheme()).toBe('caldera')
    const afterFirstChord = spy.oscillators
    expect(afterFirstChord).toBeGreaterThan(0)
    vi.advanceTimersByTime(9000)
    expect(spy.oscillators).toBeGreaterThan(afterFirstChord)
    stopAmbientMusic()
    expect(currentMusicTheme()).toBeNull()
    const afterStop = spy.oscillators
    vi.advanceTimersByTime(9000)
    expect(spy.oscillators).toBe(afterStop)
  })

  it('pedir el tema que ya suena no lo reinicia', () => {
    vi.useFakeTimers()
    const spy = installFakeAudio()
    startAmbientMusic('sanctuary')
    const afterFirst = spy.oscillators
    startAmbientMusic('sanctuary')
    expect(spy.oscillators).toBe(afterFirst)
  })

  it('cambiar de escenario cambia el tema', () => {
    vi.useFakeTimers()
    installFakeAudio()
    startAmbientMusic('sanctuary')
    startAmbientMusic('aether-citadel')
    expect(currentMusicTheme()).toBe('aether-citadel')
  })
})
