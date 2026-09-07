import dayjs, { Dayjs } from "dayjs"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isoWeek from "dayjs/plugin/isoWeek"

dayjs.extend(isSameOrBefore)
dayjs.extend(isoWeek)

export type DayMeetingPublic = "Sexta-feira" | "Sábado" | "Domingo"

export function getWeekendDays(
  monthOffset: number = 0,
  dayMeetingPublic: DayMeetingPublic = "Sábado"
): Date[] {
  const start = dayjs().startOf("month").add(monthOffset, "month")
  const end = start.endOf("month")

  const dayOfWeekMap: Record<DayMeetingPublic, number> = {
    "Sexta-feira": 5,
    "Sábado": 6,
    "Domingo": 0,
  }

  const targetDay = dayOfWeekMap[dayMeetingPublic]
  const dates: Date[] = []

  let current = start.day(targetDay)

  if (current.isBefore(start)) {
    current = current.add(7, "day")
  }

  while (current.isSameOrBefore(end)) {
    dates.push(current.startOf("day").toDate())
    current = current.add(7, "day")
  }

  return dates
}

export function getWeekendRange(localMeetingDate: Date): { friday: Dayjs; saturday: Dayjs; sunday: Dayjs } {
  const base = dayjs(localMeetingDate)

  const sunday = base.isoWeekday(7)
  const saturday = sunday.subtract(1, "day")
  const friday = sunday.subtract(2, "day")

  return {
    friday,
    saturday,
    sunday,
  }
}

export function getRealDateForDestination(
  destDay: DayMeetingPublic,
  localDate: Date
): Dayjs {
  const weekend = getWeekendRange(localDate)

  const map: Record<DayMeetingPublic, Dayjs> = {
    "Sexta-feira": weekend.friday,
    "Sábado": weekend.saturday,
    "Domingo": weekend.sunday,
  }

  return map[destDay]
}

export const WEEKDAYS_PT: Record<string, string> = {
  Sunday: "Domingo",
  Monday: "Segunda-feira",
  Tuesday: "Terça-feira",
  Wednesday: "Quarta-feira",
  Thursday: "Quinta-feira",
  Friday: "Sexta-feira",
  Saturday: "Sábado"
}
