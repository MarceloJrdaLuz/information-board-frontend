import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import HospitalityRow from "@/Components/HospitalityWeekendRow"
import SkeletonHospitalityRow from "@/Components/HospitalityWeekendRow/skeleton"
import ScrollToTopButton from "@/Components/ScrollToTopButton"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import {
    createHospitalityWeekendAtom,
    dirtyWeekendsAtom,
    hospitalityGroup,
    hospitalityWeekendsAtom,
} from "@/atoms/hospitalityWeekendScheduleAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IHospitalityWeekend, IRecordHospitalityAssignment, IRecordHospitalityWeekend } from "@/types/hospitality"
import { IHospitalityGroup } from "@/types/types"
import { DayMeetingPublic, getWeekendDays } from "@/utils/dateUtil"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
import { useAtom, useSetAtom } from "jotai"
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Save,
    Sparkles,
    Utensils,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

dayjs.extend(customParseFormat)
dayjs.extend(isoWeek)
dayjs.extend(isBetween)

function HospitalityWeekendPage() {
    dayjs.locale("pt-br")
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [monthOffset, setMonthOffset] = useState<number>(0)
    const [weekendMeetingDay, setWeekendMeetingDay] = useState<Date[]>([])
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const [hospitalityWeekends, setHospitalityWeekends] = useAtom(hospitalityWeekendsAtom)
    const setGroups = useSetAtom(hospitalityGroup)

    const setCreateHospitalityWeekend = useSetAtom(createHospitalityWeekendAtom)
    const [dirtyWeekends] = useAtom(dirtyWeekendsAtom)

    const baseDate = dayjs().add(monthOffset, "month")
    const currentMonthLabel = baseDate.format("MMMM [de] YYYY")
    const prevMonthLabel = baseDate.clone().subtract(1, "month").format("MMM")
    const nextMonthLabel = baseDate.clone().add(1, "month").format("MMM")

    const { data, mutate } = useAuthorizedFetch<IHospitalityWeekend[]>(
        `congregation/${congregation_id ?? ""}/hospitality/weekends`,
        {
            allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
        }
    )
    const { data: groups } = useAuthorizedFetch<IHospitalityGroup[]>(
        `${congregation_id ? `congregation/${congregation_id}/hospitalityGroups` : ""}`,
        {
            allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
        }
    )

    useEffect(() => {
        if (!data) return
        const weekendsByDate = (data ?? []).reduce<Record<string, IRecordHospitalityWeekend>>((acc, weekend) => {
            const assignments: IRecordHospitalityAssignment[] = (weekend.assignments ?? []).map(a => ({
                id: a.id,
                eventType: a.eventType,
                completed: a.completed,
                group_id: a.group.id,
            }))

            acc[weekend.date] = {
                id: weekend.id,
                date: weekend.date,
                assignments
            }

            return acc
        }, {})

        setHospitalityWeekends(weekendsByDate)
    }, [data, monthOffset, setHospitalityWeekends])

    useEffect(() => {
        if (groups) {
            setGroups(groups)
        }
    }, [groups, setGroups])

    useEffect(() => {
        if (!congregation?.dayMeetingPublic) return
        setWeekendMeetingDay(getWeekendDays(monthOffset, congregation?.dayMeetingPublic as DayMeetingPublic))
    }, [monthOffset, congregation?.dayMeetingPublic])

    useEffect(() => {
        setPageActive("/arranjo-oradores/programacao-hospitalidade")
    }, [setPageActive])

    // Quantidade de alterações não salvas
    const pendingChangesCount = useMemo(() => {
        return Object.keys(dirtyWeekends).length
    }, [dirtyWeekends])

    // Métricas do mês
    const stats = useMemo(() => {
        const totalWeekends = weekendMeetingDay.length
        let assignedCount = 0

        weekendMeetingDay.forEach(d => {
            const dateStr = d.toISOString().split("T")[0]
            const weekend = hospitalityWeekends?.[dateStr]
            if (weekend?.assignments && weekend.assignments.length > 0) {
                const hasValidGroup = weekend.assignments.some(a => !!a.group_id)
                if (hasValidGroup) assignedCount++
            }
        })

        return {
            total: totalWeekends,
            assigned: assignedCount,
            pendingAssignments: totalWeekends - assignedCount
        }
    }, [weekendMeetingDay, hospitalityWeekends])

    const handleSave = async () => {
        const alteredWeekends = Object.values(dirtyWeekends)
        if (!alteredWeekends.length) {
            return toast.info("Nenhuma alteração pendente para salvar.")
        }

        try {
            setIsSaving(true)
            await toast.promise(
                setCreateHospitalityWeekend(congregation_id ?? "", { weekends: alteredWeekends }),
                {
                    pending: "Salvando arranjos de hospitalidade...",
                    success: "Programação de hospitalidade salva com sucesso!",
                    error: "Erro ao salvar a programação."
                }
            )
            mutate()
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Hospitalidade" />

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
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-900 capitalize">
                                Programação de Hospitalidade • {currentMonthLabel}
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500">
                                Defina os grupos responsáveis por acolher os oradores visitantes (hospedagem, almoço ou jantar).
                            </p>
                        </div>
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Total no mês</div>
                                <div className="text-base font-bold text-typography-900">{stats.total} reuniões</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Com arranjo</div>
                                <div className="text-base font-bold text-typography-900">{stats.assigned} de {stats.total}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className={`p-2 rounded-lg ${pendingChangesCount > 0 ? "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 animate-pulse" : "bg-surface-300 text-typography-500"}`}>
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Alterações pendentes</div>
                                <div className="text-base font-bold text-typography-900">
                                    {pendingChangesCount > 0 ? (
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                                            {pendingChangesCount} não salva(s)
                                        </span>
                                    ) : (
                                        "Nenhuma"
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* 2. NAVIGATION & SAVE TOOLBAR                         */}
                {/* ==================================================== */}
                <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md">
                    {/* Navegação entre meses */}
                    <div className="flex items-center bg-surface-200/80 rounded-xl p-1 border border-surface-300">
                        <button
                            onClick={() => setMonthOffset((m) => m - 1)}
                            className="p-2 rounded-lg hover:bg-surface-100 text-typography-700 hover:text-typography-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Mês anterior"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sm:inline capitalize">{prevMonthLabel}</span>
                        </button>

                        {monthOffset !== 0 && (
                            <button
                                onClick={() => setMonthOffset(0)}
                                className="px-2.5 py-1 text-xs font-semibold text-primary-200 hover:bg-surface-100 rounded-lg transition-colors flex items-center gap-1"
                                title="Voltar para o mês atual"
                            >
                                <RotateCcw className="h-3 w-3" />
                                <span>Hoje</span>
                            </button>
                        )}

                        <button
                            onClick={() => setMonthOffset((m) => m + 1)}
                            className="p-2 rounded-lg hover:bg-surface-100 text-typography-700 hover:text-typography-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Próximo mês"
                        >
                            <span className="sm:inline capitalize">{nextMonthLabel}</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Botão de Salvar */}
                    <div className="flex items-center gap-2">
                        {pendingChangesCount > 0 && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {pendingChangesCount} pendente(s)
                            </span>
                        )}

                        <Button
                            onClick={handleSave}
                            disabled={isSaving || pendingChangesCount === 0}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm transition-all text-typography-200 ${
                                pendingChangesCount > 0
                                    ? "bg-primary-200 hover:opacity-90 ring-2 ring-primary-200/30"
                                    : "opacity-60 cursor-not-allowed"
                            }`}
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
                        </Button>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* 3. WEEKEND ROWS LIST                                */}
                {/* ==================================================== */}
                {!data ? (
                    <SkeletonHospitalityRow />
                ) : weekendMeetingDay.length > 0 ? (
                    <div className="flex flex-col gap-4 pb-36">
                        {weekendMeetingDay.map((d) => (
                            <div
                                key={d.toISOString()}
                                className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-typography-300 transition-all"
                            >
                                <HospitalityRow date={d} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-typography-500 bg-surface-100 rounded-2xl border border-surface-300">
                        Nenhum dia de reunião encontrado para o mês selecionado.
                    </div>
                )}
            </section>

            <ScrollToTopButton />
        </ContentDashboard>
    )
}

HospitalityWeekendPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default HospitalityWeekendPage
