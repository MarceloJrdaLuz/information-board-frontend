export enum MechanicalMeetingType {
    MIDWEEK = "MIDWEEK",
    WEEKEND = "WEEKEND"
}

export enum MechanicalRole {
    ATTENDANT = "ATTENDANT",
    SOUND = "SOUND",
    MEDIA = "MEDIA",
    SOUND_AND_MEDIA = "SOUND_AND_MEDIA",
    ROVING_MIC = "ROVING_MIC",
    STAGE_MIC = "STAGE_MIC"
}

export const MechanicalRoleLabels: Record<MechanicalRole, string> = {
    [MechanicalRole.ATTENDANT]: "Indicador",
    [MechanicalRole.SOUND]: "Som",
    [MechanicalRole.MEDIA]: "Mídias",
    [MechanicalRole.SOUND_AND_MEDIA]: "Som e Mídias",
    [MechanicalRole.ROVING_MIC]: "Microfone Volante",
    [MechanicalRole.STAGE_MIC]: "Pedestal"
};

export interface IMechanicalConfig {
    id?: string;
    congregation_id?: string;
    combineSoundAndMedia: boolean;
    sameTeamWholeWeek: boolean;
    midweekAttendantsCount: number;
    midweekSoundCount: number;
    midweekMediaCount: number;
    midweekRovingMicsCount: number;
    midweekStageMicsCount: number;
    weekendAttendantsCount: number;
    weekendSoundCount: number;
    weekendMediaCount: number;
    weekendRovingMicsCount: number;
    weekendStageMicsCount: number;
}

export interface IMechanicalAssignment {
    id: string;
    schedule_id: string;
    role: MechanicalRole;
    order: number;
    publisher_id: string | null;
    isManual: boolean;
    publisher?: {
        id: string;
        fullName: string;
        nickname?: string | null;
    } | null;
}

export interface IMechanicalSchedule {
    id: string;
    congregation_id: string;
    weekStartDate: string;
    date: string;
    meetingType: MechanicalMeetingType;
    notes?: string | null;
    hasNoMeeting?: boolean;
    eventTitle?: string | null;
    assignments: IMechanicalAssignment[];
}

export interface IMechanicalWeek {
    weekStartDate: string;
    weekEndDate: string;
    formattedWeek: string;
    hasNoMeeting?: boolean;
    eventTitle?: string | null;
    schedules: IMechanicalSchedule[];
}

export interface IMechanicalMonthResponse {
    year: number;
    month: number;
    monthsCount?: number;
    weeks: IMechanicalWeek[];
    schedules: IMechanicalSchedule[];
}

export interface IMechanicalCandidateSuggestion {
    id: string;
    fullName: string;
    nickname?: string | null;
    isQualified: boolean;
    isUnavailable: boolean;
    unavailabilityReason?: string | null;
    isMidweekChairman: boolean;
    isAssignedThisMeeting: boolean;
    daysSinceLastAny: number | null;
    daysSinceLastThisRole: number | null;
    lastRole: string | null;
    score: number;
}

export interface IMechanicalQualificationItem {
    id: string;
    fullName: string;
    nickname?: string | null;
    canAttendant: boolean;
    canSound: boolean;
    canMedia: boolean;
    canSoundAndMedia: boolean;
    canRovingMic: boolean;
    canStageMic: boolean;
}
