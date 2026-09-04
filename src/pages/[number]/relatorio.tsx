import { domainUrl } from "@/atoms/atom"
import { themeAtom } from "@/atoms/themeAtoms"
import Footer from "@/Components/Footer"
import FormReport from "@/Components/Forms/FormReport"
import HeadComponent from "@/Components/HeadComponent"
import { useFetch } from "@/hooks/useFetch"
import { ICongregation } from "@/types/types"
import { useAtomValue } from "jotai"
import { ArrowLeft } from "lucide-react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function Relatorio() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)
    const theme = useAtomValue(themeAtom)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    return (
        <div className="min-h-screen w-full bg-surface-200 text-typography-800 flex flex-col justify-between selection:bg-primary-200 selection:text-white transition-colors duration-300">
            <Head>
                <link rel="manifest" href={`/api/manifest?number=${number}`} />
                <link
                    key="manifest-link"
                    rel="manifest"
                    href={`/api/manifest?number=${number}${theme ? `&theme=${theme}` : ''}`}
                />
            </Head>

            <HeadComponent
                title={`Relatório - Congregação ${congregationData?.name ?? ""}`}
                urlMiniatura={`${domain}/images/relatorio.png`}
            />

            {/* Top Bar de Navegação */}
            <div className="w-full bg-surface-100 border-b border-surface-300/80 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-surface-100/90">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                    <Link
                        href={`/${number}`}
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-200 hover:text-primary-150 transition active:scale-95 px-2.5 py-1.5 rounded-lg hover:bg-surface-200"
                    >
                        <ArrowLeft size={17} />
                        <span>Voltar ao Quadro</span>
                    </Link>

                    {congregationData?.name && (
                        <span className="text-xs text-typography-500 font-medium hidden sm:inline-block">
                            Congregação {congregationData.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Conteúdo do Formulário */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center">
                <FormReport congregationNumber={number as string} />
            </main>

            {/* Footer Oficial do Sistema */}
            <Footer
                nCong={number as string}
                ano={new Date().getFullYear()}
                nomeCongregacao={`Congregação ${congregationData?.name ?? ""} ${
                    congregationData?.circuit ? `- ${congregationData.circuit}` : ""
                }`}
                aviso="Atenção: favor não compartilhar acesso ao site para outros que não pertencem à congregação."
            />
        </div>
    )
}

Relatorio.getLayout = function getLayout(page: React.ReactElement) {
    return page // layout próprio independente
}

export default Relatorio
