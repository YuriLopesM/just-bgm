import type { PausableSound, Sound, SoundId, SoundState } from '@/@types'
import { create } from 'zustand'

import { persist } from 'zustand/middleware'

const audioContext = new AudioContext()
const masterGain = audioContext.createGain()
masterGain.connect(audioContext.destination)

const buffers = new Map<string, AudioBuffer>()
const bufferPromises = new Map<string, Promise<void>>()
const soundsEngineMap = new Map<string, PausableSound>()

const sounds: Sound[] = [
  {
    id: 'rain1',
    name: 'Calm Rain',
    volume: 50,
    isPlaying: false,
    file: 'rain.flac',
  },
  {
    id: 'rain2',
    name: 'Rain',
    volume: 50,
    isPlaying: false,
    file: 'rain2.ogg',
  },
  {
    id: 'storm1',
    name: 'Storm',
    volume: 50,
    isPlaying: false,
    file: 'storm.wav',
  },
  {
    id: 'wind1',
    name: 'Wind',
    volume: 50,
    isPlaying: false,
    file: 'wind.wav',
  },
  {
    id: 'waves1',
    name: 'Waves',
    volume: 50,
    isPlaying: false,
    file: 'waves.wav',
  },
  {
    id: 'fire1',
    name: 'Fire',
    volume: 50,
    isPlaying: false,
    file: 'fire.flac',
  },
  {
    id: 'birds1',
    name: 'Birds',
    volume: 50,
    isPlaying: false,
    file: 'birds.wav',
  },
  {
    id: 'cat1',
    name: 'Cat Purring',
    volume: 50,
    isPlaying: false,
    file: 'cat.wav',
  },
  {
    id: 'people1',
    name: 'Talking',
    volume: 50,
    isPlaying: false,
    file: 'people.wav',
  },
  {
    id: 'people2',
    name: 'Talking II',
    volume: 50,
    isPlaying: false,
    file: 'people2.wav',
  },
]

async function loadBuffer(id: string) {
  // Already decoded the sound
  if (buffers.has(id)) return

  // Already loading the sound
  if (bufferPromises.has(id)) return bufferPromises.get(id)

  const promise = (async () => {
    const pathName = sounds.find((s) => s.id === id)?.file
    if (!pathName) return

    const res = await fetch(`/sounds/${pathName}`)
    const arr = await res.arrayBuffer()
    const buffer = await audioContext.decodeAudioData(arr)

    buffers.set(id, buffer)
    bufferPromises.delete(id)
  })()

  bufferPromises.set(id, promise)

  return promise
}

async function startSound(id: string, volume: number) {
  await loadBuffer(id)

  const buffer = buffers.get(id)
  if (!buffer) return

  let engine = soundsEngineMap.get(id)

  if (!engine) {
    const gain = audioContext.createGain()
    gain.connect(masterGain)

    engine = {
      gain,
      startTime: 0,
      pauseTime: 0,
      isPlaying: false,
    }

    soundsEngineMap.set(id, engine)
  }

  if (engine.isPlaying) return

  engine.gain.gain.value = volume / 100

  const source = audioContext.createBufferSource()
  source.buffer = buffer
  source.loop = true
  source.connect(engine.gain)

  const offset = engine.pauseTime % buffer.duration

  source.start(0, offset)

  engine.startTime = audioContext.currentTime - offset
  engine.pauseTime = 0
  engine.source = source
  engine.isPlaying = true
}

function pause() {
  for (const s of soundsEngineMap.values()) {
    if (!s.isPlaying) continue

    s.source?.stop()
    s.source?.disconnect()
    s.source = undefined
    s.pauseTime = audioContext.currentTime - s.startTime
    s.isPlaying = false
  }
}

function setMasterVolume(v: number) {
  masterGain.gain.value = v / 100
}

function setIndividualVolume(id: SoundId, v: number) {
  const s = soundsEngineMap.get(id)

  if (s) s.gain.gain.value = v / 100
}

function parseUrlSounds(): Sound[] | null {
  const search = window.location.search.slice(1)
  if (!search) return null

  let result: Sound[] = []

  search.split(',').forEach((entry) => {
    const match = entry.match(/^([a-zA-Z]+)(\d+)$/)
    if (!match) return

    const [, id, volume] = match

    const sound = sounds.find((s) => s.id === id)
    if (!sound) return

    result.push({
      id: id as SoundId,
      name: sound.name,
      file: sound.file,
      volume: parseInt(volume, 10),
      isPlaying: false,
    })
  })

  return result
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      isMasterPlaying: false,
      volume: 100,
      sounds: (() => {
        const urlSounds = parseUrlSounds()
        if (!urlSounds) return sounds

        const urlMap = new Map(urlSounds.map((s) => [s.id, s]))

        return sounds.map((sound) => {
          const fromUrl = urlMap.get(sound.id)
          if (!fromUrl) return sound

          return {
            ...sound,
            ...fromUrl,
            isPlaying: false,
          }
        })
      })(),

      play: async () => {
        set({ isMasterPlaying: true })
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }

        const sounds = get().sounds

        await Promise.allSettled(
          sounds
            .filter((s) => s.volume > 0)
            .map((s) => startSound(s.id, s.volume))
        )

        set((state) => ({
          sounds: state.sounds.map((s) =>
            s.volume > 0 ? { ...s, isPlaying: true } : s
          ),
        }))
      },

      pause: () => {
        set({ isMasterPlaying: false })
        pause()

        set((state) => ({
          sounds: state.sounds.map((s) => ({
            ...s,
            isPlaying: false,
          })),
        }))
      },

      setVolume: (v) => {
        setMasterVolume(v)
        set({ volume: v })
      },

      setSoundVolume: async (id, v) => {
        setIndividualVolume(id, v)

        set((state) => ({
          sounds: state.sounds.map((sound) =>
            sound.id === id ? { ...sound, volume: v, isPlaying: v > 0 } : sound
          ),
        }))

        if (v > 0) {
          await loadBuffer(id)
        }

        if (v > 0 && get().isMasterPlaying) {
          await startSound(id, v)
        }
      },

      muteAll: () => {
        set(({ sounds }) => ({
          sounds: sounds.map((sound) => {
            setIndividualVolume(sound.id, 0)

            return {
              ...sound,
              volume: 0,
              isPlaying: false,
            }
          }),
        }))
      },

      getShareLink: () => {
        const sounds = get().sounds

        const search = sounds
          .filter((sound) => sound.volume > 0)
          .map((sound) => `${sound.id}${sound.volume}`)
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

        const persistedMap = new Map((state.sounds ?? []).map((s) => [s.id, s]))

        return {
          ...currentState,
          volume: state.volume ?? currentState.volume,
          sounds: currentState.sounds.map((defaultSound) => {
            const persisted = persistedMap.get(defaultSound.id)

            if (!persisted) return defaultSound

            return {
              ...defaultSound,
              volume: persisted.volume,
              isPlaying: false,
            }
          }),
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // overwrites the persisted sounds with the ones from the URL, if any, to ensure the URL always takes precedence on load
        // do not save the URL sounds to the store, as they are only meant to be applied on the initial load and not override the persisted state on every load
        const urlSounds = parseUrlSounds()

        if (urlSounds && urlSounds.length > 0) {
          state.sounds = state.sounds.map((sound) => {
            const fromUrl = urlSounds.find((s) => s.id === sound.id)

            if (!fromUrl) return sound

            return {
              ...sound,
              ...fromUrl,
              isPlaying: false,
            }
          })
        }
        setMasterVolume(state.volume)
      },
    }
  )
)
