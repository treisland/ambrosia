import Dexie, { type Table } from 'dexie'

// Core data types
export interface Medication {
  id?: number
  name: string
  genericName?: string
  dosage: string
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler' | 'patch' | 'other'
  route: 'oral' | 'topical' | 'injection' | 'inhalation' | 'other'
  instructions?: string
  purpose?: string
  prescriber?: string
  pharmacy?: string
  ndc?: string // National Drug Code
  barcode?: string
  color?: string
  shape?: string
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Schedule {
  id?: number
  medicationId: number
  name: string
  type: 'fixed' | 'interval' | 'cycle' | 'taper' | 'prn'
  times: string[] // HH:MM format
  days: number[] // 0=Sunday, 1=Monday, etc.
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
  isActive: boolean
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface TaperStep {
  week: number
  dosage: string
  frequency: string
}

export interface Dose {
  id?: number
  medicationId: number
  scheduleId: number
  scheduledTime: Date
  takenTime?: Date
  status: 'scheduled' | 'taken' | 'snoozed' | 'missed' | 'skipped'
  dosage?: string
  notes?: string
  snoozeUntil?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Inventory {
  id?: number
  medicationId: number
  quantity: number
  unit: 'tablets' | 'capsules' | 'ml' | 'doses' | 'pills'
  refillThreshold: number
  lastRefillDate?: Date
  nextRefillDate?: Date
  autoRefill: boolean
  pharmacy?: string
  prescriptionNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  id?: number
  timezone: string
  notifications: {
    enabled: boolean
    reminderMinutes: number[]
    quietHours: {
      start: string // HH:MM
      end: string // HH:MM
    }
    sound: boolean
    vibration: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    fontSize: 'small' | 'medium' | 'large'
  }
  privacy: {
    dataSharing: boolean
    analytics: boolean
    crashReporting: boolean
  }
  backup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    lastBackup?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface CareTeamMember {
  id?: number
  name: string
  email?: string
  phone?: string
  relationship: 'doctor' | 'pharmacist' | 'caregiver' | 'family' | 'other'
  permissions: {
    viewMeds: boolean
    viewSchedule: boolean
    viewLogs: boolean
    receiveAlerts: boolean
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Database class
export class AmbrosiaDB extends Dexie {
  medications!: Table<Medication>
  schedules!: Table<Schedule>
  doses!: Table<Dose>
  inventory!: Table<Inventory>
  userSettings!: Table<UserSettings>
  careTeam!: Table<CareTeamMember>

  constructor() {
    super('AmbrosiaDB')
    
    this.version(1).stores({
      medications: '++id, name, isActive, createdAt',
      schedules: '++id, medicationId, type, isActive, startDate',
      doses: '++id, medicationId, scheduleId, scheduledTime, status, takenTime',
      inventory: '++id, medicationId, quantity, lastRefillDate',
      userSettings: '++id, timezone',
      careTeam: '++id, email, isActive'
    })

    // Hooks for automatic timestamps
    this.medications.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.medications.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as any).updatedAt = new Date()
    })

    this.schedules.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.schedules.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as any).updatedAt = new Date()
    })

    this.doses.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.doses.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as any).updatedAt = new Date()
    })

    this.inventory.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.inventory.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as any).updatedAt = new Date()
    })

    this.userSettings.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.userSettings.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as any).updatedAt = new Date()
    })

    this.careTeam.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.careTeam.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as any).updatedAt = new Date()
    })
  }
}

// Export singleton instance
export const db = new AmbrosiaDB()
