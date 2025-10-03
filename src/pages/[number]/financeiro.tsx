import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import NotFoundDocument from "@/Components/NotFoundDocument"
import PdfViewer from "@/Components/PdfViewer"
import Spiner from "@/Components/Spiner"
import { domainUrl } from "@/atoms/atom"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { removeMimeType } from "@/functions/removeMimeType"
import { useFetch } from "@/hooks/useFetch"
import { Categories, ICongregation, IDocument } from "@/types/types"
import { useAtomValue } from "jotai"
import { ChevronsLeftIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconeFinanceiro from '../../../public/images/financeiro-gray.png'

export default function Financeiro() {

    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])


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
            setDocumentsFilter(filterDocuments(Categories.financeiro))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    return !pdfShow ? (
        <div className=" flex flex-col h-screen w-screen bg-gray-200">
            <HeadComponent title="Financeiro" urlMiniatura={`${domain}/images/financeiro.png`} />
            <LayoutPrincipal image={
                <Image src={iconeFinanceiro} alt="Icone uma calculadora e contas" fill />
            } congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} heightConteudo={'1/2'} header className="bg-contas bg-left-bottom bg-cover lg:bg-right" textoHeader="Relatório Financeiro">
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-8/12 my-0 m-auto"></div>
                <div className="flex justify-between overflow-auto hide-scrollbar w-11/12 md:w-8/12 gap-2 my-2 m-auto flex-wrap">
                   {documents ? (
                     documentsFilter && documentsFilter?.length > 0 ? documentsFilter?.map(document => (
                        <Button className="w-full" key={document.id} onClick={() => { handleButtonClick(document.url) }}>
                            {removeMimeType(document.fileName)}
                        </Button>
                    )) : (
                        <NotFoundDocument message="Relatório das contas não localizado!" />
                    )
                   ) : (
                    <div className="w-full my-2"><Spiner size="w-8 h-8" /></div>
                   )}
                </div>
                <Button
                    onClick={() => router.push(`/${number}`)}
                    className="w-1/2 mx-auto"
                ><ChevronsLeftIcon />Voltar</Button>
            </LayoutPrincipal >
        </div>
    ) : (
        <>
            <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
        </>
    )
}
