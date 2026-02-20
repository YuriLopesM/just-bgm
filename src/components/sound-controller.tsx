import { useRef, useState, type ElementType } from 'react'

import type { Sound, SoundId } from '@/@types'
import {
  BirdIcon,
  CampfireIcon,
  CatIcon,
  ChatsCircleIcon,
  ChatsIcon,
  CloudRainIcon,
  DropIcon,
  LightningIcon,
  WavesIcon,
  WindIcon,
} from '@phosphor-icons/react'

type SoundControllerProps = {
  sound: Sound
  handleVolumeChange: (id: SoundId, volume: number) => Promise<void>
}

export function SoundController({
  sound,
  handleVolumeChange,
}: SoundControllerProps) {
  const dragging = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const [isChangingVolume, setChangingVolume] = useState(false)
  const lastY = useRef(0)

  const clamp = (value: number) => Math.max(0, Math.min(100, value))

  const iconsMap: Record<SoundId, ElementType> = {
    rain1: DropIcon,
    rain2: CloudRainIcon,
    storm1: LightningIcon,
    wind1: WindIcon,
    waves1: WavesIcon,
    fire1: CampfireIcon,
    birds1: BirdIcon,
    cat1: CatIcon,
    people1: ChatsIcon,
    people2: ChatsCircleIcon,
  }

  const SoundIcon = iconsMap[sound.id] || null

  function showVolumeTemporarily() {
    setChangingVolume(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setChangingVolume(false)
    }, 800)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const sensitivity = 0.05

    setChangingVolume(true)
    handleVolumeChange(sound.id, clamp(sound.volume - e.deltaY * sensitivity))
    showVolumeTemporarily()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    setChangingVolume(true)

    lastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return

    const delta = lastY.current - e.clientY
    const sensitivity = 1

    handleVolumeChange(sound.id, clamp(sound.volume + delta * sensitivity))

    lastY.current = e.clientY
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    showVolumeTemporarily()
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      setChangingVolume(true)
      handleVolumeChange(sound.id, clamp(sound.volume + 5))
      return
    }

    if (e.key === 'ArrowDown') {
      setChangingVolume(true)
      handleVolumeChange(sound.id, clamp(sound.volume - 5))
      return
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      showVolumeTemporarily()
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
      onKeyUp={handleKeyUp}
      data-label={sound.name.toUpperCase()}
      className={`
        relative w-36 h-28 flex flex-col items-center justify-center gap-4 shadow-xl
        rounded-lg cursor-s-resize group
        before:content-[attr(data-label)] before:absolute before:-top-6 before:text-xs before:text-white before:select-none
        ring-1 ring-purple-300 transition duration-200
        hover:ring-2 focus:ring-2 hover:ring-purple-200 focus:ring-purple-200 outline-0
      `}
      style={{
        background: `linear-gradient(to top, 
            oklch(49.1% 0.27 292.581) ${sound.volume - 60}%,
            oklch(62.7% 0.265 303.9) ${sound.volume}%, 
            oklch(25.7% 0.09 281.288) ${sound.volume}%)`,
      }}
    >
      <header>
        {sound.isLoading ? (
          <div className="w-10 h-10 rounded-full border-4 border-purple-300 border-t-transparent animate-spin" />
        ) : (
          <SoundIcon
            size={64}
            className="text-purple-300 group-hover:text-purple-200 transition-colors duration-200"
            weight="duotone"
          />
        )}
      </header>
      {!!isChangingVolume && (
        <section className="absolute -bottom-10 left-0 -translate-y-1/2 w-full flex items-center justify-center">
          <p className="text-sm select-none text-purple-200">
            Volume: {sound.volume}%
          </p>
        </section>
      )}
    </div>
  )
}
