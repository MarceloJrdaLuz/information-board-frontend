import { EndweekDays, ICongregation } from "@/entities/types";

export type FormValues = {
    name: string
    number: string
    city: string 
    circuit: string
    dayMeetingPublic?: EndweekDays
    hourMeetingPublic: string
}