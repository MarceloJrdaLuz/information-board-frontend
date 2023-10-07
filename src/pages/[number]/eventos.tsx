import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import PdfViewer from "@/Components/PdfViewer"
import { domainUrl } from "@/atoms/atom"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, CongregationTypes, IDocument } from "@/entities/types"
import { removeMimeType } from "@/functions/removeMimeType"
import { api } from "@/services/api"
import { useAtomValue } from "jotai"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconEvents from '../../../public/images/eventos-gray.png'
import Image from "next/image"
import Button from "@/Components/Button"
import { ChevronsLeftIcon } from "lucide-react"
import NotFoundDocument from "@/Components/NotFoundDocument"

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Eventos({ circuit: congregationCircuit, name: congregationName, number: congregationNumber }: CongregationTypes) {

    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext()

    const [pdfShow, setPdfShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>()

    useEffect(() => {
        if (number) {
            setCongregationNumber(number as string)
        }
    }, [number, setCongregationNumber])

    useEffect(() => {
        if (documents) {
            setDocumentsFilter(filterDocuments(Categories.eventos))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    return !pdfShow ? (
        <>
            <HeadComponent title="Eventos" urlMiniatura={`${domain}/images/eventos.png`} />
            <LayoutPrincipal image={
                <Image src={iconEvents} alt="Icone de um calendário" fill />
            } congregationName={congregationName} circuit={congregationCircuit} textoHeader="Eventos" heightConteudo={'1/2'} header className="bg-cartas bg-left-bottom bg-cover lg:bg-right">
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-8/12 my-0 m-auto"></div>
                <div className="flex justify-between overflow-auto hide-scrollbar w-11/12 md:w-8/12 gap-2 my-2 m-auto flex-wrap">
                {documentsFilter && documentsFilter?.length > 0 ? documentsFilter?.map(document => (
                        <Button className="w-full" key={document.id} onClick={() => { handleButtonClick(document.url) }}>
                            {removeMimeType(document.fileName)}
                        </Button>
                    )) : (
                        <NotFoundDocument message="Nenhum evento especial encontrado!"/>
                    )
                    }
                </div>
                <Button
                    onClick={() => router.push(`/${congregationNumber}`)}
                    className="w-1/2 mx-auto"
                ><ChevronsLeftIcon />Voltar</Button>
            </LayoutPrincipal>
        </>
    ) : (
        <>
            <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
        </>
    )
}