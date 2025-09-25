import { IWeekendSchedule } from "@/entities/weekendSchedule"

export type CreateExternalTalksPayload = {
  destinationCongregation_id: string
  speaker_id: string
  talk_id?: string
  manualTalk?: string
  date: string
}

export type UpdateExternalTalksPayload = Partial<CreateExternalTalksPayload>