import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import CleanIcon from "@/Components/Icons/CleanIcon"
import PrechingHomeIcon from "@/Components/Icons/PreachingHomeIcon"
import PublicMeetingIcon from "@/Components/Icons/PublicMeetingIcon"
import ReportIcon from "@/Components/Icons/ReportIcon"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import NoticesModal from "@/Components/NoticesModal"
import { domainUrl } from "@/atoms/atom"
import { useNoticesContext } from "@/context/NoticeContext"
import { CongregationTypes, ICongregation, INotice } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { useAtomValue } from "jotai"
import { CalculatorIcon, CalendarDaysIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import Image from "next/image"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import quadro from '../../../public/images/miniatura-gray.png'
import Button from "@/Components/Button"

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.query

    const getCongregation = await api.get(`/congregation/${number}`)

    const { data: congregationData } = getCongregation

    return {
        // Passed to the page component as props
        props: { ...congregationData },
    }
}

export default function Home({ circuit: congregationCircuit, name: congregationName, number: congregationNumber }: CongregationTypes) {
    const router = useRouter()
    const { number } = router.query

    const domain = useAtomValue(domainUrl)

    const { setCongregationNumber } = useNoticesContext()

    const [notices, setNotices] = useState<INotice[]>()
    const [congregationId, setCongregationId] = useState<string | undefined>('')
    const [urlImage, setUrlImage] = useState<string | undefined>('')

    const fetchConfigCongregationData = congregationNumber ? `/congregation/${congregationNumber}` : ""
    const { data: congregation, mutate } = useFetch<ICongregation>(fetchConfigCongregationData)
    
    useEffect(() => {
        if (congregation) {
            setUrlImage(congregation.image_url)
            setCongregationId(congregation?.id)
        }
    }, [congregation])

    const fetchConfigNoticesData = congregationId ? `/notices/${congregationId}` : ""
    const { data } = useFetch<INotice[]>(fetchConfigNoticesData)

    useEffect(() => {
        if (data) {
            const today = new Date().getDate()
            const filter = data.filter(notice => {
                if (notice.startDay && notice.endDay) {
                    return today >= notice.startDay && today <= notice.endDay
                } else {
                    return true
                }
            })
            setNotices(filter)
        }

        if (number) {
            setCongregationNumber(number as string)
        }
    }, [data, number, setCongregationNumber])


    return (
        <div className=" flex flex-col h-screen w-screen bg-gray-200 overflow-auto">
            {notices && notices.length > 0 && <NoticesModal notices={notices} congregationNumber={congregationNumber} />}
            <HeadComponent title="Quadro de Anúncios" urlMiniatura={`${domain}/images/miniatura.png`} />
            <LayoutPrincipal image={(
                urlImage ? (
                    <Image src={urlImage} alt="Foto do Salão do Reino" fill />
                ) : (
                    <Image src={quadro} alt="Icone de um quadro de anúncios" fill />
                )
            )} congregationName={congregationName} circuit={congregationCircuit} textoHeader="Quadro de Anúncios" heightConteudo={'auto'} header className="bg-left-bottom bg-cover md:bg-center lg:bg-right ">
                <Button onClick={() => Router.push(`${congregationNumber}/relatorio`)}>
                    <ReportIcon />Relatório de Serviço de campo
                </Button>
                <Button onClick={() => Router.push(`${congregationNumber}/limpeza`)}>
                    <CleanIcon />Limpeza do Salão do Reino
                </Button>
                <Button onClick={() => Router.push(`${congregationNumber}/designacoes`)}>
                    <PublicMeetingIcon />Designações das Reuniões
                </Button>
                <Button onClick={() => Router.push(`${congregationNumber}/campo`)}>
                    <PrechingHomeIcon />Designações de Campo
                </Button>
                <Button onClick={() => Router.push(`${congregationNumber}/financeiro`)}>
                    <CalculatorIcon />Relatório Financeiro
                </Button>
                <Button onClick={() => Router.push(`${congregationNumber}/eventos`)}>
                    <CalendarDaysIcon />Eventos especiais
                </Button>
            </LayoutPrincipal>
        </div>
    )
}
