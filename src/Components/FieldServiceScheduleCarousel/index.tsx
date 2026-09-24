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
// Funções auxiliares (assumindo que existam no seu projeto ou definindo-as)
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface Props {
    fixedSchedules: FieldServiceFixedSchedule[];
    rotationBlocks: FieldServiceRotationBlock[];
}

export default function FieldServiceCarousel({ fixedSchedules, rotationBlocks }: Props) {
    const rotationCarouselRef = useRef<HTMLDivElement | null>(null)

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
        // Vamos "achatar" os blocos para listar todos os dias de rodízio do mês atual
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

        // Ordenar por data
        return flattened.sort((a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1);
    }, [rotationBlocks, currentMonth]);

    const next = () => currentIndex < months.length - 1 && setCurrentIndex(prev => prev + 1);
    const prev = () => currentIndex > 0 && setCurrentIndex(prev => prev - 1);
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const rotationAsFixed = useMemo(() => {
        return rotationBlocks.map(block => ({
            id: `rotation-${block.weekdayIndex}`,
            weekday: block.weekday,
            weekdayIndex: block.weekdayIndex,
            time: block.time,
            location: block.location,
            locationRotation: false,
            locationOverrides: []
        }))
    }, [rotationBlocks])

    const weeklySchedules = useMemo(() => {
        const normalizeWeekday = (index: number) =>
            index === 0 ? 7 : index

        return [...rotationAsFixed, ...fixedSchedules].sort(
            (a, b) =>
                normalizeWeekday(a.weekdayIndex) -
                normalizeWeekday(b.weekdayIndex)
        )
    }, [rotationAsFixed, fixedSchedules])

    return (
        <div className="w-full flex justify-around flex-wrap gap-6 mt-4">
            {/* SEÇÃO: SAÍDAS FIXAS (Sempre visível ou acima do carrossel) */}
            {fixedSchedules.length > 0 && (
                <div className="w-full rounded-2xl shadow-sm bg-surface-100 p-4 sm:p-5 border border-surface-300 border-l-4 border-l-primary-200">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-200" />
                            <h2 className="font-bold text-typography-900 text-base sm:text-lg">
                                Saídas Semanais
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-typography-500 bg-surface-200/70 px-2.5 py-1 rounded-lg border border-surface-300">
                            {weeklySchedules.length} {weeklySchedules.length === 1 ? "saída" : "saídas"}
                        </span>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {weeklySchedules.map((item) => {
                            const isFixedWithRotation = item.locationRotation;

                            const current = isFixedWithRotation
                                ? resolveFixedLocation(item as FieldServiceFixedSchedule)
                                : null;

                            const nextLocationsCout = 8;
                            const nextLocations = isFixedWithRotation
                                ? resolveNextFixedLocations(item as FieldServiceFixedSchedule, nextLocationsCout)
                                : [];

                            const hasOverrides = isFixedWithRotation && nextLocations.length > 0;
                            const isExpanded = expandedId === `${item.weekday}-${item.time}`;

                            return (
                                <div
                                    key={`${item.weekday}-${item.time}`}
                                    className="flex flex-col justify-between p-4 rounded-xl bg-surface-200/40 border border-surface-300/80 shadow-2xs hover:border-primary-200 hover:shadow-xs transition-all duration-200 gap-3"
                                >
                                    <div className="space-y-2.5">
                                        {/* Header com Dia da Semana e Horário */}
                                        <div className="flex items-center justify-between pb-2 border-b border-surface-300/60 gap-2">
                                            <span className="font-bold text-sm text-primary-200">
                                                {item.weekday}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-typography-800 bg-surface-100 px-2.5 py-0.5 rounded-lg border border-surface-300 shadow-2xs">
                                                <Clock size={13} className="text-primary-200" />
                                                <span>{item.time}</span>
                                            </span>
                                        </div>

                                        {/* LOCAL */}
                                        <div className="flex items-start gap-2 text-xs text-typography-700">
                                            <MapPin size={15} className="text-primary-200 mt-0.5 shrink-0" />

                                            <div className="flex flex-col leading-snug">
                                                <span className="font-semibold text-typography-800 flex flex-wrap items-center gap-1">
                                                    {current?.location ?? item.location}

                                                    {/* data só quando existe override */}
                                                    {current?.isOverride && (
                                                        <span className="text-[10px] text-primary-200 font-bold bg-primary-200/10 px-1.5 py-0.5 rounded border border-primary-200/20">
                                                            ({dayjs(current.date).format("DD/MM")})
                                                        </span>
                                                    )}
                                                </span>

                                                {/* botão expandir */}
                                                {hasOverrides && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedId(isExpanded ? null : `${item.weekday}-${item.time}`)
                                                        }
                                                        className="text-[11px] text-primary-200 mt-1.5 hover:underline font-semibold self-start cursor-pointer"
                                                    >
                                                        {isExpanded
                                                            ? "Ocultar próximas semanas ↑"
                                                            : "Ver próximas semanas ↓"}
                                                    </button>
                                                )}

                                                {/* lista expandida */}
                                                {hasOverrides && isExpanded && (
                                                    <div className="mt-2 space-y-1 text-[11px] text-typography-600 bg-surface-100 p-2.5 rounded-lg border border-surface-300">
                                                        {nextLocations.map(loc => (
                                                            <div
                                                                key={loc.weekStart}
                                                                className="flex items-center gap-1.5"
                                                            >
                                                                <span className="font-bold text-typography-700">
                                                                    {dayjs(loc.date).format("DD/MM")}
                                                                </span>

                                                                <span
                                                                    className={`truncate ${loc.isOverride ? "font-bold text-primary-200" : ""}`}
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

                                    {/* dirigente */}
                                    <div className="pt-2 border-t border-surface-300/60 flex items-center justify-between text-xs">
                                        <span className="text-typography-500 font-medium flex items-center gap-1">
                                            <User size={13} className="text-typography-400" />
                                            <span>Dirigente:</span>
                                        </span>
                                        {"leader" in item ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20 shadow-2xs">
                                                {(item as any).leader}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    rotationCarouselRef.current?.scrollIntoView({
                                                        behavior: "smooth",
                                                        block: "start"
                                                    })
                                                }
                                                className="text-xs font-semibold text-primary-200 hover:underline cursor-pointer"
                                            >
                                                Ver escala ↓
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SEÇÃO: CARROSSEL DE RODÍZIOS (Fim de semana / Datas específicas) */}
            <div ref={rotationCarouselRef} className="w-full flex flex-col gap-4">

                {/* Header do Carousel / Seletor de Meses separado com ícone de calendário */}
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
                        <span>{currentMonth ? capitalize(dayjs(currentMonth + "-01").format("MMMM YYYY")) : "Sem rodízio"}</span>
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
        </div>
    );
}