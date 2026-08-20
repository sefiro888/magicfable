export type SoundCue =
  | 'draw'
  | 'resource'
  | 'summon'
  | 'spell'
  | 'move'
  | 'attack'
  | 'impact'
  | 'destroy'
  | 'freeze'
  | 'shield'
  | 'reveal'
  | 'turn'
  | 'victory'
  | 'defeat'
  | 'ui'

/**
 * Una voz es una capa de la señal: un oscilador (o una ráfaga de ruido) con su
 * envolvente propia. Las señales del juego se construyen apilando voces —un
 * golpe es sub-grave + ruido, una fanfarria son tres notas desplazadas en el
 * tiempo— en vez de un único pitido.
 *
 * Es una descripción de datos a propósito: se puede comprobar en tests sin
 * WebAudio y se renderiza en un solo sitio (`renderVoice`).
 */
export interface Voice {
  /** 'noise' usa una ráfaga de ruido blanco filtrado en vez de un oscilador. */
  wave: OscillatorType | 'noise'
  /** Frecuencia inicial en Hz (para 'noise', el corte del filtro). */
  freq: number
  /** Frecuencia final del barrido; si se omite, la voz no barre. */
  toFreq?: number
  /** Retardo desde el inicio de la señal, en segundos. */
  at: number
  /** Duración de la voz en segundos. */
  duration: number
  /** Ganancia relativa de la voz (0-1) antes de aplicar la mezcla del usuario. */
  gain: number
  /** Ataque de la envolvente en segundos: 0 = percusivo, alto = pad suave. */
  attack?: number
  /** Filtro pasa-banda para el ruido; alto = más metálico, bajo = más sordo. */
  q?: number
}

/** Semitono sobre una fundamental, en la escala temperada. */
const step = (root: number, semitones: number): number => root * Math.pow(2, semitones / 12)

/**
 * Timbre de cada señal del juego. Los graves llevan el peso físico (golpes,
 * destrucción) y los agudos la información (robar, revelar, congelar), de modo
 * que se distingan aunque suenen encadenados durante una animación larga.
 */
