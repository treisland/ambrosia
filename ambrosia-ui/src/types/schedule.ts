export type DoseStatus = 'scheduled' | 'taken' | 'snoozed' | 'missed' | 'skipped'

export interface DoseEvent {
  id: string
  medication: string
  doseMg?: number
  instructions?: string
  start: Date
  end: Date
  status: DoseStatus
}