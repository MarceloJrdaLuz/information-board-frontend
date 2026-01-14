export enum RecurrenceType {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}

export interface CreateReminderPayload {
    title: string
    description?: string
    startDate: string | null
    endDate: string | null
    isRecurring?: boolean
    recurrenceType?: RecurrenceType // Novo
    recurrenceInterval?: number | null // Nome atualizado
    recurrenceCount?: number | null
}

export interface UpdateReminderPayload extends Partial<CreateReminderPayload> {
  isActive?: boolean
}
