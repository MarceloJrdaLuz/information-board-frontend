import { INotice } from "@/entities/types"

export interface INoticesProps {
    notices: INotice[] | undefined
    congregationNumber: string
}