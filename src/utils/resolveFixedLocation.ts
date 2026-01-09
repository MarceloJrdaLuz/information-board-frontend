import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
import { FieldServiceFixedSchedule } from "@/types/fieldService"

dayjs.extend(isoWeek)

export function resolveFixedLocation(
  item: FieldServiceFixedSchedule
): {
  location: string
  weekStart: string
  date: string
  isOverride: boolean
} {
  const weekStart = dayjs().startOf("isoWeek")
  const weekStartStr = weekStart.format("YYYY-MM-DD")

  const override = item.locationOverrides?.find(
    o => o.weekStart === weekStartStr
  )

  const location =
    item.locationRotation && override
      ? override.location
      : item.location

  return {
    location,
    weekStart: weekStartStr,
    date: weekStart.day(item.weekdayIndex).format("YYYY-MM-DD"),
    isOverride: Boolean(override),
  }
}
