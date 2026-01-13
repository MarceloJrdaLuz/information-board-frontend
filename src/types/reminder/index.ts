export interface IReminder {
  id: string
  title: string
  description?: string | null

  startDate: string
  endDate: string

  isRecurring: boolean
  recurrenceIntervalDays?: number | null
  recurrenceCount?: number | null
  completed_until?: string | null
  isActive: boolean
}
