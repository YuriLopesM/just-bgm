import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

import Clarity from '@microsoft/clarity'

import { Toaster } from 'sonner'

export function Providers() {
  const clarityId = import.meta.env.VITE_CLARITY_ID
  Clarity.init(clarityId)
  Clarity.consentV2()

  return (
    <>
      <Toaster position="bottom-right" theme="dark" duration={2000} />
      <RouterProvider router={router} />
    </>
  )
}
