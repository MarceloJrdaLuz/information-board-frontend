import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { FieldServiceFixedSchedule, FieldServiceRotationBlock } from "@/types/fieldService";
import { resolveFixedLocation } from "@/utils/resolveFixedLocation";
dayjs.locale("pt-br");
// Funções auxiliares (assumindo que existam no seu projeto ou definindo-as)
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface Props {
    fixedSchedules: FieldServiceFixedSchedule[];
    rotationBlocks: FieldServiceRotationBlock[];
}

export default function FieldServiceCarousel({ fixedSchedules, rotationBlocks }: Props) {
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

    return (
        <div className="w-full flex justify-around flex-wrap gap-6 mt-4">
            {/* SEÇÃO: CARROSSEL DE RODÍZIOS (Fim de semana / Datas específicas) */}
            <div className="w-full rounded-xl shadow bg-surface-100 p-4">

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
            {/* SEÇÃO: SAÍDAS FIXAS (Sempre visível ou acima do carrossel) */}
            {fixedSchedules.length > 0 && (
                <div className="w-full rounded-xl shadow bg-surface-100 p-4 border-l-4 border-primary-200">
                    <h2 className="font-bold text-primary-200 text-lg mb-3">Saídas Fixas Semanais</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {fixedSchedules.map((item, idx) => (
                            <div key={idx} className="bg-surface-200/50 p-3 rounded-lg border border-typography-200">
                                <p className="font-bold text-primary-200 text-sm mb-2">{item.weekday}</p>
                                <div className="space-y-1 text-typography-700 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-primary-200" />
                                        <span>{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-primary-200" />
                                        <span className="truncate">{resolveFixedLocation(item)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-primary-200" />
                                        <span className="font-medium">{item.leader}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}