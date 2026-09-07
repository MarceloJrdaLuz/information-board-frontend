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
    // Verifica se o publisher tem o privilégio "Pioneiro Auxiliar" no mês atual
    if (publisher.pioneerMonths) {
        return publisher.pioneerMonths.includes(`${monthAndYear}`)
    }
    return false
}
