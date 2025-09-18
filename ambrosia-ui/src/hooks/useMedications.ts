import { useState, useEffect, useCallback } from 'react'
import { db } from '../database/schema'
import type { Medication, Schedule, Dose, Inventory } from '../database/schema'

export interface MedicationWithDetails extends Medication {
  schedules: Schedule[]
  inventory?: Inventory
  nextDose?: Dose
  adherenceRate?: number
}

export function useMedications() {
  const [medications, setMedications] = useState<MedicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMedications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const meds = await db.medications.where('isActive').equals(1).toArray()
      const medsWithDetails: MedicationWithDetails[] = []

      for (const med of meds) {
        const schedules = await db.schedules.where('medicationId').equals(med.id!).and(s => s.isActive).toArray()
        const inventory = await db.inventory.where('medicationId').equals(med.id!).first()
        
        // Get next dose
        const nextDose = await db.doses
          .where('medicationId')
          .equals(med.id!)
          .and(d => d.status === 'scheduled' && d.scheduledTime > new Date())
          .first()

        // Calculate adherence rate (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const recentDoses = await db.doses
          .where('medicationId')
          .equals(med.id!)
          .and(d => d.scheduledTime >= sevenDaysAgo)
          .toArray()

        const totalScheduled = recentDoses.length
        const taken = recentDoses.filter(d => d.status === 'taken').length
        const adherenceRate = totalScheduled > 0 ? (taken / totalScheduled) * 100 : 0

        medsWithDetails.push({
          ...med,
          schedules,
          inventory,
          nextDose,
          adherenceRate
        })
      }

      setMedications(medsWithDetails)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medications')
    } finally {
      setLoading(false)
    }
  }, [])

  const addMedication = useCallback(async (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const medicationWithTimestamps = {
        ...medication,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const id = await db.medications.add(medicationWithTimestamps)
      await loadMedications()
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add medication')
      throw err
    }
  }, [loadMedications])

  const updateMedication = useCallback(async (id: number, updates: Partial<Medication>) => {
    try {
      await db.medications.update(id, updates)
      await loadMedications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medication')
      throw err
    }
  }, [loadMedications])

  const deleteMedication = useCallback(async (id: number) => {
    try {
      await db.medications.update(id, { isActive: false })
      await loadMedications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medication')
      throw err
    }
  }, [loadMedications])

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  return {
    medications,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    refresh: loadMedications
  }
}
