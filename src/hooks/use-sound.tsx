// import { useLocalStorage } from './use-local-storage'

// import type { SoundController, SoundKeys } from '@/@types'

// export function useSound() {
//   const [soundController, setSoundController] =
//     useLocalStorage<SoundController>('@just-bgm/sound-controller', {
//       volume: 50,
//       isPlaying: false,
//       wander: false,
//       sounds: {
//         rain: { volume: 50 },
//         birds: { volume: 40 },
//         wind: { volume: 30 },
//         fire: { volume: 20 },
//         ocean: { volume: 10 },
//         city: { volume: 25 },
//       },
//     })

//   const togglePlay = () => {
//     setSoundController((prev) => ({
//       ...prev,
//       isPlaying: !prev.isPlaying,
//     }))
//   }

//   const toggleWander = () => {
//     setSoundController((prev) => ({
//       ...prev,
//       wander: !prev.wander,
//     }))
//   }

//   const handleGlobalVolumeChange = (volume: number) => {
//     setSoundController((prev) => ({
//       ...prev,
//       volume,
//     }))
//   }

//   const handleSoundVolumeChange = (sound: SoundKeys, volume: number) => {
//     setSoundController((prev) => ({
//       ...prev,
//       sounds: {
//         ...prev.sounds,
//         [sound]: {
//           ...prev.sounds[sound],
//           volume,
//         },
//       },
//     }))
//   }

//   return {
//     soundController,
//     togglePlay,
//     toggleWander,
//     handleGlobalVolumeChange,
//     handleSoundVolumeChange,
//   }
// }
