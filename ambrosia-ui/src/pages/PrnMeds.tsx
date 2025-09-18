import { useState, useEffect } from 'react'
import { PrnMedication } from '../components/PrnMedication'
import { db } from '../database/schema'

export default function PrnMeds() {
  const [prnMedications, setPrnMedications] = useState<any[]>([])
  const [recentDoses, setRecentDoses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrnMedications()
    loadRecentDoses()
  }, [])

  const loadPrnMedications = async () => {
    try {
      const medications = await db.medications.where('isActive').equals(1).toArray()
      const schedules = await db.schedules.where('type').equals('prn').and(s => s.isActive).toArray()
      
      const prnMeds = medications
        .filter(med => schedules.some(s => s.medicationId === med.id))
        .map(med => {
          const schedule = schedules.find(s => s.medicationId === med.id)
          return { ...med, schedule }
        })
        .filter(med => med.schedule)
      
      setPrnMedications(prnMeds)
    } catch (error) {
      console.error('Failed to load PRN medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentDoses = async () => {
    try {
      const doses = await db.doses
        .where('takenTime')
        .above(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        .toArray()
      
      setRecentDoses(doses)
    } catch (error) {
      console.error('Failed to load recent doses:', error)
    }
  }

  const handleTakeDose = async (medicationId: number, dosage: string, notes?: string) => {
    try {
      const medication = prnMedications.find(med => med.id === medicationId)
      if (!medication?.schedule) return

      await db.doses.add({
        medicationId,
        scheduleId: medication.schedule.id!,
        scheduledTime: new Date(),
        takenTime: new Date(),
        status: 'taken',
        dosage,
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Reload recent doses to update the UI
      await loadRecentDoses()
    } catch (error) {
      console.error('Failed to take PRN dose:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">As-Needed Medications</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {prnMedications.length} medication{prnMedications.length !== 1 ? 's' : ''}
        </div>
      </div>

      {prnMedications.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No PRN Medications
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add medications with "as needed" schedules to track them here.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add PRN Medication
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {prnMedications.map((medication) => (
            <PrnMedication
              key={medication.id}
              medication={medication}
              schedule={medication.schedule}
              recentDoses={recentDoses}
              onTakeDose={handleTakeDose}
            />
          ))}
        </div>
      )}

      {/* Recent PRN Doses */}
      {recentDoses.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Doses
          </h3>
          <div className="space-y-2">
            {recentDoses
              .filter(dose => dose.takenTime)
              .sort((a, b) => (b.takenTime?.getTime() || 0) - (a.takenTime?.getTime() || 0))
              .slice(0, 5)
              .map((dose) => {
                const medication = prnMedications.find(med => med.id === dose.medicationId)
                return (
                  <div key={dose.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {medication?.name || 'Unknown Medication'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {dose.dosage} • {dose.notes && `${dose.notes} • `}
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }).format(new Date(dose.takenTime!))}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Taken
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
