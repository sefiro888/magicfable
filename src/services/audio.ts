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

const cueFrequency: Record<SoundCue, number> = {
  draw: 430,
  resource: 660,
  summon: 220,
  spell: 820,
  move: 280,
  attack: 140,
  impact: 90,
  destroy: 65,
  freeze: 980,
  shield: 350,
  reveal: 580,
  turn: 500,
  victory: 880,
  defeat: 110,
  ui: 520,
}

/**
 * Señales sintetizadas como marcador de posición legal (sin assets externos).
 * Para sustituirlas por audio real: cargar archivos con licencia en
 * public/assets/audio/<cue>.ogg y reemplazar esta síntesis por su reproducción.
 */
export function playSynthCue(cue: SoundCue, volume = 0.3): void {
  if (typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const duration = cue === 'victory' || cue === 'defeat' ? 0.42 : cue === 'freeze' ? 0.2 : 0.12
  oscillator.type = cue === 'spell' || cue === 'victory' || cue === 'freeze' ? 'sine' : 'triangle'
  oscillator.frequency.setValueAtTime(cueFrequency[cue], context.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(40, cueFrequency[cue] * (cue === 'defeat' || cue === 'freeze' ? 0.5 : 1.35)),
    context.currentTime + duration,
  )
  gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * 0.12, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
  oscillator.addEventListener('ended', () => void context.close())
}
