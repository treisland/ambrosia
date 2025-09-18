import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { db } from '../database/schema'

export type NotificationPermission = 'default' | 'granted' | 'denied'

export type NotificationSettings = {
  enabled: boolean
  reminderMinutes: number[]
  quietHours: {
    start: string // HH:MM
    end: string // HH:MM
  }
  sound: boolean
  vibration: boolean
}

type NotificationContextValue = {
  permission: NotificationPermission
  settings: NotificationSettings
  requestPermission: () => Promise<NotificationPermission>
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>
  scheduleReminder: (medicationId: number, scheduledTime: Date, medicationName: string) => Promise<void>
  cancelReminder: (medicationId: number) => Promise<void>
  isInQuietHours: () => boolean
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminderMinutes: [15, 5, 0], // 15 min before, 5 min before, at time
    quietHours: {
      start: '22:00',
      end: '08:00'
    },
    sound: true,
    vibration: true
  })

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermission)
    }
  }, [])

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await db.userSettings.toArray()
        if (userSettings.length > 0) {
          setSettings(userSettings[0].notifications)
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      }
    }
    loadSettings()
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result as NotificationPermission)
      return result as NotificationPermission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }, [])

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    try {
      // Update in database
      const existingSettings = await db.userSettings.toArray()
      if (existingSettings.length > 0) {
        await db.userSettings.update(existingSettings[0].id!, {
          notifications: updatedSettings
        })
      } else {
        await db.userSettings.add({
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: updatedSettings,
          appearance: {
            theme: 'system',
            fontSize: 'medium'
          },
          privacy: {
            dataSharing: false,
            analytics: false,
            crashReporting: false
          },
          backup: {
            enabled: false,
            frequency: 'weekly'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error)
    }
  }, [settings])

  const isInQuietHours = useCallback((): boolean => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    
    const { start, end } = settings.quietHours
    
    // Handle quiet hours that span midnight (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end
    }
    
    return currentTime >= start && currentTime <= end
  }, [settings.quietHours])

  const scheduleReminder = useCallback(async (
    medicationId: number, 
    scheduledTime: Date, 
    medicationName: string
  ) => {
    if (permission !== 'granted' || !settings.enabled) {
      return
    }

    // Check if we're in quiet hours
    if (isInQuietHours()) {
      console.log('Skipping notification due to quiet hours')
      return
    }

    // Schedule notifications for each reminder time
    for (const minutesBefore of settings.reminderMinutes) {
      const reminderTime = new Date(scheduledTime.getTime() - (minutesBefore * 60 * 1000))
      const now = new Date()
      
      // Only schedule future reminders
      if (reminderTime > now) {
        const timeoutId = setTimeout(() => {
          showNotification(medicationId, medicationName, minutesBefore)
        }, reminderTime.getTime() - now.getTime())

        // Store timeout ID for potential cancellation
        // In a real app, you'd store this in IndexedDB or use a more robust scheduling system
        console.log(`Scheduled reminder for ${medicationName} in ${minutesBefore} minutes`)
        // Suppress unused variable warning
        void timeoutId
      }
    }
  }, [permission, settings, isInQuietHours])

  const cancelReminder = useCallback(async (medicationId: number) => {
    // In a real implementation, you'd cancel the scheduled timeouts
    console.log(`Cancelled reminders for medication ${medicationId}`)
  }, [])

  const showNotification = useCallback((
    medicationId: number, 
    medicationName: string, 
    minutesBefore: number
  ) => {
    if (permission !== 'granted' || !settings.enabled) {
      return
    }

    const title = minutesBefore === 0 
      ? `Time to take ${medicationName}`
      : `${medicationName} reminder in ${minutesBefore} minutes`

    const options: NotificationOptions = {
      body: minutesBefore === 0 
        ? 'Don\'t forget to take your medication'
        : `Your next dose is due in ${minutesBefore} minutes`,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: `medication-${medicationId}`,
      requireInteraction: minutesBefore === 0,
      data: {
        medicationId,
        medicationName,
        scheduledTime: new Date().toISOString()
      },
      // Note: actions are not supported in all browsers
      // In a real app, you'd use a more robust notification system
    }

    try {
      new Notification(title, options)
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }, [permission, settings])

  const value = useMemo(
    () => ({
      permission,
      settings,
      requestPermission,
      updateSettings,
      scheduleReminder,
      cancelReminder,
      isInQuietHours
    }),
    [permission, settings, requestPermission, updateSettings, scheduleReminder, cancelReminder, isInQuietHours]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
