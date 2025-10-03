import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import Notices from "@/Components/Notices"
import { useFetch } from "@/hooks/useFetch"
import { ICongregation, INotice } from "@/types/types"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function NoticesPage() {
    const router = useRouter()
    const { number } = router.query
    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    const [congregationData, setCongregationData] = useState<ICongregation>()
    const [notices, setNotices] = useState<INotice[]>()

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
    }, [data])

    return (
        <>
            <HeadComponent title="Anuncios" urlMiniatura="https://luisgomes.netlify.app/images/limpeza.jpg" />
            <LayoutPrincipal congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} heightConteudo={'h-[90vh]'} justifyContent="start">
                <Notices notices={notices} congregationNumber={number as string} />
            </LayoutPrincipal>
        </>
    )
}

