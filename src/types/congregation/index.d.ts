export interface ICheckConsentCongregation {
    hasAccepted: boolean
    isLatestVersion: boolean
    acceptedVersion: string | null
    currentVersion: string
    acceptedAt?: Date
    activeTerm?: ITermOfUseCongregation
    message: string
}

export interface ITermOfUse {
    id: string
    type: string
    version: string,
    title: string
    content: string,
    is_active: boolean
    createdAt: Date
}
