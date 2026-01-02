import { IPublicWitnessAssignment } from "@/Components/PublicWitnessSchedule/SlotScheduleRow"

export type CreatePublicWitnessMonthSchedulePayload = {
  schedule: PublicWitnessDaySchedulePayload[]
}

export type PublicWitnessDaySchedulePayload = {
  date: string // formato: YYYY-MM-DD
  slots: PublicWitnessSlotSchedulePayload[]
}

export type PublicWitnessSlotSchedulePayload = {
  time_slot_id: string
  publishers: PublicWitnessSlotPublisherPayload[]
}

export type PublicWitnessSlotPublisherPayload = {
  publisher_id: string
  order: number
}



export interface IPublicWitnessScheduleDay {
  date: string
  assignments: IPublicWitnessAssignment[]
}

export interface IPublicWitnessScheduleResponse {
  arrangement_id: string
  start_date: string
  end_date: string
  schedule: IPublicWitnessScheduleDay[]
}