export const voicesForCue = (cue: SoundCue): readonly Voice[] => {
  switch (cue) {
    case 'draw':
      return [
        { wave: 'noise', freq: 3200, toFreq: 1400, at: 0, duration: 0.14, gain: 0.5, q: 1.4 },
        { wave: 'triangle', freq: 620, toFreq: 900, at: 0.02, duration: 0.1, gain: 0.25 },
      ]
    case 'resource':
      return [
        { wave: 'sine', freq: 660, at: 0, duration: 0.16, gain: 0.35 },
        { wave: 'sine', freq: 990, at: 0.05, duration: 0.16, gain: 0.22 },
      ]
    case 'summon':
      // Acorde grave que "aterriza": la unidad pesa.
      return [
        { wave: 'sawtooth', freq: 110, at: 0, duration: 0.42, gain: 0.35, attack: 0.06 },
        { wave: 'sawtooth', freq: step(110, 7), at: 0.03, duration: 0.4, gain: 0.24, attack: 0.06 },
        { wave: 'sine', freq: 55, at: 0, duration: 0.34, gain: 0.5 },
        { wave: 'noise', freq: 900, toFreq: 300, at: 0.18, duration: 0.22, gain: 0.28, q: 0.8 },
      ]
    case 'spell': {
      // Arpegio ascendente de tres notas: la magia "se eleva".
      const root = 520
      return [0, 4, 9].map((semitones, index) => ({
        wave: 'sine' as const,
        freq: step(root, semitones),
        toFreq: step(root, semitones + 0.2),
        at: index * 0.055,
        duration: 0.26,
        gain: 0.3 - index * 0.04,
        attack: 0.01,
      }))
    }
    case 'move':
      return [
        { wave: 'noise', freq: 1100, toFreq: 420, at: 0, duration: 0.16, gain: 0.34, q: 0.7 },
        { wave: 'triangle', freq: 200, toFreq: 150, at: 0, duration: 0.12, gain: 0.18 },
      ]
    case 'attack':
      // Filo: silbido corto y brillante antes del impacto.
      return [
        { wave: 'noise', freq: 4200, toFreq: 1200, at: 0, duration: 0.13, gain: 0.42, q: 2.4 },
        { wave: 'square', freq: 300, toFreq: 120, at: 0.01, duration: 0.1, gain: 0.16 },
      ]
    case 'impact':
      // Golpe: sub-grave con caída + capa de ruido sordo.
      return [
        { wave: 'sine', freq: 140, toFreq: 44, at: 0, duration: 0.26, gain: 0.75 },
        { wave: 'noise', freq: 700, toFreq: 180, at: 0, duration: 0.18, gain: 0.45, q: 0.6 },
        { wave: 'square', freq: 90, toFreq: 60, at: 0.01, duration: 0.12, gain: 0.2 },
      ]
    case 'destroy':
      // Derrumbe: barrido largo hacia abajo con crujido.
      return [
        { wave: 'sawtooth', freq: 180, toFreq: 40, at: 0, duration: 0.5, gain: 0.42 },
        { wave: 'noise', freq: 1600, toFreq: 200, at: 0, duration: 0.45, gain: 0.4, q: 0.5 },
        { wave: 'sine', freq: 70, toFreq: 35, at: 0.06, duration: 0.4, gain: 0.5 },
      ]
    case 'freeze':
      // Cristal: campanilla muy aguda + siseo helado.
      return [
        { wave: 'sine', freq: 1980, toFreq: 2400, at: 0, duration: 0.32, gain: 0.24 },
        { wave: 'sine', freq: 2970, at: 0.04, duration: 0.26, gain: 0.14 },
        { wave: 'noise', freq: 6000, toFreq: 3000, at: 0, duration: 0.34, gain: 0.2, q: 3 },
      ]
    case 'shield':
      return [
        { wave: 'sine', freq: 300, toFreq: 450, at: 0, duration: 0.3, gain: 0.34, attack: 0.05 },
        { wave: 'triangle', freq: 600, toFreq: 900, at: 0.04, duration: 0.26, gain: 0.18, attack: 0.05 },
      ]
    case 'reveal':
      return [
        { wave: 'sine', freq: 780, toFreq: 1170, at: 0, duration: 0.24, gain: 0.26, attack: 0.02 },
        { wave: 'noise', freq: 5200, toFreq: 2600, at: 0, duration: 0.2, gain: 0.16, q: 2.2 },
      ]
    case 'turn':
      // Dos notas de aviso, como una campana de sala.
      return [
        { wave: 'triangle', freq: 494, at: 0, duration: 0.3, gain: 0.3, attack: 0.01 },
        { wave: 'triangle', freq: 659, at: 0.13, duration: 0.34, gain: 0.28, attack: 0.01 },
      ]
    case 'victory': {
      // Fanfarria mayor de cuatro notas.
      const root = 392
      return [0, 4, 7, 12].map((semitones, index) => ({
        wave: 'triangle' as const,
        freq: step(root, semitones),
        at: index * 0.12,
        duration: index === 3 ? 0.8 : 0.36,
        gain: 0.32,
        attack: 0.015,
      }))
    }
    case 'defeat': {
      // Caída menor: la misma forma que la victoria, invertida y grave.
      const root = 262
      return [0, -3, -8].map((semitones, index) => ({
        wave: 'sawtooth' as const,
        freq: step(root, semitones),
        at: index * 0.18,
        duration: index === 2 ? 0.9 : 0.4,
        gain: 0.26,
        attack: 0.03,
      }))
    }
    case 'ui':
    default:
      return [{ wave: 'sine', freq: 640, toFreq: 820, at: 0, duration: 0.07, gain: 0.22 }]
  }
}

/** Duración total de una señal, para saber cuánto tarda en apagarse. */
export const cueDuration = (cue: SoundCue): number =>
  voicesForCue(cue).reduce((longest, voice) => Math.max(longest, voice.at + voice.duration), 0)

// ── Motor ────────────────────────────────────────────────────────────────────

interface Engine {
  context: AudioContext
  /** Bus de efectos: señales cortas de acción. */
  sfx: GainNode
  /** Bus de música: la capa ambiental de fondo. */
  music: GainNode
  /** Envío compartido a la reverberación. */
  reverb: GainNode
}

let engine: Engine | null = null
let mix = { master: 0.75, effects: 0.7, music: 0.35, muted: false }

/**
 * Genera una respuesta de impulso (sala mediana) por ruido decaído: da cuerpo a
 * las señales sin cargar ningún archivo de audio externo.
 */
