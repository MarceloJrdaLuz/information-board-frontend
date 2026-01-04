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
import { AlertCircleIcon, CrownIcon } from "lucide-react"

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

export default function SlotScheduleRow({ date, slot, publishers, assignment, publishersCount }: Props) {
  const { congregation } = useCongregationContext()
  const [dirty, setDirty] = useAtom(dirtyMonthScheduleAtom)
  const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([])
  const isEditable = slot.is_rotative

  const tempUsage = useMemo(() => {
    if (!dirty) return []

    return Object.values(dirty).flatMap(day =>
      day.slots.flatMap(slot =>
        slot.publishers.map(p => ({
          publisher_id: p.publisher_id,
          date: day.date,
        }))
      )
    )
  }, [dirty])


  const urlFetch = congregation ? `public-witness/schedules/congregation/${congregation?.id}/history`
    : ""

  const { data: history } = useAuthorizedFetch<IAssignmentsHistoryResponse>(
    urlFetch,
    { allowedRoles: ["ADMIN_CONGREGATION", "PUBLIC_WITNESS_MANAGER"] }
  )

  const options = useMemo(
    () =>
      buildPublicWitnessHistoryOptions(
        publishers,
        history,
        "fullName",
        tempUsage
      ),
    [publishers, history, tempUsage]
  )


  // 🔄 Inicializa com publishers fixos
  useEffect(() => {
    if (!options.length) return

    // se já existe dirty para este slot, NÃO sobrescreve
    const hasDirtyForSlot =
      dirty?.[date]?.slots?.some(s => s.time_slot_id === slot.id)

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
  }, [
    assignment,
    options,
    slot.id,
    slot.defaultPublishers,
    date,
    dirty
  ])

  const leaderOfDay = useMemo(() => {
    if (!history?.fieldServiceHistory?.length) return null

    const entry = history.fieldServiceHistory.find(
      h => h.date === date
    )

    return entry?.leader_id ?? null
  }, [history, date])

  const handleChange = (items: IPublisher[]) => {
    if (!isEditable) return
    setSelectedPublishers(items)

    setDirty(prev => ({
      ...prev,
      [date]: {
        date,
        slots: [
          ...(prev[date]?.slots ?? []).filter(
            s => s.time_slot_id !== slot.id
          ),
          {
            time_slot_id: slot.id,
            publishers: items.map((p, index) => ({
              publisher_id: p.id,
              order: index + 1,
            })),
          },
        ],
      },
    }))
  }

  let borderColor = "border-l-4 border-red-500"

  if (selectedPublishers.length === 1) {
    borderColor = "border-l-4 border-yellow-500"
  } else if (selectedPublishers.length >= 2) {
    borderColor = "border-l-4 border-green-500"
  }


  return (
    <div
      className={`
    flex flex-col gap-2 rounded-md p-3
    border 
    ${borderColor}
    transition-colors duration-300
  `}
    >
      <div className="text-sm text-typography-700">
        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
      </div>

      {isEditable && <DropdownMulti<IPublisher>
        title="Selecione os publicadores"
        items={options}
        selectedItems={selectedPublishers}
        handleChange={handleChange}
        itemKey="id"
        labelKey="fullName"
        labelRenderer={(p) => (p as any).displayLabel}
        border
        full
        textVisible
        searchable
        emptyMessage="Nenhum publicador encontrado"
      />}

      {/* Publicadores selecionados */}
      {selectedPublishers.length > 0 && (
        <div className="mt-2 text-sm text-typography-700 flex flex-wrap gap-1">
          {selectedPublishers.map((p, index) => {
            const totalInOtherSlots = publishersCount?.[p.id] ?? 0

            const duplicatesInThisSlot = selectedPublishers
              .slice(0, index)
              .filter(sp => sp.id === p.id).length

            const hasOtherSlotConflict = totalInOtherSlots > 0 || duplicatesInThisSlot > 0
            const isLeaderOfDay = leaderOfDay === p.id

            const className = `
    flex items-center gap-2 p-2 leading-none rounded
    ${isLeaderOfDay
                ? "bg-yellow-50 text-yellow-500 border border-yellow-300 font-semibold"
                : hasOtherSlotConflict
                  ? "bg-red-100 text-red-600 font-semibold"
                  : ""}
  `

            return (
              <div
                key={index}
                className={className}
                title={
                  isLeaderOfDay
                    ? "Este publicador é o dirigente de campo neste dia"
                    : "Conflito de escala"
                }
              >
                <span>
                  {p.nickname || p.fullName}
                </span>

                {isLeaderOfDay && (
                  <>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-600 text-typography-200">
                      Dirigente de Campo
                    </span>
                  </>
                )}

                {!isLeaderOfDay && hasOtherSlotConflict && (
                  <AlertCircleIcon className="w-4 h-4" />
                )}
              </div>
            )
          })}

        </div>
      )}
    </div>
  )
}
