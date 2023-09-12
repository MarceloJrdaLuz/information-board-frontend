import ButtonHome from "@/Components/ButtonHome"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import Notices from "@/Components/Notices"
import PdfViewer from "@/Components/PdfViewer"
import { NoticeContext } from "@/context/NoticeContext"
import { PublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, CongregationTypes, ICongregation, IDocument, INotice } from "@/entities/types"
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

export default function NoticesPage({ circuit: congregationCircuit, name: congregationName, number: congregationNumber }: CongregationTypes) {
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
    }, [data])

    return (
        <>
            <HeadComponent title="Anuncios" urlMiniatura="https://luisgomes.netlify.app/images/limpeza.jpg" />
            <LayoutPrincipal congregationName={congregationName} circuit={congregationCircuit} heightConteudo={'screen'} className="bg-gray-900 bg-left-bottom bg-cover lg:bg-right">
                <div className="overflow-auto">
                    <Notices notices={notices} congregationNumber={number as string} />
                </div>
            </LayoutPrincipal>
        </>
    )
}

