import { toogleMenu } from "@/atoms/atom"
import { useAtom, useAtomValue } from "jotai"
import { ReactNode } from "react"
interface NavBarRootProps {
    children: ReactNode
}

export default function NavBarRoot({ children }: NavBarRootProps) {
    const [isMenuOpen] = useAtom(toogleMenu)

    return (
        <nav className={`${!isMenuOpen ? 'w-0 transition-all duration-200' : 'transition-all duration-200 w-2/3 max-w-[300px] '}  md:w-2/12 bg-primary-200 md:min-w-[185px]  text-white shadow-2xl overflow-auto hide-scrollbar h-screen absolute md:relative z-40 `}>
            {children}
        </nav>
    )
}