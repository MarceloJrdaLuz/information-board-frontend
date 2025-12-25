import dayjs from "dayjs"

export function formatHour(time: string) {
  return dayjs(`2000-01-01 ${time}`).format("HH:mm")
}
