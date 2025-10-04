import { IHospitalityGroup } from "../types"

export enum IHospitalityEventType {
  DINNER = "DINNER",     // Janta
  LUNCH = "LUNCH",       // Almoço
  HOSTING = "HOSTING",   // Hospedagem
}

export type IHospitalityAssignment = {
  id: string
  eventType: IHospitalityEventType
  completed: boolean
  group: IHospitalityGroup
}

export type IHospitalityWeekend = {
  id: string
  date: string
  assignments: IHospitalityAssignment[]
}

export interface IRecordHospitalityWeekend {
  id?: string
  date: string
  assignments: IRecordHospitalityAssignment[]
}

export interface IRecordHospitalityAssignment {
  id?: string
  eventType: IHospitalityEventType
  completed: boolean
  group_id: string
  group_host_fullName?: string
  group_host_nickname?: string
}
