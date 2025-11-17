import { PublicDocumentsProvider } from "@/context/PublicDocumentsContext"
import { ReactNode } from "react"

type LayoutProps = {
    children: ReactNode
}

export default function PublicDocumentsProviderLayout({ children }: LayoutProps) {
    return (
        <PublicDocumentsProvider>
            {children}
        </PublicDocumentsProvider>
    )
}
