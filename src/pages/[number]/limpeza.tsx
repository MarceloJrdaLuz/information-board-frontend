import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import PdfViewer from "@/Components/PdfViewer"
import { domainUrl } from "@/atoms/atom"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, CongregationTypes, ICongregation, IDocument } from "@/entities/types"
import { removeMimeType } from "@/functions/removeMimeType"
import { api } from "@/services/api"
import { useAtomValue } from "jotai"
import { GetServerSideProps } from "next"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconClean from '../../../public/images/limpeza-gray.png'
import Image from "next/image"
import Button from "@/Components/Button"
import { ChevronsLeftIcon } from "lucide-react"

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Limpeza({ circuit: congregationCircuit, name: congregationName, number: congregationNumber }: CongregationTypes) {
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
            setDocumentsFilter(filterDocuments(Categories.limpeza))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    return !pdfShow ? (
        <>
            <HeadComponent title="Limpeza" urlMiniatura={`${domain}/images/limpeza-green.png`} />
            <LayoutPrincipal image={
                <Image src={iconClean} alt="Icone de produtos de limpeza" fill />
            } congregationName={congregationName} circuit={congregationCircuit} heightConteudo={'1/2'} header className=" bg-left-bottom bg-cover lg:bg-right" textoHeader="Limpeza do Salão" >
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-8/12 my-0 m-auto"></div>
                <div className="flex justify-between overflow-auto hide-scrollbar w-11/12 md:w-8/12 gap-2 my-2 m-auto flex-wrap">
                    {documentsFilter?.map(document => (
                        <Button className="w-full" key={document.id} onClick={() => { handleButtonClick(document.url) }}>
                            {removeMimeType(document.fileName)}
                        </Button>
                    ))
                    }
                </div>
                <Button
                    onClick={() => Router.push(`/${congregationNumber}`)}
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

