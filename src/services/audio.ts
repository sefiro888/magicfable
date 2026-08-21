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

// ── Ambiente ─────────────────────────────────────────────────────────────────

export type MusicTheme = 'aether-citadel' | 'sanctuary' | 'caldera' | 'menu'

/**
 * Perfil sonoro de cada sitio. No es música: es el AMBIENTE del lugar, tres
 * capas que suenan a la vez.
 *
 * - `air`: lecho de ruido en bucle, filtrado y con el corte respirando muy
 *   despacio — el viento de la ciudadela, el aire quieto del santuario, el
 *   rugido sordo de la caldera.
 * - `drone`: dos o tres notas larguísimas, muy graves y ligeramente
 *   desafinadas entre sí, que dan tono y profundidad sin melodía que se pegue.
 * - `detail`: sucesos sueltos y espaciados (una gota, una chispa, una
 *   campanilla) que llegan a intervalos irregulares para que el sitio parezca
 *   vivo y no un bucle.
 *
 * La versión anterior encadenaba acordes de pad y sonaba a órgano de juguete:
 * en un juego de tablero la capa de fondo tiene que poder ignorarse mientras
 * se piensa la jugada.
 */
interface AmbienceProfile {
  air: {
    /** Espectro del lecho: 'brown' pesa hacia los graves, 'pink' es más neutro. */
    color: 'brown' | 'pink'
    /** Corte del pasa-bajos, en Hz, y cuánto respira arriba y abajo. */
    cutoff: number
    sweep: number
    /** Ciclos por segundo de esa respiración: siempre muy por debajo de 1. */
    breath: number
    gain: number
  }
  drone: {
    /** Fundamental en Hz y los intervalos (en semitonos) que se apilan encima. */
    root: number
    intervals: readonly number[]
    wave: OscillatorType
    gain: number
    /** Desafinado entre las voces, en cents: da el batido lento característico. */
    detune: number
  }
  detail: {
    kind: 'chime' | 'drip' | 'ember'
    /** Separación mínima y máxima entre sucesos, en segundos. */
    everyMin: number
    everyMax: number
    gain: number
  }
}

export const AMBIENCE: Record<MusicTheme, AmbienceProfile> = {
  // Altura y aire libre: viento fino, tono luminoso, campanillas de cristal.
  'aether-citadel': {
    air: { color: 'pink', cutoff: 820, sweep: 420, breath: 0.055, gain: 0.14 },
    drone: { root: 98, intervals: [0, 7, 19], wave: 'triangle', gain: 0.05, detune: 6 },
    detail: { kind: 'chime', everyMin: 7, everyMax: 16, gain: 0.16 },
  },
  // Piedra, noche y agua: casi sin viento, tono menor, goteo en la lejanía.
  sanctuary: {
    air: { color: 'brown', cutoff: 340, sweep: 140, breath: 0.03, gain: 0.16 },
    drone: { root: 87.3, intervals: [0, 3, 12], wave: 'sine', gain: 0.06, detune: 4 },
    detail: { kind: 'drip', everyMin: 4, everyMax: 11, gain: 0.13 },
  },
  // Interior volcánico: rumor grave constante y brasas que estallan a menudo.
  caldera: {
    air: { color: 'brown', cutoff: 190, sweep: 110, breath: 0.09, gain: 0.22 },
    drone: { root: 65.4, intervals: [0, 1, 12], wave: 'sawtooth', gain: 0.045, detune: 9 },
    detail: { kind: 'ember', everyMin: 1.6, everyMax: 5, gain: 0.1 },
  },
  // Portada y menús: lo más discreto posible, solo tono y alguna campanilla.
  menu: {
    air: { color: 'pink', cutoff: 500, sweep: 200, breath: 0.04, gain: 0.09 },
    drone: { root: 110, intervals: [0, 7, 16], wave: 'sine', gain: 0.055, detune: 5 },
    detail: { kind: 'chime', everyMin: 11, everyMax: 24, gain: 0.12 },
  },
}

/**
 * Ruido en bucle de varios segundos. 'brown' se integra (cada muestra parte de
 * la anterior), lo que carga el espectro en los graves y da un rumor de fondo;
 * 'pink' aproxima el rosa sumando dos polos, más parecido al siseo del aire.
 */
