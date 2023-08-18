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

export default function Campo(props: CongregationTypes) {

    const [pdfShow, setPdfShow] = useState(false)
    const [options, setOptions] = useState('')

    function renderizarPdf(opcao: string) {
        return (
            <span>A</span>
            // <GeradorPdf nomeArquivo={opcao} setPdfShow={setPdfShow} />
        )
    }
    return !pdfShow ? (
        <>
            <HeadComponent title="Designações de Campo" urlMiniatura="https://luisgomes.netlify.app/images/campolight.png" />
            <LayoutPrincipal congregationName={props.name} circuit={props.circuit} heightConteudo={'1/2'} header className="bg-campo bg-center bg-cover lg:bg-right" textoHeader="Designações de Campo" >
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5 my-0 m-auto"></div>
                <div>
                    <ButtonHome onClick={() => { setOptions('Campo'), setPdfShow(true) }} texto='Designações de Campo' />
                </div>
                <div>
                    <ButtonHome onClick={() => { setOptions('Carrinho'), setPdfShow(true) }} texto='Designações Testemunho Público' />
                </div>
                <ButtonHome href={`/${props.number}`} texto='Voltar' />
            </LayoutPrincipal>
        </>
    ) : renderizarPdf(options)
}