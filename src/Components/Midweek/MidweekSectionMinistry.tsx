import { MidweekMinistryIcon } from "@/Components/Icons/MidweekIcons";
import { Button } from "@/Components/ui/button";
import { IMidweekMeetingPart, MidweekPartType, MidweekRoom } from "@/types/midweek";
import { getLessonDetails } from "@/utils/midweekLessons";
import { Clock, Copy, Layers } from "lucide-react";
import React, { useState } from "react";
import { MidweekPublisherSelect } from "./MidweekPublisherSelect";

interface MidweekSectionMinistryProps {
    parts: IMidweekMeetingPart[];
    onUpdatePart: (partId: string, data: Partial<IMidweekMeetingPart>) => Promise<void>;
    onDuplicateRoom: (targetRoom: MidweekRoom) => Promise<void>;
}

export const MidweekSectionMinistry: React.FC<MidweekSectionMinistryProps> = ({
    parts,
    onUpdatePart,
    onDuplicateRoom
}) => {
    const [activeRoom, setActiveRoom] = useState<MidweekRoom>(MidweekRoom.MAIN);

    const filteredParts = parts
        .filter(p => p.room === activeRoom)
        .sort((a, b) => {
            if (a.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && b.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return 1;
            if (b.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && a.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return -1;
            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        });

    const hasAuxRoom1 = parts.some(p => p.room === MidweekRoom.AUXILIARY_1);
    const hasAuxRoom2 = parts.some(p => p.room === MidweekRoom.AUXILIARY_2);

    const formatNumberedTitle = (num: number, title: string) => {
        if (/^\d+\./.test(title)) return title;
        return `${num}. ${title}`;
    };

    return (
        <div className="flex flex-col rounded-xl border border-surface-300 bg-surface-100 overflow-hidden shadow-sm">
            {/* Header da Seção com cor e ícone oficiais */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-[#D49000] text-white gap-2">
                <div className="flex items-center gap-3">
                    <MidweekMinistryIcon className="h-6 w-6" size={24} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">
                        Faça Seu Melhor no Ministério
                    </h3>
                </div>

                {/* Seletor de Salas (Principal / Auxiliar 1 / Auxiliar 2) */}
                <div className="flex items-center gap-1.5 bg-[#A87200] p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setActiveRoom(MidweekRoom.MAIN)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                            activeRoom === MidweekRoom.MAIN
                                ? "bg-surface-100 text-typography-900 shadow-sm"
                                : "text-amber-100 hover:bg-[#8F6100]"
                        }`}
                    >
                        Sala Principal
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveRoom(MidweekRoom.AUXILIARY_1)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                            activeRoom === MidweekRoom.AUXILIARY_1
                                ? "bg-surface-100 text-typography-900 shadow-sm"
                                : "text-amber-100 hover:bg-[#8F6100]"
                        }`}
                    >
                        <span>Sala B</span>
                        {hasAuxRoom1 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveRoom(MidweekRoom.AUXILIARY_2)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                            activeRoom === MidweekRoom.AUXILIARY_2
                                ? "bg-surface-100 text-typography-900 shadow-sm"
                                : "text-amber-100 hover:bg-[#8F6100]"
                        }`}
                    >
                        <span>Sala C</span>
                        {hasAuxRoom2 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                </div>
            </div>

            {/* Ações de Sala Auxiliar */}
            {activeRoom !== MidweekRoom.MAIN && filteredParts.length === 0 && (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Layers className="h-10 w-10 text-amber-500" />
                    <div className="max-w-md">
                        <h4 className="text-sm font-bold text-typography-900">
                            Nenhuma parte cadastrada para {activeRoom === MidweekRoom.AUXILIARY_1 ? "a Sala Auxiliar 1" : "a Sala Auxiliar 2"}
                        </h4>
                        <p className="text-xs text-typography-500 mt-1">
                            Você pode duplicar automaticamente as partes da sala principal para preencher esta sala auxiliar.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => onDuplicateRoom(activeRoom)}
                        className="flex items-center gap-1.5 bg-[#D49000] hover:bg-[#B37A00] text-white font-semibold text-xs"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicar Partes da Sala Principal
                    </Button>
                </div>
            )}

            {/* Lista de Partes */}
            <div className="divide-y divide-surface-300 p-2">
                {filteredParts.map((part, index) => {
                    const partNum = 4 + index;
                    const isTalk = part.partType === MidweekPartType.STUDENT_TALK || part.partType === MidweekPartType.EXPLAIN_BELIEFS;
                    const isWWYS = part.partType === MidweekPartType.WHAT_WOULD_YOU_SAY;

                    const lessonInfo = getLessonDetails(
                        part.lessonNumber ? "lmd-T" : (part.brochure || "LovePeople"),
                        part.lessonNumber,
                        part.studyPoint,
                        part.studyPointDescription
                    );

                    return (
                        <div
                            key={part.id}
                            className="flex flex-col lg:flex-row lg:items-start justify-between p-3.5 gap-4 hover:bg-surface-200/70 rounded-lg transition-colors"
                        >
                            {/* Detalhes da Parte */}
                            <div className="flex flex-col gap-1.5 lg:w-5/12">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-typography-700 bg-surface-200 px-2 py-0.5 rounded">
                                        <Clock className="h-3 w-3 text-typography-500" />
                                        {part.timeMinutes} min
                                    </span>
                                </div>

                                {/* Título em Amarelo com Numeração */}
                                <h4 className="font-bold text-sm text-[#A87200] dark:text-[#FBBF24] leading-snug">
                                    {formatNumberedTitle(partNum, part.title)}
                                </h4>

                                {/* Fonte de Matéria / Cenário (ex: DE CASA EM CASA. Ofereça um estudo bíblico.) */}
                                {part.sourceMaterial && (
                                    <p className="text-xs text-typography-700 dark:text-typography-300 font-medium mt-0.5 leading-relaxed">
                                        {part.sourceMaterial}
                                    </p>
                                )}

                                {/* Informações da Lição e Ponto de Estudo */}
                                {lessonInfo?.fullDisplay && (
                                    <span className="text-[11px] text-typography-500 italic mt-0.5 leading-relaxed block">
                                        {lessonInfo.fullDisplay}
                                    </span>
                                )}

                            </div>

                            {/* Seleção do Titular e Ajudante */}
                            <div className="lg:w-7/12 flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 justify-end pt-1">
                                {/* Titular */}
                                <div className="flex-1">
                                    <span className="text-[10px] text-typography-500 font-semibold block mb-1 uppercase tracking-wider">
                                        {isWWYS ? "Orador (Consideração)" : isTalk ? "Orador (Estudante)" : "Titular (Estudante)"}
                                    </span>
                                    <MidweekPublisherSelect
                                        partId={part.id}
                                        value={part.assigned_publisher_id}
                                        publisher={part.assignedPublisher}
                                        onChange={(pubId) => onUpdatePart(part.id, { assigned_publisher_id: pubId })}
                                        placeholder="Selecione o estudante..."
                                    />
                                </div>

                                {/* Ajudante (se aplicável) */}
                                {part.requiresAssistant && (
                                    <div className="flex-1">
                                        <span className="text-[10px] text-typography-500 font-semibold block mb-1 uppercase tracking-wider">
                                            Ajudante
                                        </span>
                                        <MidweekPublisherSelect
                                            partId={part.id}
                                            isAssistant={true}
                                            value={part.assistant_publisher_id}
                                            publisher={part.assistantPublisher}
                                            onChange={(pubId) => onUpdatePart(part.id, { assistant_publisher_id: pubId })}
                                            placeholder="Selecione o ajudante..."
                                            disabled={!part.assigned_publisher_id}
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