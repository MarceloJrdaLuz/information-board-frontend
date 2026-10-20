import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isoWeek from "dayjs/plugin/isoWeek";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, User, Users } from "lucide-react";
import { FieldServiceFixedSchedule, FieldServiceRotationBlock } from "@/types/fieldService";
import { resolveFixedLocation } from "@/utils/resolveFixedLocation";
import { resolveNextFixedLocations } from "@/utils/resolveNextFixedLocation";

dayjs.extend(isoWeek);
dayjs.locale("pt-br");

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface Props {
    fixedSchedules: FieldServiceFixedSchedule[];
    rotationBlocks: FieldServiceRotationBlock[];
}

export default function FieldServiceCarousel({ fixedSchedules, rotationBlocks }: Props) {
    const rotationCarouselRef = useRef<HTMLDivElement | null>(null);

    // Aba principal selecionada: 'weekly' (Saídas Semanais) ou 'rotation' (Escala de Dirigentes)
    const [activeMainTab, setActiveMainTab] = useState<"weekly" | "rotation">("weekly");

    // Filtro por dia da semana ('ALL' ou índice 0..6)
    const [selectedDay, setSelectedDay] = useState<number | "ALL">("ALL");

    const [expandedId, setExpandedId] = useState<string | null>(null);

    // 1. Extrair meses únicos dos blocos de rodízio
    const months = useMemo(() => {
        const unique = new Set<string>();
        rotationBlocks.forEach(block => {
            block.schedules.forEach(s => {
                unique.add(dayjs(s.date).format("YYYY-MM"));
            });
        });
        return Array.from(unique).sort();
    }, [rotationBlocks]);

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

    // 2. Filtrar apenas os dias de rodízio do mês atual
    const currentMonthSchedules = useMemo(() => {
        const flattened: { date: string; leader: string; exception?: string; title: string }[] = [];

        rotationBlocks.forEach(block => {
            block.schedules.forEach(schedule => {
                if (dayjs(schedule.date).format("YYYY-MM") === currentMonth) {
                    flattened.push({
                        date: schedule.date,
                        leader: schedule.leader,
                        exception: schedule.exceptionReason,
                        title: block.title
                    });
                }
            });
        });

        return flattened.sort((a, b) => (dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1));
    }, [rotationBlocks, currentMonth]);

    const next = () => currentIndex < months.length - 1 && setCurrentIndex(prev => prev + 1);
    const prev = () => currentIndex > 0 && setCurrentIndex(prev => prev - 1);

    const rotationAsFixed = useMemo(() => {
        return rotationBlocks.map(block => ({
            id: `rotation-${block.weekdayIndex}`,
            weekday: block.weekday,
            weekdayIndex: block.weekdayIndex,
            time: block.time,
            location: block.location,
            locationRotation: false,
            locationOverrides: []
        }));
    }, [rotationBlocks]);

    const weeklySchedules = useMemo(() => {
        const normalizeWeekday = (index: number) => (index === 0 ? 7 : index);

        return [...rotationAsFixed, ...fixedSchedules].sort(
            (a, b) =>
                normalizeWeekday(a.weekdayIndex) -
                normalizeWeekday(b.weekdayIndex)
        );
    }, [rotationAsFixed, fixedSchedules]);

    // 3. Agrupar saídas semanais por Dia da Semana (Ex: Quinta-feira com 2 saídas fica em 1 bloco só)
    const groupedByDay = useMemo(() => {
        const normalizeWeekday = (index: number) => (index === 0 ? 7 : index);
        const todayDayIndex = dayjs().day(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

        const map = new Map<number, {
            weekday: string;
            weekdayIndex: number;
            isToday: boolean;
            items: typeof weeklySchedules;
        }>();

        weeklySchedules.forEach(item => {
            if (!map.has(item.weekdayIndex)) {
                map.set(item.weekdayIndex, {
                    weekday: item.weekday,
                    weekdayIndex: item.weekdayIndex,
                    isToday: item.weekdayIndex === todayDayIndex,
                    items: []
                });
            }
            map.get(item.weekdayIndex)!.items.push(item);
        });

        // Ordena as saídas de cada dia por horário crescente ("09:00", "15:00", etc.)
        map.forEach(group => {
            group.items.sort((a, b) => a.time.localeCompare(b.time));
        });

        // Ordena os dias da semana na ordem natural (Segunda a Domingo)
        return Array.from(map.values()).sort(
            (a, b) => normalizeWeekday(a.weekdayIndex) - normalizeWeekday(b.weekdayIndex)
        );
    }, [weeklySchedules]);

    // Grupos filtrados pelo dia selecionado
    const displayedDayGroups = useMemo(() => {
        if (selectedDay === "ALL") return groupedByDay;
        return groupedByDay.filter(g => g.weekdayIndex === selectedDay);
    }, [groupedByDay, selectedDay]);

    const hasWeekly = weeklySchedules.length > 0;
    const hasRotation = rotationBlocks.length > 0;

    return (
        <div className="w-full flex flex-col gap-5 mt-4">
            {/* ABAS SUPERIORES: SAÍDAS SEMANAIS VS ESCALA DE DIRIGENTES */}
            {hasWeekly && hasRotation && (
                <div className="flex items-center p-1 bg-surface-200 rounded-xl border border-surface-300 w-full sm:w-auto self-start gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveMainTab("weekly")}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeMainTab === "weekly"
                                ? "bg-surface-100 text-typography-900 shadow-sm border border-surface-300/60"
                                : "text-typography-600 hover:text-typography-900 hover:bg-surface-100/50"
                        }`}
                    >
                        <Clock className="w-4 h-4 text-primary-200" />
                        <span>Programação Semanal</span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-primary-200/10 text-primary-200 font-semibold">
                            {weeklySchedules.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveMainTab("rotation")}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            activeMainTab === "rotation"
                                ? "bg-surface-100 text-typography-900 shadow-sm border border-surface-300/60"
                                : "text-typography-600 hover:text-typography-900 hover:bg-surface-100/50"
                        }`}
                    >
                        <Users className="w-4 h-4 text-primary-200" />
                        <span>Escala de Dirigentes</span>
                        {currentMonthSchedules.length > 0 && (
                            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-surface-300 text-typography-700 font-semibold">
                                {currentMonthSchedules.length}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* CONTEÚDO 1: SAÍDAS SEMANAIS AGRUPADAS POR DIA */}
            {(activeMainTab === "weekly" || !hasRotation) && hasWeekly && (
                <div className="w-full flex flex-col gap-4">
                    {/* BARRA DE FILTRO POR DIA DA SEMANA (SCROLL HORIZONTAL SEM BARRA VISÍVEL) */}
                    {groupedByDay.length > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <button
                                type="button"
                                onClick={() => setSelectedDay("ALL")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                    selectedDay === "ALL"
                                        ? "bg-primary-200 text-white border-primary-200 shadow-xs"
                                        : "bg-surface-100 text-typography-700 border-surface-300 hover:bg-surface-200"
                                }`}
                            >
                                Todos os dias ({weeklySchedules.length})
                            </button>

                            {groupedByDay.map(group => {
                                const isSelected = selectedDay === group.weekdayIndex;
                                return (
                                    <button
                                        key={group.weekdayIndex}
                                        type="button"
                                        onClick={() => setSelectedDay(group.weekdayIndex)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                            isSelected
                                                ? "bg-primary-200 text-white border-primary-200 shadow-xs"
                                                : "bg-surface-100 text-typography-700 border-surface-300 hover:bg-surface-200"
                                        }`}
                                    >
                                        <span>{group.weekday.replace("-feira", "")}</span>
                                        {group.isToday && (
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500 animate-pulse"}`}
                                                title="Hoje"
                                            />
                                        )}
                                        <span
                                            className={`text-[10px] px-1 py-0.2 rounded ${
                                                isSelected ? "bg-white/20 text-white" : "bg-surface-200 text-typography-500"
                                            }`}
                                        >
                                            {group.items.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* GRADE DE DIAS DA SEMANA */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {displayedDayGroups.map(group => (
                            <div
                                key={group.weekdayIndex}
                                className={`flex flex-col rounded-2xl bg-surface-100 border transition-all duration-200 shadow-xs overflow-hidden ${
                                    group.isToday
                                        ? "border-primary-200 ring-1 ring-primary-200/30"
                                        : "border-surface-300 hover:border-surface-400"
                                }`}
                            >
                                {/* Cabeçalho do Bloco do Dia */}
                                <div
                                    className={`flex items-center justify-between px-4 py-3 border-b border-surface-300/80 ${
                                        group.isToday ? "bg-primary-200/10" : "bg-surface-200/50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`font-bold text-sm sm:text-base ${
                                                group.isToday ? "text-primary-200 font-extrabold" : "text-typography-900"
                                            }`}
                                        >
                                            {group.weekday}
                                        </span>
                                        {group.isToday && (
                                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                Hoje
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[11px] font-semibold text-typography-500 bg-surface-100 px-2 py-0.5 rounded-lg border border-surface-300 shadow-2xs">
                                        {group.items.length} {group.items.length === 1 ? "saída" : "saídas"}
                                    </span>
                                </div>

                                {/* Lista de Saídas daquele dia */}
                                <div className="p-3 flex flex-col gap-2.5 divide-y divide-surface-300/50">
                                    {group.items.map((item, itemIdx) => {
                                        const isFixedWithRotation = item.locationRotation;
                                        const current = isFixedWithRotation
                                            ? resolveFixedLocation(item as FieldServiceFixedSchedule)
                                            : null;
                                        const nextLocationsCount = 8;
                                        const nextLocations = isFixedWithRotation
                                            ? resolveNextFixedLocations(item as FieldServiceFixedSchedule, nextLocationsCount)
                                            : [];
                                        const hasOverrides = isFixedWithRotation && nextLocations.length > 0;
                                        const isExpanded = expandedId === `${item.weekday}-${item.time}`;

                                        return (
                                            <div
                                                key={`${item.weekday}-${item.time}-${itemIdx}`}
                                                className={`flex flex-col gap-2.5 ${itemIdx > 0 ? "pt-3" : ""}`}
                                            >
                                                {/* Horário e Dirigente / Status */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-200 bg-primary-200/10 px-2.5 py-1 rounded-lg border border-primary-200/20">
                                                        <Clock size={13} className="text-primary-200" />
                                                        <span>{item.time}</span>
                                                    </span>

                                                    {"leader" in item && (item as any).leader ? (
                                                        <span className="text-xs font-semibold text-typography-700 flex items-center gap-1">
                                                            <User size={13} className="text-typography-400" />
                                                            <span>{(item as any).leader}</span>
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveMainTab("rotation");
                                                                rotationCarouselRef.current?.scrollIntoView({
                                                                    behavior: "smooth",
                                                                    block: "start"
                                                                });
                                                            }}
                                                            className="text-xs font-semibold text-primary-200 hover:underline flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Users size={13} />
                                                            <span>Ver escala de dirigentes →</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Local da saída */}
                                                <div className="flex items-start gap-2 text-xs text-typography-700">
                                                    <MapPin size={15} className="text-primary-200 mt-0.5 shrink-0" />
                                                    <div className="flex flex-col leading-snug w-full">
                                                        <span className="font-semibold text-typography-800 flex flex-wrap items-center gap-1">
                                                            {current?.location ?? item.location}
                                                            {current?.isOverride && (
                                                                <span className="text-[10px] text-primary-200 font-bold bg-primary-200/10 px-1.5 py-0.5 rounded border border-primary-200/20">
                                                                    ({dayjs(current.date).format("DD/MM")})
                                                                </span>
                                                            )}
                                                        </span>

                                                        {/* Botão expandir próximas semanas se houver rodízio de local */}
                                                        {hasOverrides && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setExpandedId(isExpanded ? null : `${item.weekday}-${item.time}`)
                                                                }
                                                                className="text-[11px] text-primary-200 mt-1 hover:underline font-semibold self-start cursor-pointer"
                                                            >
                                                                {isExpanded
                                                                    ? "Ocultar próximas semanas ↑"
                                                                    : "Ver próximas semanas ↓"}
                                                            </button>
                                                        )}

                                                        {/* Lista expandida de locais */}
                                                        {hasOverrides && isExpanded && (
                                                            <div className="mt-2 space-y-1 text-[11px] text-typography-600 bg-surface-200/60 p-2.5 rounded-lg border border-surface-300">
                                                                {nextLocations.map(loc => (
                                                                    <div key={loc.weekStart} className="flex items-center gap-1.5">
                                                                        <span className="font-bold text-typography-700">
                                                                            {dayjs(loc.date).format("DD/MM")}
                                                                        </span>
                                                                        <span
                                                                            className={`truncate ${
                                                                                loc.isOverride ? "font-bold text-primary-200" : ""
                                                                            }`}
                                                                        >
                                                                            • {loc.location}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CONTEÚDO 2: CARROSSEL DE RODÍZIOS / ESCALA DE DIRIGENTES */}
            {(activeMainTab === "rotation" || !hasWeekly) && hasRotation && (
                <div ref={rotationCarouselRef} className="w-full flex flex-col gap-4">
                    {/* Header do Carousel / Seletor de Meses */}
                    <div className="flex justify-between items-center bg-surface-100 p-3 rounded-2xl border border-surface-300 shadow-sm">
                        <button
                            type="button"
                            onClick={prev}
                            disabled={currentIndex === 0}
                            className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                            title="Mês anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <h2 className="text-base sm:text-lg font-extrabold text-typography-900 capitalize tracking-tight flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary-200" />
                            <span>
                                {currentMonth ? capitalize(dayjs(currentMonth + "-01").format("MMMM YYYY")) : "Sem rodízio"}
                            </span>
                        </h2>

                        <button
                            type="button"
                            onClick={next}
                            disabled={currentIndex === months.length - 1}
                            className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                            title="Próximo mês"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Lista de Cards da Escala de Dirigentes */}
                    {currentMonthSchedules.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-typography-400 bg-surface-100 rounded-2xl border border-surface-300">
                            <CalendarDays className="h-8 w-8 opacity-40 text-primary-200" />
                            <span className="text-sm font-medium">Nenhuma escala de dirigentes para este mês.</span>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {currentMonthSchedules.map((item, idx) => {
                                const itemDate = dayjs(item.date);
                                const isCurrentWeek = itemDate.isSame(dayjs(), "isoWeek");
                                const dayFormatted = itemDate.format("DD");
                                const monthFormatted = itemDate.format("MMM").toUpperCase();
                                const weekDayName = capitalize(itemDate.format("dddd"));

                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 gap-3"
                                    >
                                        <div className="space-y-3">
                                            {/* Cabeçalho da Data */}
                                            <div className="flex items-center justify-between pb-3 border-b border-surface-300 gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary-200/10 text-primary-200 rounded-xl font-bold border border-primary-200/20 shrink-0">
                                                        <span className="text-base leading-none">{dayFormatted}</span>
                                                        <span className="text-[10px] tracking-wider uppercase">
                                                            {monthFormatted}
                                                        </span>
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

                                            {/* Título do Bloco / Arranjo se houver */}
                                            {item.title && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-typography-500">
                                                        Arranjo:
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-200 text-typography-700 border border-surface-300">
                                                        {item.title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Dirigente ou Exceção */}
                                            <div className="pt-2 border-t border-surface-300/60">
                                                {item.exception ? (
                                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium italic">
                                                        <span>⚠️</span>
                                                        <span>{item.exception}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-typography-600 flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-primary-200" />
                                                            <span>Dirigente:</span>
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20 shadow-2xs">
                                                            {item.leader}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
