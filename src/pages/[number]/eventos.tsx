import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import NotFoundDocument from "@/Components/NotFoundDocument"
import PdfViewer from "@/Components/PdfViewer"
import Spiner from "@/Components/Spiner"
import { domainUrl } from "@/atoms/atom"
import { themeAtom } from "@/atoms/themeAtoms"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { removeMimeType } from "@/functions/removeMimeType"
import { useFetch } from "@/hooks/useFetch"
import PublicDocumentsProviderLayout from "@/layouts/providers/publicDocuments/_layout"
import { Categories, ICongregation, IDocument } from "@/types/types"
import { useAtomValue } from "jotai"
import { ChevronsLeftIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconEvents from '../../../public/images/eventos-gray.png'

function Eventos() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)
    const themeAtomValue = useAtomValue(themeAtom)
    const isDark = themeAtomValue === "theme-dark"

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
            setDocumentsFilter(filterDocuments(Categories.eventos))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    return !pdfShow ? (
        <div className=" flex flex-col h-screen w-screen bg-typography-200">
            <HeadComponent title="Eventos" urlMiniatura={`${domain}/images/eventos.png`} />
            <div className=" flex flex-col h-screen w-screen bg-typography-200 overflow-auto">
                <LayoutPrincipal
                    nCong={congregationData?.number}
                    image={
                        <Image src={iconEvents} alt="Icone de um calendário" fill />
                    } congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} textoHeader="Eventos" heightConteudo={'1/2'} header className="bg-cartas bg-left-bottom bg-cover lg:bg-right">
                    <div className="linha bg-typography-500 mt-2 w-full h-0.5 md:w-8/12 my-0 m-auto"></div>
                    <div className="flex justify-between overflow-auto hide-scrollbar w-11/12 md:w-8/12 gap-2 my-2 m-auto flex-wrap">
                        {documents ? (
                            documentsFilter && documentsFilter?.length > 0 ? documentsFilter?.map(document => (
                                <Button outline={isDark} className="w-full" key={document.id} onClick={() => { handleButtonClick(document.url) }}>
                                    {removeMimeType(document.fileName)}
                                </Button>
                            )) : (
                                <NotFoundDocument message="Nenhum evento especial encontrado!" />
                            )

                        ) : (
                            <div className="w-full my-2"><Spiner size="w-8 h-8" /></div>
                        )}
                    </div>
                    <Button outline={isDark}
                        onClick={() => router.push(`/${number}`)}
                        className="w-1/2 mx-auto"
                    ><ChevronsLeftIcon />Voltar</Button>
                </LayoutPrincipal>
            </div>
        </div>
    ) : (
        <>
            <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
        </>
    )
}

Eventos.getLayout = (page: React.ReactElement) => {
    return (
        <PublicDocumentsProviderLayout>
            {page}
        </PublicDocumentsProviderLayout>
    )
}

export default Eventos
