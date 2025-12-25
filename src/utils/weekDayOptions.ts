import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"

export const WEEKDAY_OPTIONS = Object.values(Weekday)
  .filter((v) => typeof v === "number")
  .map((weekday) => ({
    value: weekday as number,
    label: WEEKDAY_LABEL[weekday as Weekday],
  }))
