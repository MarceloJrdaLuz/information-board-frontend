import { ReactNode } from "react"

export type NavBarOptionsType = {
    title: string
    active?: boolean
    icon?: ReactNode
    onClick: () => void 
}