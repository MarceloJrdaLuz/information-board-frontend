import { RecurrenceType } from "@/atoms/remindersAtom/types"

export interface IReminder {
  id: string
  title: string
  description?: string | null

  startDate: string
  endDate: string

  isRecurring: boolean
  recurrenceType?: RecurrenceType 
  recurrenceInterval?: number | null 
  recurrenceCount?: number | null
  completed_until?: string | null
  isActive: boolean
}
