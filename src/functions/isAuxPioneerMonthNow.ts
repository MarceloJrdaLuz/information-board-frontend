import { IPublisher } from "@/types/types"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const isAuxPioneerMonthNow = (publisher: IPublisher) => {
    if (!publisher) return false
    const currentDate = dayjs() // Obtém a data atual
    const currentDay = currentDate.date() // Obtém o dia atual do mês
    let targetDate

    // Se estiver até o dia 20 do mês atual, retorna o mês anterior
    if (currentDay <= 20) {
        targetDate = currentDate.subtract(1, 'month')
    } else {
        targetDate = currentDate
    }

    const targetMonth = targetDate.locale("pt-br").format("MMMM")
    const targetYear = targetDate.format("YYYY")

    return isAuxPioneerMonth(publisher, `${targetMonth}-${targetYear}`)
}

const normalizeMonthStr = (str: string) =>
    (str ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-_]+/g, "-")
        .trim()
        .toLowerCase()

const monthNamesNormalized = [
    "janeiro",
    "fevereiro",
    "marco",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro"
]

export const isAuxPioneerMonth = (publisher: IPublisher, monthAndYear: string) => {
    if (!publisher) return false
    const cleanMonthYear = monthAndYear.trim().toLowerCase()

    const parts = cleanMonthYear.split(/[\s\-_]+/)
    if (parts.length < 2) return false
    const mName = parts[0]
    const yNum = parseInt(parts[1], 10)
    if (isNaN(yNum)) return false

    const normalizedMName = normalizeMonthStr(mName)
    const mIdx = monthNamesNormalized.indexOf(normalizedMName)
    if (mIdx === -1) return false

    const targetNormalized = `${monthNamesNormalized[mIdx]}-${yNum}`

    // 1. Verifica pioneerMonths (case-insensitive, sem acentos e hifens flexíveis)
    if (Array.isArray(publisher.pioneerMonths) && publisher.pioneerMonths.length > 0) {
        const found = publisher.pioneerMonths.some(
            (m) => m && normalizeMonthStr(m) === targetNormalized
        )
        if (found) return true
    }

    // 2. Verifica privilegesRelation se existir (apenas registros de Pioneiro Auxiliar com período válido para este mês)
    if (Array.isArray(publisher.privilegesRelation) && publisher.privilegesRelation.length > 0) {
        const targetStart = dayjs(new Date(yNum, mIdx, 1)).startOf("month")
        const targetEnd = dayjs(new Date(yNum, mIdx, 1)).endOf("month")

        const hasRel = publisher.privilegesRelation.some((pr) => {
            const pName = pr.privilege?.name
            const pCode = pr.privilege?.code
            const isAux =
                pName === "Pioneiro Auxiliar" ||
                pName === "Auxiliary Pioneer" ||
                pCode === "AUXILIARY_PIONEER"
            if (!isAux) return false

            const start = pr.startDate ? dayjs(pr.startDate) : null
            const end = pr.endDate ? dayjs(pr.endDate) : null

            // Registro sem data inicial não pode ser considerado válido
            if (!start || !start.isValid()) return false

            if (end && end.isValid()) {
                return (
                    start.isSameOrBefore(targetEnd, "day") &&
                    end.isSameOrAfter(targetStart, "day")
                )
            } else {
                // Se não tem data final, é restrito exclusivamente ao mês da data inicial
                return start.year() === yNum && start.month() === mIdx
            }
        })

        if (hasRel) return true
    }

    return false
}

