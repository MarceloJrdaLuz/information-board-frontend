import { ICongregation, IPublisher } from "../types"

export enum CleaningGroupDayPreference {
    ALL = "ALL",
    MIDWEEK = "MIDWEEK",
    WEEKEND = "WEEKEND"
}

export interface ICleaningGroup {
    id: string
    congregation: ICongregation
    order: number
    name: string
    dayPreference?: CleaningGroupDayPreference | string
    publishers: IPublisher[]
}

export interface ICleaningGroupUnavailability {
    id: string
    congregation_id: string
    group_id: string
    group: ICleaningGroup
    startDate: string
    endDate: string
    reason?: string | null
    created_at?: string
    updated_at?: string
}

export interface IFormDataCleaningGroup {
    publishers: IPublisher[]
    cleaningGroups: ICleaningGroup[]
}

export interface ICleaningScheduleConfig {
    id: string
    mode: CleaningScheduleMode,
    congregation: ICongregation
}

export enum CleaningScheduleMode {
    WEEKLY = "WEEKLY",
    MEETINGS = "MEETINGS"
}

interface IPublisherSimple {
    id: string
    fullName: string
    nickname: string
    displayName: string
}


export interface ICleaningSchedule {
    id: string,
    congregation_id: string
    group_id: string
    date: string
    weekdayNumber: number,
    weekdayName: string
    group: {
        id: string
        order: number,
        name: string
        publishers: IPublisherSimple[]
    }
}

export interface ICleaningScheduleResponse {
    schedules: ICleaningSchedule[]
}

export interface GeneratedSchedule {
    start: string
    end: string
    schedule: ICleaningSchedule[]
}