export enum SpecialEventType {
    CIRCUIT_ASSEMBLY = "CIRCUIT_ASSEMBLY",
    REGIONAL_CONVENTION = "REGIONAL_CONVENTION",
    MEMORIAL = "MEMORIAL",
    CIRCUIT_OVERSEER_VISIT = "CIRCUIT_OVERSEER_VISIT",
    SPECIAL_TALK = "SPECIAL_TALK",
    CUSTOM = "CUSTOM"
}

export enum EventImpactScope {
    NONE = "NONE",
    EVENT_DAYS_ONLY = "EVENT_DAYS_ONLY",
    ALL_DAYS = "ALL_DAYS"
}

export interface ISpecialEvent {
    id: string;
    congregation_id: string;
    type: SpecialEventType;
    title: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    affectsWholeWeek: boolean;
    cancelMidweekMeeting: boolean;
    cancelWeekendMeeting: boolean;
    isCircuitOverseerVisit: boolean;
    cancelCleaning: boolean;
    fieldServiceImpact: EventImpactScope;
    publicWitnessingImpact: EventImpactScope;
    showOnPublicBoard: boolean;
    theme?: string | null;
    location?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CreateSpecialEventDTO {
    type: SpecialEventType;
    title: string;
    startDate: string;
    endDate: string;
    affectsWholeWeek: boolean;
    cancelMidweekMeeting: boolean;
    cancelWeekendMeeting: boolean;
    isCircuitOverseerVisit: boolean;
    cancelCleaning: boolean;
    fieldServiceImpact: EventImpactScope;
    publicWitnessingImpact: EventImpactScope;
    showOnPublicBoard: boolean;
    theme?: string | null;
    location?: string | null;
    notes?: string | null;
}
