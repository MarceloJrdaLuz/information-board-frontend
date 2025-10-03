import { INotice } from "@/types/types"

export interface IListItemsProps {
    notices: INotice[]
    onDelete: (notice_id: string) => void
}