import { FieldServiceFixedSchedule } from "@/types/fieldService"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isoWeek)

export function resolveNextFixedLocations(
  item: FieldServiceFixedSchedule,
  count = 5
): {
  location: string
  weekStart: string
  date: string
  isOverride: boolean
}[] {
  const results = []

  const baseWeekStart = dayjs().startOf("isoWeek")

  for (let i = 1; i <= count; i++) {
    const weekStart = baseWeekStart
      .add(i, "week")
      .startOf("isoWeek")

    const weekStartStr = weekStart.format("YYYY-MM-DD")

    const override = item.locationOverrides?.find(
      o => o.weekStart === weekStartStr
    )

    const location =
      item.locationRotation && override
        ? override.location
        : item.location

    results.push({
      location,
      weekStart: weekStartStr,
      date: weekStart.day(item.weekdayIndex).format("YYYY-MM-DD"),
      isOverride: Boolean(override),
    })
  }

  return results
}
