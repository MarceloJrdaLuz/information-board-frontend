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
import { AlertCircleIcon } from "lucide-react"

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
  const [, setDirty] = useAtom(dirtyMonthScheduleAtom)
  const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([])
  const isEditable = slot.is_rotative

  const urlFetch = congregation ? `public-witness/schedules/congregation/${congregation?.id}/history`
    : ""

  const { data: history } = useAuthorizedFetch<IAssignmentsHistoryResponse>(
    urlFetch,
    { allowedRoles: ["ADMIN_CONGREGATION", "PUBLIC_WITNESS_MANAGER"] }
  )

  const options = useMemo(
    () => buildPublicWitnessHistoryOptions(publishers, history, "fullName"),
    [publishers, history]
  )

  // 🔄 Inicializa com publishers fixos
  useEffect(() => {
    if (assignment?.publishers?.length) {
      const selected = assignment.publishers
        .sort((a, b) => a.order - b.order)
        .map(p => {
          const pub = publishers.find(pub => pub.id === p.publisher.id)
          if (!pub) return null

          // 🟢 Aqui criamos o displayLabel igual ao options
          const option = options.find(o => o.id === pub.id)
          return option || pub
        })
        .filter(Boolean) as (IPublisher & { displayLabel: string })[]

      setSelectedPublishers(selected)
      return
    }

    if (slot.defaultPublishers?.length) {
      const selected = slot.defaultPublishers
        .map(dp => {
          const pub = publishers.find(pub => pub.id === dp.publisher.id)
          if (!pub) return null

          const option = options.find(o => o.id === pub.id)
          return option || pub
        })
        .filter(Boolean) as (IPublisher & { displayLabel: string })[]

      setSelectedPublishers(selected)
    }
  }, [assignment, slot.defaultPublishers, publishers, options])


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


  return (
    <div className="flex flex-col gap-2 border rounded-md p-3">
      <div className="text-sm text-typography-700">
        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
      </div>

      {isEditable && <DropdownMulti<IPublisher>
        title="Selecione os publicadores"
        items={options}
        selectedItems={selectedPublishers}
        handleChange={handleChange}
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
            // Quantidade total do dia EXCETO este slot
            const totalInOtherSlots = (publishersCount?.[p.id] ?? 0)

            // Quantidade deste publicador duplicado dentro deste slot
            const duplicatesInThisSlot = selectedPublishers
              .slice(0, index)
              .filter(sp => sp.id === p.id).length

            const isConflict = totalInOtherSlots > 0 || duplicatesInThisSlot > 0

            return (
              <div key={index}
                className={`flex items-center gap-2 p-2 leading-none rounded ${isConflict ? "bg-red-100 text-red-600 font-semibold" : ""}`}>
                <span
                  title={isConflict ? "Este publicador já está escalado em outro slot hoje" : ""}
                >
                  {p.fullName}
                </span>
                {isConflict && <AlertCircleIcon className="w-4 h-4" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
