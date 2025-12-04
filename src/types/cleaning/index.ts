import { ICongregation, IPublisher } from "../types"

export interface ICleaningGroup {
    id: string
    congregation: ICongregation
    order: number
    name: string
    publishers: IPublisher[]
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