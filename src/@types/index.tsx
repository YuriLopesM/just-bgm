export type SoundKeys = 'rain' | 'birds' | 'wind' | 'fire' | 'waves' | 'people'

export type Sound = {
  volume: number
}

export type SoundState = {
  volume: number
  isLoading: boolean
  sounds: Partial<Record<SoundKeys, { volume: number; isPlaying: boolean }>>

  wander?: boolean

  play: () => Promise<void>
  pause: () => void
  setVolume: (v: number) => void
  setSoundVolume: (sound: SoundKeys, v: number) => void
  getShareLink: () => string
}

export type PausableSound = {
  source?: AudioBufferSourceNode
  gain: GainNode
  buffer?: AudioBuffer
  startTime: number
  pauseTime: number
  isPlaying: boolean
}
