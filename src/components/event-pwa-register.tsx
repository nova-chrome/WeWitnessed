'use client'

import { useEffect } from 'react'
import { tryCatch } from '~/utils/try-catch'

interface EventPWARegisterProps {
  slug: string
}

/**
 * Registers the service worker with event-specific scope.
 *
 * This is a Client Component (not just a hook) because it establishes
 * the client boundary needed by the Server Component layout. The layout
 * cannot directly call hooks, so we wrap the logic in a component.
 */

export function EventPWARegister({ slug }: EventPWARegisterProps) {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return

      const { data: registration, error } = await tryCatch(
        navigator.serviceWorker.register('/sw.js', {
          scope: `/e/${slug}/`,
          updateViaCache: 'none',
        }),
      )

      if (error) {
        console.error('Service Worker registration failed:', error)
        return
      }

      console.log(`Service Worker registered for /e/${slug}/`, registration)
    }

    registerServiceWorker()
  }, [slug])

  return null
}
