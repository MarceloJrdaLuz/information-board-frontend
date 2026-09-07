import HeadComponent from "@/Components/HeadComponent"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import { domainUrl } from "@/atoms/atom"
import { useFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/termsofuse"
import { ICongregation } from "@/types/types"
import { useAtomValue } from "jotai"
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")

function PoliticaPrivacidade() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    const fetchTermsOfUsePublishersData = `/terms/active/publisher`
    const { data: terms, isLoading } = useFetch<ITermOfUse>(fetchTermsOfUsePublishersData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    return (
        <div className="flex flex-col h-screen w-screen bg-surface-200/40 text-typography-800">
            <HeadComponent
                title="Política de Privacidade"
                urlMiniatura={`${domain}/images/miniatura.png`}
            />
            <div className="flex flex-col h-screen w-screen overflow-auto">
                <LayoutPrincipal
                    nCong={congregationData?.number}
                    congregationName={congregationData?.name ?? ""}
                    circuit={congregationData?.circuit ?? ""}
                    heightConteudo={'1/2'}
                    header
                    className="bg-typography-900 bg-left-bottom bg-cover lg:bg-right"
                    textoHeader="Política de Privacidade"
                >
                    <div className="w-full max-w-4xl mx-auto my-6 sm:my-10 px-4 sm:px-6 flex flex-col gap-6">
                        {/* Paper Document Card */}
                        <div className="bg-surface-100 border border-surface-300 rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm flex flex-col gap-6">
                            {/* Document Header */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary-100/15 border border-primary-200/25 text-primary-200 flex items-center justify-center shrink-0 shadow-xs">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-typography-900 tracking-tight">
                                            {terms?.title || "Política sobre Coleta e Armazenamento de Dados"}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                            Diretrizes sobre privacidade, sigilo e tratamento de dados no quadro de anúncios.
                                        </p>
                                    </div>
                                </div>

                                {/* Meta Chips */}
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    {terms?.version && (
                                        <span className="px-2.5 py-0.5 rounded-lg bg-surface-200 border border-surface-300 text-xs font-mono font-bold text-typography-700">
                                            v.{terms.version}
                                        </span>
                                    )}
                                    {terms?.createdAt && (
                                        <span className="text-xs text-typography-500 bg-surface-200/70 border border-surface-300/80 px-2.5 py-0.5 rounded-lg">
                                            Atualizado em {dayjs(terms.createdAt).format("D [de] MMMM [de] YYYY")}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Em vigor</span>
                                    </span>
                                </div>
                            </div>

                            <hr className="border-surface-300" />

                            {/* Document Content */}
                            <div className="text-typography-800 text-sm sm:text-base leading-relaxed space-y-4">
                                {isLoading ? (
                                    <div className="flex flex-col gap-3 py-6">
                                        <div className="h-5 w-3/4 bg-surface-200 shimmer rounded" />
                                        <div className="h-4 w-full bg-surface-200 shimmer rounded" />
                                        <div className="h-4 w-5/6 bg-surface-200 shimmer rounded" />
                                        <div className="h-4 w-4/5 bg-surface-200 shimmer rounded" />
                                    </div>
                                ) : (
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-xl sm:text-2xl font-bold text-typography-900 mt-6 mb-3 first:mt-0" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-bold text-typography-800 mt-5 mb-2.5 pb-1 border-b border-surface-300/60" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-typography-800 mt-4 mb-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-sm sm:text-base text-typography-700 leading-relaxed mb-4 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1.5 my-3 text-sm sm:text-base text-typography-700" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1.5 my-3 text-sm sm:text-base text-typography-700" {...props} />,
                                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold text-typography-900" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary-200/50 pl-4 py-1 italic text-typography-600 my-4" {...props} />,
                                        }}
                                    >
                                        {terms?.content ?? "Nenhuma política de privacidade foi definida pela congregação."}
                                    </ReactMarkdown>
                                )}
                            </div>

                            {/* Bottom Action */}
                            <div className="pt-6 border-t border-surface-300 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => Router.push(`/${number}`)}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-200 hover:bg-primary-200/90 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Voltar para o Quadro de Anúncios</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </LayoutPrincipal>
            </div>
        </div>
    )
}

PoliticaPrivacidade.getLayout = function getLayout(page: React.ReactElement) {
    return page
}

export default PoliticaPrivacidade
