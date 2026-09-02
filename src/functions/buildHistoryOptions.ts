import { IRecordWeekendSchedule } from "@/types/weekendSchedule"
import dayjs from "dayjs"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
dayjs.extend(isSameOrBefore)

export interface RelativeTimeInfo {
    relativeText: string
    formattedDate: string | null
    fullLabel: string
}

/**
 * Retorna uma formatação humanizada de tempo relativo decorrido.
 * Exemplos:
 *  - "há 14 dias" (se < 30 dias)
 *  - "há 3 meses" (se < 12 meses)
 *  - "há 1 ano" ou "há 2 anos e 3 meses" (se >= 1 ano)
 *  - "Nunca" (se não houver data)
 */
export function formatRelativeTime(
    dateStr: string | null | undefined,
    referenceDateStr?: string,
    neverLabel: string = "Nunca"
): RelativeTimeInfo {
    if (!dateStr) {
        return {
            relativeText: neverLabel,
            formattedDate: null,
            fullLabel: `— [${neverLabel}]`
        }
    }

    const past = dayjs(dateStr).startOf("day")
    const ref = referenceDateStr ? dayjs(referenceDateStr).startOf("day") : dayjs().startOf("day")
    const formattedDate = past.format("DD/MM/YYYY")

    const diffDays = Math.max(0, ref.diff(past, "day"))
    const diffMonths = Math.max(0, ref.diff(past, "month"))
    const diffYears = Math.max(0, ref.diff(past, "year"))

    let relativeText = ""

    if (diffDays === 0) {
        relativeText = "nesta semana"
    } else if (diffDays === 1) {
        relativeText = "há 1 dia"
    } else if (diffDays < 30) {
        relativeText = `há ${diffDays} dias`
    } else if (diffMonths < 12) {
        relativeText = diffMonths === 1 ? "há 1 mês" : `há ${diffMonths} meses`
    } else {
        const remainingMonths = diffMonths % 12
        const yearText = diffYears === 1 ? "1 ano" : `${diffYears} anos`
        if (remainingMonths > 0) {
            const monthText = remainingMonths === 1 ? "1 mês" : `${remainingMonths} meses`
            relativeText = `há ${yearText} e ${monthText}`
        } else {
            relativeText = `há ${yearText}`
        }
    }

    return {
        relativeText,
        formattedDate,
        fullLabel: `— [${relativeText} • ${formattedDate}]`
    }
}

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
            const info = formatRelativeTime(lastDate, limitDate)
            return {
                ...p,
                lastDate,
                relativeText: info.relativeText,
                formattedDate: info.formattedDate,
                displayLabel: `${(p as any)[labelKey]} ${info.fullLabel}`
            }
        })
        .sort((a, b) => {
            if (!a.lastDate) return -1
            if (!b.lastDate) return 1
            return dayjs(a.lastDate).valueOf() - dayjs(b.lastDate).valueOf()
        })
}
