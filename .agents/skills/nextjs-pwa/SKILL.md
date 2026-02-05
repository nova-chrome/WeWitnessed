---
name: nextjs-pwa
description: Set up Progressive Web App features in Next.js App Router projects. Use when adding PWA support, web app manifest, service workers, push notifications, or making an app installable.
---

# Next.js PWA Setup

Guide for implementing PWA features in Next.js App Router applications.

## Web App Manifest

Create `app/manifest.ts`:

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'App Name',
    short_name: 'App',
    description: 'App description',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
```

Place icon files in `public/`. Use [favicon generators](https://realfavicongenerator.net/) to create icon sets.

## Service Worker

Create `public/sw.js`:

```javascript
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
```

## Push Notifications

### 1. Generate VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Add to `.env`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 2. Server Actions

Create `app/actions.ts`:

```typescript
'use server'

import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

let subscription: PushSubscription | null = null

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  // Production: store in database
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // Production: remove from database
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Notification',
        body: message,
        icon: '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
```

### 3. Client Component

```typescript
'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
    setSubscription(sub)
    await subscribeUser(JSON.parse(JSON.stringify(sub)))
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe()
    setSubscription(null)
    await unsubscribeUser()
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <div>
      {subscription ? (
        <button onClick={unsubscribeFromPush}>Unsubscribe from notifications</button>
      ) : (
        <button onClick={subscribeToPush}>Enable notifications</button>
      )}
    </div>
  )
}
```

## Install Prompt (iOS)

```typescript
'use client'

import { useState, useEffect } from 'react'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) return null

  return (
    <div>
      {isIOS && (
        <p>
          To install this app, tap the share button and then "Add to Home Screen".
        </p>
      )}
    </div>
  )
}
```

## Security Headers

Add to `next.config.ts`:

```typescript
const config = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ]
  },
}
```

## Requirements for Installability

1. Valid web app manifest with icons
2. Served over HTTPS
3. Registered service worker

## Local Testing

```bash
next dev --experimental-https
```

Ensure browser notifications are enabled and accept permission prompts.

## Offline Support

For offline functionality, use [Serwist](https://github.com/serwist/serwist):

```bash
npm install @serwist/next serwist
```

See [Serwist Next.js example](https://github.com/serwist/serwist/tree/main/examples/next-basic) for integration.

## Browser Support

- iOS 16.4+ (home screen installed apps)
- Safari 16+ (macOS 13+)
- Chromium-based browsers
- Firefox

## References

- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Web App Manifest API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)
