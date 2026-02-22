import dayjs from 'dayjs'

export function getWeekPageOfMonth(): number {
  const today = dayjs()

  // Primeiro dia do mês
  const firstDayOfMonth = today.startOf('month')

  // Encontrar a primeira segunda-feira do mês
  let firstMonday = firstDayOfMonth

  while (firstMonday.day() !== 1) {
    firstMonday = firstMonday.add(1, 'day')
  }

  // Se hoje for antes da primeira segunda
  if (today.isBefore(firstMonday)) {
    return 1
  }

  const diffDays = today.diff(firstMonday, 'day')
  const weekNumber = Math.floor(diffDays / 7) + 1

  // Limita entre 1 e 5
  return Math.min(Math.max(weekNumber, 1), 5)
}