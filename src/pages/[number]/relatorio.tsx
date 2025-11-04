import { domainUrl } from "@/atoms/atom"
import FormReport from "@/Components/Forms/FormReport"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import { useFetch } from "@/hooks/useFetch"
import { ICongregation } from "@/types/types"
import { useAtomValue } from "jotai"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function Relatorio() {
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
            <LayoutPrincipal nCong={congregationData?.number} congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} bgFundo={'bg-teste-100'} heightConteudo="h-[90vh]">
                <FormReport congregationNumber={number as string} />
            </LayoutPrincipal>
        </>
    )
} 

Relatorio.getLayout = function getLayout(page: React.ReactElement) {
    return page // sem layout nenhum
}

export default Relatorio
