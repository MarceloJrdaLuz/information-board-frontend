import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import { domainUrl } from "@/atoms/atom"
import { themeAtom } from "@/atoms/themeAtoms"
import { useFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/termsofuse"
import { ICongregation } from "@/types/types"
import { useAtomValue } from "jotai"
import { ChevronsLeftIcon } from "lucide-react"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

function PoliticaPrivacidade() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)
    const themeAtomValue = useAtomValue(themeAtom)
    const isDark = themeAtomValue === "theme-dark"

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    const fetchTermsOfUsePublishersData = `/terms/active/publisher`
    const { data: terms } = useFetch<ITermOfUse>(fetchTermsOfUsePublishersData)
    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    return (
        <div className=" flex flex-col h-screen w-screen bg-typography-200">
            <HeadComponent title="Política de Privacidade" urlMiniatura={`${domain}/images/miniatura.png`} />
            <LayoutPrincipal nCong={congregationData?.number} congregationName={congregationData?.name ?? ""} circuit={congregationData?.circuit ?? ""} heightConteudo={'1/2'} header className="bg-typography-900 bg-left-bottom bg-cover lg:bg-right" textoHeader="Política de Privacidade" >
                <div className="p-10 m-4 bg-surface-100">
                    <h1 className="mb-5 font-bold text-typography-900 text-2xl">Política sobre coleta e armazenamento de dados</h1>
                    <ReactMarkdown >
                        {terms?.content ?? "Nenhuma política de privacidade foi definida pela congregação."}
                    </ReactMarkdown>
                    <Button
                        outline={isDark}
                        onClick={() => Router.push(`/${number}`)}
                        className="w-1/2 mx-auto mt-10"
                    ><ChevronsLeftIcon />Voltar</Button>
                </div>
            </LayoutPrincipal>
        </div>
    )
}

PoliticaPrivacidade.getLayout = function getLayout(page: React.ReactElement) {
    return page // sem layout nenhum
}

export default PoliticaPrivacidade


