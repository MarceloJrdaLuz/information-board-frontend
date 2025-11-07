import { ReactNode, useEffect, useState } from "react"
import Conteudo from "../Conteudo"
import Footer from "../Footer"
import Header from "../Header"
import { HeaderPublicSkeleton } from "../Header/skeleton"
import { ContentPublicSkeleton } from "../Conteudo/skeleton"
import { FooterPublicSkeleton } from "../Footer/skeleton"

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
    nCong?: string,
    loading?: boolean
}

export default function LayoutPrincipal(props: LayoutPrincipalProps) {

    if (props.loading) {
        return (
            <div className="layout relative shadow shadow-typography-600 bg-typography-200 h-auto w-full flex flex-col">
                {props.header &&
                    <HeaderPublicSkeleton />
                }
                <ContentPublicSkeleton />
                <FooterPublicSkeleton />
            </div>
        )
    }

    return (
        <div className={`layout relative shadow shadow-typography-600 bg-surface-200 h-auto w-full flex flex-col md:m-auto lg:shadow-none`}>
            {!props.header ? null :
                <>
                    <Header className={props.className} texto={props.textoHeader}>
                        {props.image}
                    </Header>
                </>
            }
            <Conteudo justifyContent={props.justifyContent} bgFundo={props.bgFundo} hConteudo={props.heightConteudo}>
                {props.children}
            </Conteudo>

            <Footer nCong={props.nCong} ano={new Date().getFullYear()} nomeCongregacao={`Congregação ${props.congregationName} - ${props.circuit}`} aviso="Atenção: favor não compartilhar acesso ao site para outros que não pertencem à congregação." />
        </div>
    )
}