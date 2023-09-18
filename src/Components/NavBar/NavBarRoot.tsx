'use-client'
import { toogleMenu } from "@/atoms/atom"
import { useAtom, useAtomValue } from "jotai"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { NavBar } from "."
interface NavBarRootProps {
    children: ReactNode
}

export default function NavBarRoot({ children }: NavBarRootProps) {
    const [isMenuOpen, setMenuOpen] = useAtom(toogleMenu)
    const [isDesktop, setIsDesktop] = useState(false)
    
    useEffect(() => {
        if (window.innerWidth >= 720) setIsDesktop(true)
    }, [])

    const checkScreenWidth = useCallback(() => {
        if (window.innerWidth >= 720) setIsDesktop(true)
    }, [setIsDesktop])


    useEffect(() => {
        setMenuOpen(isDesktop)
    }, [isDesktop, setMenuOpen])

    useEffect(() => {
        // Adiciona um ouvinte de evento de redimensionamento
        window.addEventListener("resize", checkScreenWidth)

        // Remove o ouvinte de evento ao desmontar o componente
        return () => {
            window.removeEventListener("resize", checkScreenWidth)
        }
    }, [checkScreenWidth])

    return (
        <nav className={`${!isMenuOpen ? 'w-0 transition-all duration-200' : 'transition-all duration-200 w-2/3 max-w-[300px] '}  md:w-2/12  md:min-w-[185px] bg-primary-200 text-white shadow-2xl overflow-auto hide-scrollbar h-screen absolute md:relative z-40 pb-9 pt-20`}>
            <NavBar.Logo isMenuOpen={isMenuOpen} />
            {children}
        </nav>
    )
}