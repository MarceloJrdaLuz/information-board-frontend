import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")

import { ICleaningScheduleResponse } from "@/types/cleaning";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow";
import { WEEKDAYS_PT } from "@/utils/dateUtil";

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
        <div className="w-full rounded-xl shadow bg-surface-100 p-4 mt-4">
            <h2 className="font-bold text-primary-200 text-lg my-2">Programação de Limpeza</h2>

            {/* Header do "carousel" */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prev}
                    disabled={currentIndex === 0}
                    className="disabled:text-typography-600 p-2 rounded-full text-primary-200 transition"
                >
                    <ChevronLeft size={26} />
                </button>

                <h3 className="font-semibold text-lg text-typography-700">
                    {capitalizeFirstLetter(dayjs(currentMonth + "-01").format("MMMM YYYY"))}
                </h3>

                <button
                    onClick={next}
                    disabled={currentIndex === months.length - 1}
                    className="disabled:text-typography-600 p-2 rounded-full text-primary-200 transition"
                >
                    <ChevronRight size={26} />
                </button>
            </div>

            {/* Cards do mês atual */}
            <div className="grid gap-3 sm:grid-cols-2">
                {currentMonthSchedules.map(item => {
                    const nameCount: Record<string, number> = {};

                    const publishers = item.group.publishers
                        .map(pub => {
                            const firstName = pub.fullName?.split(" ")[0];
                            if (!firstName) return null;

                            if (nameCount[firstName]) {
                                nameCount[firstName]++;
                                return pub.nickname || pub.fullName;
                            } else {
                                nameCount[firstName] = 1;
                                return firstName;
                            }
                        })
                        .filter(Boolean);

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
                                {publishers.join(", ")}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
