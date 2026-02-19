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

  await Promise.allSettled(
    (Object.keys(storeSounds) as SoundKeys[]).map(async (key) => {
      try {
        const userVol = storeSounds[key]?.volume ?? 100
        let s = soundsMap.get(key)

        if (!buffers.has(key)) {
          await loadBuffer(key)
        }

        const buffer = buffers.get(key)
        if (!buffer) return

        if (!s) {
          const gain = audioContext.createGain()
          gain.gain.value = userVol / 100
          gain.connect(masterGain)

          s = { gain, startTime: 0, pauseTime: 0, isPlaying: false }
          soundsMap.set(key, s)
        } else {
          s.gain.gain.value = userVol / 100
        }

        if (s.isPlaying) return

        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.loop = true
        source.connect(s.gain)

        const offset = s.pauseTime || 0
        source.start(0, offset)

        s.source = source
        s.startTime = audioContext.currentTime - offset
        s.isPlaying = true
      } catch (err) {
        console.error(`Failed to start sound: ${key}`, err)
      }
    })
  )
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

export function setIndividualVolume(sound: SoundKeys, v: number) {
  const s = soundsMap.get(sound)
  if (s) s.gain.gain.value = v / 100
}

function parseUrlSounds(): Partial<SoundState['sounds']> {
  const search = window.location.search.slice(1)
  if (!search) return {}

  const result: Partial<SoundState['sounds']> = {}

  search.split(',').forEach((entry) => {
    const match = entry.match(/^([a-zA-Z]+)(\d+)$/)
    if (!match) return

    const [, key, volume] = match

    result[key as SoundKeys] = {
      volume: Number(volume),
      isPlaying: false,
    }
  })

  return result
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      volume: 100,
      isLoading: false,
      sounds: {
        rain: { volume: 50, isPlaying: false },
        birds: { volume: 0, isPlaying: false },
        wind: { volume: 0, isPlaying: false },
        fire: { volume: 0, isPlaying: false },
        waves: { volume: 0, isPlaying: false },
        people: { volume: 0, isPlaying: false },
        ...parseUrlSounds(),
      },

      play: async () => {
        set({ isLoading: true })
        const sounds = get().sounds
        await playSound(sounds)

        set((state) => ({
          sounds: Object.fromEntries(
            Object.entries(state.sounds).map(([k, v]) => [
              k,
              { ...v, isPlaying: state.volume > 0 ? true : false },
            ])
          ) as SoundState['sounds'],
          isLoading: false,
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
          isLoading: false,
        }))
      },

      setVolume: (v) => {
        setMasterVolume(v)
        set({ volume: v })
      },

      setSoundVolume: (sound, v) => {
        setIndividualVolume(sound, v)
        set((state) => ({
          sounds: {
            ...state.sounds,
            [sound]: { ...state.sounds[sound], volume: v },
          },
        }))
      },

      getShareLink: () => {
        const sounds = get().sounds

        const search = Object.entries(sounds)
          .filter(([, v]) => v.volume > 0)
          .map(([key, v]) => `${key}${v.volume}`)
          .join(',')

        return `${window.location.origin}?${search}`
      },
    }),
    {
      name: '@just-bgm/sound-store',
      partialize: (state) => ({
        volume: state.volume,
        sounds: state.sounds,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as SoundState

        if (!state) return currentState

        return {
          ...currentState,
          ...state,
          sounds: Object.fromEntries(
            Object.entries(state?.sounds ?? {}).map(([k, v]) => [
              k,
              { ...v, isPlaying: false },
            ])
          ),
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // overwrites the persisted sounds with the ones from the URL, if any, to ensure the URL always takes precedence on load
        // do not save the URL sounds to the store, as they are only meant to be applied on the initial load and not override the persisted state on every load
        const urlSounds = parseUrlSounds()

        if (Object.keys(urlSounds).length > 0) {
          state.sounds = {
            ...state.sounds,
            ...Object.fromEntries(
              Object.entries(urlSounds).map(([key, value]) => [
                key,
                {
                  ...state.sounds?.[key as SoundKeys],
                  volume: value.volume,
                },
              ])
            ),
          }
        }
        setMasterVolume(state.volume)
      },
    }
  )
)
