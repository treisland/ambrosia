import { useEffect, useMemo, useState } from 'react'
import { fetchWeekDoseEvents } from '../mocks/schedule'
import type { DoseEvent } from '../types/schedule'
import { useChatbot } from '../contexts/ChatbotContext'

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date)
}

export default function CalendarPage() {
  const [events, setEvents] = useState<DoseEvent[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { open } = useChatbot()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchWeekDoseEvents().then(
      evs => {
        if (!mounted) return
        setEvents(evs)
        setLoading(false)
      },
      err => {
        console.error(err)
        if (!mounted) return
        setError('Failed to load schedule')
        setLoading(false)
      }
    )
    return () => {
      mounted = false
    }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, DoseEvent[]>()
    if (!events) return map
    for (const e of events) {
      const key = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate()).toISOString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    for (const [, list] of map) list.sort((a, b) => a.start.getTime() - b.start.getTime())
    return map
  }, [events])

  function updateEvent(id: string, updater: (e: DoseEvent) => DoseEvent) {
    setEvents(prev => (prev ? prev.map(e => (e.id === id ? updater(e) : e)) : prev))
  }

  function onTake(e: DoseEvent) {
    updateEvent(e.id, prev => ({ ...prev, status: 'taken' }))
  }

  function onSkip(e: DoseEvent) {
    updateEvent(e.id, prev => ({ ...prev, status: 'skipped' }))
  }

  function onSnooze(e: DoseEvent) {
    const newStart = new Date(e.start)
    newStart.setMinutes(newStart.getMinutes() + 10)
    const newEnd = new Date(e.end)
    newEnd.setMinutes(newEnd.getMinutes() + 10)
    updateEvent(e.id, prev => ({ ...prev, start: newStart, end: newEnd, status: 'snoozed' }))
  }

  if (loading) return <div>Loading…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!events) return null

  const days = [...grouped.keys()].sort()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Week</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {days.map(dayIso => {
          const dayDate = new Date(dayIso)
          const list = grouped.get(dayIso) || []
          return (
            <section key={dayIso} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{formatDate(dayDate)}</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {list.map(e => (
                  <li key={e.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {e.medication}{e.doseMg ? ` ${e.doseMg} mg` : ''}
                        {e.status !== 'scheduled' && (
                          <span className={
                            'ml-2 rounded-full px-2 py-0.5 text-[10px] border ' +
                            (e.status === 'taken'
                              ? 'bg-green-600 text-white border-green-600'
                              : e.status === 'snoozed'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300')
                          }>
                            {e.status}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {formatTime(e.start)}{e.instructions ? ` • ${e.instructions}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onTake(e)} className="rounded-md bg-blue-600 text-white px-2.5 py-1.5 text-xs hover:bg-blue-500">Take</button>
                      <button onClick={() => onSnooze(e)} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs">Snooze</button>
                      <button onClick={() => onSkip(e)} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs">Skip</button>
                      <button
                        className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs"
                        onClick={() =>
                          open({
                            question: `What should I know about ${e.medication} ${e.doseMg ? e.doseMg + ' mg ' : ''}for this dose?`,
                            context: { medication: e.medication, doseMg: e.doseMg, at: e.start.toISOString() },
                          })
                        }
                      >
                        Ask
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}