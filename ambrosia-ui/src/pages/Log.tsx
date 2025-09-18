import { useDoses } from '../hooks/useDoses'
import { useEffect, useState } from 'react'

export default function Log() {
  const { doses, loading, error, getTodaysDoses } = useDoses()
  const [filter, setFilter] = useState<'all' | 'taken' | 'missed' | 'skipped'>('all')

  useEffect(() => {
    getTodaysDoses()
  }, [getTodaysDoses])

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return '✓'
      case 'missed':
        return '✕'
      case 'skipped':
        return '○'
      case 'snoozed':
        return '⏰'
      default:
        return '○'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return 'text-green-600 dark:text-green-400'
      case 'missed':
        return 'text-red-600 dark:text-red-400'
      case 'skipped':
        return 'text-zinc-400 dark:text-zinc-500'
      case 'snoozed':
        return 'text-amber-600 dark:text-amber-400'
      default:
        return 'text-zinc-600 dark:text-zinc-400'
    }
  }

  const filteredDoses = doses.filter(dose => {
    if (filter === 'all') return true
    return dose.status === filter
  })

  const groupedDoses = filteredDoses.reduce((groups, dose) => {
    const date = new Date(dose.scheduledTime).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(dose)
    return groups
  }, {} as Record<string, typeof doses>)

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Dose Log</h2>
        <div className="animate-pulse">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-16 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-48"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Dose Log</h2>
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 shadow-sm">
          <p className="text-sm text-red-600 dark:text-red-400">Error loading dose log: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Dose Log</h2>
        <div className="flex gap-1">
          {(['all', 'taken', 'missed', 'skipped'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-2 py-1 text-xs rounded-md ${
                filter === status
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedDoses).length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {filter === 'all' ? 'No doses logged yet' : `No ${filter} doses found`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedDoses)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayDoses]) => (
              <div key={date} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <ul className="space-y-2 text-sm">
                  {dayDoses
                    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                    .map((dose) => (
                      <li key={dose.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={getStatusColor(dose.status)}>
                            {getStatusIcon(dose.status)}
                          </span>
                          <span>
                            {formatTime(new Date(dose.scheduledTime))} {dose.medication?.name} {dose.medication?.dosage}
                          </span>
                        </div>
                        {dose.takenTime && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Taken at {formatTime(new Date(dose.takenTime))}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

