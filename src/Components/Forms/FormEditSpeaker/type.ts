import { ICongregation, IPublisher, ISpeaker, ITalk } from "@/entities/types"

export type FormValues = {
    fullName?: string
    address?: string,
    phone?: string
}
 
export type SpeakerFormData = {
 publishers: IPublisher[] 
 congregations: ICongregation[]
 talks: ITalk[]
}