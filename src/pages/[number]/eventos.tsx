import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import { PublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, IDocument } from "@/entities/types"
import { removeMimeType } from "@/functions/removeMimeType"
import { api } from "@/services/api"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"


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

export async function getStaticProps({ params }: { params: { number: string } }) {

    const getCongregation = await api.get(`/congregation/${params.number}`)

    const { data: congregationData } = getCongregation
    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Eventos(props: CongregationTypes) {

    const router = useRouter()
    const { number } = router.query

    const { setCongregationNumber, documents, filterDocuments } = useContext(PublicDocumentsContext)
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>()

    if (number) {
        setCongregationNumber(number as string)
    }

    useEffect(() => {
        if (documents) {
            setDocumentsFilter(filterDocuments(Categories.eventos))
        }
    }, [filterDocuments, documents])

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
            <div className="flex justify-between w-full md:w-4/5 my-0 m-auto">
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
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5 my-0 m-auto"></div>

                {/* <div>
                    <ButtonHome texto={`Eventos Especiais`} onClick={() => { setVisivel(true), renderizarBotoesEventos(), setVisivelCartas(false) }} />
                </div>

                {visivel ? renderizarBotoesEventos() : null} */}
                {documentsFilter?.map(document => (
                    <div key={document.id}>
                        <ButtonHome onClick={() => {  }} texto={removeMimeType(document.fileName)} />
                    </div>
                ))
                }

                <ButtonHome href={`/${props.number}`} texto='Voltar' />
            </LayoutPrincipal>
        </>
    ) : (
        renderizarPdf(item)
    )
}