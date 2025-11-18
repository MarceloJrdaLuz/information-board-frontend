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
    emergencyContact_id?: string | undefined
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
    startPioneer?: string,
    address?: string,
    phone?: string,
    emergencyContact_id?: string | undefined
}

