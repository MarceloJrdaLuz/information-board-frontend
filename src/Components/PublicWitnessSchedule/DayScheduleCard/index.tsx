import { dirtyMonthScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { Button } from "@/Components/ui/button"
import { IFieldServiceException } from "@/types/fieldService"
import { IPublicWitnessArrangement } from "@/types/publicWitness"
import { EventImpactScope, ISpecialEvent } from "@/types/specialEvent"
import { IPublisher } from "@/types/types"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { useAtom } from "jotai"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CalendarOff,
  CheckCircle2,
  Plus,
  ShieldAlert,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import SlotScheduleRow, { IPublicWitnessAssignment } from "../SlotScheduleRow"

dayjs.locale("pt-br")
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

interface Props {
  date: string
  arrangement: IPublicWitnessArrangement
  publishers: IPublisher[]
  assignmentsBySlot?: Record<string, IPublicWitnessAssignment>
  exceptions?: IFieldServiceException[]
  specialEvents?: ISpecialEvent[]
}

export default function DayScheduleCard({
  date,
  arrangement,
  publishers,
  assignmentsBySlot,
  exceptions = [],
  specialEvents = [],
}: Props) {
  const [dirty] = useAtom(dirtyMonthScheduleAtom)

  // 1. Identifica exceções cadastradas diretamente na data
  const todaysExceptions = useMemo(() => {
    return exceptions.filter(ex => ex.date === date)
  }, [exceptions, date])

  // 2. Identifica evento especial que suspende o testemunho público nesta data
  const matchingSpecialEvent = useMemo(() => {
    if (!specialEvents || specialEvents.length === 0) return null
    const targetDate = dayjs(date)
    return specialEvents.find(se => {
      if (!se.publicWitnessingImpact || se.publicWitnessingImpact === EventImpactScope.NONE) {
        return false
      }
      const seStart = dayjs(se.startDate)
      const seEnd = dayjs(se.endDate)
      const rangeStart = (se.publicWitnessingImpact === EventImpactScope.ALL_DAYS || se.affectsWholeWeek)
        ? seStart.startOf("isoWeek")
        : seStart
      const rangeEnd = (se.publicWitnessingImpact === EventImpactScope.ALL_DAYS || se.affectsWholeWeek)
        ? seEnd.endOf("isoWeek")
        : seEnd

      return targetDate.isSameOrAfter(rangeStart, "day") && targetDate.isSameOrBefore(rangeEnd, "day")
    })
  }, [specialEvents, date])

  const isSuspended = todaysExceptions.length > 0 || !!matchingSpecialEvent

  const suspensionReason = useMemo(() => {
    if (matchingSpecialEvent) {
      return matchingSpecialEvent.title
    }
    if (todaysExceptions.length > 0) {
      return todaysExceptions.map(ex => ex.reason).filter(Boolean).join(", ") || "Sem atividade programada"
    }
    return ""
  }, [matchingSpecialEvent, todaysExceptions])

  // 3. Verifica se já existem publicadores atribuídos nesta data (salvos ou modificados)
  const hasExistingAssignments = useMemo(() => {
    const fromProps = Object.values(assignmentsBySlot ?? {}).some(
      a => a.publishers && a.publishers.length > 0
    )
    const fromDirty = (dirty[date]?.slots ?? []).some(
      s => s.publishers && s.publishers.length > 0
    )
    return fromProps || fromDirty
  }, [assignmentsBySlot, dirty, date])

  // Estado para forçar a exibição/atividade manual mesmo quando suspenso
  const [forceActive, setForceActive] = useState<boolean>(hasExistingAssignments)

  useEffect(() => {
    if (hasExistingAssignments) {
      setForceActive(true)
    }
  }, [hasExistingAssignments])

  // Map publisher_id -> quantidade de slots nesse dia
  const publishersCount = useMemo(() => {
    const count: Record<string, number> = {}

    Object.entries(assignmentsBySlot ?? {}).forEach(([slotId, assignment]) => {
      assignment.publishers.forEach(p => {
        count[p.publisher.id] = (count[p.publisher.id] ?? 0) + 1
      })
    })

    const dayDirty = dirty[date]?.slots ?? []
    dayDirty.forEach(slot => {
      slot.publishers.forEach(p => {
        count[p.publisher_id] = (count[p.publisher_id] ?? 0) + 1
      })
    })

    return count
  }, [assignmentsBySlot, dirty, date])

  // Contagem de horários completos no dia
  const sortedSlots = useMemo(() => {
    return arrangement.timeSlots
      .slice()
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [arrangement.timeSlots])

  const filledSlotsCount = useMemo(() => {
    return sortedSlots.filter(slot => {
      const dirtySlot = dirty[date]?.slots?.find(s => s.time_slot_id === slot.id)
      if (dirtySlot) {
        return dirtySlot.publishers.length >= 2
      }
      const existing = assignmentsBySlot?.[slot.id]
      if (existing) {
        return existing.publishers.length >= 2
      }
      if (!slot.is_rotative) {
        return (slot.defaultPublishers?.length ?? 0) >= 2
      }
      return false
    }).length
  }, [sortedSlots, dirty, date, assignmentsBySlot])

  const parsedDate = dayjs(date)
  const formattedDate = parsedDate.format("dddd, D [de] MMMM [de] YYYY")
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
  const isAllFilled = sortedSlots.length > 0 && filledSlotsCount === sortedSlots.length

  return (
    <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Topo do Card de Dia: Data e Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-300">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary-100/20 text-primary-200">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-typography-500 uppercase tracking-wider">
              {parsedDate.format("DD/MM/YYYY")}
            </span>
            <h3 className="text-base font-bold text-typography-900 capitalize">
              {capitalizedDate}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSuspended && !forceActive ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold">
              <CalendarOff className="w-4 h-4 text-red-600" />
              Suspenso por Evento Especial
            </span>
          ) : isSuspended && forceActive ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold">
              Atividade forçada manualmente ({filledSlotsCount}/{sortedSlots.length})
            </span>
          ) : isAllFilled ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Completo ({filledSlotsCount}/{sortedSlots.length})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              {filledSlotsCount} de {sortedSlots.length} horários preenchidos
            </span>
          )}
        </div>
      </div>

      {/* Quando suspenso e NÃO forçado: oculta os campos de seleção e exibe card de suspensão com botão para forçar */}
      {isSuspended && !forceActive ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <CalendarOff className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-typography-900">
                  Testemunho público suspenso nesta data
                </span>
                {suspensionReason && (
                  <span className="text-[11px] font-semibold bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded">
                    {suspensionReason}
                  </span>
                )}
              </div>
              <p className="text-xs text-typography-600 dark:text-typography-400">
                Devido ao evento especial deste período, a seleção de publicadores está oculta para esta data.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setForceActive(true)}
            className="shrink-0 text-xs font-semibold flex items-center gap-1.5 border-amber-500/40 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Forçar testemunho público neste dia</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Se foi forçado manualmente, exibe aviso e opção de re-suspender */}
          {isSuspended && forceActive && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-typography-800 dark:text-typography-200">
                  <strong>Atividade ativada manualmente</strong> para esta data ({suspensionReason}).
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForceActive(false)}
                className="h-7 text-xs text-typography-600 hover:text-typography-900 self-end sm:self-auto cursor-pointer"
              >
                Ocultar / Suspender novamente
              </Button>
            </div>
          )}

          {/* Alerta de Exceção simples quando não for evento especial suspenso */}
          {!matchingSpecialEvent && todaysExceptions.length > 0 && !forceActive && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Exceção nesta data:</strong>{" "}
                {todaysExceptions.map(ex => ex.reason).join(", ")}
              </div>
            </div>
          )}

          {/* Lista de Horários do Dia */}
          <div className="flex flex-col gap-3">
            {sortedSlots.map(slot => {
              const countExcludingThisSlot: Record<string, number> = { ...publishersCount }

              assignmentsBySlot?.[slot.id]?.publishers?.forEach(p => {
                const pubId = p?.publisher?.id || p?.publisher_id
                if (pubId) {
                  countExcludingThisSlot[pubId] = (countExcludingThisSlot[pubId] ?? 1) - 1
                }
              })

              const dayDirtySlot = dirty[date]?.slots?.find(s => s.time_slot_id === slot.id)
              dayDirtySlot?.publishers?.forEach(p => {
                if (p?.publisher_id) {
                  countExcludingThisSlot[p.publisher_id] = (countExcludingThisSlot[p.publisher_id] ?? 1) - 1
                }
              })

              return (
                <SlotScheduleRow
                  key={slot.id}
                  date={date}
                  slot={slot}
                  publishers={publishers}
                  assignment={assignmentsBySlot?.[slot.id]}
                  publishersCount={countExcludingThisSlot}
                  isSpecialDate={!arrangement.is_fixed}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
