import { INotice } from "@/entities/types";

export interface INoticesModalProps {
    notices: INotice[] | undefined
    congregationNumber: string
}