import { IPublicWitnessArrangement } from "@/types/publicWitness"
import SlotScheduleRow from "../SlotScheduleRow"
import { IPublisher } from "@/types/types"
import { IPublicWitnessAssignment } from "../SlotScheduleRow"
import { IFieldServiceException } from "@/types/fieldService"
import { useMemo } from "react"
import { useAtom } from "jotai"
import { dirtyMonthScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import dayjs from "dayjs"

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

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-surface-100">
      <h3 className="font-semibold text-primary-200">{dayjs(date).format("DD/MM/YYYY")}</h3>
      {todaysExceptions.length > 0 && (
        <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
          {todaysExceptions.map(ex => ex.reason).join(", ")}
        </div>
      )}
      {
        arrangement.timeSlots
          .slice()
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map(slot => {
            // Cria um publishersCount excluindo o slot atual
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
          })

      }

    </div>
  )
}
