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

export default function Limpeza(props: CongregationTypes) {
    const router = useRouter()
    const { number } = router.query

    const [pdfShow, setPdfShow] = useState(false)
    const [options, setOptions] = useState('')


    const { setCongregationNumber, documents, filterDocuments } = useContext(PublicDocumentsContext)
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>()

    if (number) {
        setCongregationNumber(number as string)
    }

    useEffect(() => {
        if(documents){
            setDocumentsFilter(filterDocuments(Categories.limpeza))
        }
    }, [filterDocuments, documents])

    function renderizarPdf(opcao: string) {
        return (
            <span>A</span>
            // <GeradorPdf nomeArquivo="Limpeza" setPdfShow={setPdfShow}/>
        )
    }
    return !pdfShow ? (
        <>
            <HeadComponent title="Limpeza" urlMiniatura="https://luisgomes.netlify.app/images/limpeza.jpg" />
            <LayoutPrincipal circuit={props.circuit} congregationName={props.name} heightConteudo={'1/2'} header className="bg-limpeza bg-left-bottom bg-cover lg:bg-right" textoHeader="Limpeza do Salão" >

                <div className="linha bg-gray-500 mt-2 w-full h-0.5 md:w-4/5 my-0 m-auto"></div>
                {documentsFilter?.map(document => (
                    <div key={document.id}>
                        <ButtonHome onClick={() => { setOptions('Campo'), setPdfShow(true) }} texto={removeMimeType(document.fileName)} />
                    </div>
                ))
                }
                <ButtonHome href={`/${props.number}`} texto='Voltar' />
            </LayoutPrincipal>
        </>
    ) : renderizarPdf('limpeza')
}

