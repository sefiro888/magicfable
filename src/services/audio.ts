type SoundCue =
  | 'draw'
  | 'resource'
  | 'summon'
  | 'spell'
  | 'move'
  | 'attack'
  | 'impact'
  | 'destroy'
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
  victory: 880,
  defeat: 110,
  ui: 520,
}

export function playSynthCue(cue: SoundCue, volume = 0.3): void {
  if (typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const duration = cue === 'victory' || cue === 'defeat' ? 0.42 : 0.12
  oscillator.type = cue === 'spell' || cue === 'victory' ? 'sine' : 'triangle'
  oscillator.frequency.setValueAtTime(cueFrequency[cue], context.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(40, cueFrequency[cue] * (cue === 'defeat' ? 0.5 : 1.35)),
    context.currentTime + duration,
  )
  gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * 0.12, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
  oscillator.addEventListener('ended', () => void context.close())
}
