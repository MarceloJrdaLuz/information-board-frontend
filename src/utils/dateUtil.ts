import moment from "moment"

export function getSaturdays(monthOffset: number = 0): Date[] {
  const start = moment().startOf("month").add(monthOffset, "months")
  const end = start.clone().endOf("month")

  const saturdays: Date[] = []
  let current = start.clone().day(6) // primeiro sábado do mês

  if (current.isBefore(start)) {
    current.add(7, "days")
  }

  while (current.isBefore(end)) {
    saturdays.push(current.startOf("day").toDate()) // garante hora 00:00:00
    current.add(7, "days")
  }

  return saturdays
}
