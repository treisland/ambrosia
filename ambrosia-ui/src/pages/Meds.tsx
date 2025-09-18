import { useMedications } from '../hooks/useMedications'
import { Link } from 'react-router-dom'
import { InventoryManager } from '../components/InventoryManager'
import { RefillAlerts } from '../components/RefillAlerts'
import { useState } from 'react'

export default function Meds() {
  const { medications, loading, error } = useMedications()
  const [selectedMedication, setSelectedMedication] = useState<number | null>(null)
  const [showRefillAlerts, setShowRefillAlerts] = useState(false)

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getScheduleDescription = (medication: any) => {
    if (medication.schedules.length === 0) return 'No schedule'
    
    const schedule = medication.schedules[0]
    const times = schedule.times.map((time: string) => formatTime(new Date(`2000-01-01T${time}`))).join(', ')
    const mealTiming = schedule.mealTiming && schedule.mealTiming !== 'none' ? ` • ${schedule.mealTiming} food` : ''
    
    return `${times}${mealTiming}`
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Medications</h2>
          <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-500">+ Add</button>
        </div>
        <div className="animate-pulse">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-48 mb-1"></div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Medications</h2>
          <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-500">+ Add</button>
        </div>
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 shadow-sm">
          <p className="text-sm text-red-600 dark:text-red-400">Error loading medications: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medications</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRefillAlerts(!showRefillAlerts)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {showRefillAlerts ? 'Hide' : 'Show'} Refill Alerts
          </button>
          <Link 
            to="/add"
            className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-500"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Refill Alerts */}
      {showRefillAlerts && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Refill Alerts</h3>
          <RefillAlerts />
        </div>
      )}
      
      {medications.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">No medications added yet</p>
          <Link 
            to="/add"
            className="inline-block rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500"
          >
            Add your first medication
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((medication) => (
            <div key={medication.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-medium text-lg text-gray-900 dark:text-white">
                    {medication.name} {medication.dosage}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getScheduleDescription(medication)}
                  </div>
                  {medication.nextDose && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Next: {formatTime(new Date(medication.nextDose.scheduledTime))}
                    </div>
                  )}
                  {medication.adherenceRate !== undefined && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Adherence: {Math.round(medication.adherenceRate)}%
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMedication(selectedMedication === medication.id ? null : medication.id!)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {selectedMedication === medication.id ? 'Hide' : 'Manage'} Inventory
                  </button>
                </div>
              </div>

              {/* Inventory Management */}
              {selectedMedication === medication.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <InventoryManager 
                    medicationId={medication.id}
                    onInventoryUpdate={() => {
                      // Refresh medications data
                      window.location.reload()
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

