import { FieldServiceFixedSchedule } from "@/types/fieldService"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isoWeek)

export function resolveFixedLocation(
  item: FieldServiceFixedSchedule
): string {
  if (!item.locationRotation || !item.locationOverrides?.length) {
    return item.location
  }

  const currentWeekStart = dayjs().startOf("isoWeek").format("YYYY-MM-DD")

  const override = item.locationOverrides.find(
    o => o.weekStart === currentWeekStart
  )

  return override?.location ?? item.location
}
