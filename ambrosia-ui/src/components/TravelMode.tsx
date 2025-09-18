import { useState, useEffect } from 'react'

interface TravelModeProps {
  currentTimezone: string
  onTimezoneChange: (timezone: string) => void
}

export function TravelMode({ currentTimezone, onTimezoneChange }: TravelModeProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone)
  const [commonTimezones] = useState([
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'UTC', label: 'UTC' }
  ])

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleEnableTravelMode = () => {
    setIsEnabled(true)
  }

  const handleDisableTravelMode = () => {
    setIsEnabled(false)
    setSelectedTimezone(currentTimezone)
  }

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone)
    onTimezoneChange(timezone)
  }

  const formatTimeInTimezone = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(date)
    } catch (error) {
      return 'Invalid timezone'
    }
  }

  const getTimezoneOffset = (timezone: string) => {
    try {
      const now = new Date()
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
      const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
      const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60)
      return offset
    } catch (error) {
      return 0
    }
  }

  const formatOffset = (offset: number) => {
    const sign = offset >= 0 ? '+' : ''
    return `UTC${sign}${offset}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Travel Mode</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adjust medication schedules for different timezones
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => e.target.checked ? handleEnableTravelMode() : handleDisableTravelMode()}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          {/* Current time display */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Time</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-blue-700 dark:text-blue-300">Home Timezone</div>
                <div className="font-mono text-lg">
                  {formatTimeInTimezone(currentTime, currentTimezone)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {currentTimezone} ({formatOffset(getTimezoneOffset(currentTimezone))})
                </div>
              </div>
              <div>
                <div className="text-blue-700 dark:text-blue-300">Travel Timezone</div>
                <div className="font-mono text-lg">
                  {formatTimeInTimezone(currentTime, selectedTimezone)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {selectedTimezone} ({formatOffset(getTimezoneOffset(selectedTimezone))})
                </div>
              </div>
            </div>
          </div>

          {/* Timezone selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Timezone
            </label>
            <select
              value={selectedTimezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {commonTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Travel mode info */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Travel Mode Active
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  All medication schedules will be adjusted to the selected timezone. 
                  Remember to switch back to your home timezone when you return.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isEnabled && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enable travel mode to adjust your medication schedules for different timezones.
          </p>
        </div>
      )}
    </div>
  )
}
