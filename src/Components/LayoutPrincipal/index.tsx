import { ReactNode } from "react"
import Conteudo from "../Conteudo"
import Footer from "../Footer"
import Header from "../Header"

interface LayoutPrincipalProps {
    children?: ReactNode
    image?: ReactNode
    className?: string
    header?: boolean
    heightConteudo?: string
    bgFundo?: string
    textoHeader?: string
    congregationName: string
    circuit: string
    imageUrl?: string
    justifyContent?: string, 
    nCong?: string
}

export default function LayoutPrincipal(props: LayoutPrincipalProps) {

    return (
        <div className={`layout relative shadow shadow-gray-600 bg-gray-200 h-auto w-full flex flex-col md:m-auto lg:shadow-none`}>
            {!props.header ? null :
                <Header className={props.className} texto={props.textoHeader}>
                    {props.image}
                </Header>}
            <Conteudo justifyContent={props.justifyContent} bgFundo={props.bgFundo} hConteudo={props.heightConteudo}>
                {props.children}
            </Conteudo>

            <Footer nCong={props.nCong} ano={new Date().getFullYear()} nomeCongregacao={`Congregação ${props.congregationName} - ${props.circuit}`} aviso="Atenção: favor não compartilhar acesso ao site para outros que não pertencem à congregação" />
        </div>
    )
}