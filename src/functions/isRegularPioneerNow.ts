import { IPublisher } from "@/types/types"
import dayjs from "dayjs"

export const isPioneerNow = (publisher: IPublisher, date: Date) => {
    const startPioneer = dayjs(publisher.startPioneer)
    const currentDate = dayjs(date)
    if (!startPioneer.isValid()) {
        return false // Data inválida, não é pioneiro
    }

    if (currentDate.isBefore(startPioneer, 'day')) {
        return false
    }

    return true
}
