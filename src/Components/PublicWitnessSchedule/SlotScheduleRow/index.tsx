import { useEffect, useState } from "react"
import { useAtom } from "jotai"

import DropdownMulti from "@/Components/DropdownMulti"
import { dirtyMonthScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { IPublicWitnessTimeSlot } from "@/types/publicWitness"
import { IPublisher } from "@/types/types"

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
}

export default function SlotScheduleRow({ date, slot, publishers, assignment }: Props) {
  const [, setDirty] = useAtom(dirtyMonthScheduleAtom)
  const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([])
  const isEditable = slot.is_rotative


  // 🔄 Inicializa com publishers fixos
  useEffect(() => {
    if (assignment?.publishers?.length) {
      const selected = assignment.publishers
        .sort((a, b) => a.order - b.order)
        .map(p =>
          publishers.find(pub => pub.id === p.publisher.id)
        )
        .filter(Boolean) as IPublisher[]

      setSelectedPublishers(selected)
      return
    }

    if (slot.defaultPublishers?.length) {
      const selected = slot.defaultPublishers
        .map(dp => publishers.find(pub => pub.id === dp.publisher.id))
        .filter(Boolean) as IPublisher[]

      setSelectedPublishers(selected)
    }
  }, [assignment, slot.defaultPublishers, publishers])

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
        items={publishers}
        selectedItems={selectedPublishers}
        handleChange={handleChange}
        labelKey="fullName"
        border
        full
        textVisible
        searchable
        emptyMessage="Nenhum publicador encontrado"
      />}

      {selectedPublishers.length > 0 && (
        <div className="mt-2 text-sm text-typography-600">
          <strong>Selecionados:</strong> {selectedPublishers.map(p => p.fullName).join(", ")}
        </div>
      )}
    </div>
  )
}
