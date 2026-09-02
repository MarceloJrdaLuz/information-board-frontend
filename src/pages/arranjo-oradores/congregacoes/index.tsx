import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import { ListGeneric } from "@/Components/ListGeneric"
import { LocationLink } from "@/Components/LocationLink"
import ScrollToTopButton from "@/Components/ScrollToTopButton"
import SkeletonAuxiliaryCongregationsList from "@/Components/SkeletonAuxiliaryCongregationsList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteAuxiliaryCongregationAtom, selectedAuxiliaryCongregationAtom } from "@/atoms/auxiliaryCongregationAtoms"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ICongregation } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { Building2, Calendar, Clock, Compass, Home, MapPin, Mic, Plus, Search } from "lucide-react"
import Router from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

function AuxiliaryCongregationsPage() {
    const setAuxiliaryCongregationUpdate = useSetAtom(selectedAuxiliaryCongregationAtom)
    const deleteAuxiliaryCongregation = useSetAtom(deleteAuxiliaryCongregationAtom)
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [congregations, setCongregations] = useState<ICongregation[]>()
    const [searchQuery, setSearchQuery] = useState("")

    const { data: getAuxiliaryCongregations, mutate } = useAuthorizedFetch<ICongregation[]>("/auxiliaryCongregations", {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    useEffect(() => {
        if (getAuxiliaryCongregations) {
            setCongregations(getAuxiliaryCongregations)
        }
    }, [getAuxiliaryCongregations])

    useEffect(() => {
        setPageActive('/arranjo-oradores/congregacoes')
    }, [setPageActive])

    const normalize = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()

    const filteredCongregations = useMemo(() => {
        if (!congregations) return []

        const term = normalize(searchQuery.trim())
        if (!term) return sortArrayByProperty(congregations, "name")

        const filtered = congregations.filter(c =>
            normalize(c.name ?? "").includes(term) ||
            normalize(c.city ?? "").includes(term) ||
            normalize(c.circuit ?? "").includes(term) ||
            normalize(c.address ?? "").includes(term)
        )
        return sortArrayByProperty(filtered, "name")
    }, [congregations, searchQuery])

    // Métricas
    const stats = useMemo(() => {
        const total = congregations?.length ?? 0
        const cities = new Set(congregations?.map(c => c.city).filter(Boolean)).size
        const circuits = new Set(congregations?.map(c => c.circuit).filter(Boolean)).size
        return { total, cities, circuits }
    }, [congregations])

    function handleDelete(congregation_id: string) {
        toast.promise(deleteAuxiliaryCongregation(congregation_id), {
            pending: 'Excluindo congregação...',
        }).then(() => {
            mutate()
        }).catch(err => {
            console.error(err)
        })
    }

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pb-36 w-full animate-pulse">
                {Array(6).fill(0).map((_, i) => (<SkeletonAuxiliaryCongregationsList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Congregações"} />

            <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto">
                {/* ==================================================== */}
                {/* 1. HERO & METRICS CARD                               */}
                {/* ==================================================== */}
                <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                                <Building2 className="h-4 w-4" />
                                <span>Arranjo de Oradores • Fim de Semana</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-900">
                                Congregações Auxiliares
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500">
                                Gerencie as congregações parceiras participantes do intercâmbio de oradores.
                            </p>
                        </div>

                        <Button
                            outline
                            onClick={() => Router.push('/arranjo-oradores/congregacoes/add')}
                            className="text-primary-200 p-2.5 md:p-3 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-semibold text-sm">Criar congregação</span>
                        </Button>
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Total de Congregações</div>
                                <div className="text-base font-bold text-typography-900">{stats.total}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Cidades Atendidas</div>
                                <div className="text-base font-bold text-typography-900">{stats.cities}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                <Compass className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Circuitos</div>
                                <div className="text-base font-bold text-typography-900">{stats.circuits}</div>
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nome da congregação, cidade ou circuito..."
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-surface-300 bg-surface-200/60 text-xs sm:text-sm text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:bg-surface-100 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700 p-1 rounded-full text-xs"
                                title="Limpar busca"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {searchQuery && (
                        <span className="hidden sm:inline-block text-xs text-typography-500 font-medium whitespace-nowrap">
                            {filteredCongregations.length} {filteredCongregations.length === 1 ? "resultado" : "resultados"}
                        </span>
                    )}
                </div>

                {/* ==================================================== */}
                {/* 3. CONGREGATIONS LIST                               */}
                {/* ==================================================== */}
                {!congregations ? (
                    renderSkeleton()
                ) : filteredCongregations.length > 0 ? (
                    <ListGeneric
                        onDelete={(item_id) => handleDelete(item_id)}
                        onUpdate={(congregation) => setAuxiliaryCongregationUpdate(congregation)}
                        items={filteredCongregations}
                        path="/arranjo-oradores/congregacoes"
                        label="da Congregação"
                        renderItem={(congregation) => (
                            <div className="flex flex-col h-full justify-between gap-3">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-base font-bold text-typography-900 leading-snug">
                                            {congregation.name}
                                        </h3>
                                        {congregation.circuit && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-100/15 text-primary-200 border border-primary-200/20 shrink-0">
                                                {congregation.circuit}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 text-xs text-typography-600 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-typography-400 shrink-0" />
                                            <span>{congregation.city || "Cidade não cadastrada"}</span>
                                        </div>

                                        {congregation.address && (
                                            <div className="flex items-center gap-1.5">
                                                <Home className="h-3.5 w-3.5 text-typography-400 shrink-0" />
                                                <span className="truncate">{congregation.address}</span>
                                            </div>
                                        )}

                                        {congregation.longitude && congregation.latitude && (
                                            <div className="flex items-center gap-1.5">
                                                <Compass className="h-3.5 w-3.5 text-typography-400 shrink-0" />
                                                <LocationLink longitude={congregation.longitude} latitude={congregation.latitude} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Informações da Reunião e Oradores */}
                                <div className="pt-2 border-t border-surface-300/80 flex flex-wrap items-center justify-between gap-2 text-xs text-typography-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-typography-400" />
                                        <span>{congregation.dayMeetingPublic || "Dia a definir"}</span>
                                        {congregation.hourMeetingPublic && (
                                            <>
                                                <span>•</span>
                                                <Clock className="h-3 w-3 text-typography-400" />
                                                <span>{congregation.hourMeetingPublic.slice(0, 5)}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-primary-200 font-semibold">
                                        <Mic className="h-3.5 w-3.5" />
                                        <span>{congregation.speakers?.length ?? 0} oradores</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                ) : (
                    <EmptyState
                        message={
                            searchQuery
                                ? "Nenhuma congregação encontrada para os termos pesquisados."
                                : "Nenhuma congregação cadastrada."
                        }
                    />
                )}
            </section>

            <ScrollToTopButton />
        </ContentDashboard>
    )
}

AuxiliaryCongregationsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default AuxiliaryCongregationsPage
