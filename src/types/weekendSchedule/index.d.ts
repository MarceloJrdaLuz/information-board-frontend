import { IExternalTalk } from "../externalTalks"
import { ICongregation, IHospitalityGroup, IPublisher, ISpeaker, ITalk } from "../types"

export interface IPublicSchedule {
  id: string
  date: string
  month: string
  isCurrentWeek: boolean
  isSpecial?: boolean
  specialName?: string
  chairman?: { name: string }
  reader?: { name: string }
  speaker?: { name: string; congregation?: string }
  talk?: { title: string; number: number }
  watchTowerStudyTitle?: string
  externalTalks?: IExternalTalkPublic[]
  hospitality: IHospitalityGroupPublic[]

}

export interface IExternalTalkPublic {
  id: string
  date: string
  speaker?: {
    name: string
  } | null
  talk?: {
    title: string
    number: number
  } | null
  manualTalk?: string | null
  destinationCongregation: string | null
}

export interface IHospitalityGroupPublic {
  eventType: IHospitalityEventType
  completed: boolean
  group: string
  host: string
  members: string[]
}
export interface IWeekendSchedule {
  id?: string
  date: string
  speaker?: ISpeaker
  visitingCongregation?: ICongregation
  talk?: ITalk
  chairman?: IPublisher
  reader?: IPublisher
  hospitalityGroup?: IHospitalityGroup
  isSpecial?: boolean
  specialName?: string
  manualTalk?: string
  manualSpeaker?: string
  watchTowerStudyTitle?: string
}

export interface IWeekendScheduleWithExternalTalks extends IWeekendSchedule {
  externalTalks?: IExternalTalk[]
}

export interface IRecordWeekendSchedule {
  id?: string
  date: string
  speaker_id?: string
  visitingCongregation_id?: string
  talk_id?: string
  chairman_id?: string
  reader_id?: string
  hospitalityGroup_id?: string
  isSpecial?: boolean
  specialName?: string
  manualTalk?: string
  manualSpeaker?: string
  watchTowerStudyTitle?: string
}

export type IWeekendScheduleFormData = {
  weekendSchedules: IWeekendSchedule[]
  congregations: ICongregation[]
  talks: ITalk[]
  speakers: ISpeaker[]
  readers: IPublisher[]
  chairmans: IPublisher[]
  hospitalityGroups: IHospitalityGroup[]
}

export type IExternalTalkFormData = {
  congregations: ICongregation[]
  talks: ITalk[]
  speakers: ISpeaker[]
  externalTalks: IExternalTalk[]
}