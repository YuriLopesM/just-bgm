import type { ElementType } from 'react'

import {
  GithubLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from '@phosphor-icons/react'

export type EnabledSocials = 'github' | 'x' | 'linkedin' | 'instagram'

type SocialIconProps = {
  social: EnabledSocials
}

type SocialIconMap = {
  href: string
  icon: ElementType
}

export const SocialIcon = ({ social }: SocialIconProps) => {
  const socials: Record<string, SocialIconMap> = {
    github: {
      href: 'https://github.com/yurilopesm',
      icon: GithubLogoIcon,
    },
    x: {
      href: 'https://x.com/l1mitt',
      icon: XLogoIcon,
    },
    linkedin: {
      href: 'https://www.linkedin.com/in/yuri-lopes-machado/',
      icon: LinkedinLogoIcon,
    },
    instagram: {
      href: 'https://www.instagram.com/yurilopesm/',
      icon: InstagramLogoIcon,
    },
  }

  const Icon = socials[social].icon

  return (
    <a
      href={socials[social].href}
      className="text-white hover:text-purple-300 transition-colors"
      target="_blank"
      aria-label={`Redirect to social media ${social} profile`}
    >
      <Icon className="inline-block mr-2" weight="fill" size={20} />
    </a>
  )
}
