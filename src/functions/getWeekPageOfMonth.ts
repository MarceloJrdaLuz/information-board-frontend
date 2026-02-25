import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

export function getWeekPageOfMonth(pdfMonth: number) {
  const today = dayjs()
  const year = today.year()

  const firstDayOfPdfMonth = dayjs(new Date(year, pdfMonth, 1))

  let firstMonday = firstDayOfPdfMonth.startOf('isoWeek')

  if (firstMonday.month() !== pdfMonth) {
    firstMonday = firstMonday.add(1, 'week')
  }

  const currentMonday = today.startOf('isoWeek')
  const currentSunday = currentMonday.add(6, 'day')

  // 👇 VERDADEIRO controle
  const weekBelongsToPdfMonth =
    currentMonday.month() === pdfMonth

  if (!weekBelongsToPdfMonth) {
    return { page: 1, isCurrentWeek: false }
  }

  const diffWeeks = currentMonday.diff(firstMonday, 'week')

  return {
    page: Math.min(diffWeeks + 1, 5),
    isCurrentWeek: true,
  }
}