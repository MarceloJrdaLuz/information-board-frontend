'use client'

import { toogleMenu } from "@/atoms/atom"
import { useSetAtom } from "jotai"
import { X } from "lucide-react"
import Link from "next/link"
import InformationBoardImage from "../InformationBoardImage"

export interface INavBarLogoProps {
    isMenuOpen: boolean
    isDesktop: boolean
}

export default function NavBarLogo({ isDesktop }: INavBarLogoProps) {
    const setMenuOpen = useSetAtom(toogleMenu)

    return (
        <div className="flex h-18 sm:h-20 items-center justify-between px-4 bg-white/5 backdrop-blur-xs">
            <Link
                href="/dashboard"
                className="flex items-center gap-3 group transition-transform active:scale-98"
            >
                <div className="p-1 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors shadow-2xs">
                    <InformationBoardImage size="36" />
                </div>
                <div className="flex flex-col">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                        Quadro de Anúncios
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                        Painel Administrativo
                    </span>
                </div>
            </Link>

            {/* Botão fechar no mobile */}
            {!isDesktop && (
                <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer md:hidden"
                    title="Fechar menu"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    )
}