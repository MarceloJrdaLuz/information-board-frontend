'use client'

import { toogleMenu } from "@/atoms/atom"
import { useAtom } from 'jotai'
import { Menu, X } from "lucide-react"
import { ComponentProps } from "react"

interface ButtonHamburguerProps extends ComponentProps<'button'> {}

export default function ButtonHamburguer({ className, ...props }: ButtonHamburguerProps) {
    const [toogleMenuValue, setToogleMenuValue] = useAtom(toogleMenu)

    const toggleValue = () => {
        setToogleMenuValue(!toogleMenuValue)
    }

    return (
        <button
            type="button"
            onClick={toggleValue}
            title={toogleMenuValue ? "Fechar menu" : "Abrir menu"}
            className={`
                flex items-center justify-center w-10 h-10 rounded-xl
                bg-white/15 hover:bg-white/25 active:scale-95 text-white
                border border-white/15 backdrop-blur-xs shadow-xs
                transition-all duration-150 cursor-pointer shrink-0
                ${className || ""}
            `}
            {...props}
        >
            {toogleMenuValue ? <X size={20} /> : <Menu size={20} />}
        </button>
    )
}