import moment from "moment";
import { IRecordHospitalityWeekend } from "@/types/hospitality";

export function buildHospitalityOptions<
  T extends { id: string; name: string; host?: { fullName: string } | null }
>(
  groups: T[] | undefined | null,
  weekends: Record<string, IRecordHospitalityWeekend>
): (T & { displayLabel: string; lastDate?: string })[] {
  if (!groups) return [];

  const completedMap = new Map<string, string>();
  const fallbackMap = new Map<string, string>();

  // percorre todos os fins de semana e registra a data mais recente de participação
  Object.values(weekends).forEach(w => {
    const wDate = moment(w.date);
    (w.assignments ?? []).forEach(a => {
      if (!a.group_id) return;

      // fallback → data mais recente de qualquer participação
      const prevFallback = fallbackMap.get(a.group_id);
      if (!prevFallback || wDate.isAfter(moment(prevFallback))) {
        fallbackMap.set(a.group_id, w.date);
      }

      // completed → data mais recente de participação concluída
      if (a.completed) {
        const prevCompleted = completedMap.get(a.group_id);
        if (!prevCompleted || wDate.isAfter(moment(prevCompleted))) {
          completedMap.set(a.group_id, w.date);
        }
      }
    });
  });

  // monta lista com as datas
  const groupsWithLabel = groups.map(g => {
    const lastDate = completedMap.get(g.id) ?? fallbackMap.get(g.id);
    const hostName = g.host?.fullName ? ` — Anfitrião: ${g.host.fullName}` : "";
    const displayLabel = `${g.name}${hostName} — [${
      lastDate ? moment(lastDate).format("DD/MM/YYYY") : "Nunca"
    }]`;
    return { ...g, lastDate, displayLabel };
  });

  // ordena: os que nunca participaram primeiro, depois por data mais antiga
  groupsWithLabel.sort((a, b) => {
    if (!a.lastDate && b.lastDate) return -1;
    if (!b.lastDate && a.lastDate) return 1;
    if (!a.lastDate && !b.lastDate) return 0;

    // compara datas antigas primeiro
    return moment(a.lastDate).isBefore(moment(b.lastDate)) ? -1 : 1;
  });

  return groupsWithLabel;
}
