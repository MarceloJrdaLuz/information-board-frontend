import { atom } from "jotai"
import { IPublicWitnessDaySchedule } from "@/types/publicWitness"

export const arrangementScheduleAtom = atom<Record<string, IPublicWitnessDaySchedule>>({})
export const dirtyScheduleAtom = atom<Record<string, IPublicWitnessDaySchedule>>({})

export type PublicWitnessDefaultPublisherPayload = {
  publisher_id: string
  order?: number
}

export type PublicWitnessTimeSlotPayload = {
  id?: string
  start_time: string
  end_time: string
  order: number
  is_rotative?: boolean
  defaultPublishers?: PublicWitnessDefaultPublisherPayload[]
}

export type CreatePublicWitnessArrangementPayload = {
  title: string
  is_fixed: boolean
  weekday?: number | null
  date?: string | null
  timeSlots: PublicWitnessTimeSlotPayload[]
}

export type UpdatePublicWitnessArrangementPayload =
  Partial<CreatePublicWitnessArrangementPayload>
