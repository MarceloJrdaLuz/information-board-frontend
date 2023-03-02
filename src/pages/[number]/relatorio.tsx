import { IconeSeta } from "@/assets/icons";
import ButtonHome from "@/Components/ButtonHome";
import HeadComponent from "@/Components/HeadComponent";
import LayoutPrincipal from "@/Components/LayoutPrincipal";
import RelatorioForm from "@/Components/RelatorioForm";
import { api } from "@/services/api";
import Link from "next/link";
import { useState } from "react";


export interface CongregationTypes {
    id: string
    name: string
    number: string
    city: string
    circuit: string
    imageUrl: string
}

export async function getStaticPaths() {
    const getCongregations = await api.get('/congregations')

    const congregations: CongregationTypes[] = getCongregations.data

    const paths = congregations.map(cong => ({
        params: { number: cong.number }
    }))

    return {
        paths, fallback: false
    }
}

export async function getStaticProps({ params }: {params: {number: string}}) {

    const getCongregation = await api.get(`/congregation/${params.number}`)

    const { data: congregationData } = getCongregation
    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Relatorio(props: CongregationTypes) {
    return (
        <>
            <HeadComponent title="Relatório" urlMiniatura="https://luisgomes.netlify.app/images/miniatura.png"/>
            <LayoutPrincipal congregationName={props.name} circuit={props.circuit} bgFundo={'bg-teste-100'} heightConteudo="auto">
                <Link href={'/'} passHref>
                    <div className="absolute top-10 left-11 rounded-full bg-teste-200 p-2 hover:border hover:border-teste-100">
                        {IconeSeta}
                    </div>
                </Link>
                <RelatorioForm />
            </LayoutPrincipal>
        </>
    )
} 