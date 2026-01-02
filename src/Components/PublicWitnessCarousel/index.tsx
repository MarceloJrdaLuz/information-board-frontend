import { useMemo, useState } from "react"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react"
import {
    IPublicWitnessFixedSchedule,
    IPublicWitnessRotationBlock
} from "@/types/publicWitness/schedules"
import { formatHour } from "@/utils/formatTime"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"

dayjs.locale("pt-br")

const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

interface Props {
    fixedSchedules: IPublicWitnessFixedSchedule[]
    rotationBlocks: IPublicWitnessRotationBlock[]
}

export default function PublicWitnessCarousel({
    fixedSchedules,
    rotationBlocks
}: Props) {

    /* =====================================================
     *  ARRANJOS ESPECIAIS (AGRUPADOS POR DATA)
     * ===================================================== */
    const specialByDate = useMemo(() => {
        return fixedSchedules
            .filter(fs => fs.date)
            .reduce<Record<string, IPublicWitnessFixedSchedule[]>>((acc, fs) => {
                acc[fs.date!] = acc[fs.date!] || []
                acc[fs.date!].push(fs)
                return acc
            }, {})
    }, [fixedSchedules])

    const specialDates = Object.entries(specialByDate).sort(
        ([a], [b]) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1)
    )

    /* =====================================================
     *  FIXOS SEM DATA (SEMANAIS)
     * ===================================================== */
    const weeklyFixed = fixedSchedules.filter(fs => !fs.date)

    /* =====================================================
     *  MESES DO RODÍZIO
     * ===================================================== */
    const months = useMemo(() => {
        const unique = new Set<string>()
        rotationBlocks.forEach(block => {
            block.schedules.forEach(s => {
                unique.add(dayjs(s.date).format("YYYY-MM"))
            })
        })
        return Array.from(unique).sort()
    }, [rotationBlocks])

    const [currentIndex, setCurrentIndex] = useState(0)
    const currentMonth = months[currentIndex]

    /* =====================================================
     *  RODÍZIOS DO MÊS ATUAL
     * ===================================================== */
    const currentMonthSchedules = useMemo(() => {
        const flattened: {
            date: string
            title: string
            start_time: string
            end_time: string
            publishers: string[]
        }[] = []

        rotationBlocks.forEach(block => {
            block.schedules.forEach(schedule => {
                if (dayjs(schedule.date).format("YYYY-MM") === currentMonth) {
                    flattened.push({
                        date: schedule.date,
                        title: block.title,
                        start_time: block.start_time,
                        end_time: block.end_time,
                        publishers: schedule.publishers.map(p => p.name)
                    })
                }
            })
        })

        return flattened.sort((a, b) =>
            dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1
        )
    }, [rotationBlocks, currentMonth])

    const next = () =>
        currentIndex < months.length - 1 && setCurrentIndex(i => i + 1)

    const prev = () =>
        currentIndex > 0 && setCurrentIndex(i => i - 1)

    /* =====================================================
     *  RENDER
     * ===================================================== */
    return (
        <div className="w-full flex flex-col gap-6 mt-4">
            {/* =================================================
       *  RODÍZIOS
       * ================================================= */}
            <div className="w-full rounded-xl shadow bg-surface-100 p-4">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className="disabled:text-typography-600 p-2 rounded-full text-primary-200 hover:bg-surface-200"
                    >
                        <ChevronLeft size={26} />
                    </button>

                    <h3 className="font-semibold text-lg text-typography-700">
                        {currentMonth
                            ? capitalize(dayjs(currentMonth + "-01").format("MMMM YYYY"))
                            : "Sem rodízio"}
                    </h3>

                    <button
                        onClick={next}
                        disabled={currentIndex === months.length - 1}
                        className="disabled:text-typography-600 p-2 rounded-full text-primary-200 hover:bg-surface-200"
                    >
                        <ChevronRight size={26} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-4">
                    {currentMonthSchedules.map((item, idx) => (
                        <div
                            key={idx}
                            className="w-full border rounded-lg p-4 bg-surface-100 hover:bg-surface-200"
                        >
                            <div className="flex justify-between mb-2">
                                <p className="font-bold text-primary-200">
                                    {dayjs(item.date).format("DD/MM/YYYY")}
                                </p>
                                <p className="text-xs text-typography-600">
                                    {capitalize(dayjs(item.date).format("dddd"))}
                                </p>
                            </div>

                            <div className="h-px bg-typography-200 mb-3" />

                            <p className="font-semibold text-sm mb-1">{item.title}</p>

                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={14} className="text-primary-200" />
                                <span>
                                    {formatHour(item.start_time)} - {formatHour(item.end_time)}
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-sm mt-1">
                                <Users size={14} className="text-primary-200 mt-1" />
                                <span>
                                    {item.publishers.length
                                        ? item.publishers.join(", ")
                                        : "Sem publicadores"}
                                </span>
                            </div>
                        </div>
                    ))}

                    {currentMonthSchedules.length === 0 && (
                        <p className="py-10 italic text-typography-600">
                            Nenhum rodízio para este mês.
                        </p>
                    )}
                </div>
            </div>

            {/* =================================================
       *  ARRANJOS ESPECIAIS (POR DATA)
       * ================================================= */}
            {specialDates.length > 0 && (
                <div className="w-full rounded-xl shadow bg-surface-100 p-4 border-l-4 border-primary-200">
                    <h2 className="font-bold text-primary-200 text-lg mb-4">
                        Arranjos Especiais
                    </h2>

                    <div className="flex flex-wrap gap-4">
                        {specialDates.map(([date, schedules]) => (
                            <div
                                key={date}
                                className="w-full border rounded-lg p-4 bg-surface-100"
                            >
                                {/* Cabeçalho da data */}
                                <div className="flex justify-between mb-3">
                                    <p className="font-bold text-primary-200">
                                        {dayjs(date).format("DD/MM/YYYY")}
                                    </p>
                                    <p className="text-xs text-typography-600">
                                        {capitalize(dayjs(date).format("dddd"))}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {Object.entries(
                                        schedules.reduce<Record<string, typeof schedules>>((acc, s) => {
                                            acc[s.title] = acc[s.title] || []
                                            acc[s.title].push(s)
                                            return acc
                                        }, {})
                                    ).map(([title, items]) => (
                                        <div key={title} className="space-y-2">
                                            {/* TÍTULO DO ARRANJO (UMA VEZ SÓ) */}
                                            <h4 className="font-semibold text-primary-200">
                                                {title}
                                            </h4>

                                            {/* HORÁRIOS */}
                                            {items.map((s, idx) => (
                                                <div
                                                    key={idx}
                                                    className="border rounded-md p-3 bg-surface-100 hover:bg-surface-200"
                                                >
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock size={14} className="text-primary-200" />
                                                        <span>
                                                            {formatHour(s.start_time)} - {formatHour(s.end_time)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-sm mt-1">
                                                        <Users size={14} className="text-primary-200 mt-1" />
                                                        <span>
                                                            {s.publishers.length
                                                                ? s.publishers.map(p => p.name).join(", ")
                                                                : "Sem publicadores"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* =================================================
       *  FIXOS SEMANAIS
       * ================================================= */}
            {weeklyFixed.length > 0 && (
                <div className="w-full rounded-xl shadow bg-surface-100 p-4 border-l-4 border-primary-200">
                    <h2 className="font-bold text-primary-200 text-lg mb-3">
                        Horários Fixos
                    </h2>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {weeklyFixed.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-surface-100 hover:bg-surface-200 p-3 rounded-lg border"
                            >
                                <p className="font-semibold text-primary-200 text-sm mb-1">
                                    {item.title}
                                </p>

                                {/* WEEK LABEL */}
                                <div className="w-full flex justify-end">
                                    {item.weekday !== null && (
                                        <span className="inline-block mb-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-200/10 text-primary-200">
                                            {WEEKDAY_LABEL[item.weekday as Weekday]}
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>
                                            {formatHour(item.start_time)} - {formatHour(item.end_time)}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Users size={14} className="mt-1" />
                                        <span>
                                            {item.publishers.length
                                                ? item.publishers.map(p => p.name).join(", ")
                                                : "Sem publicadores"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
