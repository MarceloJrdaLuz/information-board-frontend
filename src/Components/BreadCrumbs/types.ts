import { ReactElement } from "react"

export interface IBreadCrumbs {
    label: string
    link: string
}

export interface IBreadCrumbsProps {
    crumbs: IBreadCrumbs[]
    pageActive: string
}