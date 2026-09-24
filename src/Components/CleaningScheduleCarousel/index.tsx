import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { ICleaningScheduleResponse } from "@/types/cleaning";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow";
import { WEEKDAYS_PT } from "@/utils/dateUtil";

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

    const currentMonth = months[currentIndex];

    const currentMonthSchedules = useMemo(() => {
        return schedules.filter(item =>
            dayjs(item.date).format("YYYY-MM") === currentMonth
        );
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
                    <span>{capitalizeFirstLetter(dayjs(currentMonth + "-01").format("MMMM YYYY"))}</span>
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

            {/* Container original da programação de limpeza */}
            <div className="w-full rounded-xl shadow bg-surface-100 p-4">
                <h2 className="font-bold text-primary-200 text-lg my-2">Programação de Limpeza</h2>

                {/* Cards do mês atual (estilo original) */}
                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                    {currentMonthSchedules.map(item => {
                        const publishersDisplay = (item.group?.publishers ?? [])
                            .map(pub => {
                                if (!pub) return "";
                                return (pub.nickname?.trim() || pub.fullName?.trim() || "");
                            })
                            .filter(Boolean)
                            .join(" – ");

                        return (
                            <div
                                key={item.date}
                                className="border border-typography-200 rounded-lg p-3 bg-surface-100 hover:bg-surface-200 text-primary-200 transition"
                            >
                                <p className="font-semibold text-sm">
                                    {`${dayjs(item.date).format("DD/MM/YYYY")} - ${WEEKDAYS_PT[item.weekdayName] ?? item.weekdayName}`}
                                </p>

                                <p className="mt-2 text-typography-700 text-sm">
                                    <span className="font-semibold">Grupo:</span> {item.group.name}
                                </p>

                                <p className="mt-1 text-typography-700 text-sm">
                                    <span className="font-semibold">Responsáveis:</span><br />
                                    {publishersDisplay}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
