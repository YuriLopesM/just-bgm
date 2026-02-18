import { ShareIcon } from '@phosphor-icons/react'

type ShareButtonProps = {
  onClick: () => void
}

export function ShareButton({ onClick }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex gap-2 items-center p-2 cursor-pointer text-sm font-light
      hover:bg-purple-300/10 hover:text-purple-300 transition
      "
      aria-label="Click here to copy the link and share your mix with anyone"
    >
      Share your mix <ShareIcon size={16} />
    </button>
  )
}
