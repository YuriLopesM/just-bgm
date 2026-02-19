export type SoundKeys = 'rain' | 'birds' | 'wind' | 'fire' | 'waves' | 'people'

export type Sound = Partial<
  Record<
    SoundKeys,
    {
      volume: number
      isPlaying: boolean
    }
  >
>

export type SoundState = {
  volume: number
  isLoading: boolean
  sounds: Sound

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
