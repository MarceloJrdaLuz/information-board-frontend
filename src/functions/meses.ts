import { IReports } from '@/types/types'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(customParseFormat)
dayjs.locale('pt-br')

export const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function DateConverter(opcao: string) {
    const mesCapturado = new Date().getMonth()
    switch (opcao) {
        case 'mes': return meses[mesCapturado]
        case 'mes-1':
            return mesCapturado === 0 ? meses[mesCapturado + 11] : meses[mesCapturado - 1]
        case 'mes+1':
            return mesCapturado === 11 ? meses[mesCapturado - 11] : meses[mesCapturado + 1]
    }
}

export function tresMesesProgramacao() {
    const diaHoje = new Date().getDate()
    const diaSemanaAtual = new Date().getDay()
    const segunda = diaHoje - diaSemanaAtual + 1
    return segunda <= 0 ? true : false
}

export function casoJanOuDez(mes: number) {
    return mes === 0 ? 11 : 10
}

export function MesString(mes: number) {
    const diaAtual = new Date().getDate()
    return diaAtual >= 25 ? meses[mes] : meses[mes === 0 || mes === 11 ? casoJanOuDez(mes) : mes - 1]
}

export function getYearService() {
    const dateCurrent = dayjs()
    const currentYear = dateCurrent.month() >= 8 ? dateCurrent.year() + 1 : dateCurrent.year()
    return currentYear
}

export function getMonthsByYear(year: string): { months: string[] } {
    const currentSeptember = dayjs(`09-01-${year}`, 'MM-DD-YYYY')
    const previousSeptember = currentSeptember.subtract(1, 'year')

    const monthsOfYear: string[] = []

    let currentMonth = currentSeptember
    while (currentMonth.isSameOrAfter(previousSeptember) || currentMonth.isSame(previousSeptember, 'month')) {
        if (currentMonth.isBefore(currentSeptember)) {
            monthsOfYear.push(currentMonth.locale('pt-br').format('MMMM YYYY').replace(/^\w/, c => c.toUpperCase()))
        }
        currentMonth = currentMonth.subtract(1, 'month')
    }

    return {
        months: monthsOfYear.reverse(),
    }
}

export function obterUltimosMeses(): { anoCorrente: string[], anoAnterior: string[] } {
    const dataAtual = dayjs()
    const anoCorrente = dataAtual.month() >= 8 ? dataAtual.year() : dataAtual.year() - 1
    const setembroCorrente = dayjs(`09-01-${anoCorrente}`, 'MM-DD-YYYY')
    const setembroAnterior = setembroCorrente.subtract(1, 'year')

    const mesesAnoCorrente: string[] = []
    const mesesAnoAnterior: string[] = []

    let mesAtual = dataAtual
    while (mesAtual.isAfter(setembroCorrente) || mesAtual.isSame(setembroCorrente, 'month')) {
        mesesAnoCorrente.push(mesAtual.locale('pt-br').format('MMMM YYYY'))
        mesAtual = mesAtual.subtract(1, 'month')
    }

    let mesAnterior = setembroCorrente.subtract(1, 'month')
    while (mesAnterior.isAfter(setembroAnterior) || mesAnterior.isSame(setembroAnterior, 'month')) {
        mesesAnoAnterior.push(mesAnterior.locale('pt-br').format('MMMM YYYY'))
        mesAnterior = mesAnterior.subtract(1, 'month')
    }

    return {
        anoCorrente: mesesAnoCorrente,
        anoAnterior: mesesAnoAnterior
    }
}

export function getMonthsPast(yearService: string): string[] {
    const currentDate = dayjs()
    const serviceStartYear = parseInt(yearService) - 1
    const serviceStartDate = dayjs(`09-01-${serviceStartYear}`, 'MM-DD-YYYY')
    const serviceEndDate = serviceStartDate.add(1, 'year').subtract(1, 'day')

    const months: string[] = []
    let monthPointer = serviceStartDate

    const adjustedCurrentDate = currentDate.subtract(1, 'month')

    while (monthPointer.isSameOrBefore(serviceEndDate) && monthPointer.isSameOrBefore(adjustedCurrentDate, 'month')) {
        months.push(monthPointer.locale('pt-br').format('MMMM YYYY'))
        monthPointer = monthPointer.add(1, 'month')
    }
    return months
}

export function filterReportsByServiceYear(
  reports: IReports[],
  year: string
): IReports[] {
  const validMonths = getMonthsByYear(year).months.map(m =>
    m.toLowerCase()
  )

  const validSet = new Set(validMonths)

  return reports.filter(report => {
    const reportMonth = report.month.toLowerCase().trim()
    return validSet.has(reportMonth)
  })
}
