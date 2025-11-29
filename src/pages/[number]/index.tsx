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
import { themeAtom } from "@/atoms/themeAtoms"
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

    const [notices, setNotices] = useState<INotice[]>()
    const [congregationData, setCongregationData] = useState<ICongregation>()
    const themeAtomValue = useAtomValue(themeAtom)
    const isDark = themeAtomValue === "theme-dark"

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
    }, [data, number])

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
                <Button alignLeft outline={isDark} className="w-full max-w-[350px]  md:w-9/12 md:max-w-[400px] mx-auto" onClick={() => Router.push(`${number}/relatorio`)}>
                    <ReportIcon className="w-5 h-5 sm:w-6 sm:h-6" />Relatório
                </Button>
                <Button alignLeft outline={isDark} className="w-full max-w-[350px] md:w-9/12 md:max-w-[400px] mx-auto" onClick={() => Router.push(`${number}/designacoes`)}>
                    <PublicMeetingIcon className="w-6 h-6 sm:w-7 sm:h-7" />Reuniões
                </Button>
                <Button alignLeft outline={isDark} className="w-full max-w-[350px]  md:w-9/12 md:max-w-[400px] mx-auto " onClick={() => Router.push(`${number}/limpeza`)}>
                    <CleanIcon className="w-7 h-7 sm:w-8 sm:h-8" />Limpeza
                </Button>
                <Button alignLeft outline={isDark} className="w-full max-w-[350px]  md:w-9/12 md:max-w-[400px] mx-auto" onClick={() => Router.push(`${number}/campo`)}>
                    <PrechingHomeIcon className="w-6 h-6 sm:w-7 sm:h-7" />Campo
                </Button>
                <Button alignLeft outline={isDark} className="w-full max-w-[350px]  md:w-9/12 md:max-w-[400px] mx-auto" onClick={() => Router.push(`${number}/financeiro`)}>
                    <CalculatorIcon />Financeiro
                </Button>
                <Button alignLeft outline={isDark} className="w-full max-w-[350px]  md:w-9/12 md:max-w-[400px] mx-auto" onClick={() => Router.push(`${number}/eventos`)}>
                    <CalendarDaysIcon />Eventos especiais
                </Button>
            </LayoutPrincipal>
        </div>
    )
}

Home.getLayout = (page: React.ReactElement) => {
    return page // sem layout nenhum
}

export default Home

