// Service Worker for Ambrosia Medication Management
const CACHE_NAME = 'ambrosia-v1'
const NOTIFICATION_TAG = 'ambrosia-medication-reminder'

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Background sync for medication reminders
self.addEventListener('sync', (event) => {
  if (event.tag === 'medication-reminder') {
    console.log('Background sync: medication reminder')
    event.waitUntil(handleMedicationReminder())
  }
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'Time to take your medication',
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: NOTIFICATION_TAG,
      requireInteraction: true,
      actions: [
        {
          action: 'take',
          title: 'Take Now',
          icon: '/vite.svg'
        },
        {
          action: 'snooze',
          title: 'Snooze 15min',
          icon: '/vite.svg'
        },
        {
          action: 'skip',
          title: 'Skip',
          icon: '/vite.svg'
        }
      ],
      data: data
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Medication Reminder', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'take') {
    // Open app and mark as taken
    event.waitUntil(
      clients.openWindow('/?action=take&medicationId=' + event.notification.data.medicationId)
    )
  } else if (event.action === 'snooze') {
    // Snooze for 15 minutes
    event.waitUntil(
      clients.openWindow('/?action=snooze&medicationId=' + event.notification.data.medicationId)
    )
  } else if (event.action === 'skip') {
    // Mark as skipped
    event.waitUntil(
      clients.openWindow('/?action=skip&medicationId=' + event.notification.data.medicationId)
    )
  } else {
    // Default click - just open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Handle medication reminder logic
async function handleMedicationReminder() {
  try {
    // This would typically fetch from IndexedDB or make API calls
    // For now, we'll just log the action
    console.log('Processing medication reminder in background')
    
    // In a real implementation, you would:
    // 1. Check for upcoming doses
    // 2. Send notifications if needed
    // 3. Update dose statuses
    // 4. Handle snoozed doses
    
    return Promise.resolve()
  } catch (error) {
    console.error('Error handling medication reminder:', error)
    return Promise.reject(error)
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'medication-check') {
    console.log('Periodic sync: medication check')
    event.waitUntil(handleMedicationReminder())
  }
})
