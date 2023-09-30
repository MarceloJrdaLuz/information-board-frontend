import { IGroup } from "@/entities/types"

export interface IListItemsProps {
    items: IGroup[]
    label: string
    path: string
    onDelete: (item_id: string) => void
}