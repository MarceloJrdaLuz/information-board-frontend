import moment from "moment"

export type DayMeetingPublic = "Sexta-feira" | "Sábado" | "Domingo"

export function getWeekendDays(
  monthOffset: number = 0,
  dayMeetingPublic: DayMeetingPublic = "Sábado"
): Date[] {
  const start = moment().startOf("month").add(monthOffset, "months")
  const end = start.clone().endOf("month")

  // Mapeia o nome do dia para o número usado pelo moment
  const dayOfWeekMap: Record<DayMeetingPublic, number> = {
    "Sexta-feira": 5,
    "Sábado": 6,
    "Domingo": 0,
  }

  const targetDay = dayOfWeekMap[dayMeetingPublic]
  const dates: Date[] = []

  // Encontra o primeiro dia correspondente no mês
  let current = start.clone().day(targetDay)

  // Se caiu antes do início do mês, pula para a próxima semana
  if (current.isBefore(start)) {
    current.add(7, "days")
  }

  while (current.isSameOrBefore(end)) {
    dates.push(current.startOf("day").toDate())
    current.add(7, "days")
  }

  return dates
}
