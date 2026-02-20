export type SoundId =
  | `rain${number}`
  | `storm${number}`
  | `wind${number}`
  | `waves${number}`
  | `fire${number}`
  | `birds${number}`
  | `cat${number}`
  | `people${number}`

export type Sound = {
  id: SoundId
  name: string
  volume: number
  file: string
  isPlaying: boolean
  isLoading?: boolean
}

export type SoundState = {
  volume: number
  sounds: Sound[]

  isMasterPlaying: boolean

  play: () => Promise<void>
  pause: () => void
  setVolume: (v: number) => void
  setSoundVolume: (id: SoundId, v: number) => Promise<void>
  muteAll: () => void
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
