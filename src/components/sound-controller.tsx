import { useRef, useState, type ElementType } from 'react'

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
  const timeoutRef = useRef<number | null>(null)
  const [isChangingVolume, setChangingVolume] = useState(false)
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
    handleVolumeChange(sound, clamp(volume - e.deltaY * sensitivity))
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

    handleVolumeChange(sound, clamp(volume + delta * sensitivity))

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
      handleVolumeChange(sound, clamp(volume + 5))
      return
    }

    if (e.key === 'ArrowDown') {
      setChangingVolume(true)
      handleVolumeChange(sound, clamp(volume - 5))
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
      data-label={sound.toUpperCase()}
      className={`
        relative w-36 flex flex-col items-center justify-center gap-4 p-6 m-0 shadow-xl
        border border-purple-400 rounded-lg cursor-s-resize 
        before:content-[attr(data-label)] before:absolute before:-top-6 before:text-xs before:text-white before:select-none
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
      {!!isChangingVolume && (
        <section className="absolute -bottom-10 left-0 -translate-y-1/2 w-full flex items-center justify-center">
          <p className="text-sm select-none text-purple-200">
            Volume: {volume}%
          </p>
        </section>
      )}
    </div>
  )
}
