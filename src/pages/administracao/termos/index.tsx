import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import { ConfirmDeleteModal } from "@/Components/ConfirmDeleteModal"
import { deleteTermOfUseAtom } from "@/atoms/TermsOfUseAtoms"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/termsofuse"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { 
    Shield, 
    Plus, 
    Trash2, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    ChevronDown, 
    ChevronUp, 
    FolderArchive,
    FileText
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")

function TermsPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const deleteTermOfUse = useSetAtom(deleteTermOfUseAtom)
    const [filterType, setFilterType] = useState<"ALL" | "congregation" | "publisher">("ALL")
    const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())

    const { data: terms, mutate, isLoading } = useAuthorizedFetch<ITermOfUse[]>('/terms', {
        allowedRoles: ["ADMIN"]
    })

    useEffect(() => {
        setPageActive('Termos de Uso')
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Termos de Uso", link: "/administracao/termos" }
        ])
    }, [setPageActive, setCrumbs])

    const handleDelete = async (term_id: string) => {
        try {
            await deleteTermOfUse(term_id)
            mutate()
        } catch (err) {
            console.error(err)
        }
    }

    const toggleExpand = (id: string) => {
        setExpandedTerms(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const filteredTerms = useMemo(() => {
        if (!terms) return []
        if (filterType === "ALL") return terms
        return terms.filter(t => t.type === filterType)
    }, [terms, filterType])

    const countAll = terms?.length || 0
    const countCongregation = terms?.filter(t => t.type === "congregation").length || 0
    const countPublisher = terms?.filter(t => t.type === "publisher").length || 0

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Termos de Uso"} />
            
            <section className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 pb-28 md:pb-36 flex flex-col gap-6">
                {/* Header Card */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-100/15 border border-primary-200/25 text-primary-200 flex items-center justify-center shrink-0 shadow-xs">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-typography-900 tracking-tight">
                                    Termos de Uso e Privacidade
                                </h1>
                                <p className="text-xs md:text-sm text-typography-500 mt-0.5">
                                    Gerencie e acompanhe as versões dos termos da congregação e dos publicadores.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/administracao/termos/add"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary-200 hover:bg-primary-200/90 active:scale-[0.98] shadow-xs transition-all shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Criar Novo Termo</span>
                        </Link>
                    </div>

                    {/* Filter Tabs */}
                    <div className="pt-4 border-t border-surface-300 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setFilterType("ALL")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                filterType === "ALL"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200 hover:bg-surface-300 text-typography-600 border-surface-300"
                            }`}
                        >
                            Todos ({countAll})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType("congregation")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                filterType === "congregation"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200 hover:bg-surface-300 text-typography-600 border-surface-300"
                            }`}
                        >
                            Congregação ({countCongregation})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType("publisher")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                filterType === "publisher"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200 hover:bg-surface-300 text-typography-600 border-surface-300"
                            }`}
                        >
                            Publicadores ({countPublisher})
                        </button>
                    </div>
                </div>

                {/* Terms List */}
                <div className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                                    <div className="h-5 w-1/3 bg-surface-200 shimmer rounded" />
                                    <div className="h-4 w-1/4 bg-surface-200 shimmer rounded" />
                                    <div className="h-16 w-full bg-surface-200 shimmer rounded-xl mt-2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredTerms.length > 0 ? (
                        filteredTerms.map(term => {
                            const isExpanded = expandedTerms.has(term.id)
                            const isCongregation = term.type === "congregation"

                            return (
                                <div
                                    key={term.id}
                                    className="bg-surface-100 border border-surface-300 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4 hover:border-surface-300/80 transition-all"
                                >
                                    {/* Top Row: Title, Badges & Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h2 className="text-base sm:text-lg font-bold text-typography-900">
                                                {term.title}
                                            </h2>
                                            <span className="px-2.5 py-0.5 rounded-lg bg-surface-200 border border-surface-300 text-xs font-mono font-bold text-typography-700">
                                                v.{term.version}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                                                isCongregation
                                                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                                                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                                            }`}>
                                                {isCongregation ? "Congregação" : "Publicador"}
                                            </span>
                                            {term.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Ativo</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-typography-500 bg-surface-200 border border-surface-300 px-2 py-0.5 rounded-md">
                                                    <span>Arquivado</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <ConfirmDeleteModal
                                                title="Excluir termo de uso"
                                                message={`Tem certeza que deseja excluir "${term.title}" (v.${term.version})? Essa ação não pode ser desfeita.`}
                                                onDelete={() => handleDelete(term.id)}
                                                button={
                                                    <button
                                                        type="button"
                                                        className="p-2 rounded-xl text-typography-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                                        title="Excluir termo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Collapsible Content */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(term.id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-200 hover:underline w-fit select-none"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                    <span>Ocultar texto completo</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                    <span>Visualizar texto completo</span>
                                                </>
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-2 p-5 bg-surface-200/40 rounded-xl border border-surface-300 text-typography-700 text-sm leading-relaxed max-h-96 overflow-y-auto thin-scrollbar">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-typography-900 mt-4 mb-2 first:mt-0" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-base font-bold text-typography-800 mt-3 mb-2" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-typography-800 mt-2 mb-1" {...props} />,
                                                        p: ({ node, ...props }) => <p className="text-sm text-typography-700 leading-relaxed mb-3 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-sm text-typography-700" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 text-sm text-typography-700" {...props} />,
                                                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-typography-900" {...props} />,
                                                    }}
                                                >
                                                    {term.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="pt-3 border-t border-surface-300/70 flex items-center gap-2 text-xs text-typography-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>
                                            Criado em {dayjs(term.createdAt).format("DD/MM/YYYY [às] HH:mm")}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                            <div className="w-12 h-12 rounded-2xl bg-surface-200 border border-surface-300 flex items-center justify-center text-typography-500">
                                <FolderArchive className="w-6 h-6 text-typography-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-base font-semibold text-typography-800">
                                    Nenhum termo de uso encontrado
                                </p>
                                <p className="text-xs text-typography-500 max-w-sm">
                                    Não há versões de termos de uso cadastradas para o filtro selecionado.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </ContentDashboard>
    )
}

TermsPage.getLayout = withProtectedLayout(["ADMIN"])

export default TermsPage
