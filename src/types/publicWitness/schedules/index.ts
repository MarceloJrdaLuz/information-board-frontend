export interface IPublisherOption {
  id: string
  fullName: string
}

export interface ISlotPublisherInput {
  publisher_id: string
  order: number
}

export interface ISlotScheduleInput {
  time_slot_id: string
  publishers: ISlotPublisherInput[]
}

export interface IDayScheduleInput {
  date: string
  slots: ISlotScheduleInput[]
}

export interface IScheduleMonthPayload {
  schedule: IDayScheduleInput[]
}






export interface IPublicWitnessCarouselPublisher {
  id: string
  name: string
}

export interface IPublicWitnessFixedSchedule {
  date: string | null        // quando for específico
  weekday: number | null     // quando for fixo semanal
  start_time: string
  end_time: string               // "09:00 - 11:00"
  title: string
  publishers: IPublicWitnessCarouselPublisher[]
}

export interface IPublicWitnessRotationSchedule {
  date: string
  publishers: IPublicWitnessCarouselPublisher[]
}

export interface IPublicWitnessRotationBlock {
  title: string
  weekday: number
  start_time: string
  end_time: string
  schedules: IPublicWitnessRotationSchedule[]
}

export interface IPublicWitnessCarouselResponse {
  fixedSchedules: IPublicWitnessFixedSchedule[]
  rotationBlocks: IPublicWitnessRotationBlock[]
}

