import { useRef, type ElementType } from 'react'

import type { SoundKeys } from '@/@types'
import {
  BirdIcon,
  ChatsCircleIcon,
  CloudRainIcon,
  FireIcon,
  WavesIcon,
  WindIcon,
} from '@phosphor-icons/react'

type SoundControllerProps = {
  sound: SoundKeys
  volume: number
  handleVolumeChange: (sound: SoundKeys, volume: number) => void
}

export function SoundController({
  sound,
  volume,
  handleVolumeChange,
}: SoundControllerProps) {
  const dragging = useRef(false)
  const lastY = useRef(0)

  const clamp = (value: number) => Math.max(0, Math.min(100, value))

  const iconsMap: Record<SoundKeys, ElementType> = {
    rain: CloudRainIcon,
    fire: FireIcon,
    wind: WindIcon,
    birds: BirdIcon,
    people: ChatsCircleIcon,
    waves: WavesIcon,
  }

  const SoundIcon = iconsMap[sound] || null

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const sensitivity = 0.05

    handleVolumeChange(sound, clamp(volume - e.deltaY * sensitivity))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    lastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return

    const delta = lastY.current - e.clientY
    const sensitivity = 1

    handleVolumeChange(sound, clamp(volume + delta * sensitivity))

    lastY.current = e.clientY
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      handleVolumeChange(sound, clamp(volume + 5))
      return
    }

    if (e.key === 'ArrowDown') {
      handleVolumeChange(sound, clamp(volume - 5))
      return
    }
  }

  return (
    <div
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-label={sound.toUpperCase()}
      className={`
        w-36 flex flex-col items-center justify-center gap-4 p-6 m-0 shadow-xl
        border border-purple-400 rounded-lg cursor-s-resize 
        before:content-[attr(data-label)] before:absolute before:-top-0.5 before:text-xs before:text-white before:select-none
        ring-1 ring-purple-300/0
        transition
        duration-200
        hover:ring-purple-300
        focus:ring-purple-300
        outline-0
      `}
      style={{
        background: `linear-gradient(to top, 
            oklch(49.1% 0.27 292.581) ${volume - 60}%,
            oklch(62.7% 0.265 303.9) ${volume}%, 
            oklch(25.7% 0.09 281.288) ${volume}%)`,
      }}
    >
      <header>
        <SoundIcon size={64} className="text-purple-100" weight="light" />
      </header>
      <main>
        <p className="text-sm select-none text-purple-200">Volume: {volume}%</p>
      </main>
    </div>
  )
}
