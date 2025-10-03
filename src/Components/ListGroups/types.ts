import { IGroup } from "@/types/types"

export interface IListItemsProps {
    items: IGroup[]
    label: string
    path: string
    onDelete: (item_id: string) => void
}