import { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { FieldServiceFixedSchedule, FieldServiceRotationBlock } from "@/types/fieldService";
import { resolveFixedLocation } from "@/utils/resolveFixedLocation";
import { resolveNextFixedLocations } from "@/utils/resolveNextFixedLocation";
import { Item } from "@radix-ui/react-select";
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
                <div className="w-full rounded-xl shadow bg-surface-100 p-4 border-l-4 border-primary-200">
                    <h2 className="font-bold text-primary-200 text-lg mb-3">Saídas Semanais</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {weeklySchedules.map((item, idx) => {
                            const isFixedWithRotation = item.locationRotation

                            const current = isFixedWithRotation
                                ? resolveFixedLocation(item as FieldServiceFixedSchedule)
                                : null

                            const nextLocations = isFixedWithRotation
                                ? resolveNextFixedLocations(item as FieldServiceFixedSchedule, 5)
                                : []

                            const hasOverrides = isFixedWithRotation && nextLocations.length > 0
                            const isExpanded = expandedId === `${item.weekday}-${item.time}`

                            return (
                                <div
                                    key={`${item.weekday}-${item.time}`}
                                    className="bg-surface-200/50 p-3 rounded-lg border border-typography-200"
                                >
                                    <p className="font-bold text-primary-200 text-sm mb-2">
                                        {item.weekday}
                                    </p>

                                    <div className="space-y-1 text-typography-700 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-primary-200" />
                                            <span>{item.time}</span>
                                        </div>

                                        {/* LOCAL */}
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="text-primary-200 mt-0.5 shrink-0" />

                                            <div className="flex flex-col leading-tight">
                                                <span className="truncate flex flex-wrap items-center gap-1">
                                                    {current?.location ?? item.location}

                                                    {/* data só quando existe override */}
                                                    {current?.isOverride && (
                                                        <span className="text-[10px] text-typography-500">
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
                                                        className="text-[10px] text-primary-200 mt-1 hover:underline self-start"
                                                    >
                                                        {isExpanded
                                                            ? "Ocultar próximas semanas"
                                                            : "Ver próximas semanas"}
                                                    </button>
                                                )}

                                                {/* lista expandida */}
                                                {hasOverrides && isExpanded && (
                                                    <div className="mt-2 space-y-1 text-[11px] text-typography-600">
                                                        {nextLocations.map(loc => (
                                                            <div
                                                                key={loc.weekStart}
                                                                className="flex flex-wrap gap-1"
                                                            >
                                                                <span>
                                                                    {dayjs(loc.date).format("DD/MM")}
                                                                </span>

                                                                <span
                                                                    className={`truncate ${loc.isOverride ? "font-semibold" : ""
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

                                        {/* dirigente */}
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-primary-200" />
                                            {"leader" in item ? (
                                                <span className="font-medium">{item.leader}</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        rotationCarouselRef.current?.scrollIntoView({
                                                            behavior: "smooth",
                                                            block: "start"
                                                        })
                                                    }
                                                    className="font-medium text-primary-200 hover:underline"
                                                >
                                                    Ver lista
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )
                        })}

                    </div>
                </div>
            )}

            {/* SEÇÃO: CARROSSEL DE RODÍZIOS (Fim de semana / Datas específicas) */}
            <div ref={rotationCarouselRef} className="w-full rounded-xl shadow bg-surface-100 p-4">

                {/* Header do Carousel */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className="disabled:text-typography-600 p-2 rounded-full text-primary-200 transition hover:bg-surface-200"
                    >
                        <ChevronLeft size={26} />
                    </button>

                    <h3 className="font-semibold text-lg text-typography-700">
                        {currentMonth ? capitalize(dayjs(currentMonth + "-01").format("MMMM YYYY")) : "Sem rodízio"}
                    </h3>

                    <button
                        onClick={next}
                        disabled={currentIndex === months.length - 1}
                        className="disabled:text-typography-600 p-2 rounded-full text-primary-200 transition hover:bg-surface-200"
                    >
                        <ChevronRight size={26} />
                    </button>
                </div>

                {/* Grid de Cards de Rodízio */}
                <div className="flex justify-around flex-wrap gap-4">
                    {currentMonthSchedules.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col w-full border border-typography-200 rounded-lg p-4 bg-surface-100 hover:bg-surface-200 transition shadow-sm"
                        >
                            {/* Topo do Card: Data e Badge */}
                            <div className="flex flex-col gap-1 mb-3">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-primary-200 text-base">
                                        {dayjs(item.date).format("DD/MM/YYYY")}
                                    </p>
                                    <p className="text-typography-600 text-xs font-medium">
                                        {capitalize(dayjs(item.date).format("dddd"))}
                                    </p>
                                </div>
                            </div>

                            {/* Divisor simples */}
                            <div className="h-px bg-typography-200 w-full mb-3" />

                            {/* Info do Dirigente */}
                            <div className="flex items-center justify-center gap-6">
                                {!item.exception && <div className="mt-1">
                                    <User size={16} className="text-primary-200" />
                                </div>}
                                <div >
                                    {!item.exception && <p className="text-typography-600 text-[10px] uppercase font-bold tracking-tight">
                                        Dirigente
                                    </p>}
                                    <p className={`text-sm ${item.exception ? "text-red-500 italic font-medium" : "text-typography-700 font-bold"}`}>
                                        {item.exception || item.leader}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {currentMonthSchedules.length === 0 && (
                        <p className="text-center col-span-full py-10 text-typography-600 italic">
                            Nenhuma escala de rodízio para este mês.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}