import moment from "moment";
import { IRecordHospitalityWeekend } from "@/types/hospitality";

export function buildHospitalityOptions<T extends { id: string; name: string; host?: { fullName: string} | null }>(
  groups: T[] | undefined | null,
  weekends: Record<string, IRecordHospitalityWeekend>
): (T & { displayLabel: string; lastDate?: string })[] {
  if (!groups) return [];

  const completedMap = new Map<string, string>();
  const fallbackMap = new Map<string, string>();

  Object.values(weekends).forEach(w => {
    (w.assignments ?? []).forEach(a => {
      if (!a.group_id) return;

      const prevFallback = fallbackMap.get(a.group_id);
      if (!prevFallback || moment(w.date).isAfter(moment(prevFallback))) {
        fallbackMap.set(a.group_id, w.date);
      }

      if (!a.completed) return;
      const prevCompleted = completedMap.get(a.group_id);
      if (!prevCompleted || moment(w.date).isAfter(moment(prevCompleted))) {
        completedMap.set(a.group_id, w.date);
      }
    });
  });

  return groups.map((g, index) => {
    const lastDate = completedMap.get(g.id) ?? fallbackMap.get(g.id);
    const hostName = g.host?.fullName ? `Anfitrião: ${g.host.fullName}` : "";
    const displayLabel = lastDate
      ? `(${g.name}) ${hostName} — [${moment(lastDate).format("DD/MM/YYYY")}]`
      : `(${g.name}) ${hostName} — [Nunca]`;
    return { ...g, lastDate, displayLabel };
  });
}
