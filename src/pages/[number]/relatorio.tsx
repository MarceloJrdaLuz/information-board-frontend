import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import FormReport from "@/Components/Forms/FormReport"
import { ICongregation } from "@/entities/types"
import { useAtomValue } from "jotai"
import { domainUrl } from "@/atoms/atom"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useFetch } from "@/hooks/useFetch"

export default function Relatorio() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    return (
        <>
            <HeadComponent title="Relatório" urlMiniatura={`${domain}/images/relatorio.png`} />
            <LayoutPrincipal congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} bgFundo={'bg-teste-100'} heightConteudo="h-[90vh]">
                <FormReport congregationNumber={number as string} />
            </LayoutPrincipal>
        </>
    )
} 