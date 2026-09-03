import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import {
    createSchedulePublicWitnessAtom,
    dirtyMonthScheduleAtom,
    monthScheduleAtom,
} from "@/atoms/publicWitnessAtoms.ts/schedules"
import ArrangementMonthScheduleSkeleton from "@/Components/ArrangementMonthScheduleSkeleton"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import DayScheduleCard from "@/Components/PublicWitnessSchedule/DayScheduleCard"
import GenerateScheduleModal from "@/Components/PublicWitnessSchedule/GenerateScheduleModal"
import SlotPreferencesModal from "@/Components/PublicWitnessSchedule/SlotPreferencesModal"
import { IPublicWitnessAssignment } from "@/Components/PublicWitnessSchedule/SlotScheduleRow"
import { Button } from "@/Components/ui/button"
import { useArrangement, usePublicWitnessSchedules, usePublishers } from "@/hooks/useArrangements"
import { WEEKDAY_LABEL, Weekday } from "@/types/fieldService"
import { getDatesForMonth } from "@/utils/publicWitnessDates"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { useAtom, useSetAtom } from "jotai"
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Calendar as CalendarIcon,
    CalendarOff,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Save,
    SlidersHorizontal,
    Users,
    Wand2
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

dayjs.locale("pt-br")

function ArrangementMonthSchedulePage() {
  const router = useRouter()
  const { arrangement_id } = router.query as { arrangement_id: string }
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const [, setPageActive] = useAtom(pageActiveAtom)
  const setSchedule = useSetAtom(monthScheduleAtom)
  const createSchedule = useSetAtom(createSchedulePublicWitnessAtom)
  const [dirty, setDirty] = useAtom(dirtyMonthScheduleAtom)

  const { data: arrangement, mutate: mutateArrangement } = useArrangement(arrangement_id || "")
  const { data: publishers } = usePublishers()

  const [monthOffset, setMonthOffset] = useState(0)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const baseDate = dayjs().add(monthOffset, "month")
  const currentMonthName = baseDate.format("MMMM [de] YYYY")
  const capitalizedMonthName =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)

  /* ---------------- Breadcrumb e Título Ativo ---------------- */
  useEffect(() => {
    setPageActive("Programação de Testemunho Público")
    setCrumbs([
      {
        label: "Início",
        link: "/dashboard"
      },
      {
        label: "Testemunho Público",
        link: "/congregacao/testemunho-publico"
      },
      {
        label: arrangement?.title || "Programação Mensal",
        link: `/congregacao/testemunho-publico/programacao/${arrangement_id}`
      }
    ])
  }, [setPageActive, setCrumbs, arrangement?.title, arrangement_id])

  /* ---------------- Reset do mês ---------------- */
  useEffect(() => {
    setSchedule({})
    setDirty({})
  }, [arrangement_id, monthOffset, setSchedule, setDirty])

  /* ---------------- Datas do mês ---------------- */
  const dates = useMemo(() => {
    if (!arrangement) return []
    if (arrangement.is_fixed) {
      if (arrangement.weekday === undefined || arrangement.weekday === null) return []
      return getDatesForMonth(monthOffset, arrangement.weekday)
    }
    return arrangement.date ? [arrangement.date] : []
  }, [arrangement, monthOffset])

  const start_date = dates[0] || baseDate.startOf("month").format("YYYY-MM-DD")
  const end_date = dates[dates.length - 1] || baseDate.endOf("month").format("YYYY-MM-DD")

  /* ---------------- Fetch schedules ---------------- */
  const { data: scheduleResponse, mutate: mutateSchedule } = usePublicWitnessSchedules({
    arrangement_id: arrangement?.id || "",
    start_date,
    end_date,
  })

  /* ---------------- Organiza assignments por data e slot ---------------- */
  const assignmentsByDate = useMemo(() => {
    const map: Record<string, Record<string, IPublicWitnessAssignment>> = {}
    scheduleResponse?.schedule.forEach(day => {
      map[day.date] = {}
      day.assignments.forEach(assignment => {
        if (!map[day.date][assignment.time_slot_id]) {
          map[day.date][assignment.time_slot_id] = assignment
        }
      })
    })
    return map
  }, [scheduleResponse])

  /* ---------------- Estatísticas do Mês ---------------- */
  const stats = useMemo(() => {
    if (!arrangement || !dates.length) {
      return { totalDays: 0, totalSlots: 0, totalCapacity: 0, filledSpots: 0, pendingSpots: 0 }
    }

    const totalDays = dates.length
    const totalSlots = totalDays * arrangement.timeSlots.length
    const totalCapacity = totalSlots * 2
    let filledSpots = 0

    dates.forEach(date => {
      arrangement.timeSlots.forEach(slot => {
        const dirtySlot = dirty[date]?.slots?.find(s => s.time_slot_id === slot.id)
        if (dirtySlot) {
          filledSpots += dirtySlot.publishers.length
        } else {
          const assignment = assignmentsByDate[date]?.[slot.id]
          if (assignment) {
            filledSpots += assignment.publishers.length
          } else if (!slot.is_rotative) {
            filledSpots += slot.defaultPublishers?.length ?? 0
          }
        }
      })
    })

    const pendingSpots = Math.max(0, totalCapacity - filledSpots)
    return { totalDays, totalSlots, totalCapacity, filledSpots, pendingSpots }
  }, [arrangement, dates, dirty, assignmentsByDate])

  const dirtyDatesCount = Object.keys(dirty).length

  /* ---------------- Salvar Alterações Manuais ---------------- */
  const handleSave = async () => {
    const payload = { schedule: Object.values(dirty) }
    if (!payload.schedule.length) {
      toast.info("Nenhuma alteração pendente para salvar")
      return
    }

    setSaving(true)
    try {
      await toast.promise(
        createSchedule(arrangement?.id || "", payload),
        {
          pending: "Salvando programação...",
          success: "Programação salva com sucesso!"
        }
      )
      setDirty({})
      mutateSchedule()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerationSuccess = () => {
    setDirty({})
    mutateSchedule()
    mutateArrangement()
  }

  /* ================= Render ================= */
  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Programação de Testemunho Público" />

      {!arrangement || !publishers ? (
        <ArrangementMonthScheduleSkeleton />
      ) : (
        <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto p-4 sm:p-6 min-w-0">
          {/* Header do Arranjo (Padrão das Reuniões) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-100 p-4 sm:p-5 rounded-xl border border-surface-300 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/congregacao/testemunho-publico")}
                className="h-9 w-9 border-surface-300 hover:bg-surface-200 shrink-0"
                title="Voltar aos arranjos"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-primary-200 bg-primary-100/20 px-2 py-0.5 rounded-md">
                    {arrangement.is_fixed
                      ? `Arranjo Fixo • ${
                          arrangement.weekday !== null && arrangement.weekday !== undefined
                            ? WEEKDAY_LABEL[arrangement.weekday as Weekday]
                            : "Sem dia"
                        }`
                      : `Data Específica • ${dayjs(arrangement.date).format("DD/MM/YYYY")}`}
                  </span>
                  <span className="text-[11px] font-medium text-typography-600 bg-surface-200 px-2 py-0.5 rounded-md">
                    {arrangement.timeSlots.length}{" "}
                    {arrangement.timeSlots.length === 1 ? "horário" : "horários"}
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-typography-900 mt-1">
                  {arrangement.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-typography-600">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 rounded-lg">
                <Users className="h-4 w-4 text-primary-200" />
                <span>
                  <strong>{publishers?.length ?? 0}</strong> publicadores habilitados
                </span>
              </div>
            </div>
          </div>

          {/* Barra Superior de Controles e Ações (Idêntica ao Meio de Semana) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-100 p-4 rounded-xl border border-surface-300 shadow-sm sticky top-0 z-20 backdrop-blur-md">
            {/* Seletor de Mês e Ano */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonthOffset(m => m - 1)}
                className="h-9 w-9 border-surface-300 hover:bg-surface-200"
                title="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-200 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-primary-200" />
                <span className="font-bold text-sm text-typography-900 min-w-[150px] text-center">
                  {capitalizedMonthName}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonthOffset(m => m + 1)}
                className="h-9 w-9 border-surface-300 hover:bg-surface-200"
                title="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {monthOffset !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMonthOffset(0)}
                  className="text-xs text-primary-200 hover:bg-surface-200 h-9 px-2"
                >
                  Mês atual
                </Button>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPreferencesModalOpen(true)}
                className="text-xs flex items-center gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-800"
              >
                <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                <span>Preferências de Horário</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsGenerateModalOpen(true)}
                className="text-xs flex items-center gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-800"
              >
                <Wand2 className="h-4 w-4 text-primary-200" />
                <span>Auto-Preencher / Gerar...</span>
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={dirtyDatesCount === 0 || saving}
                className={`text-xs flex items-center gap-1.5 transition-all ${
                  dirtyDatesCount > 0
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    : "border border-surface-300 text-typography-400 bg-surface-200 cursor-not-allowed"
                }`}
              >
                <Save className="h-4 w-4" />
                <span>
                  {saving
                    ? "Salvando..."
                    : `Salvar Alterações ${dirtyDatesCount > 0 ? `(${dirtyDatesCount})` : ""}`}
                </span>
              </Button>
            </div>
          </div>

          {/* Cards de Métricas e Resumo do Mês */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Dias no Mês
                </span>
                <CalendarDays className="w-4 h-4 text-primary-200" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-typography-900">
                {stats.totalDays}
              </span>
              <span className="text-[11px] text-typography-500">
                dias programados para este carrinho
              </span>
            </div>

            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total de Vagas
                </span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-typography-900">
                {stats.totalCapacity}
              </span>
              <span className="text-[11px] text-typography-500">
                {stats.totalSlots} horários (2 por horário)
              </span>
            </div>

            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Preenchidas
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-700">
                {stats.filledSpots}
              </span>
              <span className="text-[11px] text-typography-500">
                {stats.totalCapacity > 0
                  ? `${Math.round((stats.filledSpots / stats.totalCapacity) * 100)}% preenchido`
                  : "0%"}
              </span>
            </div>

            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Vagas em Aberto
                </span>
                <AlertCircle
                  className={`w-4 h-4 ${
                    stats.pendingSpots > 0 ? "text-amber-500" : "text-green-600"
                  }`}
                />
              </div>
              <span
                className={`text-xl sm:text-2xl font-bold ${
                  stats.pendingSpots > 0 ? "text-amber-600" : "text-green-700"
                }`}
              >
                {stats.pendingSpots}
              </span>
              <span className="text-[11px] text-typography-500">
                {stats.pendingSpots === 0 ? "Escala completa!" : "vagas restantes para preencher"}
              </span>
            </div>
          </div>

          {/* Lista dos Dias do Mês */}
          <div className="flex flex-col gap-4 pb-28">
            {dates.length > 0 ? (
              dates.map(date => (
                <DayScheduleCard
                  key={date}
                  date={date}
                  arrangement={arrangement}
                  publishers={publishers}
                  assignmentsBySlot={assignmentsByDate[date]}
                  exceptions={scheduleResponse?.exceptions}
                />
              ))
            ) : (
              <div className="bg-surface-100 border border-dashed border-surface-300 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 text-typography-500">
                <CalendarOff className="w-10 h-10 text-typography-400" />
                <p className="text-base font-semibold text-typography-700">
                  Nenhuma data encontrada para este arranjo no mês selecionado.
                </p>
                <p className="text-xs text-typography-500 max-w-sm">
                  Utilize as setas no topo para navegar entre os meses ou altere a configuração do arranjo.
                </p>
              </div>
            )}
          </div>

          {/* Modal de Geração Automática */}
          <GenerateScheduleModal
            isOpen={isGenerateModalOpen}
            onClose={() => setIsGenerateModalOpen(false)}
            arrangementId={arrangement.id}
            arrangementTitle={arrangement.title}
            defaultStartDate={start_date}
            defaultEndDate={end_date}
            onSuccess={handleGenerationSuccess}
          />

          {/* Modal de Preferências de Horários */}
          <SlotPreferencesModal
            isOpen={isPreferencesModalOpen}
            onClose={() => setIsPreferencesModalOpen(false)}
            arrangement={arrangement}
            publishers={publishers}
            onSuccess={() => {
              mutateArrangement()
            }}
          />
        </div>
      )}
    </ContentDashboard>
  )
}

ArrangementMonthSchedulePage.getLayout = withProtectedLayout([
  "ADMIN_CONGREGATION",
  "FIELD_SERVICE_MANAGER",
  "PUBLIC_WITNESS_MANAGER",
])

export default ArrangementMonthSchedulePage
