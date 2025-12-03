import { IRecordWeekendSchedule } from "@/types/weekendSchedule"
import dayjs from "dayjs"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
dayjs.extend(isSameOrBefore)

export function buildOptions<T extends { id: string }>(
    people: T[] | undefined | null,
    schedules: Record<string, IRecordWeekendSchedule>,
    roleField: keyof IRecordWeekendSchedule,
    labelKey: keyof T,
    limitDate?: string // <-- opcional
) {
    if (!people) return []

    const historyMap = new Map<string, string>()
    const limit = limitDate ? dayjs(limitDate) : null

    Object.values(schedules).forEach(s => {
        const personId = s[roleField] as string | undefined
        if (!personId) return

        const d = dayjs(s.date)

        // Só faz filtro se limitDate tiver sido passado
        if (limit && !d.isBefore(limit)) return  

        const prevDate = historyMap.get(personId)
        if (!prevDate || d.isAfter(dayjs(prevDate))) {
            historyMap.set(personId, s.date)
        }
    })

    return people
        .map(p => {
            const lastDate = historyMap.get(p.id)
            return {
                ...p,
                lastDate,
                displayLabel:
                    `${(p as any)[labelKey]} ` +
                    `${lastDate ? `— [${dayjs(lastDate).format("DD/MM/YYYY")}]` : "— [Nunca]"}`
            }
        })
        .sort((a, b) => {
            if (!a.lastDate) return -1
            if (!b.lastDate) return 1
            return dayjs(a.lastDate).valueOf() - dayjs(b.lastDate).valueOf()
        })
}
