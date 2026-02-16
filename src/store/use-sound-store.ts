import type { PausableSound, SoundKeys, SoundState } from '@/@types'
import { SOUND_FILES } from '@/constants'
import { create } from 'zustand'

import { persist } from 'zustand/middleware'

const audioContext = new AudioContext()
const masterGain = audioContext.createGain()
masterGain.connect(audioContext.destination)

const buffers = new Map<SoundKeys, AudioBuffer>()
const soundsMap = new Map<SoundKeys, PausableSound>()

async function loadBuffer(sound: SoundKeys) {
  if (buffers.has(sound)) return

  const res = await fetch(SOUND_FILES[sound])
  const arr = await res.arrayBuffer()
  const buffer = await audioContext.decodeAudioData(arr)
  buffers.set(sound, buffer)
}

export async function playSound(storeSounds: SoundState['sounds']) {
  await audioContext.resume()

  for (const key of Object.keys(storeSounds) as SoundKeys[]) {
    const userVol = storeSounds[key]?.volume ?? 100
    let s = soundsMap.get(key)

    if (!buffers.has(key)) await loadBuffer(key)
    const buffer = buffers.get(key)!
    if (!s) {
      const gain = audioContext.createGain()
      gain.gain.value = userVol / 100
      gain.connect(masterGain)

      s = { gain, startTime: 0, pauseTime: 0, isPlaying: false }
      soundsMap.set(key, s)
    } else {
      s.gain.gain.value = userVol / 100
    }

    if (s.isPlaying) continue

    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(s.gain)

    const offset = s.pauseTime || 0
    source.start(0, offset)

    s.source = source
    s.startTime = audioContext.currentTime - offset
    s.isPlaying = true
  }
}

export function pauseSound() {
  for (const s of soundsMap.values()) {
    if (!s.isPlaying) continue

    s.source?.stop()
    s.source?.disconnect()
    s.source = undefined
    s.pauseTime = audioContext.currentTime - s.startTime
    s.isPlaying = false
  }
}

export function setMasterVolume(v: number) {
  masterGain.gain.value = v / 100
}

export function setSoundVolume(sound: SoundKeys, v: number) {
  const s = soundsMap.get(sound)
  if (s) s.gain.gain.value = v / 100
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      volume: 100,

      sounds: {
        rain: { volume: 50, isPlaying: false },
        birds: { volume: 0, isPlaying: false },
        wind: { volume: 0, isPlaying: false },
        fire: { volume: 0, isPlaying: false },
        waves: { volume: 0, isPlaying: false },
        people: { volume: 0, isPlaying: false },
      },

      play: async () => {
        const sounds = get().sounds
        await playSound(sounds)

        set((state) => ({
          sounds: Object.fromEntries(
            Object.entries(state.sounds).map(([k, v]) => [
              k,
              { ...v, isPlaying: state.volume > 0 ? true : false },
            ])
          ) as SoundState['sounds'],
        }))
      },

      pause: () => {
        pauseSound()

        set((state) => ({
          sounds: Object.fromEntries(
            Object.entries(state.sounds).map(([k, v]) => [
              k,
              { ...v, isPlaying: false },
            ])
          ) as SoundState['sounds'],
        }))
      },

      setVolume: (v) => {
        setMasterVolume(v)
        set({ volume: v })
      },

      setSoundVolume: (sound, v) => {
        setSoundVolume(sound, v)
        set((state) => ({
          sounds: {
            ...state.sounds,
            [sound]: { ...state.sounds[sound], volume: v },
          },
        }))
      },
    }),
    {
      name: '@just-bgm/sound-store',
      partialize: (state) => ({
        volume: state.volume,
        sounds: state.sounds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setMasterVolume(state.volume)
        }
      },
    }
  )
)