const buildImpulse = (context: AudioContext, seconds = 1.6, decay = 3): AudioBuffer => {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds))
  const impulse = context.createBuffer(2, length, context.sampleRate)
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return impulse
}

/**
 * Un ÚNICO AudioContext para toda la sesión. La versión anterior creaba uno por
 * sonido: los navegadores limitan cuántos contextos simultáneos admiten (Chrome
 * corta sobre los 6) y abrirlos cuesta milisegundos de hilo principal, así que
 * en una animación con varios eventos seguidos empezaban a fallar sonidos.
 */
const getEngine = (): Engine | null => {
  if (engine) return engine
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext
  if (!AudioContextClass) return null
  try {
    const context = new AudioContextClass()
    const master = context.createGain()
    master.gain.value = 1
    // El compresor evita que un golpe y una fanfarria simultáneos saturen.
    const limiter = context.createDynamicsCompressor()
    limiter.threshold.value = -12
    limiter.ratio.value = 6
    limiter.attack.value = 0.003
    limiter.release.value = 0.18
    master.connect(limiter).connect(context.destination)

    const sfx = context.createGain()
    const music = context.createGain()
    sfx.connect(master)
    music.connect(master)

    const reverb = context.createGain()
    reverb.gain.value = 0.22
    const convolver = context.createConvolver()
    convolver.buffer = buildImpulse(context)
    reverb.connect(convolver).connect(master)

    engine = { context, sfx, music, reverb }
    applyMix()
    return engine
  } catch {
    return null
  }
}

const applyMix = (): void => {
  if (!engine) return
  const master = mix.muted ? 0 : Math.max(0, Math.min(1, mix.master))
  engine.sfx.gain.value = master * Math.max(0, Math.min(1, mix.effects))
  engine.music.gain.value = master * Math.max(0, Math.min(1, mix.music))
}

/**
 * Fija la mezcla desde las preferencias del usuario. Se aplica en caliente: al
 * mover un deslizador durante la partida, la música de fondo cambia de volumen
 * sin cortarse.
 */
export const setAudioMix = (next: Partial<typeof mix>): void => {
  mix = { ...mix, ...next }
  applyMix()
}

/**
 * Los navegadores arrancan el AudioContext suspendido hasta que hay un gesto
 * real del usuario. Llamar a esto desde cualquier clic lo despierta.
 */
export const resumeAudio = (): void => {
  const active = getEngine()
  if (active && active.context.state === 'suspended') void active.context.resume()
}

const renderVoice = (active: Engine, voice: Voice, startAt: number, level: number): void => {
  const { context } = active
  const begin = startAt + voice.at
  const end = begin + voice.duration
  const gain = context.createGain()
  const peak = Math.max(0.0001, voice.gain * level * 0.5)
  const attack = voice.attack ?? 0.004
  gain.gain.setValueAtTime(0.0001, begin)
  gain.gain.exponentialRampToValueAtTime(peak, begin + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  gain.connect(active.sfx)
  gain.connect(active.reverb)

  if (voice.wave === 'noise') {
    const length = Math.max(1, Math.floor(context.sampleRate * voice.duration))
    const buffer = context.createBuffer(1, length, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
    const source = context.createBufferSource()
    source.buffer = buffer
    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = voice.q ?? 1
    filter.frequency.setValueAtTime(voice.freq, begin)
    if (voice.toFreq) filter.frequency.exponentialRampToValueAtTime(Math.max(40, voice.toFreq), end)
    source.connect(filter).connect(gain)
    source.start(begin)
    source.stop(end)
    return
  }

  const oscillator = context.createOscillator()
  oscillator.type = voice.wave
  oscillator.frequency.setValueAtTime(voice.freq, begin)
  if (voice.toFreq) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, voice.toFreq), end)
  oscillator.connect(gain)
  oscillator.start(begin)
  oscillator.stop(end)
}

/**
 * Reproduce una señal del juego. Ya no recibe volumen: la mezcla del usuario
 * (general / efectos / silencio) vive en los buses del motor y se aplica en
 * caliente, así que cada punto de llamada solo dice QUÉ suena, no cuánto.
 */
export function playSynthCue(cue: SoundCue): void {
  if (mix.muted) return
  const active = getEngine()
  if (!active) return
  if (active.context.state === 'suspended') void active.context.resume()
  const startAt = active.context.currentTime + 0.005
  for (const voice of voicesForCue(cue)) renderVoice(active, voice, startAt, 1)
}

