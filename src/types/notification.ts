export enum NotificationType {
    HOSPITALITY = "HOSPITALITY",
    SPEAKER = "SPEAKER",
    PUBLICWITNESS = "PUBLICWITNESS",
    FIELD_SERVICE = "FIELD_SERVICE",
    CLEANING = "CLEANING",
    READING = "READING",
    CHAIRMAN = "CHAIRMAN",
    REMINDER = "REMINDER",
}

export interface INotification {
    id: string
    user_id: string
    type: NotificationType
    title: string
    body: string
    scheduled_at?: string | null
    sent_at?: string | null
    read_at?: string | null
    data?: Record<string, any> | null
    created_at: string
    updated_at: string
}
