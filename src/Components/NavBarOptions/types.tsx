import { MouseEventHandler, ReactNode } from "react"

export type NavBarOptionsType = {
    title: string
    active?: boolean
    icon?: ReactNode
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    onClick: () => void 
}