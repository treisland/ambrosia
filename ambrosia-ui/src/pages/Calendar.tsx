import { useEffect, useMemo, useState } from 'react'
import { fetchRangeDoseEvents } from '../mocks/schedule'
import type { DoseEvent } from '../types/schedule'

type View = 'week' | 'month'

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfWeek(new Date()))
  const [view, setView] = useState<View>('week')
  const [events, setEvents] = useState<DoseEvent[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => (view === 'week' ? weekRange(cursor) : monthRange(cursor)), [cursor, view])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchRangeDoseEvents(range.start, range.end).then(
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
  }, [range.start.getTime(), range.end.getTime()])

  const dayStatus = useMemo(() => {
    const map = new Map<string, { taken: number; scheduled: number }>()
    if (!events) return map
    for (const e of events) {
      const key = isoDay(e.start)
      if (!map.has(key)) map.set(key, { taken: 0, scheduled: 0 })
      const v = map.get(key)!
      v.scheduled += 1
      if (e.status === 'taken') v.taken += 1
    }
    return map
  }, [events])

  function statusForDay(date: Date) {
    const key = isoDay(date)
    const v = dayStatus.get(key)
    if (!v) return 'none' as const
    if (v.taken === 0) return 'missed' as const
    if (v.taken === v.scheduled) return 'taken' as const
    return 'partial' as const
  }

  function prev() {
    setCursor(prev => (view === 'week' ? addDays(prev, -7) : addMonths(prev, -1)))
  }
  function next() {
    setCursor(prev => (view === 'week' ? addDays(prev, 7) : addMonths(prev, 1)))
  }
  function today() {
    setCursor(startOfWeek(new Date()))
  }

  if (loading) return <div>Loading…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Adherence</h2>
        <div className="flex items-center gap-2">
          <button onClick={today} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs">Today</button>
          <button onClick={prev} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs">Prev</button>
          <button onClick={next} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs">Next</button>
          <div className="ml-2 inline-flex rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden">
            <button onClick={() => setView('week')} className={'px-2.5 py-1.5 text-xs ' + (view === 'week' ? 'bg-zinc-200 dark:bg-zinc-800' : '')}>Week</button>
            <button onClick={() => setView('month')} className={'px-2.5 py-1.5 text-xs ' + (view === 'month' ? 'bg-zinc-200 dark:bg-zinc-800' : '')}>Month</button>
          </div>
        </div>
      </div>

      {view === 'week' ? (
        <WeekView start={range.start} end={range.end} statusForDay={statusForDay} />
      ) : (
        <MonthView start={range.start} end={range.end} statusForDay={statusForDay} />
      )}
    </div>
  )
}

function WeekView({ start, end, statusForDay }: { start: Date; end: Date; statusForDay: (d: Date) => 'taken' | 'partial' | 'missed' | 'none' }) {
  const days: Date[] = []
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(new Date(d))
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(d => (
        <DayCard key={d.toISOString()} date={d} status={statusForDay(d)} />
      ))}
    </div>
  )
}

function MonthView({ start, end, statusForDay }: { start: Date; end: Date; statusForDay: (d: Date) => 'taken' | 'partial' | 'missed' | 'none' }) {
  const days: Date[] = []
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(new Date(d))
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm">
      <div className="grid grid-cols-7 text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 px-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => (
          <div key={d.toISOString()} className="aspect-square">
            <DayCell date={d} status={statusForDay(d)} isFaded={d.getMonth() !== start.getMonth()} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DayCard({ date, status }: { date: Date; status: 'taken' | 'partial' | 'missed' | 'none' }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm text-center">
      <div className="text-sm font-medium">{formatDay(date)}</div>
      <StatusPill status={status} className="mt-2 inline-block" />
    </div>
  )
}

function DayCell({ date, status, isFaded }: { date: Date; status: 'taken' | 'partial' | 'missed' | 'none'; isFaded?: boolean }) {
  return (
    <div className={'rounded-md border text-center p-1 ' + (isFaded ? 'opacity-60 ' : '') + borderFor(status)}>
      <div className="text-[11px]">{date.getDate()}</div>
      <StatusDot status={status} className="mx-auto mt-1" />
    </div>
  )
}

function StatusPill({ status, className = '' }: { status: 'taken' | 'partial' | 'missed' | 'none'; className?: string }) {
  const label = status === 'taken' ? 'All taken' : status === 'partial' ? 'Partial' : status === 'missed' ? 'Missed' : 'No doses'
  return (
    <span className={className + ' text-[10px] rounded-full px-2 py-0.5 ' + bgFor(status)}>{label}</span>
  )
}

function StatusDot({ status, className = '' }: { status: 'taken' | 'partial' | 'missed' | 'none'; className?: string }) {
  return <span className={className + ' inline-block h-2.5 w-2.5 rounded-full ' + dotFor(status)} />
}

function bgFor(status: 'taken' | 'partial' | 'missed' | 'none') {
  switch (status) {
    case 'taken':
      return 'bg-green-600 text-white'
    case 'partial':
      return 'bg-amber-500 text-white'
    case 'missed':
      return 'bg-rose-600 text-white'
    default:
      return 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
  }
}

function dotFor(status: 'taken' | 'partial' | 'missed' | 'none') {
  switch (status) {
    case 'taken':
      return 'bg-green-600'
    case 'partial':
      return 'bg-amber-500'
    case 'missed':
      return 'bg-rose-600'
    default:
      return 'bg-zinc-400 dark:bg-zinc-600'
  }
}

function borderFor(status: 'taken' | 'partial' | 'missed' | 'none') {
  switch (status) {
    case 'taken':
      return 'border-green-600/40 dark:border-green-500/40'
    case 'partial':
      return 'border-amber-500/40'
    case 'missed':
      return 'border-rose-600/40'
    default:
      return 'border-zinc-300 dark:border-zinc-700'
  }
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  const res = new Date(d)
  res.setDate(diff)
  res.setHours(0, 0, 0, 0)
  return res
}
function weekRange(cursor: Date) {
  const start = startOfWeek(cursor)
  const end = addDays(start, 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
function monthRange(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const start = startOfWeek(first)
  const lastOfMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
  const end = addDays(startOfWeek(addDays(lastOfMonth, 1)), 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
function addDays(date: Date, amount: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}
function addMonths(date: Date, amount: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + amount)
  return d
}
function isoDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function formatDay(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date)
}