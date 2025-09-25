import { IWeekendSchedule } from "@/entities/weekendSchedule"

export type CreateWeekendSchedulePayload = {
  schedules: IWeekendSchedule[]

}

export type UpdateWeekendSchedulePayload = Partial<CreateWeekendSchedulePayload>