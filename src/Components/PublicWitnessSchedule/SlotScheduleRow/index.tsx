import { useAtom } from "jotai"
import { useEffect, useMemo, useState } from "react"
import DropdownMulti from "@/Components/DropdownMulti"
import { dirtyMonthScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { useCongregationContext } from "@/context/CongregationContext"
import { buildPublicWitnessHistoryOptions } from "@/functions/buildPublicWitnessHistoryOptions"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IPublicWitnessTimeSlot } from "@/types/publicWitness"
import { IAssignmentsHistoryResponse } from "@/types/publicWitness/schedules"
import { IPublisher } from "@/types/types"
import {
  AlertCircleIcon,
  Clock,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  X,
  UserCheck
} from "lucide-react"

export interface IPublicWitnessAssignment {
  id: string
  time_slot_id: string
  date: string
  created_at: string
  fixed: boolean
  publishers: {
    id: string
    assignment_id: string
    publisher_id: string
    order: number
    publisher: IPublisher
  }[]
}

interface Props {
  date: string
  slot: IPublicWitnessTimeSlot
  publishers: IPublisher[]
  assignment?: IPublicWitnessAssignment
  publishersCount?: Record<string, number>
}

export default function SlotScheduleRow({
  date,
  slot,
  publishers,
  assignment,
  publishersCount
}: Props) {
  const { congregation } = useCongregationContext()
  const [dirty, setDirty] = useAtom(dirtyMonthScheduleAtom)
  const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([])
  const isEditable = slot.is_rotative

  const tempUsage = useMemo(() => {
    if (!dirty) return []

    return Object.values(dirty).flatMap(day =>
      day.slots.flatMap(slotItem =>
        slotItem.publishers.map(p => ({
          publisher_id: p.publisher_id,
          date: day.date
        }))
      )
    )
  }, [dirty])

  const urlFetch = congregation
    ? `public-witness/schedules/congregation/${congregation?.id}/history`
    : ""

  const { data: history } = useAuthorizedFetch<IAssignmentsHistoryResponse>(urlFetch, {
    allowedRoles: ["ADMIN_CONGREGATION", "PUBLIC_WITNESS_MANAGER"]
  })

  const options = useMemo(
    () => buildPublicWitnessHistoryOptions(publishers, history, "fullName", tempUsage),
    [publishers, history, tempUsage]
  )

  // 🔄 Inicializa com publishers do assignment ou fixos
  useEffect(() => {
    if (!options.length) return

    const hasDirtyForSlot = dirty?.[date]?.slots?.some(s => s.time_slot_id === slot.id)
    if (hasDirtyForSlot) return

    let initialSelected: IPublisher[] = []

    if (assignment?.publishers?.length) {
      initialSelected = assignment.publishers
        .sort((a, b) => a.order - b.order)
        .map(p => options.find(o => o.id === p.publisher.id))
        .filter(Boolean) as IPublisher[]
    } else if (slot.defaultPublishers?.length) {
      initialSelected = slot.defaultPublishers
        .map(dp => options.find(o => o.id === dp.publisher.id))
        .filter(Boolean) as IPublisher[]
    }

    setSelectedPublishers(initialSelected)
  }, [assignment, options, slot.id, slot.defaultPublishers, date, dirty])

  const leaderOfDay = useMemo(() => {
    if (!history?.fieldServiceHistory?.length) return null
    const entry = history.fieldServiceHistory.find(h => h.date === date)
    return entry?.leader_id ?? null
  }, [history, date])

  const updateDirty = (items: IPublisher[]) => {
    setDirty(prev => ({
      ...prev,
      [date]: {
        date,
        slots: [
          ...(prev[date]?.slots ?? []).filter(s => s.time_slot_id !== slot.id),
          {
            time_slot_id: slot.id,
            publishers: items.map((p, index) => ({
              publisher_id: p.id,
              order: index + 1
            }))
          }
        ]
      }
    }))
  }

  const handleChange = (items: IPublisher[]) => {
    if (!isEditable) return
    setSelectedPublishers(items)
    updateDirty(items)
  }

  const handleRemovePublisher = (publisherId: string) => {
    if (!isEditable) return
    const updated = selectedPublishers.filter(p => p.id !== publisherId)
    setSelectedPublishers(updated)
    updateDirty(updated)
  }

  // Nomes dos publicadores que têm preferência por este horário
  const preferredPublishersNames = useMemo(() => {
    if (!slot.preferences?.length) return []
    return slot.preferences
      .map(pref => {
        const pub = publishers.find(p => p.id === pref.publisher_id)
        return pub?.nickname || pub?.fullName
      })
      .filter(Boolean)
  }, [slot.preferences, publishers])

  // Status visual do slot
  const isFilled = selectedPublishers.length >= 2
  const isPartial = selectedPublishers.length === 1

  return (
    <div
      className={`
        flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 border
        ${
          !isEditable
            ? "bg-surface-50 border-surface-300"
            : isFilled
            ? "bg-surface-100 border-green-300/80 shadow-sm"
            : isPartial
            ? "bg-surface-100 border-amber-300/80 shadow-sm"
            : "bg-surface-100 border-surface-300 shadow-sm"
        }
      `}
    >
      {/* Linha de cabeçalho do horário */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-200 text-typography-800 font-semibold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-primary-200" />
            <span>
              {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
            </span>
          </div>

          {slot.is_rotative ? (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              <RefreshCw className="w-3 h-3 text-blue-600" />
              Rodízio
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-surface-200 text-typography-700 font-medium">
              <Lock className="w-3 h-3 text-typography-500" />
              Fixo
            </span>
          )}

          {preferredPublishersNames.length > 0 && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium"
              title={`Preferências para este horário: ${preferredPublishersNames.join(", ")}`}
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-600" />
              {preferredPublishersNames.length}{" "}
              {preferredPublishersNames.length === 1 ? "preferência" : "preferências"}
            </span>
          )}
        </div>

        {/* Status de preenchimento */}
        <div>
          {isFilled ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
              Completo ({selectedPublishers.length}/2)
            </span>
          ) : isPartial ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Incompleto (1/2)
            </span>
          ) : (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
              Vago (0/2)
            </span>
          )}
        </div>
      </div>

      {/* Seleção de publicadores */}
      {isEditable ? (
        <DropdownMulti<IPublisher>
          title="Selecione os publicadores para este horário"
          items={options}
          selectedItems={selectedPublishers}
          handleChange={handleChange}
          itemKey="id"
          labelKey="fullName"
          labelRenderer={p => (p as any).displayLabel}
          border
          full
          textVisible
          searchable
          emptyMessage="Nenhum publicador encontrado"
        />
      ) : (
        <div className="text-xs text-typography-600 italic">
          Horário fixo: publicadores configurados por padrão no arranjo.
        </div>
      )}

      {/* Publicadores selecionados em formato de cartões / tags */}
      {selectedPublishers.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedPublishers.map((p, index) => {
            const totalInOtherSlots = publishersCount?.[p.id] ?? 0
            const duplicatesInThisSlot = selectedPublishers
              .slice(0, index)
              .filter(sp => sp.id === p.id).length
            const hasOtherSlotConflict = totalInOtherSlots > 0 || duplicatesInThisSlot > 0
            const isLeaderOfDay = leaderOfDay === p.id

            const initials = (p.nickname || p.fullName)
              .split(" ")
              .map(n => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()

            return (
              <div
                key={p.id + index}
                className={`
                  flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs
                  ${
                    isLeaderOfDay
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : hasOtherSlotConflict
                      ? "bg-red-50 text-red-800 border-red-300"
                      : "bg-surface-50 text-typography-800 border-surface-300"
                  }
                `}
              >
                <div className="w-5 h-5 rounded-full bg-primary-100/20 text-primary-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {initials}
                </div>

                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {p.nickname || p.fullName}
                </span>

                {isLeaderOfDay && (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold"
                    title="Este publicador é o dirigente de campo nesta data"
                  >
                    Dirigente
                  </span>
                )}

                {hasOtherSlotConflict && (
                  <span
                    className="flex items-center text-red-600"
                    title="Conflito: publicador designado mais de uma vez nesta data"
                  >
                    <AlertCircleIcon className="w-3.5 h-3.5" />
                  </span>
                )}

                {isEditable && (
                  <button
                    type="button"
                    onClick={() => handleRemovePublisher(p.id)}
                    className="text-typography-400 hover:text-red-500 transition-colors ml-1 p-0.5 rounded hover:bg-surface-200"
                    title="Remover deste horário"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
