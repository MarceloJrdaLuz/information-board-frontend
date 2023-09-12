import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import CleanIcon from "@/Components/Icons/CleanIcon"
import MeetingIcon from "@/Components/Icons/MeetingIcon"
import PrechingHomeIcon from "@/Components/Icons/PreachingHomeIcon"
import PreachingIcon from "@/Components/Icons/PreachingIcon"
import PublicMeetingIcon from "@/Components/Icons/PublicMeetingIcon"
import ReportIcon from "@/Components/Icons/ReportIcon"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import NoticesModal from "@/Components/NoticesModal"
import { CongregationContext } from "@/context/CongregationContext"
import { NoticeContext } from "@/context/NoticeContext"
import { PublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { CongregationTypes, ICongregation, INotice } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { CalculatorIcon, CalendarDaysIcon } from "lucide-react"
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

export default function Home({ circuit: congregationCircuit, name: congregationName, number: congregationNumber }: CongregationTypes) {
    const router = useRouter()
    const { number } = router.query
    const { setCongregationNumber } = useContext(NoticeContext)

    const [notices, setNotices] = useState<INotice[]>()
    const [congregationId, setCongregationId] = useState<string | undefined>('')

    const fetchConfigCongregationData = congregationNumber ? `/congregation/${congregationNumber}` : ""
    const { data: congregation, mutate } = useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregation) {
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
        <div className=" flex flex-col bg-gray-200">
            <NoticesModal notices={notices} congregationNumber={congregationNumber} />
            <HeadComponent title="Quadro de Anúncios" urlMiniatura="https://bituruna.netlify.app/images/miniatura.png" />
            <LayoutPrincipal congregationName={congregationName} circuit={congregationCircuit} textoHeader="Quadro de Anúncios" heightConteudo={'screen'} header className="bg-home  bg-left-bottom bg-cover md:bg-center lg:bg-right ">
                <ButtonHome href={`${congregationNumber}/relatorio`} texto="Relatório de Serviço de Campo" icon={<ReportIcon />} />
                <ButtonHome href={`${congregationNumber}/limpeza`} texto="Limpeza do Salão do Reino" icon={<CleanIcon />} />
                <ButtonHome href={`${congregationNumber}/designacoes`} texto="Designações das Reuniões" icon={<PublicMeetingIcon />} />
                <ButtonHome href={`${congregationNumber}/campo`} texto="Designações de Campo" icon={<PrechingHomeIcon />} />
                <ButtonHome href={`${congregationNumber}/financeiro`} texto="Relatório Financeiro" icon={<CalculatorIcon />} />
                <ButtonHome href={`${congregationNumber}/eventos`} texto="Eventos" icon={<CalendarDaysIcon />} />
            </LayoutPrincipal>
        </div>
    )
}
