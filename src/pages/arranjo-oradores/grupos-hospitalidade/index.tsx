import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import { ListGeneric } from "@/Components/ListGeneric"
import ScrollToTopButton from "@/Components/ScrollToTopButton"
import SkeletonHospitalityGroupsList from "@/Components/SkeletonHospitalityGroupsList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteHospitalityGroupAtom, selectedHospitalityGroupAtom } from "@/atoms/hospitalityGroupsAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IHospitalityGroup } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { Home, Plus, Search, UserCheck, Users, Utensils } from "lucide-react"
import Router from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

function HospitalityGroupsPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const deleteHospitalityGroup = useSetAtom(deleteHospitalityGroupAtom)
    const setHospitalityGroupUpdate = useSetAtom(selectedHospitalityGroupAtom)

    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [hospitalityGroups, setHospitalityGroups] = useState<IHospitalityGroup[]>()
    const [searchQuery, setSearchQuery] = useState("")

    const { data: getHospitalityGroups, mutate } = useAuthorizedFetch<IHospitalityGroup[]>(
        `/congregation/${congregation_id ?? ""}/hospitalityGroups`,
        {
            allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
        }
    )

    useEffect(() => {
        if (getHospitalityGroups) {
            const sort = sortArrayByProperty(getHospitalityGroups, "name")
            setHospitalityGroups(sort)
        }
    }, [getHospitalityGroups])

    useEffect(() => {
        setPageActive('/arranjo-oradores/grupos-hospitalidade')
    }, [setPageActive])

    const normalize = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()

    const filteredGroups = useMemo(() => {
        if (!hospitalityGroups) return []

        const term = normalize(searchQuery.trim())
        if (!term) return sortArrayByProperty(hospitalityGroups, "name")

        const filtered = hospitalityGroups.filter(group => {
            const nameMatch = normalize(group.name ?? "").includes(term)
            const hostMatch = normalize(group.host?.fullName ?? "").includes(term)
            const memberMatch = group.members?.some(m => normalize(m.fullName ?? "").includes(term))
            return nameMatch || hostMatch || memberMatch
        })
        return sortArrayByProperty(filtered, "name")
    }, [hospitalityGroups, searchQuery])

    // Métricas
    const stats = useMemo(() => {
        const total = hospitalityGroups?.length ?? 0
        const totalMembers = hospitalityGroups?.reduce((acc, g) => acc + (g.members?.length ?? 0), 0) ?? 0
        const withHost = hospitalityGroups?.filter(g => !!g.host).length ?? 0
        return { total, totalMembers, withHost }
    }, [hospitalityGroups])

    function handleDelete(hospitalityGroup_id: string) {
        toast.promise(deleteHospitalityGroup(hospitalityGroup_id), {
            pending: 'Excluindo grupo...',
        }).then(() => {
            mutate()
        }).catch(err => {
            console.error(err)
        })
    }

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pb-36 w-full animate-pulse">
                {Array(6).fill(0).map((_, i) => (<SkeletonHospitalityGroupsList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Grupos de Hospitalidade"} />

            <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto">
                {/* ==================================================== */}
                {/* 1. HERO & METRICS CARD                               */}
                {/* ==================================================== */}
                <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                                <Utensils className="h-4 w-4" />
                                <span>Arranjo de Oradores • Fim de Semana</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-900">
                                Grupos de Hospitalidade
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500">
                                Gerencie os grupos de irmãos responsáveis por recepcionar e acolher os oradores visitantes.
                            </p>
                        </div>

                        <Button
                            outline
                            onClick={() => Router.push('/arranjo-oradores/grupos-hospitalidade/add')}
                            className="text-primary-200 p-2.5 md:p-3 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-semibold text-sm">Criar grupo</span>
                        </Button>
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <Utensils className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Total de Grupos</div>
                                <div className="text-base font-bold text-typography-900">{stats.total}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Participantes</div>
                                <div className="text-base font-bold text-typography-900">{stats.totalMembers}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                <Home className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Com Anfitrião</div>
                                <div className="text-base font-bold text-typography-900">{stats.withHost} de {stats.total}</div>
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
                            placeholder="Buscar por nome do grupo, anfitrião ou membro..."
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
                            {filteredGroups.length} {filteredGroups.length === 1 ? "resultado" : "resultados"}
                        </span>
                    )}
                </div>

                {/* ==================================================== */}
                {/* 3. GROUPS LIST                                      */}
                {/* ==================================================== */}
                {!hospitalityGroups ? (
                    renderSkeleton()
                ) : filteredGroups.length > 0 ? (
                    <ListGeneric
                        onDelete={(item_id) => handleDelete(item_id)}
                        onUpdate={(group) => setHospitalityGroupUpdate(group)}
                        items={filteredGroups}
                        path="/arranjo-oradores/grupos-hospitalidade"
                        label="do grupo"
                        renderItem={(group) => (
                            <div className="flex flex-col h-full justify-between gap-3">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-base font-bold text-typography-900 leading-snug">
                                            {group.name}
                                        </h3>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-100/15 text-primary-200 border border-primary-200/20 shrink-0">
                                            {group.members?.length ?? 0} membros
                                        </span>
                                    </div>

                                    {/* Anfitrião */}
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-200/60 border border-surface-300/80 text-xs text-typography-700 mt-1">
                                        <UserCheck className="h-4 w-4 text-primary-200 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-typography-500 font-medium uppercase">Anfitrião</span>
                                            <span className="font-semibold text-typography-900">
                                                {group.host?.fullName || "Nenhum anfitrião definido"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Membros do grupo */}
                                <div className="pt-2 border-t border-surface-300/80">
                                    <span className="text-[11px] font-semibold text-typography-500 uppercase tracking-wider block mb-1.5">
                                        Integrantes do Grupo:
                                    </span>
                                    {group.members && group.members.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                                            {group.members.map(m => (
                                                <span
                                                    key={m.id}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-surface-200/80 text-typography-800 border border-surface-300/80"
                                                >
                                                    {m.fullName}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-typography-400 italic">
                                            Nenhum membro vinculado a este grupo
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    />
                ) : (
                    <EmptyState
                        message={
                            searchQuery
                                ? "Nenhum grupo de hospitalidade encontrado para os termos pesquisados."
                                : "Nenhum grupo de hospitalidade cadastrado."
                        }
                    />
                )}
            </section>

            <ScrollToTopButton />
        </ContentDashboard>
    )
}

HospitalityGroupsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default HospitalityGroupsPage
