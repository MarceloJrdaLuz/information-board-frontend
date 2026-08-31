'use client'

import { ChevronDown } from "lucide-react"
import NavBarOptionIcon from "./NavBarOptionIcon"
import { NavBarListOptionsType } from "./types"

export default function NavBarListOptions({
    children,
    title,
    icon,
    showList,
    onClick,
}: NavBarListOptionsType) {
    return (
        <div className="my-1">
            {/* Header da Categoria / Submenu */}
            <div
                onClick={onClick}
                title={title}
                className={`
                    group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer
                    transition-all duration-150 ease-out select-none
                    ${
                        showList
                            ? "bg-white/15 text-white font-semibold shadow-2xs"
                            : "text-white/80 hover:text-white hover:bg-white/10 font-medium"
                    }
                `}
            >
                <div className="flex items-center gap-3 truncate min-w-0">
                    <span
                        className={`
                            flex items-center justify-center shrink-0 transition-transform duration-150
                            ${showList ? "text-white scale-105" : "text-white/80 group-hover:text-white group-hover:scale-105"}
                        `}
                    >
                        <NavBarOptionIcon icon={icon} />
                    </span>
                    <span className="text-xs sm:text-sm truncate">{title}</span>
                </div>

                {/* Seta animada com rotação */}
                <span
                    className={`
                        shrink-0 ml-2 transition-transform duration-200 ease-out text-white/70 group-hover:text-white
                        ${showList ? "rotate-180 text-white" : "rotate-0"}
                    `}
                >
                    <ChevronDown size={17} />
                </span>
            </div>

            {/* Submenu com Linha Guia Lateral */}
            {showList && (
                <ul className="mt-1 ml-4 pl-1.5 border-l border-white/20 space-y-0.5 animate-fade-in">
                    {children}
                </ul>
            )}
        </div>
    )
}