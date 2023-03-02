import ButtonHome from "@/Components/ButtonHome";
import HeadComponent from "@/Components/HeadComponent";
import LayoutPrincipal from "@/Components/LayoutPrincipal";
import { api } from "@/services/api";
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

export default function Financeiro(props: CongregationTypes) {

    const [pdfShow, setPdfShow] = useState(false)

    function renderizarPdf(opcao: string) {
        return (
            <span>A</span>
            // <GeradorPdf nomeArquivo="Financeiro" setPdfShow={setPdfShow}/>
        )
    }
    return !pdfShow ? (
        <>
        <HeadComponent title="Financeiro" urlMiniatura="https://luisgomes.netlify.app/images/contas.jpg"/>
        <LayoutPrincipal congregationName={props.name}  circuit={props.circuit}  heightConteudo={'1/2'} header className="bg-contas bg-left-bottom bg-cover lg:bg-right" textoHeader="Relatório Financeiro">
            <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5"></div>

            <ButtonHome onClick={()=>setPdfShow(true)} texto='Relatório das Contas' />
            <ButtonHome href={`/${props.number}`} texto='Voltar' />
        </LayoutPrincipal>
        </>
    ) : (
        renderizarPdf('financeiro')
    )
}
