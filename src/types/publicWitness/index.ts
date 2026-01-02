import { IPublisher } from "../types"

export interface IPublicWitnessSlotAssignment {
  time_slot_id: string
  publishers?: IPublicWitnessAssignmentPublisher[]
}

export interface IPublicWitnessDaySchedule {
  date: string
  slots: IPublicWitnessSlotAssignment[]
}

// Publisher simples (listagem / seleção)
export interface IPublicWitnessPublisher {
  id: string
  fullName: string
}

// Relação assignment → publisher
export interface IPublicWitnessAssignmentPublisher {
  publisher_id: string
  order: number
}

// Publisher fixo do slot (vindo do backend)
export interface IPublicWitnessDefaultPublisher {
  id: string
  time_slot_id: string
  publisher_id: string
  order: number
  publisher: IPublisher
}

// Slot de horário
export interface IPublicWitnessTimeSlot {
  id: string
  arrangement_id: string
  start_time: string // "HH:mm:ss"
  end_time: string   // "HH:mm:ss"
  order: number
  is_rotative: boolean
  defaultPublishers: IPublicWitnessDefaultPublisher[]
}

// Arranjo completo
export interface IPublicWitnessArrangement {
  id: string
  congregation_id: string
  title: string
  is_fixed: boolean
  weekday: number | null
  date: string | null
  created_at: string
  timeSlots: IPublicWitnessTimeSlot[]
}
