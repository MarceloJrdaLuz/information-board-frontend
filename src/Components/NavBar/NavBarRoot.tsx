'use-client'
import { isDesktopAtom, toogleMenu } from "@/atoms/atom"
import { useAtom } from "jotai"
import { ReactNode, useCallback, useEffect } from "react"
import { NavBar } from "."
interface NavBarRootProps {
    children: ReactNode
}

export default function NavBarRoot({ children }: NavBarRootProps) {
    const [isMenuOpen, setMenuOpen] = useAtom(toogleMenu)
    const [isDesktop, setIsDesktop] = useAtom(isDesktopAtom)

    const checkScreenWidth = useCallback(() => {
        if (window.innerWidth >= 768) {
            setIsDesktop(true)
            setMenuOpen(true)
        } else {
            setIsDesktop(false)
            setMenuOpen(false)
        }
    }, [setIsDesktop, setMenuOpen])

    useEffect(() => {
        checkScreenWidth() // atualiza inicial
    }, [checkScreenWidth])

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
        <nav
            className={`
    fixed top-0 left-0 h-screen z-40
    bg-gradient-to-b from-primary-200 to-primary-150 
    text-typography-100 shadow-xl

    transform transition-transform duration-300
    ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}

    w-2/3 max-w-[300px]

    md:relative md:translate-x-0 md:w-3/12 md:min-w-[185px] 
  `}
        >
            <div className={`sticky top-0 z-50`}>
                <NavBar.Logo isMenuOpen={isMenuOpen} isDesktop />
            </div>
            <div className="overflow-y-auto hide-scrollbar h-[calc(100vh-80px)] pb-9">
                {children}
            </div>
        </nav>
    )
}