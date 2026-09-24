import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow";
import { ICleaningScheduleResponse } from "@/types/cleaning";
import { WEEKDAYS_PT } from "@/utils/dateUtil";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

dayjs.locale("pt-br");

interface Props {
    schedule: ICleaningScheduleResponse;
}

export default function CleaningScheduleCarousel({ schedule }: Props) {
    const schedules = schedule.schedules;

    // Filtra somente semanas desta semana em diante
    const startOfToday = dayjs().startOf("day");

    const futureSchedules = useMemo(() =>
        schedules.filter(item => dayjs(item.date).isSame(startOfToday, "day") || dayjs(item.date).isAfter(startOfToday)),
        [schedules]
    );

    // Meses únicos no formato YYYY-MM (apenas futuros)
    const months = useMemo(() => {
        const unique = new Set<string>();
        futureSchedules.forEach(item => {
            unique.add(dayjs(item.date).format("YYYY-MM"));
        });
        return Array.from(unique).sort();
    }, [futureSchedules]);

    const [currentIndex, setCurrentIndex] = useState(0);

    // Inicia no mês atual
    useEffect(() => {
        const nowMonth = dayjs().format("YYYY-MM");
        const idx = months.findIndex(m => m >= nowMonth);
        setCurrentIndex(idx >= 0 ? idx : 0);
    }, [months]);

    const currentMonth = months[currentIndex];

    const currentMonthSchedules = useMemo(() =>
        futureSchedules.filter(item =>
            dayjs(item.date).format("YYYY-MM") === currentMonth
        ),
        [futureSchedules, currentMonth]
    );

    if (months.length === 0) return null;

    return (
        <div className="relative w-full flex flex-col gap-4 pb-4">
            {/* Navegação de Meses — mesmo estilo de SchedulesCarousel */}
            <div className="flex justify-between items-center bg-surface-100 p-3 rounded-2xl border border-surface-300 shadow-sm">
                <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                    className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                    title="Mês anterior"
                >
                    <ChevronLeft size={24} />
                </button>

                <h2 className="text-base sm:text-lg font-extrabold text-typography-900 capitalize tracking-tight flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-200" />
                    <span>{capitalizeFirstLetter(dayjs(currentMonth + "-01").format("MMMM YYYY"))}</span>
                </h2>

                <button
                    disabled={currentIndex === months.length - 1}
                    onClick={() => setCurrentIndex(i => Math.min(i + 1, months.length - 1))}
                    className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                    title="Próximo mês"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Cards do mês atual */}
            {currentMonthSchedules.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-typography-400">
                    <CalendarDays className="h-8 w-8 opacity-40" />
                    <span className="text-sm">Nenhuma programação para este mês.</span>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {currentMonthSchedules.map(item => {
                        const publishersDisplay = (item.group?.publishers ?? [])
                            .map(pub => {
                                if (!pub) return "";
                                return (pub.nickname?.trim() || pub.fullName?.trim() || "");
                            })
                            .filter(Boolean);

                        const isCurrentWeek = (() => {
                            const itemDate = dayjs(item.date);
                            const weekStart = dayjs().startOf("isoWeek" as dayjs.OpUnitType);
                            const weekEnd = dayjs().endOf("isoWeek" as dayjs.OpUnitType);
                            return itemDate.isSame(weekStart, "day") || (itemDate.isAfter(weekStart) && itemDate.isBefore(weekEnd)) || itemDate.isSame(weekEnd, "day");
                        })();

                        return (
                            <div
                                key={item.date}
                                className="rounded-2xl border border-surface-300 shadow-sm overflow-hidden bg-surface-100"
                            >
                                {/* Cabeçalho do card — mesmo estilo azul #28456C */}
                                <div className="bg-[#28456C] text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-200">
                                            {dayjs(item.date).format("DD [de] MMMM")} — {WEEKDAYS_PT[item.weekdayName] ?? item.weekdayName}
                                        </span>
                                        {isCurrentWeek && (
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider shadow-xs shrink-0">
                                                Esta Semana
                                            </span>
                                        )}
                                    </div>

                                    {item.group?.name && (
                                        <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-2 self-start sm:self-auto border border-white/10">
                                            <Sparkles className="h-4 w-4 text-blue-200" />
                                            <div className="flex flex-col text-xs">
                                                <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">Grupo</span>
                                                <span className="font-bold text-white">{item.group.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Corpo do card */}
                                <div className="p-4 sm:p-5 flex flex-col gap-3">
                                    {/* Seção de responsáveis */}
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-200/10 border border-primary-200/20">
                                            <Users className="h-4 w-4 text-primary-200 shrink-0" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-primary-200">
                                                Responsáveis
                                            </span>
                                        </div>

                                        {publishersDisplay.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {publishersDisplay.map((name, i) => (
                                                    <span
                                                        key={i}
                                                        className="font-bold text-xs text-typography-900 bg-surface-200/60 px-3 py-1.5 rounded-lg border border-surface-300 shadow-2xs"
                                                    >
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-typography-400 italic">Não definido</span>
                                        )}
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
