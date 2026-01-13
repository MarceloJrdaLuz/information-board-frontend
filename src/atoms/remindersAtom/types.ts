export interface CreateReminderPayload {
  title: string
  description?: string

  startDate: string | null
  endDate: string | null

  isRecurring?: boolean
  recurrenceIntervalDays?: number | null
  recurrenceCount?: number | null
}


export interface UpdateReminderPayload extends Partial<CreateReminderPayload> {
  isActive?: boolean
}
