import type { Schedule, TaperStep } from '../database/schema'

export type ScheduleType = 'fixed' | 'interval' | 'cycle' | 'taper' | 'prn'

export interface ScheduleConfig {
  type: ScheduleType
  times: string[] // HH:MM format
  days?: number[] // 0=Sunday, 1=Monday, etc.
  intervalHours?: number // for interval type
  cycleDaysOn?: number // for cycle type
  cycleDaysOff?: number // for cycle type
  taperSchedule?: TaperStep[] // for taper type
  prnLimits?: {
    minIntervalHours: number
    maxDosesPerDay: number
    maxDosePerDay?: number
  }
  mealTiming?: 'before' | 'with' | 'after' | 'none'
  timezone: string
  startDate: Date
  endDate?: Date
}

export class ScheduleService {
  /**
   * Generate dose times for a given schedule configuration
   */
  static generateDoseTimes(config: ScheduleConfig, fromDate: Date, toDate: Date): Date[] {
    const doseTimes: Date[] = []
    const currentDate = new Date(fromDate)
    
    while (currentDate <= toDate) {
      switch (config.type) {
        case 'fixed':
          doseTimes.push(...this.generateFixedTimes(currentDate, config))
          break
          
        case 'interval':
          doseTimes.push(...this.generateIntervalTimes(currentDate, config))
          break
          
        case 'cycle':
          doseTimes.push(...this.generateCycleTimes(currentDate, config))
          break
          
        case 'taper':
          doseTimes.push(...this.generateTaperTimes(currentDate, config))
          break
          
        case 'prn':
          // PRN schedules don't generate automatic doses
          break
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return doseTimes.filter(time => time >= fromDate && time <= toDate)
  }

  private static generateFixedTimes(date: Date, config: ScheduleConfig): Date[] {
    const times: Date[] = []
    
    if (!config.days || config.days.includes(date.getDay())) {
      for (const timeStr of config.times) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        const doseTime = new Date(date)
        doseTime.setHours(hours, minutes, 0, 0)
        times.push(doseTime)
      }
    }
    
    return times
  }

  private static generateIntervalTimes(date: Date, config: ScheduleConfig): Date[] {
    const times: Date[] = []
    
    if (!config.intervalHours) return times
    
    const startTime = new Date(date)
    startTime.setHours(0, 0, 0, 0)
    
    const endTime = new Date(date)
    endTime.setHours(23, 59, 59, 999)
    
    let currentTime = new Date(startTime)
    
    while (currentTime <= endTime) {
      times.push(new Date(currentTime))
      currentTime.setTime(currentTime.getTime() + (config.intervalHours * 60 * 60 * 1000))
    }
    
    return times
  }

  private static generateCycleTimes(date: Date, config: ScheduleConfig): Date[] {
    const times: Date[] = []
    
    if (!config.cycleDaysOn || !config.cycleDaysOff) return times
    
    const daysOn = config.cycleDaysOn
    const daysOff = config.cycleDaysOff
    const cycleLength = daysOn + daysOff
    
    // Calculate which day of the cycle we're on
    const startDate = new Date(config.startDate)
    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const cycleDay = daysSinceStart % cycleLength
    
    // If we're in the "on" part of the cycle, generate times
    if (cycleDay < daysOn) {
      for (const timeStr of config.times) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        const doseTime = new Date(date)
        doseTime.setHours(hours, minutes, 0, 0)
        times.push(doseTime)
      }
    }
    
    return times
  }

