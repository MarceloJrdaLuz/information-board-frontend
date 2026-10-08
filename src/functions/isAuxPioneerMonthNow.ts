import { IPublisher } from "@/types/types"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const isAuxPioneerMonthNow = (publisher: IPublisher) => {
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

    // Verifica se o publisher tem o privilégio "Pioneiro Auxiliar" no mês alvo
    if (publisher.pioneerMonths) {
        return publisher.pioneerMonths.includes(`${capitalizeFirstLetter(targetMonth)}-${targetYear}`)
    }

    return false
}

export const isAuxPioneerMonth = (publisher: IPublisher, monthAndYear: string) => {
    if (!publisher) return false
    const cleanMonthYear = monthAndYear.trim().toLowerCase()

    // 1. Verifica pioneerMonths (case-insensitive)
    if (Array.isArray(publisher.pioneerMonths)) {
        const found = publisher.pioneerMonths.some(
            (m) => m && m.trim().toLowerCase() === cleanMonthYear
        )
        if (found) return true
    }

    // 2. Verifica privilegesRelation se existir
    if (Array.isArray(publisher.privilegesRelation)) {
        const parts = cleanMonthYear.split(/[\s\-_]+/)
        if (parts.length >= 2) {
            const mName = parts[0]
            const yNum = parseInt(parts[1], 10)
            const monthNames = [
                "janeiro",
                "fevereiro",
                "março",
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
            let mIdx = monthNames.indexOf(mName)
            if (mIdx === 3 && mName === "marco") mIdx = 2
            if (mIdx >= 0 && !isNaN(yNum)) {
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

                    if (start && start.isValid() && start.isAfter(targetEnd, "day")) {
                        return false
                    }
                    if (end && end.isValid() && end.isBefore(targetStart, "day")) {
                        return false
                    }
                    return true
                })

                if (hasRel) return true
            }
        }
    }

    return false
}

