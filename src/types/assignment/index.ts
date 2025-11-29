import { IHospitalityEventType } from "../hospitality"
import { ITalk } from "../types"

export interface IAssignment {
    date: string
    role: string
    talk?: Omit<ITalk, 'id'>
    eventType: IHospitalityEventType
    status: string
    destinationCongregation: {
        name: string
        city: string
        address?: string
        latitude?: string
        longitude?: string
        dayMeetingPublic: string
        hourMeetingPublic: string
    }
}