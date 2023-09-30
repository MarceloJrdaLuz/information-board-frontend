import { INotice } from "@/entities/types"

export interface IListItemsProps {
    notices: INotice[]
    onDelete: (notice_id: string) => void
}