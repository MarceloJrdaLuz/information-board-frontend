
interface IItem {
    id: string
    name: string
    description: string
}


export interface IListItemsProps {
    items: IItem[]
    label: string
    path: string
    onDelete: (item_id: string) => void
}