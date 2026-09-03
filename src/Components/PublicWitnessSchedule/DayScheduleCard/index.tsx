import { IPublicWitnessArrangement } from "@/types/publicWitness"
import SlotScheduleRow from "../SlotScheduleRow"
import { IPublisher } from "@/types/types"
import { IPublicWitnessAssignment } from "../SlotScheduleRow"
import { IFieldServiceException } from "@/types/fieldService"
import { useMemo } from "react"
import { useAtom } from "jotai"
import { dirtyMonthScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { Calendar as CalendarIcon, ShieldAlert, CheckCircle2 } from "lucide-react"

dayjs.locale("pt-br")

interface Props {
  date: string
  arrangement: IPublicWitnessArrangement
  publishers: IPublisher[]
  assignmentsBySlot?: Record<string, IPublicWitnessAssignment>
  exceptions?: IFieldServiceException[]
}

export default function DayScheduleCard({
  date,
  arrangement,
  publishers,
  assignmentsBySlot,
  exceptions = []
}: Props) {
  const [dirty] = useAtom(dirtyMonthScheduleAtom)

  const todaysExceptions = exceptions.filter(ex => ex.date === date)

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
          {isAllFilled ? (
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

      {/* Alerta de Exceção */}
      {todaysExceptions.length > 0 && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs sm:text-sm">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Exceção / Sem atividade nesta data:</strong>{" "}
            {todaysExceptions.map(ex => ex.reason).join(", ")}
          </div>
        </div>
      )}

      {/* Lista de Horários do Dia */}
      <div className="flex flex-col gap-3">
        {sortedSlots.map(slot => {
          const countExcludingThisSlot: Record<string, number> = { ...publishersCount }

          assignmentsBySlot?.[slot.id]?.publishers.forEach(p => {
            countExcludingThisSlot[p.publisher.id] =
              (countExcludingThisSlot[p.publisher.id] ?? 1) - 1
          })

          const dayDirtySlot = dirty[date]?.slots.find(s => s.time_slot_id === slot.id)
          dayDirtySlot?.publishers.forEach(p => {
            countExcludingThisSlot[p.publisher_id] =
              (countExcludingThisSlot[p.publisher_id] ?? 1) - 1
          })

          return (
            <SlotScheduleRow
              key={slot.id}
              date={date}
              slot={slot}
              publishers={publishers}
              assignment={assignmentsBySlot?.[slot.id]}
              publishersCount={countExcludingThisSlot}
            />
          )
        })}
      </div>
    </div>
  )
}
