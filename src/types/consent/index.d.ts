import { ITermOfUse } from "../termsofuse"

export interface ICheckPublisherConsent {
    hasAccepted: boolean
    isLatestVersion: boolean
    acceptedVersion: string
    currentVersion: string
    acceptedAt: Date
    activeTerm: ITermOfUse
    message: string
}

export interface IConsentRecordTypes {
    id: string
    publisher: IPublisherConsent
    deviceId: string
    accepted_at: string
}

export interface ICheckConsentCongregation {
    hasAccepted: boolean
    isLatestVersion: boolean
    acceptedVersion: string | null
    currentVersion: string
    acceptedAt?: Date
    activeTerm?: ITermOfUse
    message: string
}