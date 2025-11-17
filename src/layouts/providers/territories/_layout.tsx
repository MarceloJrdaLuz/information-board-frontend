import { TerritoryProvider } from "@/context/TerritoryContext"
import { ReactNode } from "react"

type LayoutProps = {
    children: ReactNode
}

export default function TerritoriesProviderLayout({ children }: LayoutProps) {
    return (
        <TerritoryProvider>
            {children}
        </TerritoryProvider>
    )
}
