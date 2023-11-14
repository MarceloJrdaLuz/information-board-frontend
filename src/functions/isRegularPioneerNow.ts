import { IPublisher } from "@/entities/types"
import moment from "moment"
require('moment/locale/pt-br')


export const isPioneerNow = (publisher: IPublisher, date: Date) => {
    const startPioneer = moment(publisher.startPioneer);
    const currentDate = moment(date);
    if (!startPioneer.isValid()) {
        return false; // Data inválida, não é pioneiro
    }

    if(currentDate.isBefore(startPioneer, 'day')){
        return false
    }

    return true
}
