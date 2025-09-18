import { useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext'

export function NotificationSettings() {
  const { permission, settings, requestPermission, updateSettings, isInQuietHours } = useNotifications()
  const [isRequesting, setIsRequesting] = useState(false)

  const handlePermissionRequest = async () => {
    setIsRequesting(true)
    try {
      await requestPermission()
    } finally {
      setIsRequesting(false)
    }
  }

  const handleToggleEnabled = (enabled: boolean) => {
    updateSettings({ enabled })
  }

  const handleReminderMinutesChange = (minutes: number[]) => {
    updateSettings({ reminderMinutes: minutes })
  }

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    updateSettings({
      quietHours: {
        ...settings.quietHours,
        [field]: value
      }
    })
  }

  const handleSoundToggle = (sound: boolean) => {
    updateSettings({ sound })
  }

  const handleVibrationToggle = (vibration: boolean) => {
    updateSettings({ vibration })
  }

  const reminderOptions = [
    { value: 0, label: 'At scheduled time' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Settings
        </h3>
        
        {/* Permission Status */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Notification Permission</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: <span className={`font-medium ${
                  permission === 'granted' ? 'text-green-600' : 
                  permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {permission === 'granted' ? 'Granted' : 
                   permission === 'denied' ? 'Denied' : 'Not requested'}
                </span>
              </p>
            </div>
            {permission !== 'granted' && (
              <button
                onClick={handlePermissionRequest}
                disabled={isRequesting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? 'Requesting...' : 'Request Permission'}
              </button>
            )}
          </div>
        </div>

        {/* Enable Notifications */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Enable Notifications</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive medication reminders
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleToggleEnabled(e.target.checked)}
              disabled={permission !== 'granted'}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Reminder Times */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Reminder Times</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose when you want to be reminded before each dose
          </p>
          <div className="space-y-2">
            {reminderOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.reminderMinutes.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleReminderMinutesChange([...settings.reminderMinutes, option.value].sort((a, b) => b - a))
                    } else {
                      handleReminderMinutesChange(settings.reminderMinutes.filter(m => m !== option.value))
                    }
                  }}
                  disabled={!settings.enabled || permission !== 'granted'}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Quiet Hours</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No notifications will be sent during these hours
            {isInQuietHours() && (
              <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
                (Currently in quiet hours)
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={settings.quietHours.start}
                onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                disabled={!settings.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={settings.quietHours.end}
                onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                disabled={!settings.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Sound & Vibration */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Notification Preferences</h4>
          
          {/* Sound */}
          <div className="flex items-center justify-between py-2">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">Sound</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Play sound with notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => handleSoundToggle(e.target.checked)}
                disabled={!settings.enabled || permission !== 'granted'}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between py-2">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">Vibration</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vibrate device with notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) => handleVibrationToggle(e.target.checked)}
                disabled={!settings.enabled || permission !== 'granted'}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
