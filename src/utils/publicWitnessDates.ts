import dayjs from "dayjs"

export function getDatesForMonth(
  monthOffset: number,
  weekday?: number
): string[] {
  const base = dayjs().add(monthOffset, "month").startOf("month")
  const end = base.endOf("month")

  const dates: string[] = []

  let current = base
  while (current.isBefore(end) || current.isSame(end)) {
    if (weekday === undefined || current.day() === weekday) {
      dates.push(current.format("YYYY-MM-DD"))
    }
    current = current.add(1, "day")
  }

  return dates
}