  private static generateTaperTimes(date: Date, config: ScheduleConfig): Date[] {
    const times: Date[] = []
    
    if (!config.taperSchedule) return times
    
    const startDate = new Date(config.startDate)
    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeksSinceStart = Math.floor(daysSinceStart / 7)
    
    // Find the current taper step
    const currentStep = config.taperSchedule.find(step => step.week <= weeksSinceStart) || 
                       config.taperSchedule[config.taperSchedule.length - 1]
    
    if (currentStep) {
      // Parse frequency (e.g., "2x daily", "3x daily", "every 8 hours")
      const frequency = this.parseFrequency(currentStep.frequency)
      
      if (frequency.type === 'daily' && frequency.count) {
        // Distribute doses evenly throughout the day
        const hoursBetween = 24 / frequency.count
        for (let i = 0; i < frequency.count; i++) {
          const doseTime = new Date(date)
          doseTime.setHours(i * hoursBetween, 0, 0, 0)
          times.push(doseTime)
        }
      } else if (frequency.type === 'interval' && frequency.intervalHours) {
        // Doses at regular intervals
        const startTime = new Date(date)
        startTime.setHours(0, 0, 0, 0)
        
        let currentTime = new Date(startTime)
        while (currentTime.getHours() < 24) {
          times.push(new Date(currentTime))
          currentTime.setTime(currentTime.getTime() + (frequency.intervalHours * 60 * 60 * 1000))
        }
      }
    }
    
    return times
  }

  private static parseFrequency(frequency: string): { type: 'daily' | 'interval', count?: number, intervalHours?: number } {
    const lower = frequency.toLowerCase()
    
    if (lower.includes('x daily') || lower.includes('times daily')) {
      const match = lower.match(/(\d+)x?\s*daily/)
      return { type: 'daily', count: match ? parseInt(match[1]) : 1 }
    }
    
    if (lower.includes('every') && lower.includes('hour')) {
      const match = lower.match(/every\s+(\d+)\s*hours?/)
      return { type: 'interval', intervalHours: match ? parseInt(match[1]) : 8 }
    }
    
    // Default to once daily
    return { type: 'daily', count: 1 }
  }

  /**
   * Check if a PRN dose can be taken based on limits
   */
  static canTakePrnDose(
    medicationId: number,
    prnLimits: { minIntervalHours: number; maxDosesPerDay: number; maxDosePerDay?: number },
    recentDoses: { medicationId: number; takenTime: Date; dosage?: string }[]
  ): { canTake: boolean; reason?: string } {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Filter to this medication and today
    const todayDoses = recentDoses.filter(dose => 
      dose.medicationId === medicationId && 
      dose.takenTime >= today
    )
    
    // Check max doses per day
    if (todayDoses.length >= prnLimits.maxDosesPerDay) {
      return { canTake: false, reason: `Maximum ${prnLimits.maxDosesPerDay} doses per day reached` }
    }
    
    // Check minimum interval
    const lastDose = todayDoses.sort((a, b) => b.takenTime.getTime() - a.takenTime.getTime())[0]
    if (lastDose) {
      const hoursSinceLastDose = (now.getTime() - lastDose.takenTime.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastDose < prnLimits.minIntervalHours) {
        const remainingHours = Math.ceil(prnLimits.minIntervalHours - hoursSinceLastDose)
        return { canTake: false, reason: `Wait ${remainingHours} more hours before next dose` }
      }
    }
    
    return { canTake: true }
  }

  /**
   * Adjust schedule for timezone changes (travel mode)
   */
  static adjustForTimezone(schedule: Schedule, newTimezone: string): Schedule {
    // This is a simplified implementation
    // In a real app, you'd use a proper timezone library like date-fns-tz
    return {
      ...schedule,
      timezone: newTimezone
    }
  }

  /**
   * Get meal timing recommendations
   */
  static getMealTimingRecommendation(mealTiming: 'before' | 'with' | 'after' | 'none'): string {
    switch (mealTiming) {
      case 'before':
        return 'Take 30-60 minutes before meals'
      case 'with':
        return 'Take with food to reduce stomach upset'
      case 'after':
        return 'Take after meals to reduce stomach upset'
      case 'none':
        return 'Take on an empty stomach'
      default:
        return 'Follow prescription instructions'
    }
  }
}
