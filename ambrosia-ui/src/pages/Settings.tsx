import { NotificationSettings } from '../components/NotificationSettings'
import { TravelMode } from '../components/TravelMode'
import { useState } from 'react'

export default function Settings() {
  const [currentTimezone, setCurrentTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  const handleTimezoneChange = (timezone: string) => {
    setCurrentTimezone(timezone)
    // In a real app, you'd update the database and adjust all schedules
    console.log('Timezone changed to:', timezone)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      
      {/* Notification Settings */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <NotificationSettings />
      </div>

      {/* Travel Mode */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <TravelMode 
          currentTimezone={currentTimezone}
          onTimezoneChange={handleTimezoneChange}
        />
      </div>

      {/* Other Settings Placeholder */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Other Settings
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">Profile & Timezone</span>
            <span className="text-gray-400">Coming soon</span>
          </li>
          <li className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">Backup & Sync</span>
            <span className="text-gray-400">Coming soon</span>
          </li>
          <li className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">Privacy & Consents</span>
            <span className="text-gray-400">Coming soon</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

