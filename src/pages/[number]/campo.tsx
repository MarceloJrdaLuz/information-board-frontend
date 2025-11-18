import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import PreachingIcon from "@/Components/Icons/PreachingIcon"
import PublicPreachingIcon from "@/Components/Icons/PublicPreachingIcon"
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
import iconPreaching from '../../../public/images/campo-gray.png'

function Campo() {
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
    const [fieldServiceOptionsShow, setFieldServiceOptionsShow] = useState(false)
    const [publicServiceOptionsShow, setLPublicServiceOptionsShow] = useState(false)
    const [documentsFieldServiceFilter, setDocumentsFieldServiceFilter] = useState<IDocument[]>()
    const [documentsPublicServiceFilter, setDocumentsPublicServiceFilter] = useState<IDocument[]>()

    useEffect(() => {
        if (number) {
            setCongregationNumber(number as string)
        }
    }, [number, setCongregationNumber])

    useEffect(() => {
        if (documents) {
            setDocumentsFieldServiceFilter(filterDocuments(Categories.saidasDeCampo))
            setDocumentsPublicServiceFilter(filterDocuments(Categories.testemunhoPublico))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    return !pdfShow ? (
        <div className=" flex flex-col h-screen w-screen bg-typography-200">
            <HeadComponent title="Designações de Campo" urlMiniatura={`${domain}/images/campo.png`} />
            <LayoutPrincipal
                nCong={congregationData?.number}
                image={
                    <Image src={iconPreaching} alt="Icone de uma pessoa pregando" fill />
                }
                congregationName={congregationData?.name ?? ""}
                circuit={congregationData?.circuit ?? ""}
                heightConteudo={'1/2'}
                header
                className="bg-designacoes bg-center bg-cover"
                textoHeader="Designações de Campo"
            >
                <div className="linha bg-typography-500 mt-2 w-full h-0.5 md:w-8/12 my-0 m-auto"></div>
                <div className="overflow-auto hide-scrollbar p-2 w-full md:w-8/12 m-auto ">
                    <div>
                        <Button outline={isDark}
                            onClick={() => { setFieldServiceOptionsShow(!fieldServiceOptionsShow) }}
                            className="w-full"
                        ><PreachingIcon /> Saídas de Campo</Button>
                        <div className="flex justify-between w-11/12 gap-1 my-2 m-auto flex-wrap">
                            {fieldServiceOptionsShow && (
                                documents ? documentsFieldServiceFilter && documentsFieldServiceFilter.length > 0 ? (
                                    documentsFieldServiceFilter?.map(document => (
                                        <div className={`${removeMimeType(document.fileName).length > 10 ? 'w-full' : 'flex-1'} min-w-[120px]`} key={document.id}>
                                            <Button outline={isDark}
                                                className="w-full"
                                                onClick={() => { handleButtonClick(document.url) }}
                                            >
                                                {removeMimeType(document.fileName)}
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <NotFoundDocument message="Nenhuma programação de saída de campo encontrada!" />
                                ) : (
                                    <div className="w-full"><Spiner size="w-8 h-8" /></div>
                                )
                            )}
                        </div>

                        <div>
                            <Button outline={isDark}
                                onClick={() => { setLPublicServiceOptionsShow(!publicServiceOptionsShow) }}
                                className="w-full"
                            ><PublicPreachingIcon />Testemunho Público</Button>
                            <div className="flex justify-between w-11/12 gap-1 my-2 m-auto flex-wrap">
                                {publicServiceOptionsShow && (
                                    documents ? (
                                        documentsPublicServiceFilter && documentsPublicServiceFilter?.length > 0 ? documentsPublicServiceFilter?.map(document => (
                                            <div className={`${removeMimeType(document.fileName).length > 10 ? 'w-full' : 'flex-1'} min-w-[120px]`} key={document.id}>
                                                <Button outline={isDark}
                                                    className="w-full"
                                                    onClick={() => { handleButtonClick(document.url) }}
                                                >{removeMimeType(document.fileName)}</Button>
                                            </div>
                                        )) : <NotFoundDocument message="Nenhuma programação de testemunho público encontrada!" />
                                    ) : (
                                        <div className="w-full">
                                            <Spiner size="w-8 h-8" />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                    <Button outline={isDark}
                        onClick={() => router.push(`/${number}`)}
                        className="w-1/2 mx-auto"
                    ><ChevronsLeftIcon />Voltar</Button>
                </div>
            </LayoutPrincipal>
        </div>
    ) : (
        <>
            <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
        </>
    )
}

Campo.getLayout = (page: React.ReactElement) => {
    return (
        <PublicDocumentsProviderLayout>
            {page}
        </PublicDocumentsProviderLayout>
    )
}

export default Campo
