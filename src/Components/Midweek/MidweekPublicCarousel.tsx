"use client";

import { MidweekLivingIcon, MidweekMinistryIcon, MidweekTreasuresIcon } from "@/Components/Icons/MidweekIcons";
import { getLessonDetails } from "@/utils/midweekLessons";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Calendar, CalendarOff, ChevronLeft, ChevronRight, ChevronUp, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

dayjs.locale("pt-br");

export interface IPublicMidweekPart {
    id: string;
    title: string;
    sourceMaterial?: string | null;
    timeMinutes: number;
    section: "TREASURES" | "MINISTRY" | "LIVING";
    partType: string;
    room: "MAIN" | "AUXILIARY_1" | "AUXILIARY_2";
    orderIndex: number;
    requiresAssistant: boolean;
    assignedPublisher?: string | null;
    assistantPublisher?: string | null;
    customSpeakerName?: string | null;
    lessonNumber?: number | null;
    studyPoint?: number | null;
    studyPointDescription?: string | null;
}

export interface IPublicMidweekSchedule {
    id: string;
    weekDate: string;
    meetingDate?: string | null;
    month: string;
    year: number;
    weeklyBibleReading?: string | null;
    songOpen?: number | null;
    songMiddle?: number | null;
    songEnd?: number | null;
    isSpecial: boolean;
    specialType?: string | null;
    specialName?: string | null;
    notes?: string | null;
    isCurrentWeek: boolean;
    chairman?: string | null;
    openingPrayer?: string | null;
    closingPrayer?: string | null;
    auxCounselor1?: string | null;
    auxCounselor2?: string | null;
    cbsConductor?: string | null;
    cbsReader?: string | null;
    cbsSourceMaterial?: string | null;
    parts: IPublicMidweekPart[];
}

export type MidweekScheduleResponse = Record<string, IPublicMidweekSchedule[]>;

// Helper para formatar o título da parte com número sequencial sem duplicidade
const formatNumberedTitle = (num: number, title: string) => {
    const clean = title.replace(/^\d+[\.\-\s]+\s*/, "").trim();
    return `${num}. ${clean}`;
};

