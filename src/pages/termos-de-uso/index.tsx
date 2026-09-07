import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/termsofuse"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { CheckCircle2, FolderArchive, ShieldCheck } from "lucide-react"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { useEffect } from "react"
import ReactMarkdown from "react-markdown"

dayjs.locale("pt-br")

function TermsOfUsePage() {
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const { data: termActive, isLoading } = useAuthorizedFetch<ITermOfUse>('/terms/active/congregation', {
        allowedRoles: ['ADMIN_CONGREGATION']
    })

    useEffect(() => {
        setPageActive('Termos de uso')
    }, [setPageActive])

    useEffect(() => {
        setCrumbs([{ label: 'Início', link: '/dashboard' }])
    }, [setCrumbs])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Termos de Uso"} />
            
            <section className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 pb-28 md:pb-36 flex flex-col gap-6">
                {/* Paper Document Card */}
                <div className="bg-surface-100 border border-surface-300 rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary-100/15 border border-primary-200/25 text-primary-200 flex items-center justify-center shrink-0 shadow-xs">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-typography-900 tracking-tight">
                                    {termActive?.title || "Termos de Uso"}
                                </h1>
                                <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                    Termos e condições gerais de uso da plataforma do quadro de anúncios.
                                </p>
                            </div>
                        </div>

                        {/* Meta Chips */}
                        {termActive && (
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-surface-200 border border-surface-300 text-xs font-mono font-bold text-typography-700">
                                    v.{termActive.version}
                                </span>
                                <span className="text-xs text-typography-500 bg-surface-200/70 border border-surface-300/80 px-2.5 py-0.5 rounded-lg">
                                    Atualizado em {dayjs(termActive.createdAt).format("D [de] MMMM [de] YYYY")}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Em vigor</span>
                                </span>
                            </div>
                        )}
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
                        ) : termActive?.content ? (
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
                                {termActive.content}
                            </ReactMarkdown>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 text-typography-400">
                                <FolderArchive className="w-10 h-10 text-typography-400" />
                                <p className="text-base font-medium text-typography-700">
                                    Nenhum termo de uso disponível no momento.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </ContentDashboard>
    )
}

TermsOfUsePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"])

export default TermsOfUsePage
