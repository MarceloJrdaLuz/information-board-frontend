'use client'

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
        checkScreenWidth()
    }, [checkScreenWidth])

    useEffect(() => {
        setMenuOpen(isDesktop)
    }, [isDesktop, setMenuOpen])

    useEffect(() => {
        window.addEventListener("resize", checkScreenWidth)
        return () => {
            window.removeEventListener("resize", checkScreenWidth)
        }
    }, [checkScreenWidth])

    return (
        <>
            {/* Backdrop escuro no mobile para fechar ao clicar fora */}
            {!isDesktop && isMenuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden"
                    aria-hidden="true"
                />
            )}

            <nav
                className={`
                    fixed top-0 left-0 h-[100dvh] z-50
                    bg-gradient-to-b from-primary-200 via-primary-200 to-primary-150 
                    text-white shadow-2xl border-r border-white/10
                    flex flex-col select-none

                    transform transition-transform duration-300 ease-in-out
                    ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}

                    w-[270px] sm:w-[290px]
                    md:relative md:translate-x-0 md:w-64 lg:w-72 md:min-w-[240px] md:max-w-[288px] md:shadow-none
                `}
            >
                {/* Header com Logo */}
                <div className="shrink-0 border-b border-white/15">
                    <NavBar.Logo isMenuOpen={isMenuOpen} isDesktop={isDesktop} />
                </div>

                {/* Lista de Navegação com Scrollbar suave */}
                <div className="flex-1 overflow-y-auto thin-scrollbar px-3 py-3 space-y-1">
                    {children}
                </div>
            </nav>
        </>
    )
}