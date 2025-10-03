import { ITalk } from "@/types/types"
import { IRecordWeekendSchedule } from "@/types/weekendSchedule"
import moment from "moment"

export function buildTalkOptions(
  talks: ITalk[] | undefined,
  schedules: Record<string, IRecordWeekendSchedule>
) {
  if (!talks) return []

  const historyMap = new Map<string, string>() // talk.id -> última data

  Object.values(schedules).forEach(s => {
    const talkId = s.talk_id
    if (talkId) {
      const prevDate = historyMap.get(talkId)
      if (!prevDate || new Date(s.date) > new Date(prevDate)) {
        historyMap.set(talkId, s.date)
      }
    }
  })

  return talks
    .map(t => {
      const lastDate = historyMap.get(t.id)
      return {
        ...t,
        lastDate,
        displayLabel: `${t.title} ${
          lastDate ? `— [${moment(lastDate).format("DD/MM/YYYY")}]` : "— [Sem histórico]"
        }`
      }
    })
    .sort((a, b) => {
      if (!a.lastDate) return -1
      if (!b.lastDate) return 1
      return new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime()
    })
}
