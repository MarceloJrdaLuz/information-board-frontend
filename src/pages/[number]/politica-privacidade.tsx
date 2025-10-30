import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import { domainUrl } from "@/atoms/atom"
import { useFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/congregation"
import { ICongregation } from "@/types/types"
import { useAtomValue } from "jotai"
import { ChevronsLeftIcon } from "lucide-react"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"


export default function PoliticaPrivacidade() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    const fetchTermsOfUsePublishersData =   `/terms/active/publisher`
    const { data: terms } = useFetch<ITermOfUse>(fetchTermsOfUsePublishersData)
    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    return (
        <div className=" flex flex-col h-screen w-screen bg-gray-200">
            <HeadComponent title="Política de Privacidade" urlMiniatura={`${domain}/images/miniatura.png`} />
            <LayoutPrincipal nCong={congregationData?.number} congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} heightConteudo={'1/2'} header className="bg-gray-900 bg-left-bottom bg-cover lg:bg-right" textoHeader="Política de Privacidade" >
                <div className="p-10 m-4 bg-white">
                    <h1 className="mb-5 font-bold text-gray-900 text-2xl">Política sobre coleta e armazenamento de dados</h1>
                    <ReactMarkdown >
                        {terms?.content ?? "Nenhuma política de privacidade foi definida pela congregação."}
                    </ReactMarkdown>
                    <Button
                        onClick={() => Router.push(`/${number}`)}
                        className="w-1/2 mx-auto mt-10"
                    ><ChevronsLeftIcon />Voltar</Button>
                </div>
            </LayoutPrincipal>
        </div>
    )
}

