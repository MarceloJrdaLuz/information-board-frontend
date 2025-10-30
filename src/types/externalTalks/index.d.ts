import { ICongregation, ISpeaker, ITalk } from "../types"

export interface IExternalTalk {
    id: string
    date: string
    speaker?: ISpeaker
    talk?: ITalk | null
    manualTalk?: string | null
    destinationCongregation: ICongregation
    status: ExternalTalkStatus
}

export type ExternalTalkStatus = "pending" | "confirmed" | "canceled"
