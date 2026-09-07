import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { ICleaningScheduleResponse } from "@/types/cleaning";
import { CalendarDays, Sparkles, Users } from "lucide-react";
import React from "react";

dayjs.locale("pt-br");

interface Props {
    schedule: ICleaningScheduleResponse;
}

export default function CleaningScheduleTable({ schedule }: Props) {
    if (!schedule.schedules || schedule.schedules.length === 0) {
        return null;
    }

    const sortedSchedules = [...schedule.schedules].sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
    );

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-200" />
                    <h3 className="font-bold text-lg text-typography-800">
                        Escala Semanal de Limpeza
                    </h3>
                </div>
                <span className="text-xs font-semibold text-typography-500 bg-surface-100 px-3 py-1.5 rounded-xl border border-surface-300">
                    {sortedSchedules.length} semanas programadas
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedSchedules.map((item) => {
                    const itemDate = dayjs(item.date);
                    const dayFormatted = itemDate.format("DD");
                    const monthFormatted = itemDate.format("MMM").toUpperCase();
                    const weekDayFormatted = itemDate.format("dddd");

                    return (
                        <div
                            key={item.date}
                            className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="space-y-3">
                                {/* Header da Data */}
                                <div className="flex items-center gap-3 pb-3 border-b border-surface-300">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary-200/10 text-primary-200  rounded-xl font-bold border border-primary-200/20 shrink-0">
                                        <span className="text-base leading-none">{dayFormatted}</span>
                                        <span className="text-[10px] tracking-wider uppercase">{monthFormatted}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-primary-200 uppercase tracking-wide">
                                            {weekDayFormatted}
                                        </span>
                                        <h4 className="text-sm font-bold text-typography-800">
                                            {itemDate.format("DD [de] MMMM [de] YYYY")}
                                        </h4>
                                    </div>
                                </div>

                                {/* Grupo Designado */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-typography-500">
                                            Grupo Responsável:
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20">
                                            {item.group.name}
                                        </span>
                                    </div>

                                    {/* Membros do Grupo */}
                                    <div className="pt-2 border-t border-surface-300">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-600 mb-2">
                                            <Users className="w-3.5 h-3.5 text-typography-400" />
                                            <span>Membros do Grupo:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.group.publishers && item.group.publishers.length > 0 ? (
                                                item.group.publishers.map((pub) => (
                                                    <span
                                                        key={pub.id}
                                                        className="px-2 py-1 rounded-lg text-xs bg-surface-100 text-typography-700 border border-surface-300 font-medium"
                                                    >
                                                        {pub.nickname?.trim() || pub.fullName?.trim()}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-typography-400 italic">
                                                    Nenhum membro vinculado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
