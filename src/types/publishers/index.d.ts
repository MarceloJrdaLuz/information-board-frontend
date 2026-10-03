import { IPublisher } from "../types"

export interface IPayloadCreatePublisher {
    fullName: string,
    congregation_id: string,
    gender: string,
    hope?: string,
    privileges?: string[],
    nickname?: string,
    dateImmersed?: string,
    birthDate?: string,
    pioneerMonths?: string[],
    situation?: string,
    startPioneer?: string,
    address?: string,
    phone?: string,
    emergencyContact_id?: string | undefined,
    user_id?: string | null,
    startDatePublisher?: string | null
}

export interface IPayloadUpdatePublisher {
    fullName?: string,
    gender?: string,
    hope?: string,
    privileges?: string[],
    nickname?: string,
    dateImmersed?: string,
    birthDate?: string,
    pioneerMonths?: string[],
    situation?: string,
    startPioneer?: string | null,
    address?: string,
    phone?: string,
    emergencyContact_id?: string | undefined,
    user_id?: string | null,
    startDatePublisher?: string | null
}

export type InactiveCandidate = {
    publisher: IPublisher
    lastReport?: {
        month: string
        year: string
    }
}

