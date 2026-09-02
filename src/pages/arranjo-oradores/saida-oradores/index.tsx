import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { createExternalAtom, deleteExternalTalkAtom, updateExternalTalkAtom, updateStatusExternalTalkAtom } from "@/atoms/externalTalksAtoms"
import { CreateExternalTalksPayload, UpdateExternalTalksPayload } from "@/atoms/externalTalksAtoms/types"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import ExternalTalkRow from "@/Components/ExternalTalkRow"
import ExternalTalksSkeleton from "@/Components/ExternalTalksSkeleton"
import ScrollToTopButton from "@/Components/ScrollToTopButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IExternalTalk } from "@/types/externalTalks"
import { IExternalTalkFormData } from "@/types/weekendSchedule"
import { DayMeetingPublic, getWeekendDays } from "@/utils/dateUtil"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
import { useAtom, useSetAtom } from "jotai"

dayjs.extend(customParseFormat)
dayjs.extend(isoWeek)
dayjs.extend(isBetween)

import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Search,
  Send,
  Users,
  XCircle
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

function ExternalTalksPage() {
  dayjs.locale("pt-br")
  const router = useRouter()
  const { date } = router.query
  const [crumbs] = useAtom(crumbsAtom)
  const [, setPageActive] = useAtom(pageActiveAtom)

  const setCreateExternalTalk = useSetAtom(createExternalAtom)
  const setUpdateExternalTalk = useSetAtom(updateExternalTalkAtom)
  const setUpdateStatusExternalTalk = useSetAtom(updateStatusExternalTalkAtom)
  const setDeleteExternalTalk = useSetAtom(deleteExternalTalkAtom)

  const [monthOffset, setMonthOffset] = useState(0)
  const [weekendMeetingDay, setWeekendMeetingDay] = useState<Date[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "canceled">("all")

  const baseDate = dayjs().add(monthOffset, "month")
  const currentMonthLabel = baseDate.format("MMMM [de] YYYY")
  const prevMonthLabel = baseDate.clone().subtract(1, "month").format("MMM")
  const nextMonthLabel = baseDate.clone().add(1, "month").format("MMM")

  useEffect(() => {
    setPageActive("Saída de oradores")
  }, [setPageActive])

  const { congregation } = useCongregationContext()
  const congregation_id = congregation?.id

  const { data, mutate } = useAuthorizedFetch<IExternalTalkFormData>(
    `/form-data?form=externalTalks`,
    {
      allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    }
  )

  // Atualiza mês a partir da query string se existir
  useEffect(() => {
    if (!router.isReady) return

    const dateParam = Array.isArray(date) ? date[0] : date
    if (!dateParam) return

    const target = dayjs(dateParam, "YYYY-MM-DD", true)
    if (target.isValid()) {
      const now = dayjs()
      const monthDiff =
        (target.year() - now.year()) * 12 + (target.month() - now.month())
      setMonthOffset(monthDiff)
    } else {
      const alt = dayjs(dateParam)
      if (!alt.isValid()) return
      const monthDiffAlt =
        (alt.year() - dayjs().year()) * 12 + (alt.month() - dayjs().month())
      setMonthOffset(monthDiffAlt)
    }
  }, [router.isReady, date])

  useEffect(() => {
    if (!congregation?.dayMeetingPublic) return
    setWeekendMeetingDay(getWeekendDays(monthOffset, congregation?.dayMeetingPublic as DayMeetingPublic))
  }, [monthOffset, congregation?.dayMeetingPublic])

  const handleAddExternalTalk = async (talk: Partial<IExternalTalk>) => {
    const payload: CreateExternalTalksPayload = {
      date: talk.date ?? "",
      destinationCongregation_id: talk.destinationCongregation?.id ?? "",
      speaker_id: talk.speaker?.id ?? "",
      manualTalk: talk.manualTalk ?? undefined,
      talk_id: talk.talk?.id ?? undefined,
    }

    await toast.promise(
      setCreateExternalTalk(congregation_id ?? "", payload),
      { pending: "Salvando saída de orador..." }
    ).then(() => {
      mutate()
    }).catch(err => {
      console.error(err)
    })
  }

  const handleUpdate = async (externalTalk_id: string, payload: Partial<IExternalTalk>) => {
    const paylodUpdate: UpdateExternalTalksPayload = {
      destinationCongregation_id: payload.destinationCongregation?.id,
      speaker_id: payload.speaker?.id,
      talk_id: payload.talk?.id,
      manualTalk: payload.manualTalk
    }
    await toast.promise(
      setUpdateExternalTalk(externalTalk_id ?? "", paylodUpdate),
      { pending: "Atualizando saída de orador..." }
    ).then(() => {
      mutate()
    }).catch(err => {
      console.error(err)
    })
  }

  const handleUpdateStatus = async (
    externalTalk_id: string,
    status: IExternalTalk["status"]
  ) => {
    const payload = { status }

    await toast.promise(
      setUpdateStatusExternalTalk(externalTalk_id, payload),
      { pending: "Atualizando status do discurso..." }
    ).then(() => {
      mutate()
    }).catch(err => {
      console.error(err)
    })
  }

  const handleDelete = async (externalTalk_id: string) => {
    await toast.promise(
      setDeleteExternalTalk(externalTalk_id),
      { pending: "Excluindo saída de orador..." }
    ).then(() => {
      mutate()
    }).catch(err => {
      console.error(err)
    })
  }

  const externalTalks = data?.externalTalks ?? []
  const speakers = data?.speakers ?? []
  const congregations = data?.congregations ?? []
  const talks = data?.talks ?? []

  // Calcula estatísticas para os discursos de saída do mês atual selecionado
  const monthStats = useMemo(() => {
    const startOfMonth = baseDate.startOf("month").subtract(2, "days")
    const endOfMonth = baseDate.endOf("month").add(2, "days")

    const currentMonthTalks = externalTalks.filter((t) => {
      const talkDate = dayjs(t.date)
      return talkDate.isAfter(startOfMonth) && talkDate.isBefore(endOfMonth)
    })

    const total = currentMonthTalks.length
    const confirmed = currentMonthTalks.filter(t => t.status === "confirmed").length
    const pending = currentMonthTalks.filter(t => t.status === "pending").length
    const canceled = currentMonthTalks.filter(t => t.status === "canceled").length

    return {
      total,
      confirmed,
      pending,
      canceled
    }
  }, [externalTalks, baseDate])

  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Saída de oradores" />

      <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto">
        {!data ? (
          <ExternalTalksSkeleton />
        ) : (
          <>
            {/* ==================================================== */}
            {/* 1. HERO & METRICS CARD                               */}
            {/* ==================================================== */}
            <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                  <Send className="h-4 w-4" />
                  <span>Arranjo de Oradores</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-typography-900 capitalize">
                  Saída de Oradores • {currentMonthLabel}
                </h1>
                <p className="text-xs sm:text-sm text-typography-500">
                  Acompanhe e organize as visitas de oradores locais para outras congregações.
                </p>
              </div>

              {/* Metric Badges Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-surface-300">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-typography-500">Total no mês</div>
                    <div className="text-base font-bold text-typography-900">{monthStats.total} saídas</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-typography-500">Confirmadas</div>
                    <div className="text-base font-bold text-typography-900">{monthStats.confirmed} de {monthStats.total}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-typography-500">Pendentes</div>
                    <div className="text-base font-bold text-typography-900">{monthStats.pending} restantes</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                  <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-typography-500">Canceladas</div>
                    <div className="text-base font-bold text-typography-900">{monthStats.canceled} saídas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* 2. COMPACT STICKY NAVIGATION & FILTER BAR            */}
            {/* ==================================================== */}
            <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md">
              {/* Month Navigation */}
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
                    Hoje
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

              {/* Search & Filter Toolbar */}
              <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                {/* Search input */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-typography-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar orador ou congregação..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-surface-300 bg-surface-200/60 text-xs text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:bg-surface-100 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="w-36">
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => setStatusFilter(val as any)}
                  >
                    <SelectTrigger className="h-8 rounded-xl border-surface-300 bg-surface-200/60 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="text-xs">Todos os status</SelectItem>
                      <SelectItem value="confirmed" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Confirmados</SelectItem>
                      <SelectItem value="pending" className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pendentes</SelectItem>
                      <SelectItem value="canceled" className="text-xs text-rose-600 dark:text-rose-400 font-medium">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* 3. LISTA DE FINAIS DE SEMANA (CARDS MODERNOS)         */}
            {/* ==================================================== */}
            <div className="flex flex-col gap-5 pb-24">
              {weekendMeetingDay.length === 0 ? (
                <div className="p-12 text-center bg-surface-100 border border-surface-300 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <CalendarIcon className="h-10 w-10 text-typography-400" />
                  <h3 className="text-base font-bold text-typography-800">
                    Nenhuma reunião encontrada para este mês
                  </h3>
                  <p className="text-xs text-typography-500 max-w-sm">
                    Verifique se o dia da reunião pública da congregação está configurado nas configurações.
                  </p>
                </div>
              ) : (
                weekendMeetingDay.map((dateItem) => {
                  const startWeekend = dayjs(dateItem).isoWeekday(5).startOf("day")
                  const endWeekend = dayjs(dateItem).isoWeekday(7).endOf("day")

                  let talksForDate = externalTalks.filter((t) => {
                    const talkDate = dayjs(t.date)
                    return talkDate.isAfter(startWeekend.subtract(1, "second")) && talkDate.isBefore(endWeekend.add(1, "second"))
                  })

                  // Aplicar filtros de status e busca se existirem
                  if (statusFilter !== "all") {
                    talksForDate = talksForDate.filter(t => t.status === statusFilter)
                  }

                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim()
                    talksForDate = talksForDate.filter(t =>
                      (t.speaker?.fullName && t.speaker.fullName.toLowerCase().includes(query)) ||
                      (t.destinationCongregation?.name && t.destinationCongregation.name.toLowerCase().includes(query)) ||
                      (t.destinationCongregation?.city && t.destinationCongregation.city.toLowerCase().includes(query)) ||
                      (t.manualTalk && t.manualTalk.toLowerCase().includes(query)) ||
                      (t.talk?.title && t.talk.title.toLowerCase().includes(query)) ||
                      (t.talk?.number && String(t.talk.number).includes(query))
                    )
                  }

                  // Se houver busca/filtro ativo e este fim de semana não tiver correspondências, podemos manter visível ou ocultar
                  const isFiltered = statusFilter !== "all" || searchQuery.trim().length > 0
                  if (isFiltered && talksForDate.length === 0) {
                    return null
                  }

                  return (
                    <ExternalTalkRow
                      key={dateItem.toISOString()}
                      date={dateItem}
                      externalTalks={talksForDate}
                      speakers={speakers}
                      congregations={congregations}
                      talks={talks}
                      onAddExternalTalk={handleAddExternalTalk}
                      onUpdate={handleUpdate}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDelete}
                    />
                  )
                })
              )}

              {/* Mensagem quando filtros não encontram resultados */}
              {(statusFilter !== "all" || searchQuery.trim().length > 0) &&
                weekendMeetingDay.length > 0 &&
                weekendMeetingDay.every((dateItem) => {
                  const startWeekend = dayjs(dateItem).isoWeekday(5).startOf("day")
                  const endWeekend = dayjs(dateItem).isoWeekday(7).endOf("day")
                  let talksForDate = externalTalks.filter((t) => {
                    const talkDate = dayjs(t.date)
                    return talkDate.isAfter(startWeekend.subtract(1, "second")) && talkDate.isBefore(endWeekend.add(1, "second"))
                  })
                  if (statusFilter !== "all") talksForDate = talksForDate.filter(t => t.status === statusFilter)
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim()
                    talksForDate = talksForDate.filter(t =>
                      (t.speaker?.fullName && t.speaker.fullName.toLowerCase().includes(query)) ||
                      (t.destinationCongregation?.name && t.destinationCongregation.name.toLowerCase().includes(query)) ||
                      (t.manualTalk && t.manualTalk.toLowerCase().includes(query)) ||
                      (t.talk?.title && t.talk.title.toLowerCase().includes(query)) ||
                      (t.talk?.number && String(t.talk.number).includes(query))
                    )
                  }
                  return talksForDate.length === 0
                }) && (
                  <div className="p-10 text-center bg-surface-100 border border-surface-300 rounded-2xl flex flex-col items-center justify-center gap-3">
                    <Search className="h-8 w-8 text-typography-400" />
                    <h3 className="text-sm font-bold text-typography-800">
                      Nenhuma saída encontrada com os filtros atuais
                    </h3>
                    <p className="text-xs text-typography-500">
                      Tente alterar os termos da busca ou redefinir os filtros de status.
                    </p>
                    <Button
                      outline
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                      }}
                      className="mt-2 rounded-xl text-xs"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
            </div>
          </>
        )}
      </section>

      {/* Botão Flutuante Voltar ao Topo */}
      <ScrollToTopButton />
    </ContentDashboard>
  )
}

ExternalTalksPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default ExternalTalksPage