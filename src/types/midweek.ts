import { Gender } from "./types";

export enum MidweekSection {
    TREASURES = "TREASURES",
    MINISTRY = "MINISTRY",
    LIVING = "LIVING"
}

export enum MidweekPartType {
    TALK = "TALK",
    GEMS = "GEMS",
    BIBLE_READING = "BIBLE_READING",
    INITIAL_CALL = "INITIAL_CALL",
    RETURN_VISIT = "RETURN_VISIT",
    BIBLE_STUDY = "BIBLE_STUDY",
    EXPLAIN_BELIEFS = "EXPLAIN_BELIEFS",
    STUDENT_TALK = "STUDENT_TALK",
    WHAT_WOULD_YOU_SAY = "WHAT_WOULD_YOU_SAY",
    LIVING_ITEM = "LIVING_ITEM",
    LOCAL_NEEDS = "LOCAL_NEEDS",
    CBS = "CBS",
    CUSTOM = "CUSTOM"
}

export enum MidweekSpecialType {
    NONE = "NONE",
    CIRCUIT_OVERSEER_VISIT = "CIRCUIT_OVERSEER_VISIT",
    CIRCUIT_ASSEMBLY = "CIRCUIT_ASSEMBLY",
    REGIONAL_CONVENTION = "REGIONAL_CONVENTION",
    MEMORIAL = "MEMORIAL",
    SPECIAL_TALK = "SPECIAL_TALK",
    CUSTOM = "CUSTOM"
}

export enum MidweekRoom {
    MAIN = "MAIN",
    AUXILIARY_1 = "AUXILIARY_1",
    AUXILIARY_2 = "AUXILIARY_2"
}

export interface IPublisherMini {
    id: string;
    fullName: string;
    nickname?: string | null;
    gender: Gender;
    family_id?: string | null;
}

export interface IMidweekMeetingPart {
    id: string;
    schedule_id: string;
    workbook_part_id?: string | null;
    section: MidweekSection;
    partType: MidweekPartType;
    title: string;
    sourceMaterial?: string | null;
    timeMinutes: number;
    lessonNumber?: number | null;
    studyPoint?: number | null;
    studyPointDescription?: string | null;
    brochure?: string | null;
    requiresAssistant: boolean;
    method?: string | null;
    custom_speaker_name?: string | null;
    room: MidweekRoom;
    assigned_publisher_id?: string | null;
    assignedPublisher?: IPublisherMini | null;
    assistant_publisher_id?: string | null;
    assistantPublisher?: IPublisherMini | null;
    orderIndex: number;
    isActive: boolean;
    isCompleted: boolean;
    prompts?: string[] | null;
    created_at?: string;
    updated_at?: string;
}

export interface IMidweekSchedule {
    id: string;
    congregation_id: string;
    workbook_week_id?: string | null;
    weekDate: string;
    meetingDate: string;
    weeklyBibleReading?: string | null;
    watchtowerStudyTheme?: string | null;
    songOpen?: number | null;
    songMiddle?: number | null;
    songEnd?: number | null;
    chairman_id?: string | null;
    chairman?: IPublisherMini | null;
    opening_prayer_id?: string | null;
    openingPrayer?: IPublisherMini | null;
    closing_prayer_id?: string | null;
    closingPrayer?: IPublisherMini | null;
    aux_counselor_1_id?: string | null;
    auxCounselor1?: IPublisherMini | null;
    aux_counselor_2_id?: string | null;
    auxCounselor2?: IPublisherMini | null;
    cbs_conductor_id?: string | null;
    cbsConductor?: IPublisherMini | null;
    cbs_reader_id?: string | null;
    cbsReader?: IPublisherMini | null;
    isSpecial: boolean;
    specialType: MidweekSpecialType;
    specialName?: string | null;
    notes?: string | null;
    parts: IMidweekMeetingPart[];
    created_at?: string;
    updated_at?: string;
}

export interface IPublisherSuggestion {
    id: string;
    fullName: string;
    nickname?: string | null;
    gender: Gender;
    family_id?: string | null;
    lastAssignedThisPartDate: string | null;
    daysSinceLastThisPart: number | null;
    lastAssignedAnyPartDate: string | null;
    daysSinceLastAnyPart: number | null;
    isUnavailable: boolean;
    unavailabilityReason?: string | null;
    hasConflictSameWeek: boolean;
    conflictDescription?: string | null;
    isFamilyMatch?: boolean;
    lastPairedWithStudentDate?: string | null;
    daysSinceLastPairedWithStudent?: number | null;
    timesPairedWithStudent?: number;
    qualificationScore: number;
}

export interface IPublisherMidweekQualification {
    id: string;
    publisher_id: string;
    canBeChairman: boolean;
    canPray: boolean;
    canTreasuresTalk: boolean;
    canSpiritualGems: boolean;
    canBibleReading: boolean;
    canStudentInitialCall: boolean;
    canStudentReturnVisit: boolean;
    canStudentBibleStudy: boolean;
    canStudentExplainBeliefs: boolean;
    canStudentTalk: boolean;
    canBeAssistant: boolean;
    canLivingParts: boolean;
    canLocalNeeds: boolean;
    canCbsConductor: boolean;
    canCbsReader: boolean;
    canAuxCounselor: boolean;
}

export interface IPublisherUnavailability {
    id: string;
    publisher_id: string;
    startDate: string;
    endDate: string;
    reason?: string | null;
    publisher?: IPublisherMini;
}