const buildNoiseLoop = (context: AudioContext, color: 'brown' | 'pink', seconds = 6): AudioBuffer => {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds))
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  let slow = 0
  let mid = 0
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1
    if (color === 'brown') {
      brown = (brown + white * 0.02) / 1.02
      data[i] = brown * 3.2
    } else {
      slow = 0.99 * slow + white * 0.05
      mid = 0.86 * mid + white * 0.25
      data[i] = (slow + mid + white * 0.12) * 0.6
    }
  }
  // Fundido cruzado en los extremos: sin esto el punto de bucle chasquea.
  const fade = Math.min(2000, Math.floor(length / 8))
  for (let i = 0; i < fade; i += 1) {
    const k = i / fade
    data[i] = (data[i] ?? 0) * k + (data[length - fade + i] ?? 0) * (1 - k)
  }
  return buffer
}

interface AmbienceHandle {
  theme: MusicTheme
  timer: number
  /** Todo lo que hay que parar al cambiar de sitio. */
  sources: Set<AudioScheduledSourceNode>
  /** Ganancia común de la capa: permite fundirla en vez de cortarla en seco. */
  bus: GainNode
}

let ambience: AmbienceHandle | null = null

/** Un suceso suelto del ambiente: gota, chispa o campanilla. */
const playDetail = (active: Engine, handle: AmbienceHandle, profile: AmbienceProfile): void => {
  const { context } = active
  const at = context.currentTime + 0.02
  const gain = context.createGain()
  gain.connect(handle.bus)
  gain.connect(active.reverb)

  if (profile.detail.kind === 'ember') {
    // Brasa: chasquido corto de ruido, con la altura variando en cada disparo.
    const duration = 0.09 + Math.random() * 0.1
    const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const source = context.createBufferSource()
    source.buffer = buffer
    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.2
    filter.frequency.value = 900 + Math.random() * 2200
    gain.gain.setValueAtTime(profile.detail.gain * (0.5 + Math.random() * 0.5), at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    source.connect(filter).connect(gain)
    source.start(at)
    source.stop(at + duration)
    handle.sources.add(source)
    source.addEventListener('ended', () => handle.sources.delete(source))
    return
  }

  const drip = profile.detail.kind === 'drip'
  const duration = drip ? 0.3 : 2.6
  const base = drip ? 640 + Math.random() * 520 : 880 * Math.pow(2, Math.floor(Math.random() * 3) / 3)
  const oscillator = context.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(base, at)
  // La gota baja de tono al caer; la campanilla se queda quieta y se apaga.
  if (drip) oscillator.frequency.exponentialRampToValueAtTime(base * 0.45, at + duration)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(profile.detail.gain, at + (drip ? 0.008 : 0.06))
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(gain)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.05)
  handle.sources.add(oscillator)
  oscillator.addEventListener('ended', () => handle.sources.delete(oscillator))

  if (!drip) {
    // La campanilla lleva su quinta encima, muy floja: suena a cristal golpeado
    // y no a un pitido de test.
    const partial = context.createOscillator()
    const partialGain = context.createGain()
    partial.type = 'sine'
    partial.frequency.value = base * 1.5
    partialGain.gain.setValueAtTime(0.0001, at)
    partialGain.gain.exponentialRampToValueAtTime(profile.detail.gain * 0.35, at + 0.08)
    partialGain.gain.exponentialRampToValueAtTime(0.0001, at + duration * 0.7)
    partial.connect(partialGain)
    partialGain.connect(handle.bus)
    partialGain.connect(active.reverb)
    partial.start(at)
    partial.stop(at + duration)
    handle.sources.add(partial)
    partial.addEventListener('ended', () => handle.sources.delete(partial))
  }
}

/** Programa el siguiente suceso a un intervalo irregular (nunca en rejilla). */
const scheduleDetail = (active: Engine, handle: AmbienceHandle, profile: AmbienceProfile): void => {
  const { everyMin, everyMax } = profile.detail
  const wait = (everyMin + Math.random() * (everyMax - everyMin)) * 1000
  handle.timer = window.setTimeout(() => {
    if (ambience !== handle) return
    playDetail(active, handle, profile)
    scheduleDetail(active, handle, profile)
  }, wait)
}

