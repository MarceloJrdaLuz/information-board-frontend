import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LifeAndMinistryIcon from "@/Components/Icons/LifeAndMinistryIcon"
import PublicMeetingIcon from "@/Components/Icons/PublicMeetingIcon"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import PdfViewer from "@/Components/PdfViewer"
import { domainUrl } from "@/atoms/atom"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, CongregationTypes, IDocument } from "@/entities/types"
import DateConverter, { meses } from "@/functions/meses"
import { removeMimeType } from "@/functions/removeMimeType"
import { threeMonths } from "@/functions/threeMonths"
import { api } from "@/services/api"
import { useAtomValue } from "jotai"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconDesignacoes from '../../../public/images/designacoes-gray.png'
import Image from "next/image"


export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Designacoes({ circuit: congregationCircuit, name: congregationName, number: congregationNumber, hourMeetingLifeAndMinistary, hourMeetingPublic, dayMeetingLifeAndMinistary, dayMeetingPublic }: CongregationTypes) {

    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)


    const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext()

    const [pdfShow, setPdfShow] = useState(false)
    const [publicOptionsShow, setPublicOptionsShow] = useState(false)
    const [lifeAndMinistryOptionsShow, setLifeAndMinistryOptionsShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [documentsLifeAndMinistryFilter, setDocumentsLifeAndMinistryFilter] = useState<IDocument[]>()
    const [documentsLifeAndMinistryFilterMonths, setDocumentsLifeAndMinistryFilterMonths] = useState<IDocument[]>()
    const [documentsPublicFilter, setDocumentsPublicFilter] = useState<IDocument[]>()
    const [documentsOthersFilter, setDocumentsOthersFilter] = useState<IDocument[]>()


    if (number) {
        setCongregationNumber(number as string)
    }

    useEffect(() => {
        if (documents) {
            setDocumentsLifeAndMinistryFilter(filterDocuments(Categories.meioDeSemana))
            setDocumentsPublicFilter(filterDocuments(Categories.fimDeSemana))
        }
    }, [documents, filterDocuments])

    useEffect(() => {

        const others = documentsLifeAndMinistryFilter?.filter(document => {
            return (
                !meses.includes(removeMimeType(document.fileName))
            )
        })

        setDocumentsOthersFilter(others)

        let threeMonthsShow = false

        if (new Date().getDate() <= 6 && new Date().getDay() <= 4) {
            threeMonthsShow = threeMonths()
        }

        if (!threeMonthsShow) {
            const filterTwoMonths = documentsLifeAndMinistryFilter?.filter(document => {
                return (
                    removeMimeType(document.fileName) === DateConverter('mes') ||
                    removeMimeType(document.fileName) === DateConverter('mes+1')
                )
            })
            if (filterTwoMonths) setDocumentsLifeAndMinistryFilterMonths(filterTwoMonths)
        } else {
            const filterThreeMonths = documentsLifeAndMinistryFilter?.filter(document => {
                return (
                    removeMimeType(document.fileName) === DateConverter('mes-1') ||
                    removeMimeType(document.fileName) === DateConverter('mes') ||
                    removeMimeType(document.fileName) === DateConverter('mes+1')
                )
            })
            if (filterThreeMonths) setDocumentsLifeAndMinistryFilterMonths(filterThreeMonths)
        }
    }, [documentsLifeAndMinistryFilter])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    let sortedDocumentsMonths: IDocument[] = [];
    if (documentsLifeAndMinistryFilterMonths) {
        sortedDocumentsMonths = [...documentsLifeAndMinistryFilterMonths].sort((a, b) => {
            // Remova espaços em branco antes de comparar os nomes de arquivo.
            const fileNameA = a.fileName.trim();
            const fileNameB = b.fileName.trim();

            // Use a função localeCompare para comparar os nomes de arquivo.
            return fileNameA.localeCompare(fileNameB);
        });
    }

    return !pdfShow ? (
        <>
            <HeadComponent title="Designações" urlMiniatura={`${domain}/images/designacoes.png`} />
            <LayoutPrincipal image={
                <Image src={iconDesignacoes} alt="Icone de uma pessoa na tribuna" fill />
            } congregationName={congregationName} circuit={congregationCircuit} textoHeader="Designações Semanais" heightConteudo={'1/2'} header className='bg-designacoes bg-center bg-cover'>
                <div className="overflow-auto hide-scrollbar p-2 w-full md:w-9/12 m-auto ">
                    <div>
                        <ButtonHome
                            onClick={() => { setLifeAndMinistryOptionsShow(!lifeAndMinistryOptionsShow) }}
                            texto='Vida e Ministério'
                            className="hover:bg-primary-100"
                            icon={<LifeAndMinistryIcon />}
                        />
                        <div className="flex justify-between w-11/12 gap-1 m-auto flex-wrap">
                            {lifeAndMinistryOptionsShow ? documentsLifeAndMinistryFilterMonths?.map(document => (
                                <div className="flex-1 " key={document.id}>
                                    <ButtonHome onClick={() => { handleButtonClick(document.url) }}
                                        texto={removeMimeType(document.fileName)}
                                        className="opacity-90"
                                    />
                                </div>
                            )) : null}
                        </div>
                        <div className="flex justify-between w-11/12 gap-1 m-auto flex-wrap">
                            {lifeAndMinistryOptionsShow && documentsOthersFilter && documentsOthersFilter.map(document => (
                                <div className="flex-1 min-w-[120px]" key={document.id}>
                                    <ButtonHome
                                        onClick={() => { handleButtonClick(document.url) }}
                                        texto={removeMimeType(document.fileName)}
                                        className="opacity-90" />
                                </div>
                            ))}
                        </div>
                        {!lifeAndMinistryOptionsShow ? <p className="font-bold  text-xl text-fontColor-100">{`${dayMeetingLifeAndMinistary} ${hourMeetingLifeAndMinistary.split(":").slice(0, 2).join(":")}`}</p> : null}
                    </div>
                    <div>
                        <ButtonHome
                            onClick={() => { setPublicOptionsShow(!publicOptionsShow) }}
                            texto='Reunião Pública'
                            className="hover:bg-primary-100"
                            icon={<PublicMeetingIcon />}
                        />
                        <div className="flex justify-between w-11/12 m-auto gap-1">
                            {publicOptionsShow ? documentsPublicFilter?.map(document => (
                                <div className="flex-1" key={document.id}>
                                    <ButtonHome
                                        onClick={() => { handleButtonClick(document.url) }}
                                        texto={removeMimeType(document.fileName)}
                                        className="opacity-90"
                                    />
                                </div>
                            )) : null}
                        </div>
                        {!publicOptionsShow && <p className="font-bold text-xl text-fontColor-100">{`${dayMeetingPublic} ${hourMeetingPublic.split(":").slice(0, 2).join(":")}`}</p>}
                    </div>
                    <ButtonHome
                        href={`/${congregationNumber}`}
                        texto='Voltar'
                        className="w-1/2 m-auto hover:bg-primary-100"
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