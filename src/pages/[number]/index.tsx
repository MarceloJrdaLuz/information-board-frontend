'use-client'
import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import CleanIcon from "@/Components/Icons/CleanIcon"
import PrechingHomeIcon from "@/Components/Icons/PreachingHomeIcon"
import PublicMeetingIcon from "@/Components/Icons/PublicMeetingIcon"
import ReportIcon from "@/Components/Icons/ReportIcon"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import NoticesModal from "@/Components/NoticesModal"
import { domainUrl } from "@/atoms/atom"
import { useNoticesContext } from "@/context/NoticeContext"
import { useFetch } from "@/hooks/useFetch"
import { ICongregation, INotice } from "@/types/types"
import { useAtomValue } from "jotai"
import { CalculatorIcon, CalendarDaysIcon } from "lucide-react"
import Image from "next/image"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import quadro from '../../../public/images/miniatura-gray.png'

function Home() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const { setCongregationNumber } = useNoticesContext()

    const [notices, setNotices] = useState<INotice[]>()
    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation, isLoading } = useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    const fetchConfigNoticesData = congregationData?.id ? `/notices/${congregationData?.id}` : ""
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

    const isFetching = isLoading || !number || !congregationData

    return (
        <div className=" flex flex-col h-screen w-screen bg-typography-200 overflow-auto">
            {notices && notices.length > 0 && <NoticesModal notices={notices} congregationNumber={number as string} />}
            <HeadComponent title="Quadro de Anúncios" urlMiniatura={`${domain}/images/miniatura.png`} />
            <LayoutPrincipal loading={isFetching} nCong={congregationData?.number} image={(
                congregationData?.image_url ? (
                    <Image src={congregationData?.image_url} alt="Foto do Salão do Reino" fill />
                ) : (
                    <Image src={quadro} alt="Icone de um quadro de anúncios" fill />
                )
            )} congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} textoHeader="Quadro de Anúncios" heightConteudo={'auto'} header className="bg-left-bottom bg-cover md:bg-center lg:bg-right ">
                <Button className="w-full md:w-9/12 mx-auto" onClick={() => Router.push(`${number}/relatorio`)}>
                    <ReportIcon />Relatório de Serviço de campo
                </Button>
                <Button className="w-full  md:w-9/12 mx-auto" onClick={() => Router.push(`${number}/limpeza`)}>
                    <CleanIcon />Limpeza do Salão do Reino
                </Button>
                <Button className="w-full  md:w-9/12 mx-auto" onClick={() => Router.push(`${number}/designacoes`)}>
                    <PublicMeetingIcon />Designações das Reuniões
                </Button>
                <Button className="w-full  md:w-9/12 mx-auto" onClick={() => Router.push(`${number}/campo`)}>
                    <PrechingHomeIcon />Designações de Campo
                </Button>
                <Button className="w-full  md:w-9/12 mx-auto" onClick={() => Router.push(`${number}/financeiro`)}>
                    <CalculatorIcon />Relatório Financeiro
                </Button>
                <Button className="w-full  md:w-9/12 mx-auto" onClick={() => Router.push(`${number}/eventos`)}>
                    <CalendarDaysIcon />Eventos especiais
                </Button>
            </LayoutPrincipal>
        </div>
    )
}

Home.getLayout = function getLayout(page: React.ReactElement) {
    return page // sem layout nenhum
}

export default Home

