import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import ListNotices from "@/Components/ListNotices"
import SkeletonListNotices from "@/Components/ListNotices/skeleton"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useNotices } from "@/hooks/useNotices"
import { INotice } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import dayjs from "dayjs"
import { useAtom } from "jotai"
import {
    AlertCircle,
    Bell,
    CheckCircle2,
    Clock,
    ExternalLink,
    Filter,
    Plus,
    Repeat,
    Search,
    X
} from "lucide-react"
import Link from "next/link"
import Router from "next/router"
import { useEffect, useMemo, useState } from "react"

function NoticesPage() {
    const { congregation } = useCongregationContext()
    const { deleteNotice } = useNotices(congregation?.number ?? "")
    const congregation_id = congregation?.id

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "recurrent" | "expired">("all")

    const fetchConfig = congregation_id ? `/notices/${congregation_id}` : ""
    const { data: notices, mutate, isLoading } = useAuthorizedFetch<INotice[]>(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "NOTICES_MANAGER"]
    })

    useEffect(() => {
        setPageActive("Anúncios")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" }
        ])
    }, [setPageActive, setCrumbs])

    // Métricas calculadas
    const metrics = useMemo(() => {
        if (!notices) return { total: 0, active: 0, recurrent: 0, expired: 0 }
        const todayDay = new Date().getDate()
        const now = dayjs()

        let activeCount = 0
        let recurrentCount = 0
        let expiredCount = 0

        notices.forEach((notice) => {
            const isRecurrent = Boolean(notice.startDay && notice.endDay)
            const isExpired = notice.expired ? now.isAfter(dayjs(notice.expired).endOf("day")) : false

            if (isRecurrent) recurrentCount++
            if (isExpired) expiredCount++

            if (!isExpired) {
                if (isRecurrent) {
                    if (notice.startDay && notice.endDay && todayDay >= notice.startDay && todayDay <= notice.endDay) {
                        activeCount++
                    }
                } else {
                    activeCount++
                }
            }
        })

        return {
            total: notices.length,
            active: activeCount,
            recurrent: recurrentCount,
            expired: expiredCount
        }
    }, [notices])

    // Filtragem em tempo real
    const filteredNotices = useMemo(() => {
        if (!notices) return []
        const query = searchQuery.trim().toLowerCase()
        const todayDay = new Date().getDate()
        const now = dayjs()

        return notices.filter((notice) => {
            const matchesQuery =
                !query ||
                notice.title.toLowerCase().includes(query) ||
                notice.text.toLowerCase().includes(query)

            if (!matchesQuery) return false

            const isRecurrent = Boolean(notice.startDay && notice.endDay)
            const isExpired = notice.expired ? now.isAfter(dayjs(notice.expired).endOf("day")) : false
            const isActiveToday = !isExpired && (!isRecurrent || (notice.startDay && notice.endDay && todayDay >= notice.startDay && todayDay <= notice.endDay))

            if (statusFilter === "active") return isActiveToday
            if (statusFilter === "recurrent") return isRecurrent
            if (statusFilter === "expired") return isExpired

            return true
        })
    }, [notices, searchQuery, statusFilter])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Anúncios"} />
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
                {/* Cabeçalho Moderno */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-300">
                    <div>
                        <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">
                            <Bell size={16} />
                            <span>Comunicação & Avisos</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                            Anúncios da Congregação
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500 mt-1">
                            Gerencie os comunicados e informativos exibidos no mural oficial da congregação.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                        {congregation?.number && (
                            <Link
                                href={`/${congregation.number}/anuncios`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300 text-typography-700 text-xs sm:text-sm font-semibold transition shadow-2xs"
                                title="Ver página pública de anúncios"
                            >
                                <ExternalLink size={15} />
                                <span>Ver no Mural</span>
                            </Link>
                        )}

                        <Button
                            onClick={() => Router.push("/congregacao/anuncios/add")}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm py-2 px-4 shadow-sm font-bold"
                        >
                            <Plus size={16} />
                            <span>Novo Anúncio</span>
                        </Button>
                    </div>
                </div>

                {/* Métricas / Cards de Resumo */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
                        <span className="text-xs font-semibold text-typography-500">Total de Anúncios</span>
                        <span className="text-2xl font-black text-typography-800">{metrics.total}</span>
                        <span className="text-[11px] text-typography-400">Cadastrados no sistema</span>
                    </div>

                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-typography-500">Ativos Hoje</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-2xl font-black text-emerald-600">{metrics.active}</span>
                        <span className="text-[11px] text-typography-400">Visíveis no quadro</span>
                    </div>

                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
                        <span className="text-xs font-semibold text-typography-500">Recorrentes</span>
                        <span className="text-2xl font-black text-primary-200">{metrics.recurrent}</span>
                        <span className="text-[11px] text-typography-400">Exibição mensal periódica</span>
                    </div>

                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
                        <span className="text-xs font-semibold text-typography-500">Expirados</span>
                        <span className="text-2xl font-black text-typography-400">{metrics.expired}</span>
                        <span className="text-[11px] text-typography-400">Ocultados da congregação</span>
                    </div>
                </div>

                {/* Barra de Busca e Filtros de Status */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-100 border border-surface-300 rounded-2xl p-3 sm:p-4 shadow-sm">
                    {/* Campo de Busca */}
                    <div className="relative flex-1">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-typography-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por título ou palavras-chave..."
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface-200/50 border border-surface-300 rounded-xl text-typography-800 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-600 p-1 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Filtros de Status (Tabs/Chips) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setStatusFilter("all")}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                                statusFilter === "all"
                                    ? "bg-primary-200 text-white shadow-xs"
                                    : "bg-surface-200 text-typography-600 hover:bg-surface-300"
                            }`}
                        >
                            Todos ({notices?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("active")}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                                statusFilter === "active"
                                    ? "bg-primary-200 text-white shadow-xs"
                                    : "bg-surface-200 text-typography-600 hover:bg-surface-300"
                            }`}
                        >
                            Ativos Hoje ({metrics.active})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("recurrent")}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                                statusFilter === "recurrent"
                                    ? "bg-primary-200 text-white shadow-xs"
                                    : "bg-surface-200 text-typography-600 hover:bg-surface-300"
                            }`}
                        >
                            Recorrentes ({metrics.recurrent})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("expired")}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                                statusFilter === "expired"
                                    ? "bg-primary-200 text-white shadow-xs"
                                    : "bg-surface-200 text-typography-600 hover:bg-surface-300"
                            }`}
                        >
                            Expirados ({metrics.expired})
                        </button>
                    </div>
                </div>

                {/* Lista de Anúncios */}
                {isLoading ? (
                    <SkeletonListNotices />
                ) : (
                    <ListNotices
                        onDelete={async (notice_id) => {
                            await deleteNotice(notice_id)
                            mutate()
                        }}
                        notices={filteredNotices}
                    />
                )}
            </div>
        </ContentDashboard>
    )
}

NoticesPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "NOTICES_MANAGER"])

export default NoticesPage
