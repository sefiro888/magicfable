import { vi } from 'vitest'

/**
 * Contadores de lo que el motor de audio le pide a WebAudio. jsdom no
 * implementa WebAudio, así que sin esto el motor no se puede probar de ninguna
 * forma: este doble solo responde a lo que el motor usa de verdad.
 */
export interface AudioSpy {
  contexts: number
  oscillators: number
  bufferSources: number
  gains: number
  resumed: number
}

const param = () => ({
  value: 0,
  setValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  cancelScheduledValues: vi.fn(),
})

const node = () => {
  const self = {
    connect: vi.fn(() => self),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    frequency: param(),
    detune: param(),
    gain: param(),
    Q: param(),
    delayTime: param(),
    type: 'sine',
    loop: false,
    buffer: null as AudioBuffer | null,
    threshold: param(),
    ratio: param(),
    knee: param(),
    attack: param(),
    release: param(),
    context: null as unknown,
  }
  return self
}

/** Instala el doble en `window.AudioContext` y devuelve sus contadores. */
export const installFakeAudio = (): AudioSpy => {
  const spy: AudioSpy = { contexts: 0, oscillators: 0, bufferSources: 0, gains: 0, resumed: 0 }

  class FakeContext {
    state = 'running'
    currentTime = 0
    sampleRate = 48000
    destination = node()
    constructor() { spy.contexts += 1 }
    createGain() { spy.gains += 1; const n = node(); n.context = this; return n }
    createOscillator() { spy.oscillators += 1; const n = node(); n.context = this; return n }
    createBufferSource() { spy.bufferSources += 1; const n = node(); n.context = this; return n }
    createBiquadFilter() { return node() }
    createDelay() { return node() }
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