// ── Música ambiental ─────────────────────────────────────────────────────────

export type MusicTheme = 'aether-citadel' | 'sanctuary' | 'caldera' | 'menu'

/**
 * Cada escenario tiene su propia escala y registro, así que suena distinto sin
 * necesidad de ninguna pista grabada: la ciudadela es luminosa (lidio), el
 * santuario contemplativo (eólico) y la caldera tensa (frigio).
 */
const THEMES: Record<MusicTheme, { root: number; scale: readonly number[]; wave: OscillatorType; beat: number }> = {
  'aether-citadel': { root: 196, scale: [0, 2, 4, 7, 9, 11], wave: 'triangle', beat: 3.1 },
  sanctuary: { root: 174.6, scale: [0, 2, 3, 5, 7, 10], wave: 'sine', beat: 3.6 },
  caldera: { root: 155.6, scale: [0, 1, 3, 5, 7, 8], wave: 'sawtooth', beat: 2.7 },
  menu: { root: 220, scale: [0, 3, 5, 7, 10], wave: 'sine', beat: 4 },
}

interface MusicHandle {
  theme: MusicTheme
  timer: number
  nodes: Set<{ stop: (when?: number) => void }>
}

let music: MusicHandle | null = null

/** Un acorde de pad: fundamental, quinta y una nota de color de la escala. */
const scheduleChord = (active: Engine, theme: MusicTheme, seed: number): void => {
  const { context } = active
  const config = THEMES[theme]
  const degrees = [0, 2, 4].map((offset) => config.scale[(seed + offset) % config.scale.length] ?? 0)
  const octave = seed % 3 === 0 ? 2 : 1
  const begin = context.currentTime + 0.05
  const length = config.beat * 1.35

  for (const [index, semitones] of degrees.entries()) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = config.wave
    oscillator.frequency.value = step(config.root * octave, semitones) / 2
    // Ataque y caída muy largos: el pad respira, no marca ritmo.
    gain.gain.setValueAtTime(0.0001, begin)
    gain.gain.exponentialRampToValueAtTime(0.16 - index * 0.035, begin + length * 0.4)
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + length)
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900 + index * 260
    oscillator.connect(filter).connect(gain)
    gain.connect(active.music)
    gain.connect(active.reverb)
    oscillator.start(begin)
    oscillator.stop(begin + length + 0.1)
    music?.nodes.add(oscillator)
    oscillator.addEventListener('ended', () => music?.nodes.delete(oscillator))
  }
}

/**
 * Arranca (o cambia) la capa ambiental de fondo. Es generativa: encadena
 * acordes de pad con una progresión que no se repite exacta, así que no hay
 * bucle audible ni archivo que descargar. Llamarla con el tema que ya suena no
 * hace nada, para poder invocarla en cada render sin cortar la música.
 */
export const startAmbientMusic = (theme: MusicTheme): void => {
  if (music?.theme === theme) return
  stopAmbientMusic()
  const active = getEngine()
  if (!active) return
  if (active.context.state === 'suspended') void active.context.resume()
  let seed = 0
  const config = THEMES[theme]
  const handle: MusicHandle = { theme, timer: 0, nodes: new Set() }
  music = handle
  scheduleChord(active, theme, seed)
  handle.timer = window.setInterval(() => {
    seed = (seed + (seed % 2 === 0 ? 1 : 2)) % 12
    if (music === handle) scheduleChord(active, theme, seed)
  }, config.beat * 1000)
}

/** Detiene la capa ambiental y libera sus osciladores. */
export const stopAmbientMusic = (): void => {
  if (!music) return
  window.clearInterval(music.timer)
  for (const node of music.nodes) {
    try {
      node.stop()
    } catch {
      // Un oscilador ya terminado lanza al pararlo otra vez: es inocuo.
    }
  }
  music = null
}

/** ¿Hay música sonando ahora mismo? (para tests y para la interfaz). */
export const currentMusicTheme = (): MusicTheme | null => music?.theme ?? null

/** Solo para tests: descarta el motor para poder construir otro limpio. */
export const __resetAudioForTests = (): void => {
  stopAmbientMusic()
  engine = null
  mix = { master: 0.75, effects: 0.7, music: 0.35, muted: false }
}
