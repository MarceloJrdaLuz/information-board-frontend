import { IWeekendSchedule } from "@/types/weekendSchedule"

export type CreateWeekendSchedulePayload = {
  schedules: IWeekendSchedule[]

}

export type UpdateWeekendSchedulePayload = Partial<CreateWeekendSchedulePayload>