export default function MidweekPublicCarousel({ schedules }: { schedules: MidweekScheduleResponse }) {
    // Filtra para exibir apenas semanas atuais e futuras (excluindo semanas passadas)
    const months = useMemo(() => {
        const startOfCurrentWeek = dayjs().startOf("week");
        return Object.entries(schedules || {})
            .map(([monthKey, weeks]) => {
                const filteredWeeks = (weeks || []).filter((week) => {
                    const meetingDateObj = dayjs(week.meetingDate || week.weekDate);
                    const weekDateObj = dayjs(week.weekDate);
                    return (
                        week.isCurrentWeek ||
                        meetingDateObj.isSame(dayjs(), "week") ||
                        weekDateObj.isSame(dayjs(), "week") ||
                        meetingDateObj.isAfter(startOfCurrentWeek) ||
                        weekDateObj.isAfter(startOfCurrentWeek)
                    );
                });
                return [monthKey, filteredWeeks] as [string, IPublicMidweekSchedule[]];
            })
            .filter(([_, weeks]) => weeks.length > 0);
    }, [schedules]);

    const [activeMonthIndex, setActiveMonthIndex] = useState(0);
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (typeof window !== "undefined") {
                setShowScrollTop(window.scrollY > 250);
            }
        };
        window.addEventListener("scroll", checkScroll, { passive: true });
        return () => window.removeEventListener("scroll", checkScroll);
    }, []);

    const scrollToTop = () => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const currentMonthIndex = months.findIndex(([_, weeks]) =>
            weeks.some((w) => w.isCurrentWeek)
        );
        const idx = currentMonthIndex >= 0 ? currentMonthIndex : 0;
        setActiveMonthIndex(idx);
        // Abre direto na semana atual dentro do mês
        const currentWeekIdx = (months[idx]?.[1] || []).findIndex((w) => w.isCurrentWeek);
        setActiveWeekIndex(currentWeekIdx >= 0 ? currentWeekIdx : 0);
    }, [months]);

    const handleMonthChange = (newMonthIdx: number) => {
        setActiveMonthIndex(newMonthIdx);
        setActiveWeekIndex(0);
    };

    if (months.length === 0) return null;

    const currentWeeks = months[activeMonthIndex]?.[1] || [];

    return (
        <div className="relative w-full flex flex-col gap-4">
            {/* Cabeçalho Sticky de Navegação de Mês e Semanas */}
            <div className="sticky top-0 z-30 bg-surface-100/95 backdrop-blur-md p-3 rounded-2xl border border-surface-300 shadow-sm flex flex-col gap-2.5 transition-all">
                {/* Navegação de Meses */}
                <div className="flex justify-between items-center">
                    <button
                        disabled={activeMonthIndex === 0}
                        onClick={() => handleMonthChange(Math.max(activeMonthIndex - 1, 0))}
                        className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                        title="Mês anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <h2 className="text-base sm:text-lg font-extrabold text-typography-900 capitalize tracking-tight flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary-200" />
                        <span>{months[activeMonthIndex]?.[0] || "Programação"}</span>
                    </h2>

                    <button
                        disabled={activeMonthIndex === months.length - 1}
                        onClick={() => handleMonthChange(Math.min(activeMonthIndex + 1, months.length - 1))}
                        className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
                        title="Próximo mês"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Navegação de Semanas */}
                {currentWeeks.length > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-200/80">
                        <button
                            disabled={activeWeekIndex === 0}
                            onClick={() => setActiveWeekIndex((i) => Math.max(i - 1, 0))}
                            className="disabled:opacity-20 disabled:cursor-not-allowed p-1.5 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer shrink-0"
                            title="Semana anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Indicadores de semana (com rolagem horizontal suave no celular) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none py-0.5 scroll-smooth overscroll-x-contain">
                            {currentWeeks.map((w, idx) => {
                                const isActive = idx === activeWeekIndex;
                                const date = dayjs(w.meetingDate || w.weekDate).format("DD/MM");
                                return (
                                    <button
                                        key={w.id}
                                        onClick={() => setActiveWeekIndex(idx)}
                                        title={`Semana de ${date}`}
                                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                                            isActive
                                                ? "bg-primary-200 text-white shadow-sm"
                                                : "bg-surface-200 text-typography-600 hover:bg-surface-300"
                                        }`}
                                    >
                                        {w.isCurrentWeek && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-emerald-500"}`} />
                                        )}
                                        {date}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            disabled={activeWeekIndex === currentWeeks.length - 1}
                            onClick={() => setActiveWeekIndex((i) => Math.min(i + 1, currentWeeks.length - 1))}
                            className="disabled:opacity-20 disabled:cursor-not-allowed p-1.5 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer shrink-0"
                            title="Próxima semana"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Card da Semana Ativa */}
            {currentWeeks.map((week, idx) => {
                if (idx !== activeWeekIndex) return null;

                const meetingDateObj = dayjs(week.weekDate || week.meetingDate);
                const diffToMonday = meetingDateObj.day() === 0 ? 6 : meetingDateObj.day() - 1;
                const monday = meetingDateObj.subtract(diffToMonday, "day");
                const sunday = monday.add(6, "day");

                let formattedMeetingDate = "";
                if (monday.month() === sunday.month()) {
                    formattedMeetingDate = `${monday.format("DD")} - ${sunday.format("DD [de] MMMM")}`;
                } else {
                    formattedMeetingDate = `${monday.format("DD [de] MMMM")} - ${sunday.format("DD [de] MMMM")}`;
                }

                // Verifica se é evento especial sem reunião normal (Assembleia, Congresso, Celebração, etc.)
                const isNoMeetingSpecial = week.isSpecial && week.specialType !== "CIRCUIT_OVERSEER_VISIT";

                // 1. Separação de Tesouros (Discurso, Joias e Leitura da Bíblia por sala)
                const treasuresParts = (week.parts || []).filter(p => p.section === "TREASURES");
                const mainTreasures = treasuresParts.filter(
                    p => p.partType !== "BIBLE_READING" && !p.title.toLowerCase().includes("leitura da bíblia")
                );
                const bibleReadingMain = treasuresParts.find(
                    p => (p.partType === "BIBLE_READING" || p.title.toLowerCase().includes("leitura da bíblia")) && p.room === "MAIN"
                );
                const bibleReadingAux1 = treasuresParts.find(
                    p => (p.partType === "BIBLE_READING" || p.title.toLowerCase().includes("leitura da bíblia")) && p.room === "AUXILIARY_1"
                );

                // 2. Separação do Ministério por salas
                const sortMinistryParts = (a: any, b: any) => {
                    const isWWYSA = a.partType === "WHAT_WOULD_YOU_SAY" || a.title?.toLowerCase().includes("o que você diria");
                    const isWWYSB = b.partType === "WHAT_WOULD_YOU_SAY" || b.title?.toLowerCase().includes("o que você diria");
                    if (isWWYSA && !isWWYSB) return 1;
                    if (isWWYSB && !isWWYSA) return -1;
                    return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
                };

                const ministryParts = (week.parts || []).filter(p => p.section === "MINISTRY");
                const mainMinistry = ministryParts.filter(p => p.room === "MAIN").sort(sortMinistryParts);
                const aux1Ministry = ministryParts.filter(p => p.room === "AUXILIARY_1").sort(sortMinistryParts);
                const aux2Ministry = ministryParts.filter(p => p.room === "AUXILIARY_2").sort(sortMinistryParts);

                const hasAux1 = aux1Ministry.length > 0;
                const hasAux2 = aux2Ministry.length > 0;

                // 3. Separação de Vida Cristã (excluindo CBS para card unificado)
                const livingParts = (week.parts || []).filter(
                    p => p.section === "LIVING" && p.partType !== "CBS" && !p.title.toLowerCase().includes("estudo bíblico")
                );
                const cbsPart = (week.parts || []).find(
                    p => p.partType === "CBS" || p.title.toLowerCase().includes("estudo bíblico")
                );

                // Contador sequencial de partes para toda a reunião
                let partCounter = 1;

                return (
                    <div
                        key={week.id}
                        className="rounded-2xl border border-surface-300 shadow-sm overflow-hidden bg-surface-100"
                    >
                        {/* Cabeçalho da Semana */}
                        <div className={`text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isNoMeetingSpecial ? "bg-gradient-to-r from-[#28456C] to-[#730817]" : "bg-[#28456C]"
                        }`}>
                            <div className="flex flex-col">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-200">
                                        {formattedMeetingDate}
                                    </span>
                                    {week.isCurrentWeek && (
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider shadow-xs shrink-0 self-center">
                                            Semana Atual
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base sm:text-xl font-black tracking-tight text-white mt-0.5">
                                    {isNoMeetingSpecial
                                        ? (week.specialName || "Semana Especial")
                                        : (week.weeklyBibleReading || "Vida e Ministério Cristão")}
                                </h3>
                            </div>

                            {/* Presidente da Reunião (apenas se houver reunião normal) */}
                            {!isNoMeetingSpecial && week.chairman && (
                                <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-2 self-start sm:self-auto border border-white/10">
                                    <Users className="h-4 w-4 text-blue-200" />
                                    <div className="flex flex-col text-xs">
                                        <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">Presidente</span>
                                        <span className="font-bold text-white">{week.chairman}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Banner de Evento Especial com Reunião (ex: Visita do SC) */}
                        {!isNoMeetingSpecial && week.isSpecial && week.specialName && (
                            <div className="bg-gradient-to-r from-[#28456C] to-[#730817] text-typography-100 px-4 py-2.5 text-center font-semibold text-sm flex items-center justify-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                <span>{week.specialName}</span>
                            </div>
                        )}

                        {/* CORPO DO CARD: Se for evento especial sem reunião, exibe aviso */}
                        {isNoMeetingSpecial ? (
                            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 bg-surface-100">
                                <div className="p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-950/30 border border-red-500/20 text-red-600 dark:text-red-400">
                                    <CalendarOff className="h-7 w-7" />
                                </div>

                                <div className="max-w-lg w-full flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-black text-base sm:text-lg text-typography-900">
                                            {week.specialName || "Semana de Evento Especial"}
                                        </h4>
                                        <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
                                            Não haverá reunião congregacional de meio de semana no Salão do Reino.
                                        </p>
                                    </div>

                                    {week.notes?.trim() ? (
                                        <div className="text-xs sm:text-sm text-red-900 dark:text-red-200  p-4 rounded-2xl border  text-left sm:text-center whitespace-pre-line leading-relaxed shadow-2xs font-medium">
                                            <strong className="block text-red-800 dark:text-red-300 font-bold mb-1 uppercase tracking-wider text-[11px]">
                                                Informações do Evento:
                                            </strong>
                                            {week.notes.trim()}
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-typography-500">
                                            Todas as designações regulares estão suspensas para que os irmãos possam participar do evento.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* PROGRAMAÇÃO NORMAL DA REUNIÃO */
                            <div className="p-4 sm:p-6 flex flex-col gap-6 divide-y divide-surface-300">
                                {/* Cântico Inicial & Oração Inicial */}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm pt-1">
                                    <span className="font-bold text-typography-800">
                                        Cântico {week.songOpen || "—"}
                                    </span>
                                    {week.openingPrayer && (
                                        <span className="text-typography-600 font-medium bg-surface-200/50 px-2.5 py-1 rounded-lg border border-surface-300/70 text-right">
                                            <strong className="text-typography-800 font-semibold">Oração Inicial:</strong> {week.openingPrayer}
                                        </span>
                                    )}
                                </div>

                                {/* 1. TESOUROS DA PALAVRA DE DEUS */}
                                {treasuresParts.length > 0 && (
                                    <div className="pt-5 flex flex-col gap-3">
                                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#2F7682] text-white shadow-2xs">
                                            <MidweekTreasuresIcon className="h-5 w-5" size={20} />
                                            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                                                Tesouros da Palavra de Deus
                                            </h4>
                                        </div>

                                        <div className="flex flex-col gap-2.5">
                                            {mainTreasures.map((part) => {
                                                const partNum = partCounter++;
                                                return (
                                                    <div
                                                        key={part.id}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2"
                                                    >
                                                        <div className="flex flex-col max-w-xl">
                                                            <span className="font-bold text-xs sm:text-sm text-[#205B6F] dark:text-[#38BDF8]">
                                                                {formatNumberedTitle(partNum, part.title)}
                                                            </span>
                                                            {part.sourceMaterial && (
                                                                <span className="text-[11px] text-typography-500 italic mt-0.5">
                                                                    {part.sourceMaterial}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {part.assignedPublisher && (
                                                            <div className="self-end sm:self-center font-bold text-xs text-typography-900 bg-surface-100 px-3 py-1.5 rounded-lg border border-surface-300 shrink-0 shadow-2xs text-right">
                                                                {part.assignedPublisher}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Leitura da Bíblia com identificação de Salas */}
                                            {(bibleReadingMain || bibleReadingAux1) && (() => {
                                                const bibleNum = partCounter++;
                                                return (
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2">
                                                        <div className="flex flex-col max-w-xl">
                                                             <span className="font-bold text-xs sm:text-sm text-[#205B6F] dark:text-[#38BDF8]">
                                                                {formatNumberedTitle(bibleNum, bibleReadingMain?.title || bibleReadingAux1?.title || "Leitura da Bíblia")}
                                                            </span>
                                                            {(bibleReadingMain?.sourceMaterial || bibleReadingAux1?.sourceMaterial) && (
                                                                <span className="text-[11px] text-typography-500 italic mt-0.5">
                                                                    {bibleReadingMain?.sourceMaterial || bibleReadingAux1?.sourceMaterial}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="self-end sm:self-center flex flex-wrap items-center justify-end gap-2 text-xs text-right">
                                                            {bibleReadingAux1 ? (
                                                                <>
                                                                    {bibleReadingMain?.assignedPublisher && (
                                                                        <span className="font-bold text-typography-900 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs flex items-center gap-1 text-right">
                                                                            <strong className="text-[#205B6F] dark:text-[#38BDF8]">Salão Principal:</strong> {bibleReadingMain.assignedPublisher}
                                                                        </span>
                                                                    )}
                                                                    {bibleReadingAux1.assignedPublisher && (
                                                                        <span className="font-bold text-typography-900 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs flex items-center gap-1 text-right">
                                                                            <strong className="text-amber-600 dark:text-amber-400">Sala B:</strong> {bibleReadingAux1.assignedPublisher}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                bibleReadingMain?.assignedPublisher && (
                                                                    <div className="font-bold text-xs text-typography-900 bg-surface-100 px-3 py-1.5 rounded-lg border border-surface-300 shrink-0 shadow-2xs text-right">
                                                                        {bibleReadingMain.assignedPublisher}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* 2. FAÇA SEU MELHOR NO MINISTÉRIO */}
                                {ministryParts.length > 0 && (
                                    <div className="pt-5 flex flex-col gap-3">
                                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#D49000] text-white shadow-2xs">
                                            <div className="flex items-center gap-2.5">
                                                <MidweekMinistryIcon className="h-5 w-5" size={20} />
                                                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                                                    Faça Seu Melhor no Ministério
                                                </h4>
                                            </div>

                                            {week.auxCounselor1 && (
                                                <span className="text-[11px] font-semibold bg-black/15 px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                                                    Conselheiro Sala B: {week.auxCounselor1}
                                                </span>
                                            )}
                                        </div>

                                        {/* Salão Principal */}
                                        <div className="flex flex-col gap-2.5">
                                            <span className="text-[11px] font-bold text-typography-500 uppercase tracking-wider">
                                                Salão Principal
                                            </span>

                                            {mainMinistry.map((part) => {
                                                const partNum = partCounter++;
                                                const lessonInfo = getLessonDetails(
                                                    part.lessonNumber ? "lmd-T" : undefined,
                                                    part.lessonNumber,
                                                    part.studyPoint,
                                                    part.studyPointDescription
                                                );

                                                return (
                                                    <div
                                                        key={part.id}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2"
                                                    >
                                                        <div className="flex flex-col max-w-xl">
                                                            <span className="font-bold text-xs sm:text-sm text-[#A87200] dark:text-[#FBBF24]">
                                                                {formatNumberedTitle(partNum, part.title)}
                                                            </span>
                                                            {part.sourceMaterial && (
                                                                <span className="text-xs text-typography-700 dark:text-typography-300 font-medium mt-0.5 leading-snug">
                                                                    {part.sourceMaterial}
                                                                </span>
                                                            )}
                                                            {lessonInfo?.fullDisplay && (
                                                                <span className="text-[11px] text-typography-500 italic mt-0.5">
                                                                    {lessonInfo.fullDisplay}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="self-end sm:self-center flex flex-wrap items-center justify-end gap-1.5 text-xs shrink-0 text-right">
                                                            {part.assignedPublisher ? (
                                                                <span className="font-bold text-typography-900 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs text-right">
                                                                    {part.assignedPublisher}
                                                                </span>
                                                            ) : null}

                                                            {part.requiresAssistant && part.assistantPublisher ? (
                                                                <span className="font-medium text-typography-600 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs text-right">
                                                                    <span className="text-typography-400">Ajudante:</span> {part.assistantPublisher}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Sala B (se houver) */}
                                        {hasAux1 && (
                                            <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-dashed border-surface-300">
                                                <span className="text-[11px] font-bold text-typography-500 uppercase tracking-wider">
                                                    Sala B
                                                </span>
                                                {aux1Ministry.map((part, auxIdx) => {
                                                    const matchingMainNum = (partCounter - mainMinistry.length) + auxIdx;
                                                    const lessonInfo = getLessonDetails(
                                                        part.lessonNumber ? "lmd-T" : undefined,
                                                        part.lessonNumber,
                                                        part.studyPoint,
                                                        part.studyPointDescription
                                                    );
                                                    return (
                                                        <div
                                                            key={part.id}
                                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2"
                                                        >
                                                            <div className="flex flex-col max-w-xl">
                                                                <span className="font-bold text-xs sm:text-sm text-[#A87200] dark:text-[#FBBF24]">
                                                                    {formatNumberedTitle(matchingMainNum, part.title)}
                                                                </span>
                                                                {part.sourceMaterial && (
                                                                    <span className="text-xs text-typography-700 dark:text-typography-300 font-medium mt-0.5 leading-snug">
                                                                        {part.sourceMaterial}
                                                                    </span>
                                                                )}
                                                                {lessonInfo?.fullDisplay && (
                                                                    <span className="text-[11px] text-typography-500 italic mt-0.5">
                                                                        {lessonInfo.fullDisplay}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="self-end sm:self-center flex flex-wrap items-center justify-end gap-1.5 text-xs text-right">
                                                                {part.assignedPublisher && (
                                                                    <span className="font-bold text-typography-900 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs text-right">
                                                                        {part.assignedPublisher}
                                                                    </span>
                                                                )}
                                                                {part.requiresAssistant && part.assistantPublisher && (
                                                                    <span className="font-medium text-typography-600 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs text-right">
                                                                        <span className="text-typography-400">Ajudante:</span> {part.assistantPublisher}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Sala C (se houver) */}
                                        {hasAux2 && (
                                            <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-dashed border-surface-300">
                                                <span className="text-[11px] font-bold text-typography-500 uppercase tracking-wider">
                                                    Sala C {week.auxCounselor2 ? `• Conselheiro Sala C: ${week.auxCounselor2}` : ""}
                                                </span>
                                                {aux2Ministry.map((part, auxIdx) => {
                                                    const matchingMainNum = (partCounter - mainMinistry.length) + auxIdx;
                                                    const lessonInfo = getLessonDetails(
                                                        part.lessonNumber ? "lmd-T" : undefined,
                                                        part.lessonNumber,
                                                        part.studyPoint,
                                                        part.studyPointDescription
                                                    );
                                                    return (
                                                        <div
                                                            key={part.id}
                                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2"
                                                        >
                                                            <div className="flex flex-col max-w-xl">
                                                                <span className="font-bold text-xs sm:text-sm text-[#A87200] dark:text-[#FBBF24]">
                                                                    {formatNumberedTitle(matchingMainNum, part.title)}
                                                                </span>
                                                                {part.sourceMaterial && (
                                                                    <span className="text-xs text-typography-700 dark:text-typography-300 font-medium mt-0.5 leading-snug">
                                                                        {part.sourceMaterial}
                                                                    </span>
                                                                )}
                                                                {lessonInfo?.fullDisplay && (
                                                                    <span className="text-[11px] text-typography-500 italic mt-0.5">
                                                                        {lessonInfo.fullDisplay}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="self-end sm:self-center flex flex-wrap items-center justify-end gap-1.5 text-xs text-right">
                                                                {part.assignedPublisher && (
                                                                    <span className="font-bold text-typography-900 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs text-right">
                                                                        {part.assignedPublisher}
                                                                    </span>
                                                                )}
                                                                {part.requiresAssistant && part.assistantPublisher && (
                                                                    <span className="font-medium text-typography-600 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 shadow-2xs text-right">
                                                                        <span className="text-typography-400">Ajudante:</span> {part.assistantPublisher}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cântico do Meio */}
                                {week.songMiddle && (
                                    <div className="pt-4 pb-1 text-xs font-bold text-typography-800">
                                        Cântico {week.songMiddle}
                                    </div>
                                )}

                                {/* 3. NOSSA VIDA CRISTÃ */}
                                {(livingParts.length > 0 || week.cbsConductor || week.cbsReader || week.cbsSourceMaterial || cbsPart) && (
                                    <div className="pt-5 flex flex-col gap-3">
                                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#BA2A12] text-white shadow-2xs">
                                            <MidweekLivingIcon className="h-5 w-5" size={20} />
                                            <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                                                Nossa Vida Cristã
                                            </h4>
                                        </div>

                                        <div className="flex flex-col gap-2.5">
                                            {livingParts.map((part) => {
                                                const partNum = partCounter++;
                                                return (
                                                    <div
                                                        key={part.id}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2"
                                                    >
                                                        <div className="flex flex-col max-w-xl">
                                                            <span className="font-bold text-xs sm:text-sm text-[#BA2A12] dark:text-[#FB7185]">
                                                                {formatNumberedTitle(partNum, part.title)}
                                                            </span>
                                                            {part.sourceMaterial && (
                                                                <span className="text-[11px] text-typography-500 italic mt-0.5">
                                                                    {part.sourceMaterial}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {part.assignedPublisher && (
                                                            <div className="self-end sm:self-center font-bold text-xs text-typography-900 bg-surface-100 px-3 py-1.5 rounded-lg border border-surface-300 shrink-0 shadow-2xs text-right">
                                                                {part.assignedPublisher}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Estudo Bíblico de Congregação (CBS) */}
                                            {(week.cbsConductor || week.cbsReader || week.cbsSourceMaterial || cbsPart) && (() => {
                                                const cbsNum = partCounter++;
                                                return (
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-xs sm:text-sm text-[#BA2A12] dark:text-[#FB7185]">
                                                                {formatNumberedTitle(cbsNum, cbsPart?.title || "Estudo Bíblico de Congregação")}
                                                            </span>
                                                            {(week.cbsSourceMaterial || cbsPart?.sourceMaterial) && (
                                                                <span className="text-[11px] text-typography-600 dark:text-typography-400 font-medium italic mt-0.5">
                                                                    {week.cbsSourceMaterial || cbsPart?.sourceMaterial}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="self-end sm:self-center flex flex-wrap items-center justify-end gap-2 text-xs text-right">
                                                            {week.cbsConductor && (
                                                                <span className="font-bold text-typography-900 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 text-right">
                                                                    <span className="text-typography-500 font-medium mr-1">Dirigente:</span>{week.cbsConductor}
                                                                </span>
                                                            )}
                                                            {week.cbsReader && (
                                                                <span className="font-bold text-typography-900 bg-surface-100 px-2.5 py-1 rounded-lg border border-surface-300 text-right">
                                                                    <span className="text-typography-500 font-medium mr-1">Leitor:</span>{week.cbsReader}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Cântico Final & Oração Final */}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm pt-4">
                                    <span className="font-bold text-typography-800">
                                        Cântico {week.songEnd || "—"}
                                    </span>
                                    {week.closingPrayer && (
                                        <span className="text-typography-600 font-medium bg-surface-200/50 px-2.5 py-1 rounded-lg border border-surface-300/70 text-right">
                                            <strong className="text-typography-800 font-semibold">Oração Final:</strong> {week.closingPrayer}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Botão Flutuante Voltar ao Topo */}
            {showScrollTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary-200 hover:bg-primary-150 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center animate-fade-in"
                    title="Voltar ao topo"
                    aria-label="Voltar ao topo"
                >
                    <ChevronUp size={20} />
                </button>
            )}
        </div>
    );
}
