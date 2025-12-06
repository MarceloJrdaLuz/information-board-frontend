import { IPublisher } from "../types"

export interface IFamily {
    id: string
    name: string
    congregation_id: string
    responsible_publisher_id: string
    members: IPublisher[]
    responsible: IPublisher
}

export interface IFormDataFamily {
    publishers: IPublisher[]
    families: IFamily[]
}
