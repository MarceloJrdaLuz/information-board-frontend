export enum HospitalityEventType {
  DINNER = "DINNER",     // Janta
  LUNCH = "LUNCH",       // Almoço
  HOSTING = "HOSTING",   // Hospedagem
}

export type HospitalityGroup = {
  id: string
  name: string
}

export type HospitalityAssignment = {
  id: string
  eventType: HospitalityEventType
  completed: boolean
  group: HospitalityGroup
}

export type HospitalityWeekend = {
  id: string
  date: string
  assignments: HospitalityAssignment[]
}
