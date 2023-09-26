import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import PdfViewer from "@/Components/PdfViewer"
import { domainUrl } from "@/atoms/atom"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, CongregationTypes, ICongregation, IDocument } from "@/entities/types"
import { removeMimeType } from "@/functions/removeMimeType"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { useAtomValue } from "jotai"
import { GetServerSideProps } from "next"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconeFinanceiro from '../../../public/images/financeiro-gray.png'


export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Financeiro({ circuit: congregationCircuit, name: congregationName, number: congregationNumber }: CongregationTypes) {

    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext()

    const [pdfShow, setPdfShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>()

    if (number) {
        setCongregationNumber(number as string)
    }

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
        <>
            <HeadComponent title="Financeiro" urlMiniatura={`${domain}/images/financeiro.png`} />
            <LayoutPrincipal image={
                <Image src={iconeFinanceiro} alt="Icone uma calculadora e contas" fill />
            } congregationName={congregationName} circuit={congregationCircuit} heightConteudo={'1/2'} header className="bg-contas bg-left-bottom bg-cover lg:bg-right" textoHeader="Relatório Financeiro">
                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5 my-0 m-auto"></div>
                <div className="overflow-auto hide-scrollbar p-2 w-full md:w-9/12 m-auto ">
                    {documentsFilter?.map(document => (
                        <div key={document.id}>
                            <ButtonHome
                                onClick={() => { handleButtonClick(document.url) }}
                                texto={removeMimeType(document.fileName)}
                                className="opacity-90"
                            />
                        </div>
                    ))
                    }
                </div>
                <ButtonHome
                    href={`/${congregationNumber}`}
                    texto='Voltar'
                    className="w-1/2 hover:bg-primary-100"
                />
            </LayoutPrincipal>
        </>
    ) : (
        <>
            <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
        </>
    )
}
