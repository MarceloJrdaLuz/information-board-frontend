'use client'

import NavBarOptionIcon from "./NavBarOptionIcon"
import { NavBarOptionType } from "./types"

export default function NavBarOption(props: NavBarOptionType) {
    const isActive = Boolean(props.active)
    const isSubItem = Boolean(props.isSubItem)

    return (
        <li
            onClick={props.onClick}
            title={props.title}
            className={`
                group relative flex items-center px-3 py-2.5 rounded-xl cursor-pointer
                transition-all duration-150 ease-out select-none
                ${
                    isSubItem
                        ? "pl-9 text-xs sm:text-sm my-0.5"
                        : "text-xs sm:text-sm my-1"
                }
                ${
                    isActive
                        ? "bg-white/20 text-white font-bold shadow-2xs border border-white/20 backdrop-blur-xs"
                        : "text-white/80 hover:text-white hover:bg-white/10 font-medium"
                }
            `}
        >
            {/* Ícone com alinhamento */}
            <span
                className={`
                    flex items-center justify-center shrink-0 mr-3 transition-transform duration-150
                    ${isActive ? "text-white scale-105" : "text-white/80 group-hover:text-white group-hover:scale-105"}
                `}
            >
                <NavBarOptionIcon icon={props.icon} />
            </span>

            {/* Título do menu */}
            <span className="truncate flex-1">
                {props.title}
            </span>

            {/* Marcador ativo lateral sutil */}
            {isActive && (
                <span className="w-1.5 h-4 rounded-full bg-white ml-2 shrink-0 animate-fade-in" />
            )}
        </li>
    )
}