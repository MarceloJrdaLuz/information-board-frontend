import Conteudo from "../Conteudo"
import Footer from "../Footer"
import Header from "../Header"

interface LayoutPrincipalProps {
    children?: any
    className?: string
    header?: boolean
    heightConteudo?: string
    bgFundo?: string
    textoHeader?: string
    congregationName: string
    circuit: string
    imageUrl?: string
}

export default function LayoutPrincipal(props: LayoutPrincipalProps) {

    return (
        <div className={`layout relative shadow shadow-gray-600  bg-gray-200 h-screen w-screen flex flex-col md:w-screen md:m-auto lg:w-screen lg:shadow-none`}>
            {!props.header ? null : <Header className={props.className} texto={props.textoHeader}></Header>}
            <Conteudo bgFundo={props.bgFundo} hConteudo={props.heightConteudo}>
                {props.children}
            </Conteudo>

            <Footer ano={new Date().getFullYear()} nomeCongregacao={`Congregação ${props.congregationName} - ${props.circuit}`} aviso="Atenção: favor não compartilhar acesso ao site para outros que não pertencem à congregação" />
        </div>
    )
}