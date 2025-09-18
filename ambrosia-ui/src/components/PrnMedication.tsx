import { useState } from 'react'
import { ScheduleService } from '../services/scheduleService'
import type { Dose } from '../database/schema'

interface PrnMedicationProps {
  medication: {
    id: number
    name: string
    dosage: string
    instructions?: string
  }
  schedule: {
    prnLimits: {
      minIntervalHours: number
      maxDosesPerDay: number
      maxDosePerDay?: number
    }
  }
  recentDoses: Dose[]
  onTakeDose: (medicationId: number, dosage: string, notes?: string) => Promise<void>
}

export function PrnMedication({ medication, schedule, recentDoses, onTakeDose }: PrnMedicationProps) {
  const [isTaking, setIsTaking] = useState(false)
  const [notes, setNotes] = useState('')
  const [showForm, setShowForm] = useState(false)

  const canTakeResult = ScheduleService.canTakePrnDose(
    medication.id,
    schedule.prnLimits,
    recentDoses.map(dose => ({
      medicationId: dose.medicationId,
      takenTime: dose.takenTime || new Date(),
      dosage: dose.dosage
    }))
  )

  const handleTakeDose = async () => {
    if (!canTakeResult.canTake) return

    setIsTaking(true)
    try {
      await onTakeDose(medication.id, medication.dosage, notes.trim() || undefined)
      setNotes('')
      setShowForm(false)
    } catch (error) {
      console.error('Failed to take PRN dose:', error)
    } finally {
      setIsTaking(false)
    }
  }

  const todayDoses = recentDoses.filter(dose => {
    const today = new Date()
    const doseDate = new Date(dose.takenTime || new Date())
    return dose.medicationId === medication.id && 
           doseDate.toDateString() === today.toDateString()
  })

  const lastDose = recentDoses
    .filter(dose => dose.medicationId === medication.id && dose.takenTime)
    .sort((a, b) => (b.takenTime?.getTime() || 0) - (a.takenTime?.getTime() || 0))[0]

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {medication.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {medication.dosage}
            {medication.instructions && ` • ${medication.instructions}`}
          </p>
          
          {/* PRN Status */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Today: {todayDoses.length}/{schedule.prnLimits.maxDosesPerDay} doses
            </span>
            {lastDose && (
              <span>
                Last taken: {new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }).format(new Date(lastDose.takenTime!))}
              </span>
            )}
          </div>

          {/* Can't take reason */}
          {!canTakeResult.canTake && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-300">
              {canTakeResult.reason}
            </div>
          )}
        </div>

        <div className="ml-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              disabled={!canTakeResult.canTake}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                canTakeResult.canTake
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Take Now
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleTakeDose}
                disabled={isTaking}
                className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isTaking ? 'Taking...' : 'Confirm'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes form */}
      {showForm && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this dose..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            rows={2}
          />
        </div>
      )}
    </div>
  )
}
