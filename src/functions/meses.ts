import { IReports } from '@/entities/types'
import moment from 'moment'
require('moment/locale/pt-br')

export const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']


export default function DateConverter(opcao: string) {

    // essa funcao recebe como parametro 3 opcoes que podem ser mes (mes atual), mes-1 (mes anterior) ou mes +1 (mes Seguinte)
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

    //Essa funcao é chamada pra reconhecer se a programacao deve exibir tres meses.

    const diaHoje = new Date().getDate()
    const diaSemanaAtual = new Date().getDay()
    const segunda = diaHoje - diaSemanaAtual + 1
    return segunda <= 0 ? true : false
}

export function casoJanOuDez(mes: number) {
    // recebe um mes que será 0 ou 11, se for mes 0 (janeiro) ele retorna o mes de dezembro (11) caso for 11 ele retorna o mes de janeiro (0)
    return mes === 0 ? 11 : 10
}

export function MesString(mes: number) {
    // Capturar o dia atual pra ver se passou do dia 25, se for entâo se entende que ela está preenchendo o relatório do mes atual, do contrario se refere ao mes anterior.
    const diaAtual = new Date().getDate()

    return diaAtual >= 25 ? meses[mes] : meses[mes === 0 || mes === 11 ? casoJanOuDez(mes) : mes - 1] //caso o mes atual for dezembro ou janeiro caem num caso diferente de mes ou mes -1, então é chamada a função pra esse caso.
}

export function getYearService() {
    moment.locale('pt-br') // Set the locale to English
    const dateCurrent = moment()
    const currentYear = dateCurrent.month() >= 8 ? dateCurrent.year() + 1 : dateCurrent.year()
    return currentYear
}

export function getMonthsByYear(year: string): { months: string[] } {
    moment.locale('pt-br') // Set the locale to English
    const currentSeptember = moment(`09-01-${year}`, 'MM-DD-YYYY')
    const previousSeptember = currentSeptember.clone().subtract(1, 'year')

    const monthsOfYear: string[] = []

    let currentMonth = currentSeptember.clone()
    while (currentMonth.isSameOrAfter(previousSeptember) || currentMonth.isSame(previousSeptember, 'month')) {
        if (currentMonth.isBefore(currentSeptember)) {
            monthsOfYear.push(currentMonth.format('MMMM YYYY').replace(/^\w/, c => c.toUpperCase()))
        }
        currentMonth.subtract(1, 'month')
    }

    return {
        months: monthsOfYear.reverse(),
    }
}

export function obterUltimosMeses(): { anoCorrente: string[], anoAnterior: string[] } {
    moment.locale('pt-br')
    const dataAtual = moment()
    const anoCorrente = dataAtual.month() >= 8 ? dataAtual.year() : dataAtual.year() - 1
    const setembroCorrente = moment(`09-01-${anoCorrente}`, 'MM-DD-YYYY')
    const setembroAnterior = setembroCorrente.clone().subtract(1, 'year')

    const mesesAnoCorrente: string[] = []
    const mesesAnoAnterior: string[] = []

    let mesAtual = dataAtual.clone()
    while (mesAtual.isAfter(setembroCorrente) || mesAtual.isSame(setembroCorrente, 'month')) {
        mesesAnoCorrente.push(mesAtual.format('MMMM YYYY'))
        mesAtual.subtract(1, 'month')
    }

    let mesAnterior = setembroCorrente.clone().subtract(1, 'month')
    while (mesAnterior.isAfter(setembroAnterior) || mesAnterior.isSame(setembroAnterior, 'month')) {
        mesesAnoAnterior.push(mesAnterior.format('MMMM YYYY'))
        mesAnterior.subtract(1, 'month')
    }

    return {
        anoCorrente: mesesAnoCorrente,
        anoAnterior: mesesAnoAnterior
    }
}

export function getMonthsPast(yearService: string): string[] {
    moment.locale('pt-br') // Define o idioma para português
    const currentDate = moment() // Data atual
    const serviceStartYear = parseInt(yearService) - 1 // Ano inicial do ano de serviço
    const serviceStartDate = moment(`09-01-${serviceStartYear}`, 'MM-DD-YYYY') // Setembro do ano inicial
    const serviceEndDate = serviceStartDate.clone().add(1, 'year').subtract(1, 'day') // Até agosto do próximo ano

    const months: string[] = []
    let monthPointer = serviceStartDate.clone()

    // Ajusta a data atual para o mês anterior
    const adjustedCurrentDate = currentDate.clone().subtract(1, 'month')

    // Enquanto o ponteiro de meses estiver no intervalo do ano de serviço e não passar do mês ajustado
    while (monthPointer.isSameOrBefore(serviceEndDate) && monthPointer.isSameOrBefore(adjustedCurrentDate, 'month')) {
        months.push(monthPointer.format('MMMM YYYY'))
        monthPointer.add(1, 'month') // Incrementa para o próximo mês
    }
    return months
}

export function filterReportsByServiceYear(
  reports: IReports[],
  year: string
): IReports[] {
  // meses válidos para o ciclo (ex: ["setembro 2023", "outubro 2023", ..., "agosto 2024"])
  const validMonths = getMonthsByYear(year).months.map(m =>
    m.toLowerCase()
  )

  // cria um set p/ lookup rápido
  const validSet = new Set(validMonths)

  return reports.filter(report => {
    // supondo que `report.month` venha tipo "setembro 2023"
    const reportMonth = report.month.toLowerCase().trim()

    console.log(reportMonth)

    return validSet.has(reportMonth)
  })
}