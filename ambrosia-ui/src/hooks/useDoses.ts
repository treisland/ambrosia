import { useState, useEffect, useCallback } from 'react'
import { db } from '../database/schema'
import type { Dose } from '../database/schema'

type DoseStatus = 'scheduled' | 'taken' | 'snoozed' | 'missed' | 'skipped'

export interface DoseWithMedication extends Dose {
  medication?: {
    id: number
    name: string
    dosage: string
    instructions?: string
  }
}

export function useDoses() {
  const [doses, setDoses] = useState<DoseWithMedication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDoses = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    try {
      setLoading(true)
      setError(null)

      let query = db.doses.orderBy('scheduledTime')
      
      if (dateRange) {
        query = query.filter(d => d.scheduledTime >= dateRange.start && d.scheduledTime <= dateRange.end)
      }

      const dosesData = await query.toArray()
      const dosesWithMedication: DoseWithMedication[] = []

      for (const dose of dosesData) {
        const medication = await db.medications.get(dose.medicationId)
        dosesWithMedication.push({
          ...dose,
          medication: medication ? {
            id: medication.id!,
            name: medication.name,
            dosage: medication.dosage,
            instructions: medication.instructions
          } : undefined
        })
      }

      setDoses(dosesWithMedication)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doses')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateDoseStatus = useCallback(async (doseId: number, status: DoseStatus, notes?: string) => {
    try {
      const updates: Partial<Dose> = { status }
      
      if (status === 'taken') {
        updates.takenTime = new Date()
      }
      
      if (notes) {
        updates.notes = notes
      }

      await db.doses.update(doseId, updates)
      await loadDoses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dose status')
      throw err
    }
  }, [loadDoses])

  const snoozeDose = useCallback(async (doseId: number, minutes: number) => {
    try {
      const snoozeUntil = new Date()
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes)
      
      await db.doses.update(doseId, {
        status: 'snoozed',
        snoozeUntil
      })
      await loadDoses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to snooze dose')
      throw err
    }
  }, [loadDoses])

  const getTodaysDoses = useCallback(async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    await loadDoses({ start: today, end: tomorrow })
  }, [loadDoses])

  const getUpcomingDoses = useCallback(async (hours: number = 24) => {
    const now = new Date()
    const future = new Date(now)
    future.setHours(future.getHours() + hours)

    await loadDoses({ start: now, end: future })
  }, [loadDoses])

  useEffect(() => {
    loadDoses()
  }, [loadDoses])

  return {
    doses,
    loading,
    error,
    updateDoseStatus,
    snoozeDose,
    getTodaysDoses,
    getUpcomingDoses,
    refresh: loadDoses
  }
}
