import { IPermission } from "@/entities/types"
import { ReactNode } from "react"

interface IItem {
    id: string
    name: string
    description: string
}


export interface IListItemsProps {
    items: IItem[]
    label: string
    path: string
}