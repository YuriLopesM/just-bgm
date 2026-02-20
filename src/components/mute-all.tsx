import type { ComponentProps } from 'react'

import { SpeakerSlashIcon } from '@phosphor-icons/react'

type MuteAllButtonProps = {
  className?: ComponentProps<'div'>['className']
  onClick: () => void
}

export const MuteAllButton = ({ className, onClick }: MuteAllButtonProps) => {
  return (
    <button
      aria-label="Mute all sounds button"
      onClick={onClick}
      className={`p-2 cursor-pointer rounded-full text-white  hover:bg-red-500 transition ${className || ''}`}
    >
      <SpeakerSlashIcon size={20} />
    </button>
  )
}
