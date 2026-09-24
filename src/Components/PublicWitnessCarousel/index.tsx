import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import isoWeek from "dayjs/plugin/isoWeek"
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, Sparkles, Users } from "lucide-react"
import {
    IPublicWitnessFixedSchedule,
    IPublicWitnessRotationBlock
} from "@/types/publicWitness/schedules"
import { formatHour } from "@/utils/formatTime"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"

dayjs.extend(isoWeek)
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

    // Inicia preferencialmente no mês atual ou no mais próximo
    useEffect(() => {
        if (months.length > 0) {
            const currentYearMonth = dayjs().format("YYYY-MM")
            const foundIndex = months.findIndex(m => m >= currentYearMonth)
            if (foundIndex !== -1) {
                setCurrentIndex(foundIndex)
            }
        }
    }, [months])

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
            <div className="w-full flex flex-col gap-4">
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
                        <span>
                            {currentMonth
                                ? capitalize(dayjs(currentMonth + "-01").format("MMMM YYYY"))
                                : "Sem rodízio"}
                        </span>
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

                {/* Lista de Cards da Escala de Testemunho Público */}
                {currentMonthSchedules.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-typography-400 bg-surface-100 rounded-2xl border border-surface-300">
                        <CalendarDays className="h-8 w-8 opacity-40 text-primary-200" />
                        <span className="text-sm font-medium">Nenhum rodízio para este mês.</span>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {currentMonthSchedules.map((item, idx) => {
                            const itemDate = dayjs(item.date)
                            const isCurrentWeek = itemDate.isSame(dayjs(), "isoWeek")
                            const dayFormatted = itemDate.format("DD")
                            const monthFormatted = itemDate.format("MMM").toUpperCase()
                            const weekDayName = capitalize(itemDate.format("dddd"))

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

                                        {/* Ponto / Arranjo e Horário */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20 shadow-2xs">
                                                {item.title}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs text-typography-700 font-semibold shrink-0">
                                                <Clock size={14} className="text-primary-200" />
                                                <span>
                                                    {formatHour(item.start_time)} - {formatHour(item.end_time)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Publicadores */}
                                        <div className="pt-2 border-t border-surface-300">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-600 mb-2">
                                                <Users className="w-3.5 h-3.5 text-typography-400" />
                                                <span>Publicadores:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {item.publishers && item.publishers.length > 0 ? (
                                                    item.publishers.map((p, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2.5 py-1 rounded-lg text-xs bg-surface-200/70 text-typography-800 border border-surface-300 font-medium"
                                                        >
                                                            {p}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-typography-400 italic">
                                                        Sem publicadores vinculados
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>


            {/* =================================================
       *  ARRANJOS ESPECIAIS (POR DATA)
       * ================================================= */}
            {specialDates.length > 0 && (
                <div className="w-full rounded-2xl shadow-sm bg-surface-100 p-4 sm:p-5 border border-surface-300 border-l-4 border-l-primary-200">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-200" />
                            <h2 className="font-bold text-typography-900 text-base sm:text-lg">
                                Arranjos Especiais
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-typography-500 bg-surface-200/70 px-2.5 py-1 rounded-lg border border-surface-300">
                            {specialDates.length} {specialDates.length === 1 ? "data" : "datas"}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {specialDates.map(([date, schedules]) => (
                            <div
                                key={date}
                                className="w-full flex flex-col p-4 sm:p-5 rounded-xl bg-surface-200/40 border border-surface-300/80 shadow-2xs gap-4"
                            >
                                {/* Cabeçalho da data */}
                                <div className="flex items-center justify-between pb-3 border-b border-surface-300/60 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center justify-center w-11 h-11 bg-primary-200/10 text-primary-200 rounded-xl font-bold border border-primary-200/20 shrink-0">
                                            <span className="text-base leading-none">{dayjs(date).format("DD")}</span>
                                            <span className="text-[10px] tracking-wider uppercase">{dayjs(date).format("MMM")}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-primary-200 uppercase tracking-wide">
                                                {capitalize(dayjs(date).format("dddd"))}
                                            </span>
                                            <h4 className="text-sm font-bold text-typography-800">
                                                {dayjs(date).format("DD [de] MMMM [de] YYYY")}
                                            </h4>
                                        </div>
                                    </div>
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
                                            {/* TÍTULO DO ARRANJO */}
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-200 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-200" />
                                                <span>{title}</span>
                                            </h4>

                                            {/* HORÁRIOS */}
                                            <div className="grid gap-2.5 sm:grid-cols-2">
                                                {items.map((s, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-100 border border-surface-300 shadow-2xs gap-2"
                                                    >
                                                        <div className="flex items-center gap-1.5 text-xs text-typography-800 font-semibold">
                                                            <Clock size={13} className="text-primary-200" />
                                                            <span>
                                                                {formatHour(s.start_time)} - {formatHour(s.end_time)}
                                                            </span>
                                                        </div>

                                                        <div className="pt-2 border-t border-surface-300/60">
                                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-typography-500 mb-1.5">
                                                                <Users className="w-3 h-3 text-typography-400" />
                                                                <span>Publicadores:</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {s.publishers && s.publishers.length > 0 ? (
                                                                    s.publishers.map((p, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="px-2 py-0.5 rounded-md text-xs bg-surface-200/70 text-typography-800 border border-surface-300 font-medium"
                                                                        >
                                                                            {p.name}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-typography-400 italic">
                                                                        Sem publicadores vinculados
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
                <div className="w-full rounded-2xl shadow-sm bg-surface-100 p-4 sm:p-5 border border-surface-300 border-l-4 border-l-primary-200">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-200" />
                            <h2 className="font-bold text-typography-900 text-base sm:text-lg">
                                Horários Fixos
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-typography-500 bg-surface-200/70 px-2.5 py-1 rounded-lg border border-surface-300">
                            {weeklyFixed.length} {weeklyFixed.length === 1 ? "horário" : "horários"}
                        </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {weeklyFixed.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col justify-between p-4 rounded-xl bg-surface-200/40 border border-surface-300/80 shadow-2xs hover:border-primary-200 hover:shadow-xs transition-all duration-200 gap-3"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-sm text-primary-200">
                                            {item.title}
                                        </span>

                                        {item.weekday !== null && (
                                            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-primary-200/10 text-primary-200 border border-primary-200/20 shadow-2xs">
                                                {WEEKDAY_LABEL[item.weekday as Weekday]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-typography-700 font-semibold">
                                        <Clock size={13} className="text-primary-200" />
                                        <span>
                                            {formatHour(item.start_time)} - {formatHour(item.end_time)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-surface-300/60">
                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-typography-500 mb-1.5">
                                        <Users className="w-3 h-3 text-typography-400" />
                                        <span>Publicadores:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {item.publishers && item.publishers.length > 0 ? (
                                            item.publishers.map((p, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded-md text-xs bg-surface-100 text-typography-800 border border-surface-300 font-medium"
                                                >
                                                    {p.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-typography-400 italic">
                                                Sem publicadores vinculados
                                            </span>
                                        )}
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
