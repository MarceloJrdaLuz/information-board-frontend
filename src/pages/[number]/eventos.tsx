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

export default function Eventos(props: CongregationTypes) {

    const [pdfShow, setPdfShow] = useState(false)

    const [visivel, setVisivel] = useState(false) //

    const [visivelCartas, setVisivelCartas] = useState(false) 

    const [item, setItem] = useState<'' | 'Assembleias' | 'Congresso' | 'Visita'>('')


    const [rotate, setRotate] = useState(0)

    const [cartas, setCartas] = useState([])

    const [mapCartasConcluido, setMapCartasConcluido] = useState(false)

    function renderizarPdf(item?: string) {
        return (
            <span>A</span>
            // <GeradorPdf nomeArquivo={item} rotate={rotate} setPdfShow={setPdfShow} />
        )
    }

    function renderizarBotoesEventos() {
        return (
            <div className="flex justify-between w-full md:w-4/5">
                <ButtonHome onClick={() => { setItem('Assembleias'), setPdfShow(true), setRotate(90) }} texto='Assembleias' />

                <ButtonHome onClick={() => { setItem('Congresso'), setPdfShow(true) }} texto='Congresso' />

                <ButtonHome onClick={() => { setItem('Visita'), setPdfShow(true), setRotate(90) }} texto='Visita do SC' />
            </div>
        )
    }
    return !pdfShow ? (
        <>
            <HeadComponent title="Cartas" urlMiniatura="https://bituruna.netlify.app/images/cartas.jpg" />
            <LayoutPrincipal congregationName={props.name} circuit={props.circuit} textoHeader="Cartas" heightConteudo={'1/2'} header className="bg-cartas bg-left-bottom bg-cover lg:bg-right">
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5"></div>

                <ButtonHome texto={`Eventos Especiais`} onClick={() => { setVisivel(true), renderizarBotoesEventos(), setVisivelCartas(false) }} />

                {visivel ? renderizarBotoesEventos() : null}

                <ButtonHome href={`/${props.number}`} texto='Voltar' />
            </LayoutPrincipal>
        </>
    ) : (
        renderizarPdf(item)
    )
}