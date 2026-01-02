import { IPublicWitnessPublisher } from "@/types/publicWitness"

export interface IPublicWitnessFormTimeSlot {
  start_time: string
  end_time: string
  order: number 
  defaultPublishers: IPublicWitnessPublisher[]
}

export interface IPublicWitnessArrangementForm {
  title: string
  timeSlots: IPublicWitnessFormTimeSlot[]
}
