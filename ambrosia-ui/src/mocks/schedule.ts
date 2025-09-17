import type { DoseEvent } from '../types/schedule'

export async function fetchWeekDoseEvents(baseDate: Date = new Date()): Promise<DoseEvent[]> {
  const startOfWeek = getStartOfWeek(baseDate)
  const events: DoseEvent[] = []

  for (let d = 0; d < 7; d++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + d)

    // Metformin 500 mg at 8:00 and 20:00
    events.push(createEvent(day, 8, 0, 30, 'Metformin', 500, 'with food'))
    events.push(createEvent(day, 20, 0, 30, 'Metformin', 500, 'with food'))

    // Lisinopril 20 mg at 12:00
    events.push(createEvent(day, 12, 0, 30, 'Lisinopril', 20))
  }

  // Simulate latency
  await delay(150)
  return events
}

function createEvent(
  day: Date,
  hour: number,
  minute: number,
  durationMin: number,
  medication: string,
  doseMg?: number,
  instructions?: string
): DoseEvent {
  const start = new Date(day)
  start.setHours(hour, minute, 0, 0)
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + durationMin)
  return {
    id: `${medication}-${start.toISOString()}`,
    medication,
    doseMg,
    instructions,
    start,
    end,
    status: 'scheduled',
  }
}

function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = d.getDate() - day
  const res = new Date(d)
  res.setDate(diff)
  res.setHours(0, 0, 0, 0)
  return res
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}