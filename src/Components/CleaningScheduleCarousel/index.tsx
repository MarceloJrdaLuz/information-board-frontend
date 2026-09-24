import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isoWeek from "dayjs/plugin/isoWeek";
import { ICleaningScheduleResponse } from "@/types/cleaning";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Sparkles, Users } from "lucide-react";
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow";
import { WEEKDAYS_PT } from "@/utils/dateUtil";

dayjs.extend(isoWeek);
dayjs.locale("pt-br");

interface Props {
    schedule: ICleaningScheduleResponse;
}

export default function CleaningScheduleCarousel({ schedule }: Props) {
    const schedules = schedule.schedules;

    // Meses únicos no formato YYYY-MM
    const months = useMemo(() => {
        const unique = new Set<string>();
        schedules.forEach(item => {
            unique.add(dayjs(item.date).format("YYYY-MM"));
        });
        return Array.from(unique).sort();
    }, [schedules]);

    const [currentIndex, setCurrentIndex] = useState(0);

    // Inicia preferencialmente no mês atual ou no mais próximo
    useEffect(() => {
        if (months.length > 0) {
            const currentYearMonth = dayjs().format("YYYY-MM");
            const foundIndex = months.findIndex(m => m >= currentYearMonth);
            if (foundIndex !== -1) {
                setCurrentIndex(foundIndex);
            }
        }
    }, [months]);

    const currentMonth = months[currentIndex];

    const currentMonthSchedules = useMemo(() => {
        return schedules
            .filter(item => dayjs(item.date).format("YYYY-MM") === currentMonth)
            .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    }, [schedules, currentMonth]);

    function next() {
        if (currentIndex < months.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }

    function prev() {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }

    if (!schedules || schedules.length === 0) {
        return null;
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Header / Seletor de Meses separado com ícone de calendário */}
            <div className="flex justify-between items-center bg-surface-100 p-3 rounded-2xl border border-surface-300 shadow-sm">
                <button
                    onClick={prev}
                    disabled={currentIndex === 0}
                    className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                    title="Mês anterior"
                >
                    <ChevronLeft size={24} />
                </button>

                <h2 className="text-base sm:text-lg font-extrabold text-typography-900 capitalize tracking-tight flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-200" />
                    <span>{currentMonth ? capitalizeFirstLetter(dayjs(currentMonth + "-01").format("MMMM YYYY")) : "Sem programação"}</span>
                </h2>

                <button
                    onClick={next}
                    disabled={currentIndex === months.length - 1}
                    className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                    title="Próximo mês"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Lista de Cards da Programação */}
            {currentMonthSchedules.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-typography-400 bg-surface-100 rounded-2xl border border-surface-300">
                    <CalendarDays className="h-8 w-8 opacity-40 text-primary-200" />
                    <span className="text-sm font-medium">Nenhuma programação de limpeza para este mês.</span>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {currentMonthSchedules.map(item => {
                        const itemDate = dayjs(item.date);
                        const isCurrentWeek = itemDate.isSame(dayjs(), "isoWeek");
                        const dayFormatted = itemDate.format("DD");
                        const monthFormatted = itemDate.format("MMM").toUpperCase();
                        const weekDayName = WEEKDAYS_PT[item.weekdayName] ?? item.weekdayName;

                        return (
                            <div
                                key={item.date}
                                className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 gap-3"
                            >
                                <div className="space-y-3">
                                    {/* Cabeçalho da Data */}
                                    <div className="flex items-center justify-between pb-3 border-b border-surface-300 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary-200/10 text-primary-200 rounded-xl font-bold border border-primary-200/20 shrink-0">
                                                <span className="text-base leading-none">{dayFormatted}</span>
                                                <span className="text-[10px] tracking-wider uppercase">{monthFormatted}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-primary-200 uppercase tracking-wide">
                                                    {weekDayName}
                                                </span>
                                                <h4 className="text-sm font-bold text-typography-800">
                                                    {itemDate.format("DD [de] MMMM [de] YYYY")}
                                                </h4>
                                            </div>
                                        </div>

                                        {isCurrentWeek && (
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0">
                                                Esta semana
                                            </span>
                                        )}
                                    </div>

                                    {/* Grupo Responsável */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-typography-500 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-primary-200" />
                                            Grupo Responsável:
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20 shadow-2xs">
                                            {item.group.name}
                                        </span>
                                    </div>

                                    {/* Membros / Responsáveis */}
                                    <div className="pt-2 border-t border-surface-300">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-600 mb-2">
                                            <Users className="w-3.5 h-3.5 text-typography-400" />
                                            <span>Responsáveis:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.group.publishers && item.group.publishers.length > 0 ? (
                                                item.group.publishers.map(pub => {
                                                    const name = pub.nickname?.trim() || pub.fullName?.trim() || pub.displayName?.trim();
                                                    if (!name) return null;
                                                    return (
                                                        <span
                                                            key={pub.id}
                                                            className="px-2.5 py-1 rounded-lg text-xs bg-surface-200/70 text-typography-800 border border-surface-300 font-medium"
                                                        >
                                                            {name}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs text-typography-400 italic">
                                                    Nenhum membro vinculado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
