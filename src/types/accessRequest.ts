import { Profile } from "./types"

export enum AccessRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELED = "CANCELED",
}

export interface IAccessRequest {
    id: string
    user_id: string
    user?: {
        id: string
        email: string
        fullName?: string
        code?: string
        profile?: Profile | null
    }
    congregation_id: string
    congregation?: {
        id: string
        name: string
        city: string
        circuit?: string
        number?: string
    }
    status: AccessRequestStatus
    message?: string | null
    response_observation?: string | null
    reviewed_by_user_id?: string | null
    reviewed_by?: {
        id: string
        fullName?: string
        email: string
    } | null
    created_at: string
    updated_at: string
}

