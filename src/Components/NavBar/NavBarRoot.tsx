import { ReactNode } from "react"

interface NavBarRootProps {
    children: ReactNode
}

export default function NavBarRoot({ children }: NavBarRootProps) {
    return (
        <nav className={`lg:w-2/12 bg-primary-200 min-w-[200px] text-white shadow-2xl`}>
            {children}
        </nav>
    )
}