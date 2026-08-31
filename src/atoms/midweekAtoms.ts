import { atom } from "jotai";
import { IMidweekSchedule } from "@/types/midweek";
import dayjs from "dayjs";

export const midweekYearAtom = atom<number>(dayjs().year());
export const midweekMonthAtom = atom<number>(dayjs().month() + 1);

export const midweekSchedulesAtom = atom<IMidweekSchedule[]>([]);
export const selectedScheduleIdAtom = atom<string | null>(null);

export const currentScheduleAtom = atom((get) => {
    const schedules = get(midweekSchedulesAtom);
    const selectedId = get(selectedScheduleIdAtom);
    if (!selectedId && schedules.length > 0) {
        return schedules[0];
    }
    return schedules.find(s => s.id === selectedId) || schedules[0] || null;
});

export const isMidweekLoadingAtom = atom<boolean>(false);
