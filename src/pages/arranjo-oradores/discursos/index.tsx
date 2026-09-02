import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import { ListGeneric } from "@/Components/ListGeneric"
import ScrollToTopButton from "@/Components/ScrollToTopButton"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteTalkAtom, selectedTalkAtom } from "@/atoms/talksAtoms"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITalk } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { BookOpen, Check, CheckCircle2, Copy, Plus, Search } from "lucide-react"
import Router from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

function TalksPage() {
    const { roleContains } = useAuthContext()
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const deleteTalk = useSetAtom(deleteTalkAtom)
    const setTalkUpdate = useSetAtom(selectedTalkAtom)
    const [search, setSearch] = useState("")
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const { data: talks, mutate } = useAuthorizedFetch<ITalk[]>("/talks", {
        allowedRoles: ["ADMIN", "ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    const normalize = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()

    const filteredTalks = useMemo(() => {
        if (!talks) return []

        const term = normalize(search.trim())
        if (!term) return talks

        return talks.filter(talk =>
            talk.number.toString().includes(term) ||
            normalize(talk.title ?? "").includes(term)
        )
    }, [talks, search])

    useEffect(() => {
        setPageActive('/arranjo-oradores/discursos')
    }, [setPageActive])

    function handleDelete(talk_id: string) {
        toast.promise(deleteTalk(talk_id), {
            pending: 'Excluindo discurso...',
        }).then(() => {
            mutate()
        }).catch(err => {
            console.error(err)
        })
    }

    function handleCopyTalk(talk: ITalk) {
        const text = `Nº ${talk.number} - ${talk.title}`
        navigator.clipboard.writeText(text)
        setCopiedId(talk.id)
        toast.info(`Copiado: "${text}"`, { autoClose: 2000 })
        setTimeout(() => setCopiedId(null), 2000)
    }

    function renderSkeleton() {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pb-36 w-full animate-pulse">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-surface-100 rounded-2xl border border-surface-300 p-5 flex flex-col justify-between gap-3 shadow-sm h-36">
                        <div className="flex justify-between items-center">
                            <div className="h-6 w-28 bg-surface-300 rounded-lg" />
                            <div className="h-6 w-6 bg-surface-300 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-5/6 bg-surface-300 rounded" />
                            <div className="h-4 w-3/5 bg-surface-300 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Discursos"} />

            <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto">
                {/* ==================================================== */}
                {/* 1. HERO & METRICS CARD                               */}
                {/* ==================================================== */}
                <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                                <BookOpen className="h-4 w-4" />
                                <span>Arranjo de Oradores • Fim de Semana</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-900">
                                Discursos Públicos
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500">
                                Consulte os temas e números dos discursos públicos para a reunião de fim de semana.
                            </p>
                        </div>

                        {roleContains('ADMIN') && (
                            <Button
                                outline
                                onClick={() => Router.push('/arranjo-oradores/discursos/add')}
                                className="text-primary-200 p-2.5 md:p-3 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="font-semibold text-sm">Criar discurso</span>
                            </Button>
                        )}
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Total Cadastrado</div>
                                <div className="text-base font-bold text-typography-900">
                                    {talks ? `${talks.length} discursos` : "..."}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Exibindo</div>
                                <div className="text-base font-bold text-typography-900">
                                    {talks ? `${filteredTalks.length} de ${talks.length}` : "..."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* 2. SEARCH TOOLBAR                                   */}
                {/* ==================================================== */}
                <div className="sticky top-2 z-30 flex items-center justify-between gap-3 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-typography-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por número (ex: 1, 45) ou tema do discurso..."
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-surface-300 bg-surface-200/60 text-xs sm:text-sm text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:bg-surface-100 transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700 p-1 rounded-full text-xs"
                                title="Limpar busca"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {search && (
                        <span className="hidden sm:inline-block text-xs text-typography-500 font-medium whitespace-nowrap">
                            {filteredTalks.length} {filteredTalks.length === 1 ? "resultado" : "resultados"}
                        </span>
                    )}
                </div>

                {/* ==================================================== */}
                {/* 3. TALKS LIST                                       */}
                {/* ==================================================== */}
                {!talks ? (
                    renderSkeleton()
                ) : filteredTalks.length > 0 ? (
                    <ListGeneric
                        showActions={roleContains('ADMIN')}
                        onDelete={(item_id) => handleDelete(item_id)}
                        onUpdate={(talk) => setTalkUpdate(talk)}
                        items={filteredTalks}
                        path="/arranjo-oradores/discursos"
                        label="do Discurso"
                        renderItem={(talk) => (
                            <div className="flex flex-col h-full justify-between gap-3 group">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-100/15 text-primary-200 border border-primary-200/20">
                                        Discurso Nº {talk.number}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleCopyTalk(talk)
                                        }}
                                        title="Copiar número e tema"
                                        className="p-1.5 rounded-lg text-typography-400 hover:text-primary-200 hover:bg-surface-200 transition-colors"
                                    >
                                        {copiedId === talk.id ? (
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                <p className="text-sm sm:text-base font-semibold text-typography-800 leading-snug line-clamp-3">
                                    {talk.title || "Sem título"}
                                </p>
                            </div>
                        )}
                    />
                ) : (
                    <EmptyState
                        message={
                            search
                                ? "Nenhum discurso encontrado para a pesquisa."
                                : "Nenhum discurso cadastrado."
                        }
                    />
                )}
            </section>

            <ScrollToTopButton />
        </ContentDashboard>
    )
}

TalksPage.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION", "TALK_MANAGER"])

export default TalksPage
