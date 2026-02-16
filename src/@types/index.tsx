export type SoundKeys = 'rain' | 'birds' | 'wind' | 'fire' | 'ocean' | 'city'

export type Sound = {
  volume: number
}

export type SoundState = {
  volume: number
  sounds: Partial<Record<SoundKeys, { volume: number; isPlaying: boolean }>>

  wander?: boolean

  play: (sound: SoundKeys) => Promise<void>
  stop: (sound: SoundKeys) => void
  setVolume: (v: number) => void
  setSoundVolume: (sound: SoundKeys, v: number) => void
}