/**
 * Arranca (o cambia) el ambiente del sitio. Entra con un fundido de dos
 * segundos para que no aparezca de golpe al abrir la partida. Pedir el mismo
 * ambiente que ya suena no hace nada, así se puede llamar en cada render.
 */
export const startAmbientMusic = (theme: MusicTheme): void => {
  if (ambience?.theme === theme) return
  stopAmbientMusic()
  const active = getEngine()
  if (!active) return
  if (active.context.state === 'suspended') void active.context.resume()
  const { context } = active
  const profile = AMBIENCE[theme]
  const bus = context.createGain()
  bus.connect(active.music)
  const now = context.currentTime
  bus.gain.setValueAtTime(0.0001, now)
  bus.gain.exponentialRampToValueAtTime(1, now + 2)

  const handle: AmbienceHandle = { theme, timer: 0, sources: new Set(), bus }
  ambience = handle

  // Capa 1: el aire del sitio.
  const air = context.createBufferSource()
  air.buffer = buildNoiseLoop(context, profile.air.color)
  air.loop = true
  const airFilter = context.createBiquadFilter()
  airFilter.type = 'lowpass'
  airFilter.frequency.value = profile.air.cutoff
  airFilter.Q.value = 0.4
  const airGain = context.createGain()
  airGain.gain.value = profile.air.gain
  air.connect(airFilter).connect(airGain).connect(bus)
  // Respiración del corte: un oscilador lentísimo modula el filtro, así el
  // lecho sube y baja de brillo en vez de quedarse plano y delatar el bucle.
  const breath = context.createOscillator()
  const breathDepth = context.createGain()
  breath.type = 'sine'
  breath.frequency.value = profile.air.breath
  breathDepth.gain.value = profile.air.sweep
  breath.connect(breathDepth).connect(airFilter.frequency)
  air.start(now)
  breath.start(now)
  handle.sources.add(air)
  handle.sources.add(breath)

  // Capa 2: el tono grave del lugar.
  for (const [index, semitones] of profile.drone.intervals.entries()) {
    const voice = context.createOscillator()
    const voiceGain = context.createGain()
    const filter = context.createBiquadFilter()
    voice.type = profile.drone.wave
    voice.frequency.value = step(profile.drone.root, semitones)
    voice.detune.value = (index - 1) * profile.drone.detune
    filter.type = 'lowpass'
    filter.frequency.value = 420 + index * 180
    voiceGain.gain.value = profile.drone.gain / (index + 1)
    voice.connect(filter).connect(voiceGain).connect(bus)
    voiceGain.connect(active.reverb)
    voice.start(now)
    handle.sources.add(voice)
  }

  // Capa 3: los sucesos sueltos.
  scheduleDetail(active, handle, profile)
}

/** Apaga el ambiente con un fundido corto y libera sus nodos. */
export const stopAmbientMusic = (): void => {
  const handle = ambience
  if (!handle) return
  ambience = null
  window.clearTimeout(handle.timer)
  const stopAll = () => {
    for (const source of handle.sources) {
      try {
        source.stop()
      } catch {
        // Una fuente ya terminada lanza al pararla otra vez: es inocuo.
      }
    }
    handle.sources.clear()
  }
  try {
    const context = handle.bus.context
    const now = context.currentTime
    handle.bus.gain.cancelScheduledValues(now)
    handle.bus.gain.setValueAtTime(Math.max(0.0001, handle.bus.gain.value), now)
    handle.bus.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    window.setTimeout(stopAll, 450)
  } catch {
    stopAll()
  }
}

/** ¿Qué ambiente suena ahora mismo? (para la interfaz y para los tests). */
export const currentMusicTheme = (): MusicTheme | null => ambience?.theme ?? null

/** Solo para tests: descarta el motor para poder construir otro limpio. */
export const __resetAudioForTests = (): void => {
  if (ambience) {
    window.clearTimeout(ambience.timer)
    ambience = null
  }
  engine = null
  mix = { master: 0.75, effects: 0.7, music: 0.35, muted: false }
}
