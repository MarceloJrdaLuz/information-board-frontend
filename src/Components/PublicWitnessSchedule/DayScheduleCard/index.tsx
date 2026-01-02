import { IPublicWitnessArrangement } from "@/types/publicWitness"
import SlotScheduleRow from "../SlotScheduleRow"
import { IPublisher } from "@/types/types"
import { IPublicWitnessAssignment } from "../SlotScheduleRow"

interface Props {
  date: string
  arrangement: IPublicWitnessArrangement
  publishers: IPublisher[]
  assignmentsBySlot?: Record<string, IPublicWitnessAssignment>
}

export default function DayScheduleCard({
  date,
  arrangement,
  publishers,
  assignmentsBySlot,
}: Props) {
  return (
    <div className="border rounded-xl p-4 space-y-3 bg-surface-100">
      <h3 className="font-semibold text-primary-200">{date}</h3>

      {arrangement.timeSlots
        .slice() // cria uma cópia do array para não mutar o original
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map(slot => (
          <SlotScheduleRow
            key={slot.id}
            date={date}
            slot={slot}
            publishers={publishers}
            assignment={assignmentsBySlot?.[slot.id]}
          />
        ))}

    </div>
  )
}
