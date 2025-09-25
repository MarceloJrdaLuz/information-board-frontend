import { IExternalTalk } from "./externalTalks"
import { IHospitalityGroup, IPublisher, ISpeaker, ITalk } from "./types"

export interface IWeekendSchedule {
  id?: string
  date: string
  speaker?: ISpeaker
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