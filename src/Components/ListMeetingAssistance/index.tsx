import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow";
import { getMonthsByYear } from "@/functions/meses";
import { IMeetingAssistance } from "@/types/types";
import {
    CalendarDays,
    FileText,
    TrendingUp,
    Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { IListItemsProps } from "./types";

function ListMeetingAssistance({ items, yearService }: IListItemsProps) {
    const months = useMemo(() => getMonthsByYear(yearService).months, [yearService]);
    const [filteredByYearService, setFilteredByYearService] = useState<IMeetingAssistance[]>([]);

    useEffect(() => {
        const filteredItems: IMeetingAssistance[] = months.reduce(
            (acc: IMeetingAssistance[], month) => {
                const found = items?.find(
                    (item) =>
                        item.month.toLowerCase() === month.split(" ")[0].toLowerCase() &&
                        item.year.toString() === month.split(" ")[1]
                );
                if (found) {
                    acc.push(found);
                }
                return acc;
            },
            []
        );
        setFilteredByYearService(filteredItems);
    }, [items, months]);

    if (!filteredByYearService || filteredByYearService.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                <FileText className="w-12 h-12 text-typography-400 mb-3" />
                <h3 className="text-base font-semibold text-typography-700">
                    Nenhum registro de assistência encontrado
                </h3>
                <p className="text-sm text-typography-500 mt-1 max-w-md">
                    Não há registros de assistência às reuniões para o ano de serviço {yearService}.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredByYearService.map((item) => (
                <div
                    key={item.id}
                    className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200"
                >
                    <div>
                        {/* Header do Mês */}
                        <div className="flex items-center gap-3 pb-3 border-b border-surface-300">
                            <div className="flex flex-col items-center justify-center w-11 h-11 bg-primary-200/10 text-primary-200  rounded-xl font-bold border border-primary-200/20 shrink-0">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-typography-800">
                                    {item.month} de {item.year}
                                </h3>
                                <span className="text-xs text-typography-400 text-typography-500 font-medium">
                                    Ano de serviço {yearService}
                                </span>
                            </div>
                        </div>

                        {/* Blocos de Assistência: Meio de Semana e Fim de Semana */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {/* Meio de Semana */}
                            <div className="p-3.5 rounded-xl bg-primary-200/5 dark:bg-primary-200/10 border border-primary-200/15 space-y-2">
                                <div className="text-xs font-bold text-primary-200 uppercase tracking-wide truncate">
                                    Meio de Semana
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-typography-500">Total:</span>
                                        <span className="font-bold text-typography-800">
                                            {item.midWeekTotal}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-typography-500">Média:</span>
                                        <span className="font-bold text-primary-200 text-sm">
                                            {item.midWeekAverage}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Fim de Semana */}
                            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/40 space-y-2">
                                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide truncate">
                                    Fim de Semana
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-typography-500">Total:</span>
                                        <span className="font-bold text-typography-800">
                                            {item.endWeekTotal}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-typography-500">Média:</span>
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                                            {item.endWeekAverage}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ListMeetingAssistance;
