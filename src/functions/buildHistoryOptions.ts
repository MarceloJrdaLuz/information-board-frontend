import { IRecordWeekendSchedule } from "@/types/weekendSchedule"
import moment from "moment"

export function buildOptions<T extends { id: string }>(
    people: T[] | undefined | null,
    schedules: Record<string, IRecordWeekendSchedule>,
    roleField: keyof IRecordWeekendSchedule,
    labelKey: keyof T
) {
    if (!people) return []

    const historyMap = new Map<string, string>() // id -> última data

    Object.values(schedules).forEach(s => {
        const personId = s[roleField] as string | undefined
        if (personId) {
            const prevDate = historyMap.get(personId)
            if (!prevDate || new Date(s.date) > new Date(prevDate)) {
                historyMap.set(personId, s.date)
            }
        }
    })

    return people
        .map(p => {
            const lastDate = historyMap.get(p.id)
            return {
                ...p,
                lastDate,
                displayLabel: `${(p as any)[labelKey]} ${lastDate ? `— [${moment(lastDate).format("DD/MM/YYYY")}]` : "— [Nunca]"
                    }`
            }
        })
        .sort((a, b) => {
            if (!a.lastDate) return -1
            if (!b.lastDate) return 1
            return new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime()
        })
}
