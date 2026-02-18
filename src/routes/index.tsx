import { createFileRoute } from '@tanstack/react-router'
import {
  PlayPause,
  ShareButton,
  SocialIcon,
  SoundController,
  VolumeSlider,
  type EnabledSocials,
} from '../components'

import { type SoundKeys } from '@/@types'

import { toast } from 'sonner'
import { useSoundStore } from '../store/use-sound-store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const {
    sounds,
    volume,
    isLoading,
    play,
    pause,
    setSoundVolume,
    setVolume,
    getShareLink,
  } = useSoundStore()

  const isCurrentlyPlaying = Object.values(sounds).some((s) => s.isPlaying)

  const handleShare = () => {
    const link = getShareLink()
    navigator.clipboard.writeText(link)
    toast.success('Share link copied to clipboard!')
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[radial-gradient(circle_at_50%_75%_in_oklab,#4338ca_0%,#1e1b4b_50%,#0c0c0c_100%)] text-white">
      <div className="absolute z-0 bg-noise inset-0 opacity-[0.8] mix-blend-overlay pointer-events-none" />
      <div
        className={`absolute z-0 bg-cloud-pattern inset-0 opacity-[0.8] mix-blend-multiply pointer-events-none will-change-[background-position] ${isCurrentlyPlaying ? '[animation-play-state:running]' : '[animation-play-state:paused]'}`}
      />

      <header className="relative z-10 h-9 w-full bg-black/20 flex justify-between px-6">
        <div className="flex items-center gap-2 text-sm text-white font-light">
          <p>Master Volume:</p>
          <VolumeSlider volume={volume} setVolume={setVolume} />
          <span>{volume}%</span>
        </div>
        <ShareButton onClick={handleShare} />
      </header>

      <header className="relative z-10 p-16 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-5xl text-purple-400 text-shadow-lg/20">
            Just<span className="text-white font-bold">BGM</span>
          </h1>
          <img src="/logo.svg" className="w-10 h-10" alt="Logo" />
        </div>
        <p className="font-light text-purple-200 text-center text-md">
          Background ambience to quiet the noise —{' '}
          <span className="text-purple-300 font-medium">without paywalls</span>.
        </p>
      </header>

      <section className="relative z-10 flex items-center justify-center mb-16 m-auto">
        <PlayPause
          play={play}
          pause={pause}
          isPlaying={isCurrentlyPlaying}
          isLoading={isLoading}
        />
      </section>

      <main
        className="
          relative flex-1
          container mx-auto
          grid place-items-center grid-cols-[repeat(auto-fit,minmax(9rem,9rem))] justify-center content-start gap-8
          px-6 py-8
          z-10
        "
      >
        {Object.entries(sounds).map(([sound, { volume }]) => (
          <SoundController
            key={sound}
            sound={sound as SoundKeys}
            volume={volume}
            handleVolumeChange={setSoundVolume}
          />
        ))}
      </main>

      <footer className="p-4 text-center text-sm z-10">
        <p className="inline-flex items-center justify-center gap-2">
          Made by Yuri Lopes 🐱‍👤
          <span className="text-gray-400">|</span>
          {['github', 'linkedin', 'instagram', 'x'].map((s) => (
            <SocialIcon key={s} social={s as EnabledSocials} />
          ))}
        </p>
      </footer>
    </div>
  )
}
