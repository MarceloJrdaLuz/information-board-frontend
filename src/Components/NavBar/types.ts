import { ElementType, ReactNode } from "react"

export type NavBarProps = {
    pageActive: string
}

export type NavBarOptionType = {
    title: string
    active?: boolean
    icon: ElementType 
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    onClick: () => void 
}

export type NavBarListOptionsType = {
    children: ReactNode
    title: string
    icon: ElementType
    showList?: boolean
    onClick: () => void 
}