import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

import Clarity from '@microsoft/clarity'

import { Toaster } from 'sonner'

import { useEffect } from 'react'

export function Providers() {
  const clarityId = import.meta.env.VITE_CLARITY_ID

  useEffect(() => {
    if (!clarityId) return

    Clarity.init(clarityId)
    Clarity.consentV2()
  }, [clarityId])

  return (
    <>
      <Toaster position="bottom-right" theme="dark" duration={2000} />
      <RouterProvider router={router} />
    </>
  )
}
