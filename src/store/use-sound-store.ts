import type { SoundKeys, SoundState } from '@/@types'
import { SOUND_FILES } from '@/constants'
import { create } from 'zustand'

import { persist } from 'zustand/middleware'

const audioContext = new AudioContext()
const masterGain = audioContext.createGain()

masterGain.connect(audioContext.destination)

const buffers = new Map<SoundKeys, AudioBuffer>()
const sources = new Map<SoundKeys, AudioBufferSourceNode>()
const gains = new Map<SoundKeys, GainNode>()

async function loadBuffer(sound: SoundKeys) {
  if (buffers.has(sound)) return

  const res = await fetch(SOUND_FILES[sound])
  const arr = await res.arrayBuffer()
  const buffer = await audioContext.decodeAudioData(arr)

  buffers.set(sound, buffer)
}

async function playSound(sound: SoundKeys) {
  await audioContext.resume()
  await loadBuffer(sound)

  const buffer = buffers.get(sound)
  if (!buffer) return

  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()

  source.buffer = buffer
  source.loop = true

  source.connect(gain)
  gain.connect(masterGain)

  source.start()

  sources.set(sound, source)
  gains.set(sound, gain)
}

function stopSound(sound: SoundKeys) {
  const source = sources.get(sound)
  if (!source) return

  source.stop()
  source.disconnect()

  sources.delete(sound)
  gains.delete(sound)
}

function setSoundVolume(sound: SoundKeys, value: number) {
  const gain = gains.get(sound)
  if (!gain) return

  gain.gain.value = value / 100
}

function setMasterVolume(value: number) {
  masterGain.gain.value = value / 100
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
        ocean: { volume: 0, isPlaying: false },
        city: { volume: 0, isPlaying: false },
      },

      play: async (sound) => {
        await playSound(sound)

        // Apply stored volume
        const volume = get().sounds[sound]?.volume ?? 0
        setSoundVolume(sound, volume)

        set((state) => ({
          sounds: {
            ...state.sounds,
            [sound]: { ...state.sounds[sound], isPlaying: true },
          },
        }))
      },

      stop: (sound) => {
        stopSound(sound)

        set((state) => ({
          sounds: {
            ...state.sounds,
            [sound]: { ...state.sounds[sound], isPlaying: false },
          },
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
