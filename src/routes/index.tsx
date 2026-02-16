import { createFileRoute } from '@tanstack/react-router'
import { SocialIcon, SoundController, type EnabledSocials } from '../components'

import { type SoundKeys } from '@/@types'

import { useSoundStore } from '../store/use-sound-store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { sounds, play, setSoundVolume } = useSoundStore()

  return (
    <div className="relative min-h-screen flex flex-col bg-[radial-gradient(circle_at_50%_75%_in_oklab,#4338ca_0%,#1e1b4b_50%,#0c0c0c_100%)] text-white">
      <div className="absolute z-0 bg-noise inset-0 opacity-[0.8] mix-blend-overlay pointer-events-none" />
      <div className="absolute z-0 bg-cloud-pattern inset-0 opacity-[0.8] mix-blend-multiply pointer-events-none" />

      <header className="relative p-16 z-10 flex items-center justify-center">
        <h1 className="text-5xl text-purple-400 text-shadow-lg/20">
          Just<span className="text-white font-bold">BGM</span>
        </h1>
      </header>

      <main
        className="
          relative flex-1
          container mx-auto
          grid place-items-center grid-cols-[repeat(auto-fit,minmax(9rem,9rem))] justify-center content-start gap-8
          px-6 py-8
          z-10
        "
      >
        <button onClick={() => play('rain')}>play</button>
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
        <p className="inline-flex items-center justify-center">
          Made by Yuri
          <span className="mx-2 text-gray-400">|</span>
          {['github', 'linkedin', 'instagram', 'x'].map((s) => (
            <SocialIcon key={s} social={s as EnabledSocials} />
          ))}
        </p>
      </footer>
    </div>
  )
}
