import { IPublicWitnessTimeSlot, IPublicWitnessAssignmentPublisher } from "@/types/publicWitness"
import { useAtom } from "jotai"
import { useState } from "react"
import { Listbox } from "@headlessui/react"
import { arrangementScheduleAtom, dirtyScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/types"

interface Props {
  slot: IPublicWitnessTimeSlot
  arrangement_id: string
}

export default function ScheduleCard({ slot, arrangement_id }: Props) {
  const [schedule, setSchedule] = useAtom(arrangementScheduleAtom)
  const [dirty, setDirty] = useAtom(dirtyScheduleAtom)
  const [selectedPublishers, setSelectedPublishers] = useState<IPublicWitnessAssignmentPublisher[]>([])

  const handleAddPublisher = (p: IPublicWitnessAssignmentPublisher) => {
    const updated = [...selectedPublishers, p]
    setSelectedPublishers(updated)
    setDirty(prev => ({ ...prev, [slot.id]: { date: "", slots: [{ time_slot_id: slot.id, publishers: updated }] } }))
  }

  return (
    <div className="p-4 border rounded flex flex-col gap-2">
      <h3 className="font-semibold">{slot.start_time} - {slot.end_time}</h3>

      {slot.defaultPublishers.length > 0 && (
        <div className="text-sm text-gray-600">
          <strong>Fixo:</strong> {slot.defaultPublishers.map(p => p.publisher_id).join(", ")}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {selectedPublishers.map(p => (
          <div key={p.publisher_id} className="flex justify-between">
            <span>{}</span>
          </div>
        ))}

        {/* Exemplo simples de adicionar publisher */}
        <Listbox value={null} onChange={handleAddPublisher}>
          <Listbox.Button className="border p-1 rounded">Adicionar Publisher</Listbox.Button>
          <Listbox.Options>
            {slot.defaultPublishers.map(p => (
              <Listbox.Option key={p.id} value={p}>{p.publisher_id}</Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>
    </div>
  )
}
