import { ITalk } from "@/types/types"
import { IRecordWeekendSchedule } from "@/types/weekendSchedule"
import dayjs from "dayjs"
import { formatRelativeTime } from "./buildHistoryOptions"

export function buildTalkOptions(
  talks: ITalk[] | undefined,
  schedules: Record<string, IRecordWeekendSchedule>,
  limitDate?: string
) {
  if (!talks) return []

  const historyMap = new Map<string, string>() // talk.id -> última data
  const limit = limitDate ? dayjs(limitDate) : null

  Object.values(schedules).forEach(s => {
    const talkId = s.talk_id
    if (talkId) {
      const d = dayjs(s.date)
      if (limit && !d.isBefore(limit)) return

      const prevDate = historyMap.get(talkId)
      if (!prevDate || d.isAfter(dayjs(prevDate))) {
        historyMap.set(talkId, s.date)
      }
    }
  })

  return talks
    .map(t => {
      const lastDate = historyMap.get(t.id)
      const info = formatRelativeTime(lastDate, limitDate, "Nunca proferido")
      return {
        ...t,
        lastDate,
        relativeText: info.relativeText,
        formattedDate: info.formattedDate,
        displayLabel: `Nº ${t.number} - ${t.title} ${info.fullLabel}`
      }
    })
    .sort((a, b) => {
      if (!a.lastDate) return -1
      if (!b.lastDate) return 1
      return dayjs(a.lastDate).valueOf() - dayjs(b.lastDate).valueOf()
    })
}
