import { IPublisher } from "@/entities/types"
import moment from "moment"
require('moment/locale/pt-br')

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isAuxPioneerMonthNow = (publisher: IPublisher) => {
    const currentDate = moment()// Obtém a data atual
    const currentMonth = currentDate.format("MMMM")
    const currentYear = currentDate.format("YYYY")

    // Verifica se o publisher tem o privilégio "Pioneiro Auxiliar" no mês atual
    if (publisher.pioneerMonths) {
        return publisher.pioneerMonths.includes(`${capitalizeFirstLetter(currentMonth)}-${currentYear}`)
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