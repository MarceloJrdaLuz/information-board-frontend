import { MidweekTreasuresIcon } from "@/Components/Icons/MidweekIcons";
import { IMidweekMeetingPart, MidweekPartType, MidweekRoom } from "@/types/midweek";
import { getLessonDetails } from "@/utils/midweekLessons";
import { BookOpen, Clock } from "lucide-react";
import React from "react";
import { MidweekPublisherSelect } from "./MidweekPublisherSelect";

interface MidweekSectionTreasuresProps {
    parts: IMidweekMeetingPart[];
    onUpdatePart: (partId: string, data: Partial<IMidweekMeetingPart>) => Promise<void>;
}

export const MidweekSectionTreasures: React.FC<MidweekSectionTreasuresProps> = ({
    parts,
    onUpdatePart
}) => {
    // Ordenação canônica estrita para a seção Tesouros da Palavra de Deus
    const typeOrder: Record<string, number> = {
        [MidweekPartType.TALK]: 1,
        [MidweekPartType.GEMS]: 2,
        [MidweekPartType.BIBLE_READING]: 3
    };

    const mainParts = parts
        .filter(p => p.room === MidweekRoom.MAIN)
        .sort((a, b) => {
            const orderA = typeOrder[a.partType] ?? (a.orderIndex ?? 99);
            const orderB = typeOrder[b.partType] ?? (b.orderIndex ?? 99);
            return orderA - orderB;
        });

    return (
        <div className="flex flex-col rounded-xl border border-surface-300 bg-surface-100 overflow-hidden shadow-sm">
            {/* Header da Seção com cor e ícone oficiais */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#2F7682] text-white">
                <div className="flex items-center gap-3">
                    <MidweekTreasuresIcon className="h-6 w-6" size={24} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">
                        Tesouros da Palavra de Deus
                    </h3>
                </div>
            </div>

            {/* Lista de Partes */}
            <div className="divide-y divide-surface-300 p-2">
                {mainParts.map((part, index) => {
                    const isBibleReading = part.partType === MidweekPartType.BIBLE_READING;
                    const isGems = part.partType === MidweekPartType.GEMS;
                    const isTalk = part.partType === MidweekPartType.TALK;

                    const lessonInfo = getLessonDetails(
                        part.brochure,
                        part.lessonNumber,
                        part.studyPoint,
                        part.studyPointDescription
                    );

                    return (
                        <div
                            key={part.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-3.5 gap-3 hover:bg-surface-200/70 rounded-lg transition-colors"
                        >
                            {/* Informações da Parte */}
                            <div className="flex flex-col gap-1.5 md:w-1/2">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-typography-700 bg-surface-200 px-2 py-0.5 rounded">
                                        <Clock className="h-3 w-3 text-typography-500" />
                                        {part.timeMinutes} min
                                    </span>

                                    {isTalk && (
                                        <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                                            Discurso
                                        </span>
                                    )}
                                    {isGems && (
                                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                                            Perguntas e Respostas
                                        </span>
                                    )}
                                    {isBibleReading && (
                                        <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                                            Leitura da Bíblia (Estudante)
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-bold text-sm text-[#2F7682] dark:text-teal-400 leading-snug">
                                    {/^\d+\./.test(part.title) ? part.title : `${index + 1}. ${part.title}`}
                                </h4>

                                {part.sourceMaterial && (
                                    <p className="text-xs text-typography-500 italic mt-0.5 leading-relaxed">
                                        {part.sourceMaterial}
                                    </p>
                                )}

                                {isBibleReading && (
                                    <div className="flex items-center gap-1.5 text-xs text-typography-500 italic mt-0.5 leading-relaxed">
                                        <span>Melhore: Lição {part.studyPoint || part.lessonNumber || 1}{lessonInfo.lessonTheme ? ` • ${lessonInfo.lessonTheme}` : ""}</span>
                                    </div>
                                )}
                            </div>

                            {/* Seleção do Designado */}
                            <div className="md:w-1/2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-end">
                                {isBibleReading ? (
                                    <>
                                        {/* Leitor Sala Principal */}
                                        <div className="flex-1 max-w-xs">
                                            <span className="text-[10px] text-typography-500 font-semibold block mb-1 uppercase tracking-wider">
                                                Leitor (Salão Principal)
                                            </span>
                                            <MidweekPublisherSelect
                                                partId={part.id}
                                                value={part.assigned_publisher_id}
                                                publisher={part.assignedPublisher}
                                                onChange={(pubId) => onUpdatePart(part.id, { assigned_publisher_id: pubId })}
                                                placeholder="Selecione o leitor..."
                                            />
                                        </div>

                                        {/* Leitor Sala Auxiliar (se existir) */}
                                        {(() => {
                                            const auxPart = parts.find(p => p.partType === MidweekPartType.BIBLE_READING && p.room === MidweekRoom.AUXILIARY_1);
                                            if (!auxPart) return null;
                                            return (
                                                <div className="flex-1 max-w-xs">
                                                    <span className="text-[10px] text-typography-500 font-semibold block mb-1 uppercase tracking-wider">
                                                        Leitor (Sala Auxiliar 1)
                                                    </span>
                                                    <MidweekPublisherSelect
                                                        partId={auxPart.id}
                                                        value={auxPart.assigned_publisher_id}
                                                        publisher={auxPart.assignedPublisher}
                                                        onChange={(pubId) => onUpdatePart(auxPart.id, { assigned_publisher_id: pubId })}
                                                        placeholder="Selecione o leitor (Sala Aux.)..."
                                                    />
                                                </div>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="w-full max-w-sm">
                                        <span className="text-[10px] text-typography-500 font-semibold block mb-1 uppercase tracking-wider">
                                            Orador
                                        </span>
                                        <MidweekPublisherSelect
                                            partId={part.id}
                                            value={part.assigned_publisher_id}
                                            publisher={part.assignedPublisher}
                                            onChange={(pubId) => onUpdatePart(part.id, { assigned_publisher_id: pubId })}
                                            placeholder="Selecione o irmão..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};