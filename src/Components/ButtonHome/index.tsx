import Link from "next/link"
import { ReactNode } from "react"

interface BotaoProps {
    texto: string
    href?: string
    onClick?: any
    alternarPdfShow?: () => void
    alterarCategoria?: (e: any) => any
    height?: string
    icon?: ReactNode
    children?: any
    className?: string
}

export default function ButtonHome(props: BotaoProps) {

    function renderizarBotao() {
        return (
            <button className={`flex justify-center items-center
                bg-primary-200 my-1 hover:bg-teste-200 hover:border 
                hover:border-teste-100 hover:text-black w-full rounded-md ${props.height ? props.height : 'h-11'}  
                text-white text-sm sm:text-base md:text-lg font-medium m-auto ${props.className}  
                `} onClick={props.onClick}>
                {props.icon && <span className="mr-2">{props.icon}</span>}
                <span>{props.texto}</span>
            </button>
        )
    }

    return props.href ? (
        <Link href={props.href}>
            {renderizarBotao()}
        </Link>
    ) : renderizarBotao()
}