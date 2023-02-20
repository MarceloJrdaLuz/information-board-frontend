import Link from "next/link";

interface BotaoProps {
    texto: string | Date 
    href?: string
    onClick?: any
    alternarPdfShow?:  () => void
    alterarCategoria?: (e:any) => any
    height?: string
    icone?: any
    children?: any
    className?: string
}

export default function ButtonHome(props: BotaoProps) {

    function renderizarBotao() {
        return (
            <button  className={`
                bg-teste-100 my-1  hover:bg-teste-200 hover:border hover:border-teste-100 hover:text-black w-full rounded-md ${props.height ? props.height : 'h-11'}  
                text-white text-lg
                 font-medium md:w-4/5 md:m-1 auto
                 mx-1 ${props.className}
                `} onClick={props.onClick}>
                {props.texto}
                {props.icone}
            </button>
        )
    }

    return props.href ? (
        <Link href={props.href}>
            {renderizarBotao()}
        </Link>
    ) : renderizarBotao()
}