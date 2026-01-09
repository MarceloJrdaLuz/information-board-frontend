import { IPublisher } from "../types";

export enum FieldServiceType {
    FIXED = "FIXED",
    ROTATION = "ROTATION",
}

export enum Weekday {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
}

export const WEEKDAY_LABEL: Record<Weekday, string> = {
    [Weekday.SUNDAY]: "Domingo",
    [Weekday.MONDAY]: "Segunda-feira",
    [Weekday.TUESDAY]: "Terça-feira",
    [Weekday.WEDNESDAY]: "Quarta-feira",
    [Weekday.THURSDAY]: "Quinta-feira",
    [Weekday.FRIDAY]: "Sexta-feira",
    [Weekday.SATURDAY]: "Sábado",
}

export const WEEKDAY_OPTIONS = Object.values(WEEKDAY_LABEL)

export const FIELD_SERVICE_TYPE_LABEL: Record<FieldServiceType, string> = {
    FIXED: "Dirigente fixo",
    ROTATION: "Rodízio",
}

export interface ILeader extends IPublisher { }

export interface ITemplateLocationOverride {
    date: string        // dia real da saída (quinta, sábado, etc)
    week_start: string  // segunda-feira ISO (controle interno)
    location: string
}


export interface ITemplateFieldService {
    id: string
    congregation_id: string

    type: FieldServiceType

    weekday: Weekday
    time: string // "08:30:00"

    location: string
    location_rotation: boolean
    location_overrides?: ITemplateLocationOverride[]

    leader_id: string | null
    leader: ILeader | null

    active: boolean
    rotation_members?: IRotationMember[]
}

export interface IRotationMember {
    id: string
    order: number
    publisher: IPublisher
}


export type FieldServiceFormData = {
    publishers: IPublisher[]
}

export interface IFieldServiceTemplate {
    id: string
    type: FieldServiceType,
    weekday: number
    time: string
    location?: string
}

export interface FieldServiceTemplateOption extends IFieldServiceTemplate {
    label: string
}

export interface IFieldServiceSchedule {
    id: string
    date: string
    leader: IPublisher
}

export interface IFieldServiceException {
    id: string
    date: string
    reason?: string
    template_id?: string | null
}

export interface FieldServiceRotationSchedule {
    date: string           // YYYY-MM-DD
    leader: string         // Nome resolvido
    exceptionReason?: string
}

export interface FieldServiceRotationBlock {
    templateId: string
    title: string
    weekday: number          // 0-6
    time: string             // "08:30"
    location: string
    schedules: FieldServiceRotationSchedule[]
}


export interface FieldServiceFixedSchedule {
    weekday: string        // "Sábado"
    weekdayIndex: number
    time: string           // "08:30"
    leader: string         // Nome ou "-"
    location: string
    locationRotation?: boolean
    locationOverrides?: {
        weekStart: string         // YYYY-MM-DD (segunda ou domingo, padrão único!)
        location: string
    }[]
}

export interface FieldServicePdfResponse {
    congregationName: string
    period: {
        start: string
        end: string
    }
    fixedSchedules: FieldServiceFixedSchedule[]
    rotationBlocks: FieldServiceRotationBlock[]
}
