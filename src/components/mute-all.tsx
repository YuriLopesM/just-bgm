import { SpeakerSlashIcon } from '@phosphor-icons/react'

export const MuteAllButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded hover:bg-red-300 transition"
    >
      <SpeakerSlashIcon size={20} />
    </button>
  )
}
