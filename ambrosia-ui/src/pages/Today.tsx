import { useDoses } from '../hooks/useDoses'
import { useMedications } from '../hooks/useMedications'
import { useNotifications } from '../contexts/NotificationContext'
import { useEffect, useState } from 'react'

export default function Today() {
  const { doses, updateDoseStatus, snoozeDose, getTodaysDoses, loading } = useDoses()
  const { medications } = useMedications()
  const { scheduleReminder, cancelReminder, permission } = useNotifications()
  const [nextDose, setNextDose] = useState<any>(null)
  const [upcomingDoses, setUpcomingDoses] = useState<any[]>([])

  useEffect(() => {
    getTodaysDoses()
  }, [getTodaysDoses])

  useEffect(() => {
    if (doses.length > 0) {
      const now = new Date()
      const todayDoses = doses.filter(dose => {
        const doseDate = new Date(dose.scheduledTime)
        return doseDate.toDateString() === now.toDateString()
      })

      const scheduledDoses = todayDoses.filter(dose => dose.status === 'scheduled')
      const next = scheduledDoses.sort((a, b) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      )[0]

      const upcoming = scheduledDoses.slice(1, 4) // Next 3 doses

      setNextDose(next)
      setUpcomingDoses(upcoming)

      // Schedule notifications for upcoming doses
      scheduledDoses.forEach(dose => {
        if (dose.medication?.id) {
          scheduleReminder(
            dose.medication.id,
            new Date(dose.scheduledTime),
            dose.medication.name
          )
        }
      })
    }
  }, [doses, scheduleReminder])

  const handleTakeDose = async (doseId: number) => {
    try {
      await updateDoseStatus(doseId, 'taken')
      // Cancel any pending notifications for this dose
      const dose = doses.find(d => d.id === doseId)
      if (dose?.medication?.id) {
        await cancelReminder(dose.medication.id)
      }
    } catch (error) {
      console.error('Failed to mark dose as taken:', error)
    }
  }

  const handleSnoozeDose = async (doseId: number) => {
    try {
      await snoozeDose(doseId, 10)
      // Reschedule notification for snoozed dose
      const dose = doses.find(d => d.id === doseId)
      if (dose?.medication?.id) {
        const snoozeTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        await scheduleReminder(dose.medication.id, snoozeTime, dose.medication.name)
      }
    } catch (error) {
      console.error('Failed to snooze dose:', error)
    }
  }

  const handleSkipDose = async (doseId: number) => {
    try {
      await updateDoseStatus(doseId, 'skipped')
      // Cancel any pending notifications for this dose
      const dose = doses.find(d => d.id === doseId)
      if (dose?.medication?.id) {
        await cancelReminder(dose.medication.id)
      }
    } catch (error) {
      console.error('Failed to skip dose:', error)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24 mb-2"></div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-48 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-20"></div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notification Status */}
      {permission !== 'granted' && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Notifications Disabled
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Enable notifications to receive medication reminders. Go to Settings to configure.
              </p>
            </div>
          </div>
        </div>
      )}

      {nextDose ? (
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <h2 className="text-base font-semibold">Next dose</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {nextDose.medication?.name} {nextDose.medication?.dosage} • {formatTime(new Date(nextDose.scheduledTime))}
            {nextDose.medication?.instructions && ` • ${nextDose.medication.instructions}`}
          </p>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => handleTakeDose(nextDose.id)}
              className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500"
            >
              Take
            </button>
            <button 
              onClick={() => handleSnoozeDose(nextDose.id)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Snooze 10m
            </button>
            <button 
              onClick={() => handleSkipDose(nextDose.id)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Skip
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <h2 className="text-base font-semibold">All caught up!</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No more doses scheduled for today.</p>
        </section>
      )}

      {upcomingDoses.length > 0 && (
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upcoming</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {upcomingDoses.map((dose) => (
              <li key={dose.id} className="flex items-center justify-between">
                <span>{dose.medication?.name} {dose.medication?.dosage}</span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {formatTime(new Date(dose.scheduledTime))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Adherence Stats */}
      {medications.length > 0 && (
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Adherence</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-600 dark:text-zinc-400">7-day average</div>
              <div className="font-medium">
                {medications.length > 0 
                  ? Math.round(medications.reduce((sum, med) => sum + (med.adherenceRate || 0), 0) / medications.length)
                  : 0}%
              </div>
            </div>
            <div>
              <div className="text-zinc-600 dark:text-zinc-400">Active medications</div>
              <div className="font-medium">{medications.length}</div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

