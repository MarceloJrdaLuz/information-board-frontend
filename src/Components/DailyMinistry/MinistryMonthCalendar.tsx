import React, { useMemo } from "react";
import { IPublisherFieldActivity } from "@/types/dailyMinistry";
import dayjs, { Dayjs } from "dayjs";
import { Plus, Clock, Award, BookOpen, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface MinistryMonthCalendarProps {
    currentDate: Dayjs;
    activities: IPublisherFieldActivity[];
    onSelectDay: (dateYMD: string, existingActivity?: IPublisherFieldActivity) => void;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
    onToday?: () => void;
    isLocked?: boolean;
}

const MONTHS_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function MinistryMonthCalendar({
    currentDate,
    activities,
    onSelectDay,
    onPrevMonth,
    onNextMonth,
    onToday,
    isLocked = false
}: MinistryMonthCalendarProps) {
    const year = currentDate.year();
    const month = currentDate.month(); // 0 a 11
    const isCurrentMonthNow = currentDate.isSame(dayjs(), "month");
    const currentMonthLabel = `${MONTHS_NAMES[month]} de ${year}`;

    // Mapear atividades por data YYYY-MM-DD
    const activitiesByDate = useMemo(() => {
        const map: Record<string, IPublisherFieldActivity[]> = {};
        activities.forEach((act) => {
            const dateStr = act.date;
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(act);
        });
        return map;
    }, [activities]);

    const daysGrid = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const items: Array<{
            day: number;
            ymd: string;
            isCurrentMonth: boolean;
            isToday: boolean;
        }> = [];

        const todayYMD = dayjs().format("YYYY-MM-DD");

        // Dias do mês anterior
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const prevDate = currentDate.subtract(1, "month").date(d);
            const ymd = prevDate.format("YYYY-MM-DD");
            items.push({
                day: d,
                ymd,
                isCurrentMonth: false,
                isToday: ymd === todayYMD
            });
        }

        // Dias do mês atual
        for (let d = 1; d <= daysInCurrentMonth; d++) {
            const curDate = currentDate.date(d);
            const ymd = curDate.format("YYYY-MM-DD");
            items.push({
                day: d,
                ymd,
                isCurrentMonth: true,
                isToday: ymd === todayYMD
            });
        }

        // Dias do próximo mês para fechar 35 ou 42 semanas
        const totalCells = items.length <= 35 ? 35 : 42;
        const remaining = totalCells - items.length;
        for (let d = 1; d <= remaining; d++) {
            const nextDate = currentDate.add(1, "month").date(d);
            const ymd = nextDate.format("YYYY-MM-DD");
            items.push({
                day: d,
                ymd,
                isCurrentMonth: false,
                isToday: ymd === todayYMD
            });
        }

        return items;
    }, [year, month, currentDate]);

    const formatMinutesBadge = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h${m}`;
    };

    return (
        <div className="w-full bg-surface-100 rounded-2xl border border-surface-300 shadow-sm p-3 sm:p-5 flex flex-col gap-2.5 sm:gap-3.5">
            {/* Barra de Navegação do Mês no Próprio Calendário */}
            <div className="flex items-center justify-between gap-2 border-b border-surface-300/70 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                        <CalendarDays className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <span className="text-xs sm:text-base font-bold text-typography-900 truncate select-none">
                        {currentMonthLabel}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 bg-surface-200/70 p-1 rounded-xl border border-surface-300/80">
                    {onToday && !isCurrentMonthNow && (
                        <button
                            type="button"
                            onClick={onToday}
                            className="px-2 sm:px-2.5 py-1 text-[11px] font-bold text-primary-200 hover:bg-primary-200/10 rounded-lg transition-colors cursor-pointer select-none"
                            title="Ir para o mês atual"
                        >
                            Hoje
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onPrevMonth}
                        className="p-1 sm:p-1.5 rounded-lg text-typography-600 hover:text-typography-900 hover:bg-surface-100 transition-colors cursor-pointer"
                        title="Mês anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onNextMonth}
                        className="p-1 sm:p-1.5 rounded-lg text-typography-600 hover:text-typography-900 hover:bg-surface-100 transition-colors cursor-pointer"
                        title="Próximo mês"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center border-b border-surface-300/60 pb-2">
                {WEEKDAY_NAMES.map((name, idx) => (
                    <span
                        key={name}
                        className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                            idx === 0 || idx === 6 ? "text-primary-200" : "text-typography-500"
                        }`}
                    >
                        {name}
                    </span>
                ))}
            </div>

            {/* Grid dos dias */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {daysGrid.map((item, idx) => {
                    const dayActivities = activitiesByDate[item.ymd] || [];
                    const hasActivities = dayActivities.length > 0;

                    let totalMinistryMinutes = 0;
                    let totalCreditMinutes = 0;
                    let hasStudies = false;

                    dayActivities.forEach((act) => {
                        totalMinistryMinutes += act.minutes || 0;
                        totalCreditMinutes += act.credit_minutes || 0;
                        if (act.bible_student_id || (act.bible_student_ids && act.bible_student_ids.length > 0)) hasStudies = true;
                    });

                    const totalDayMinutes = totalMinistryMinutes + totalCreditMinutes;

                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                if (isLocked && !hasActivities) return;
                                const latest = dayActivities[dayActivities.length - 1];
                                onSelectDay(item.ymd, latest);
                            }}
                            className={`group min-h-[52px] sm:min-h-[82px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border flex flex-col justify-between transition-all select-none ${
                                isLocked && !hasActivities ? "cursor-default" : "cursor-pointer"
                            } ${
                                item.isCurrentMonth
                                    ? "bg-surface-100 hover:border-primary-200 hover:bg-surface-200/50"
                                    : "bg-surface-200/30 opacity-35 hover:opacity-70"
                            } ${
                                item.isToday
                                    ? "ring-2 ring-primary-200/30 border-primary-200"
                                    : "border-surface-300/80"
                            } ${
                                hasActivities
                                    ? "bg-primary-200/5 hover:bg-primary-200/10"
                                    : ""
                            }`}
                        >
                            {/* Número do Dia */}
                            <div className="flex items-center justify-between w-full">
                                <span
                                    className={`text-xs sm:text-sm font-bold flex items-center justify-center ${
                                        item.isToday
                                            ? "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-200 text-white font-black shadow-xs text-[11px] sm:text-xs"
                                            : item.isCurrentMonth
                                            ? "text-typography-900"
                                            : "text-typography-400"
                                    }`}
                                >
                                    {item.day}
                                </span>

                                {!isLocked && (
                                    <Plus className="w-3.5 h-3.5 text-typography-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                                )}
                            </div>

                            {/* Conteúdo no Mobile: Compacto e Legível */}
                            {hasActivities ? (
                                <>
                                    {/* Mobile (< 640px) */}
                                    <div className="flex flex-col items-center gap-0.5 w-full mt-0.5 sm:hidden">
                                        {totalDayMinutes > 0 && (
                                            <span className="text-[9px] font-black leading-tight text-primary-200 bg-primary-200/15 rounded px-1 py-0.2 text-center w-full truncate">
                                                {formatMinutesBadge(totalDayMinutes)}
                                            </span>
                                        )}
                                        {(totalCreditMinutes > 0 || hasStudies) && (
                                            <div className="flex items-center justify-center gap-1">
                                                {totalCreditMinutes > 0 && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Crédito de horas" />
                                                )}
                                                {hasStudies && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Estudo Bíblico" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Desktop (>= 640px) */}
                                    <div className="hidden sm:flex flex-col gap-1 w-full mt-1">
                                        {totalMinistryMinutes > 0 && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-200/15 border border-primary-200/20 text-primary-200 text-[10px] sm:text-[11px] font-bold truncate">
                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                                <span className="truncate">{formatMinutesBadge(totalMinistryMinutes)}</span>
                                            </div>
                                        )}

                                        {totalCreditMinutes > 0 && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[10px] sm:text-[11px] font-bold truncate">
                                                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                                <span className="truncate">+{formatMinutesBadge(totalCreditMinutes)}</span>
                                            </div>
                                        )}

                                        {hasStudies && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold truncate">
                                                <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                                <span className="truncate">Estudo</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-2 sm:h-4" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

