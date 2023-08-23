import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import PdfViewer from "@/Components/PdfViewer"
import { PublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, ICongregation, IDocument } from "@/entities/types"
import { removeMimeType } from "@/functions/removeMimeType"
import { useFetch } from "@/hooks/useFetch"
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

export default function Campo(props: CongregationTypes) {
    const router = useRouter()
    const { number } = router.query

    const [pdfShow, setPdfShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>()

    const { setCongregationNumber, documents, filterDocuments } = useContext(PublicDocumentsContext)

    if (number) {
        setCongregationNumber(number as string)
    }

    useEffect(() => {
        if (documents) {
            setDocumentsFilter(filterDocuments(Categories.campo))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url);
        setPdfShow(true);
    }

    // function renderizarPdf(url: string) {
    //     const pdfUrl = url
    //     console.log("Url being passed to PdfViewer:", pdfUrl)
    //     return (
    //         <PdfViewer url={url}/>
    //         // <GeradorPdf nomeArquivo={opcao} setPdfShow={setPdfShow} />
    //     )
    // }

    return !pdfShow ? (
        <>
            <HeadComponent title="Designações de Campo" urlMiniatura="https://luisgomes.netlify.app/images/campolight.png" />
            <LayoutPrincipal congregationName={props.name} circuit={props.circuit} heightConteudo={'1/2'} header className="bg-campo bg-center bg-cover lg:bg-right" textoHeader="Designações de Campo" >
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5 my-0 m-auto"></div>
                {documentsFilter?.map(document => (
                    <div key={document.id}>
                        <ButtonHome onClick={() => { handleButtonClick(document.url) }} texto={removeMimeType(document.fileName)} />
                    </div>
                ))
                }
                <ButtonHome href={`/${props.number}`} texto='Voltar' />
            </LayoutPrincipal>
        </>
    ) : (
        <>
            <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
        </>
    )
}