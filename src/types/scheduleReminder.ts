export interface IScheduleReminderConfig {
    id?: string;
    congregation_id: string;
    cleaning_days_before: number;
    cleaning_enabled: boolean;
    field_service_days_before: number;
    field_service_enabled: boolean;
    public_witnessing_days_before: number;
    public_witnessing_enabled: boolean;
    midweek_meeting_days_before: number;
    midweek_meeting_enabled: boolean;
    weekend_meeting_days_before: number;
    weekend_meeting_enabled: boolean;
}

export interface IScheduleAlert {
    id: string;
    module: "CLEANING" | "FIELD_SERVICE" | "PUBLIC_WITNESS" | "MIDWEEK_MEETING" | "WEEKEND_MEETING";
    roleRequired: string;
    title: string;
    message: string;
    link: string;
    actionLabel: string;
    daysRemaining: number;
    severity: "HIGH" | "MEDIUM" | "LOW";
    isCurrentMonthUrgent?: boolean;
}

export interface IScheduleAlertsResponse {
    alerts: IScheduleAlert[];
    totalAlerts: number;
}

export interface IUserSimple {
    id: string;
    name: string;
    email: string;
}

export interface IScheduleResponsiblesResponse {
    responsiblesByRole: {
        CLEANING_MANAGER: IUserSimple[];
        FIELD_SERVICE_MANAGER: IUserSimple[];
        PUBLIC_WITNESS_MANAGER: IUserSimple[];
        MIDWEEK_MANAGER: IUserSimple[];
        TALK_MANAGER: IUserSimple[];
    };
    availableUsers: IUserSimple[];
}
