import { Button } from "@/Components/ui/button";
import { IMidweekSchedule, MidweekPartType, MidweekRoom, MidweekSection } from "@/types/midweek";
import { getLessonDetails } from "@/utils/midweekLessons";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import { AlertCircle, BookOpen, Calendar, CheckCircle2, ChevronRight, FileText, Sparkles, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

dayjs.locale('pt-br');

interface MidweekChairmanNextWeekPreviewProps {
    nextSchedule: IMidweekSchedule | null;
    hasNextWeek: boolean;
    onNextWeek: () => void;
}

export const MidweekChairmanNextWeekPreview: React.FC<MidweekChairmanNextWeekPreviewProps> = ({
    nextSchedule,
    hasNextWeek,
    onNextWeek
}) => {
    const [notes, setNotes] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined" && nextSchedule?.id) {
            const saved = localStorage.getItem(`midweek_chairman_notes_${nextSchedule.id}`);
            setNotes(saved || "");
        } else {
            setNotes("");
        }
    }, [nextSchedule?.id]);

    const handleNotesChange = (val: string) => {
        setNotes(val);
        if (typeof window !== "undefined" && nextSchedule?.id) {
            localStorage.setItem(`midweek_chairman_notes_${nextSchedule.id}`, val);
        }
    };

    const getDisplayName = (
        publisher?: { nickname?: string | null; fullName?: string | null } | null,
        custom?: string | null,
        fallback = "A designar"
    ) => {
        return publisher?.nickname || publisher?.fullName || custom || fallback;
    };
    if (!nextSchedule) {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-100 border border-surface-300 rounded-xl">
                <span className="text-sm text-typography-500">
                    Programação da próxima semana ainda não cadastrada ou não disponível.
                </span>
                {hasNextWeek && (
                    <Button
                        onClick={onNextWeek}
                        variant="outline"
                        className="gap-2 text-xs font-semibold"
                    >
                        <span>Avançar para a próxima semana</span>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        );
    }

    const formattedNextDate = nextSchedule.meetingDate
        ? dayjs(nextSchedule.meetingDate).format("dddd, DD [de] MMMM")
        : dayjs(nextSchedule.weekDate).format("Semana de DD [de] MMMM");

    // Partes de Tesouros
    const treasuresParts = (nextSchedule.parts || []).filter(
        p => p.section === MidweekSection.TREASURES && (p.isActive ?? true)
    );

    const bibleReadingMain = treasuresParts.find(
        p => p.partType === MidweekPartType.BIBLE_READING && p.room === MidweekRoom.MAIN
    );

    const bibleReadingAux = treasuresParts.find(
        p => p.partType === MidweekPartType.BIBLE_READING && p.room === MidweekRoom.AUXILIARY_1
    );

    const readingMainLesson = bibleReadingMain
        ? getLessonDetails(bibleReadingMain.brochure, bibleReadingMain.lessonNumber, bibleReadingMain.studyPoint, bibleReadingMain.studyPointDescription)
        : null;

    const readingAuxLesson = bibleReadingAux
        ? getLessonDetails(bibleReadingAux.brochure, bibleReadingAux.lessonNumber, bibleReadingAux.studyPoint, bibleReadingAux.studyPointDescription)
        : null;

    // Partes de Faça Seu Melhor no Ministério
    const allMinistryParts = (nextSchedule.parts || []).filter(
        p => p.section === MidweekSection.MINISTRY && (p.isActive ?? true)
    );

    const mainMinistryParts = allMinistryParts
        .filter(p => p.room === MidweekRoom.MAIN)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    return (
        <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-xl p-4 sm:p-5 shadow-xs">
            {/* Topo do Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-300">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary-100/20 text-primary-200">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-primary-500 uppercase tracking-wider block">
                            Designações da Próxima Semana
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-typography-900 capitalize flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-typography-400" />
                            {formattedNextDate}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={onNextWeek}
                        disabled={!hasNextWeek}
                        className="h-8 gap-1.5 text-xs font-bold"
                    >
                        <span>Ir para próxima semana</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Caso seja evento especial */}
            {nextSchedule.isSpecial && (
                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                        A próxima semana é um evento especial: <strong>{nextSchedule.specialName || "Evento Especial"}</strong>.
                    </span>
                </div>
            )}

            {/* Notas ou Anúncios para a Reunião */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-200/50 border border-surface-300">
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="chairman-meeting-notes"
                        className="flex items-center gap-1.5 text-xs font-bold text-typography-700 uppercase tracking-wider"
                    >
                        <FileText className="w-3.5 h-3.5 text-primary-200" />
                        <span>Notas / Anúncios para a Reunião</span>
                    </label>
                    {notes.trim().length > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Salvo automaticamente
                        </span>
                    )}
                </div>
                <textarea
                    id="chairman-meeting-notes"
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    rows={3}
                    placeholder="Adicione aqui notas, anúncios locais, boas-vindas, lembretes de limpeza ou recados para a reunião..."
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg bg-surface-100 border border-surface-300 text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/50 resize-y min-h-[70px]"
                />
            </div>

            {/* Bloco 1: Leitura da Bíblia */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2F7682] uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Leitura da Bíblia — {nextSchedule.weeklyBibleReading || "Programação Regular"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Salão Principal */}
                    <div className="p-3 rounded-lg bg-surface-200/60 border border-surface-300 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-typography-500">
                            <span>SALÃO PRINCIPAL</span>
                            {readingMainLesson?.shortBadge && (
                                <span className="bg-primary-100/30 text-primary-600 px-1.5 py-0.5 rounded text-[10px]">
                                    {readingMainLesson.shortBadge}
                                </span>
                            )}
                        </div>
                        <div className="text-sm font-bold text-typography-900">
                            {getDisplayName(bibleReadingMain?.assignedPublisher, bibleReadingMain?.custom_speaker_name, "Leitor a designar")}
                        </div>
                        {bibleReadingMain?.sourceMaterial && (
                            <span className="text-xs font-semibold text-[#2F7682] dark:text-teal-400">
                                📖 {bibleReadingMain.sourceMaterial}
                            </span>
                        )}
                        {readingMainLesson?.fullDisplay && (
                            <span className="text-[11px] text-typography-500">
                                {readingMainLesson.fullDisplay}
                            </span>
                        )}
                    </div>

                    {/* Sala Auxiliar 1 (Sala B), se houver */}
                    {bibleReadingAux ? (
                        <div className="p-3 rounded-lg bg-surface-200/60 border border-surface-300 flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-typography-500">
                                <span>SALA AUXILIAR (SALA B)</span>
                                {readingAuxLesson?.shortBadge && (
                                    <span className="bg-primary-100/30 text-primary-600 px-1.5 py-0.5 rounded text-[10px]">
                                        {readingAuxLesson.shortBadge}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-bold text-typography-900">
                                {getDisplayName(bibleReadingAux?.assignedPublisher, bibleReadingAux?.custom_speaker_name, "Leitor a designar")}
                            </div>
                            {bibleReadingAux?.sourceMaterial && (
                                <span className="text-xs font-semibold text-[#2F7682] dark:text-teal-400">
                                    📖 {bibleReadingAux.sourceMaterial}
                                </span>
                            )}
                            {readingAuxLesson?.fullDisplay && (
                                <span className="text-[11px] text-typography-500">
                                    {readingAuxLesson.fullDisplay}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 rounded-lg bg-surface-200/30 border border-dashed border-surface-300 flex items-center justify-center text-xs text-typography-400">
                            Sem segunda sala designada para esta semana
                        </div>
                    )}
                </div>
            </div>

            {/* Bloco 2: Seção Faça Seu Melhor no Ministério */}
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-300">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D49000] uppercase tracking-wide">
                    <Users className="w-3.5 h-3.5" />
                    <span>Faça Seu Melhor no Ministério</span>
                </div>

                {mainMinistryParts.length === 0 ? (
                    <div className="p-3 rounded-lg bg-surface-200/30 border border-dashed border-surface-300 text-xs text-typography-400 text-center">
                        Nenhuma parte de estudante cadastrada para a próxima semana.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                        {mainMinistryParts.map((part, idx) => {
                            const lessonInfo = getLessonDetails(
                                part.brochure,
                                part.lessonNumber,
                                part.studyPoint,
                                part.studyPointDescription
                            );

                            // Sala Auxiliar correspondente
                            const auxPart = allMinistryParts.find(
                                p => p.room === MidweekRoom.AUXILIARY_1 &&
                                     (p.orderIndex === part.orderIndex || (p.workbook_part_id && p.workbook_part_id === part.workbook_part_id))
                            );

                            return (
                                <div
                                    key={part.id}
                                    className="p-3 rounded-lg bg-surface-200/60 border border-surface-300 flex flex-col gap-2"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#D49000]/15 text-[#D49000] flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <h4 className="text-xs sm:text-sm font-bold text-typography-900">
                                                {part.title}
                                            </h4>
                                            <span className="text-xs text-typography-400">
                                                ({part.timeMinutes || 4} min)
                                            </span>
                                        </div>

                                        {(lessonInfo?.shortBadge || lessonInfo?.fullDisplay) && (
                                            <span className="text-[11px] text-typography-600 bg-surface-300 px-2 py-0.5 rounded-md self-start sm:self-auto">
                                                {lessonInfo.shortBadge || lessonInfo.fullDisplay}
                                            </span>
                                        )}
                                    </div>

                                    {/* Participantes: Salão Principal e Sala Auxiliar */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1 border-t border-surface-300/60">
                                        {/* Salão Principal */}
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-semibold text-typography-500 uppercase">
                                                Salão Principal
                                            </span>
                                            <div className="font-semibold text-typography-900">
                                                Titular: {getDisplayName(part.assignedPublisher, part.custom_speaker_name, "A designar")}
                                            </div>
                                            {((part as any).assistantPublisher?.nickname || (part as any).assistantPublisher?.fullName) && (
                                                <div className="text-typography-600">
                                                    Ajudante: {getDisplayName((part as any).assistantPublisher)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sala Auxiliar */}
                                        {auxPart ? (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-semibold text-typography-500 uppercase">
                                                    Sala Auxiliar (Sala B)
                                                </span>
                                                <div className="font-semibold text-typography-900">
                                                    Titular: {getDisplayName(auxPart.assignedPublisher, auxPart.custom_speaker_name, "A designar")}
                                                </div>
                                                {((auxPart as any).assistantPublisher?.nickname || (auxPart as any).assistantPublisher?.fullName) && (
                                                    <div className="text-typography-600">
                                                        Ajudante: {getDisplayName((auxPart as any).assistantPublisher)}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-[11px] text-typography-400 italic">
                                                Sem designação em segunda sala
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Rodapé: Botão Avançar para a próxima semana */}
            <div className="pt-2 flex justify-end">
                <Button
                    onClick={onNextWeek}
                    disabled={!hasNextWeek}
                    variant="outline"
                    className="w-full sm:w-auto h-9 gap-2 text-xs font-bold"
                >
                    <span>Avançar para a Programação da Próxima Semana</span>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
