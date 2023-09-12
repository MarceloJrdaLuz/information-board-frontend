import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import PdfViewer from "@/Components/PdfViewer"
import { PublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, CongregationTypes, ICongregation, IDocument } from "@/entities/types"
import { removeMimeType } from "@/functions/removeMimeType"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Campo({circuit: congregationCircuit, name: congregationName, number: congregationNumber}: CongregationTypes) {
    const router = useRouter()
    const { number } = router.query
    const { setCongregationNumber, documents, filterDocuments } = useContext(PublicDocumentsContext)

    const [pdfShow, setPdfShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>()
    const [fieldServiceOptionsShow, setFieldServiceOptionsShow] = useState(false)
    const [publicServiceOptionsShow, setLPublicServiceOptionsShow] = useState(false)
    const [documentsFieldServiceFilter, setDocumentsFieldServiceFilter] = useState<IDocument[]>()
    const [documentsPublicServiceFilter, setDocumentsPublicServiceFilter] = useState<IDocument[]>()
    
    if (number) {
        setCongregationNumber(number as string)
    }

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
        <>
            <HeadComponent title="Designações de Campo" urlMiniatura="https://luisgomes.netlify.app/images/campolight.png" />
            <LayoutPrincipal congregationName={congregationName} circuit={congregationCircuit} heightConteudo={'1/2'} header className="bg-campo bg-center bg-cover lg:bg-right" textoHeader="Designações de Campo" >
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5 my-0 m-auto"></div>
                <div className="overflow-auto hide-scrollbar p-2 w-full md:w-9/12 m-auto ">
                    <div>
                        <ButtonHome
                            onClick={() => { setFieldServiceOptionsShow(!fieldServiceOptionsShow) }}
                            texto='Saídas de campo'
                            className="hover:bg-primary-100"
                        />
                        <div className="flex justify-between w-11/12 gap-1 m-auto flex-wrap">
                            {fieldServiceOptionsShow ? documentsFieldServiceFilter?.map(document => (
                                <div className="flex-1 min-w-[120px]" key={document.id}>
                                    <ButtonHome
                                        onClick={() => { handleButtonClick(document.url) }}
                                        texto={removeMimeType(document.fileName)}
                                        className="opacity-90" />
                                </div>
                            )) : null}
                        </div>

                        <div>
                            <ButtonHome
                                onClick={() => { setLPublicServiceOptionsShow(!publicServiceOptionsShow) }}
                                texto='Testemunho Público'
                                className="hover:bg-primary-100"
                            />
                            <div className="flex justify-between w-11/12 gap-1 m-auto flex-wrap">
                                {publicServiceOptionsShow ? documentsPublicServiceFilter?.map(document => (
                                    <div className="flex-1 min-w-[120px]" key={document.id}>
                                        <ButtonHome
                                            onClick={() => { handleButtonClick(document.url) }}
                                            texto={removeMimeType(document.fileName)}
                                            className="opacity-90"
                                        />
                                    </div>
                                )) : null}
                            </div>
                        </div>
                    </div>
                    <ButtonHome
                        href={`/${congregationNumber}`}
                        texto='Voltar'
                        className="w-1/2 hover:bg-primary-100"
                    />
                </div>
            </LayoutPrincipal>
        </>
    ) : (
        <>
            <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
        </>
    )
}