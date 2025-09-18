import { db, type Schedule, type Dose } from './schema'

export class ScheduleService {
  // Create a new schedule
  static async create(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await db.schedules.add(schedule as Schedule)
  }

  // Get all active schedules
  static async getAll(): Promise<Schedule[]> {
    return await db.schedules.where('isActive').equals(1).toArray()
  }

  // Get schedules for a specific medication
  static async getByMedicationId(medicationId: number): Promise<Schedule[]> {
    return await db.schedules
      .where('medicationId')
      .equals(medicationId)
      .and(schedule => schedule.isActive)
      .toArray()
  }

  // Get schedule by ID
  static async getById(id: number): Promise<Schedule | undefined> {
    return await db.schedules.get(id)
  }

  // Update schedule
  static async update(id: number, updates: Partial<Omit<Schedule, 'id' | 'createdAt'>>): Promise<void> {
    await db.schedules.update(id, updates)
  }

  // Deactivate schedule
  static async deactivate(id: number): Promise<void> {
    await db.schedules.update(id, { isActive: false })
  }

  // Delete schedule
  static async delete(id: number): Promise<void> {
    await db.schedules.delete(id)
  }

  // Get schedules by type
  static async getByType(type: Schedule['type']): Promise<Schedule[]> {
    return await db.schedules
      .where('isActive')
      .equals(1)
      .and(schedule => schedule.type === type)
      .toArray()
  }

  // Get schedules for a specific day of week
  static async getByDayOfWeek(dayOfWeek: number): Promise<Schedule[]> {
    return await db.schedules
      .where('isActive')
      .equals(1)
      .and(schedule => schedule.days.includes(dayOfWeek))
      .toArray()
  }

  // Generate doses for a date range
  static async generateDosesForRange(
    scheduleId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<Dose[]> {
    const schedule = await this.getById(scheduleId)
    if (!schedule) throw new Error('Schedule not found')

    const doses: Omit<Dose, 'id' | 'createdAt' | 'updatedAt'>[] = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      
      // Check if this day is included in the schedule
      if (schedule.days.includes(dayOfWeek)) {
        for (const timeStr of schedule.times) {
          const [hours, minutes] = timeStr.split(':').map(Number)
          const scheduledTime = new Date(current)
          scheduledTime.setHours(hours, minutes, 0, 0)
          
          // Apply timezone offset if needed
          if (schedule.timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
            // Handle timezone conversion here
            // For now, assume local timezone
          }
          
          doses.push({
            medicationId: schedule.medicationId,
            scheduleId: scheduleId,
            scheduledTime,
            status: 'scheduled',
            dosage: undefined,
            notes: undefined
          })
        }
      }
      
      current.setDate(current.getDate() + 1)
    }
    
    // Add doses to database
    const doseIds = await db.doses.bulkAdd(doses as Dose[])
    
    // Return the created doses
    return await db.doses.where('id').anyOf(doseIds).toArray()
  }

  // Get upcoming doses for a medication
  static async getUpcomingDoses(medicationId: number, limit: number = 10): Promise<Dose[]> {
    const now = new Date()
    return await db.doses
      .where('medicationId')
      .equals(medicationId)
      .and(dose => dose.scheduledTime >= now)
      .sortBy('scheduledTime')
      .then(doses => doses.slice(0, limit))
  }

  // Get doses for today
  static async getTodaysDoses(): Promise<Dose[]> {
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)
    
    return await db.doses
      .where('scheduledTime')
      .between(startOfDay, endOfDay)
      .toArray()
  }

  // Get doses for a date range
  static async getDosesForRange(startDate: Date, endDate: Date): Promise<Dose[]> {
    return await db.doses
      .where('scheduledTime')
      .between(startDate, endDate)
      .toArray()
  }

  // Update dose status
  static async updateDoseStatus(
    doseId: number, 
    status: Dose['status'], 
    takenTime?: Date,
    notes?: string
  ): Promise<void> {
    const updates: Partial<Dose> = { status }
    if (takenTime) updates.takenTime = takenTime
    if (notes) updates.notes = notes
    
    await db.doses.update(doseId, updates)
  }

  // Snooze a dose
  static async snoozeDose(doseId: number, snoozeUntil: Date): Promise<void> {
    await db.doses.update(doseId, {
      status: 'snoozed',
      snoozeUntil
    })
  }

  // Get adherence statistics
  static async getAdherenceStats(medicationId?: number, days: number = 30): Promise<{
    totalDoses: number
    takenDoses: number
    missedDoses: number
    skippedDoses: number
    adherenceRate: number
    currentStreak: number
    longestStreak: number
  }> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    let query = db.doses.where('scheduledTime').between(startDate, endDate)
    
    if (medicationId) {
      query = query.and(dose => dose.medicationId === medicationId)
    }
    
    const doses = await query.toArray()
    
    const totalDoses = doses.length
    const takenDoses = doses.filter(d => d.status === 'taken').length
    const missedDoses = doses.filter(d => d.status === 'missed').length
    const skippedDoses = doses.filter(d => d.status === 'skipped').length
    const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0
    
    // Calculate streaks (simplified)
    const currentStreak = this.calculateCurrentStreak(doses)
    const longestStreak = this.calculateLongestStreak(doses)
    
    return {
      totalDoses,
      takenDoses,
      missedDoses,
      skippedDoses,
      adherenceRate,
      currentStreak,
      longestStreak
    }
  }

  private static calculateCurrentStreak(doses: Dose[]): number {
    // Sort by date descending
    const sortedDoses = doses.sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (const dose of sortedDoses) {
      const doseDate = new Date(dose.scheduledTime)
      doseDate.setHours(0, 0, 0, 0)
      
      if (doseDate > today) continue
      if (dose.status === 'taken') {
        streak++
      } else if (dose.status === 'missed' || dose.status === 'skipped') {
        break
      }
    }
    
    return streak
  }

  private static calculateLongestStreak(doses: Dose[]): number {
    // Group doses by day
    const dosesByDay = new Map<string, Dose[]>()
    
    for (const dose of doses) {
      const dayKey = dose.scheduledTime.toDateString()
      if (!dosesByDay.has(dayKey)) {
        dosesByDay.set(dayKey, [])
      }
      dosesByDay.get(dayKey)!.push(dose)
    }
    
    let maxStreak = 0
    let currentStreak = 0
    
    const sortedDays = Array.from(dosesByDay.keys()).sort()
    
    for (const day of sortedDays) {
      const dayDoses = dosesByDay.get(day)!
      const hasTakenDose = dayDoses.some(d => d.status === 'taken')
      const hasMissedDose = dayDoses.some(d => d.status === 'missed' || d.status === 'skipped')
      
      if (hasTakenDose && !hasMissedDose) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else if (hasMissedDose) {
        currentStreak = 0
      }
    }
    
    return maxStreak
  }
}
