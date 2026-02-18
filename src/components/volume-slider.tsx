type VolumeSliderProps = {
  volume: number
  setVolume: (v: number) => void
}

export const VolumeSlider = ({ volume, setVolume }: VolumeSliderProps) => {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={volume}
      onChange={(e) => setVolume(Number(e.target.value))}
      className="
        w-24
        md:w-64
      accent-purple-400
        cursor-pointer
      "
    />
  )
}
