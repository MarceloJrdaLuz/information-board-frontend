import { EndweekDays } from "@/types/types";

export type FormValues = {
    name: string
    number: string
    city: string 
    circuit: string
    latitude?: string
    longitude?: string
    address?: string
    dayMeetingPublic?: EndweekDays
    hourMeetingPublic: string
}