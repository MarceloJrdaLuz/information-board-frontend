import { IAssignmentsHistoryResponse } from "@/types/publicWitness/schedules"
import { IPublisher } from "@/types/types"
import dayjs from "dayjs"

interface IPublisherOption extends IPublisher {
  lastDate?: string
  displayLabel: string
}

export function buildPublicWitnessHistoryOptions(
  publishers: IPublisher[],
  history: IAssignmentsHistoryResponse | undefined,
  labelKey: keyof IPublisher
): IPublisherOption[] {
  const historyMap = new Map<string, string>()

  // Mapear a última vez que cada publisher foi usado
  history?.history.forEach(arrangement => {
    arrangement.schedule.forEach(day => {
      day.slots.forEach(slot => {
        slot.publishers.forEach(p => {
          const prevDate = historyMap.get(p.id)
          if (!prevDate || dayjs(day.date).isAfter(dayjs(prevDate))) {
            historyMap.set(p.id, day.date)
          }
        })
      })
    })
  })

  return publishers
    .map(p => {
      const lastDate = historyMap.get(p.id)
      return {
        ...p,
        lastDate,
        displayLabel: `${p[labelKey]} ${lastDate ? `— [${dayjs(lastDate).format("DD/MM/YYYY")}]` : "— [Nunca]"}`,
      }
    })
    .sort((a, b) => {
      if (!a.lastDate) return -1
      if (!b.lastDate) return 1
      return dayjs(a.lastDate).valueOf() - dayjs(b.lastDate).valueOf()
    })
}
