import { PauseIcon, PlayIcon, SpinnerIcon } from '@phosphor-icons/react'

type StartStopProps = {
  play: () => void
  pause: () => void
  isPlaying: boolean
  isLoading: boolean
}

export const PlayPause = ({
  play,
  pause,
  isPlaying,
  isLoading,
}: StartStopProps) => {
  if (isLoading) {
    return (
      <SpinnerIcon
        size={80}
        className="animate-[spin_2s_linear_infinite,pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]"
      />
    )
  }

  return (
    <>
      {isPlaying ? (
        <button
          onClick={() => pause()}
          className="animate-pulse cursor-pointer"
          aria-label="pause"
        >
          <PauseIcon size={80} weight="fill" />
        </button>
      ) : (
        <button
          onClick={() => play()}
          className="cursor-pointer"
          aria-label="start"
        >
          <PlayIcon size={80} weight="fill" />
        </button>
      )}
    </>
  )
}
