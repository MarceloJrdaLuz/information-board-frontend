import { MidweekLivingIcon } from "@/Components/Icons/MidweekIcons";
import { Button } from "@/Components/ui/button";
import { IMidweekMeetingPart, IMidweekSchedule, MidweekPartType, MidweekRoom, MidweekSection, MidweekSpecialType } from "@/types/midweek";
import { BookOpen, Check, Clock, Loader2, Mic, Plus, Trash2, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MidweekPublisherSelect } from "./MidweekPublisherSelect";

interface MidweekSectionLivingProps {
    schedule: IMidweekSchedule;
    parts: IMidweekMeetingPart[];
    startPartNumber?: number;
    onUpdateSchedule: (data: Partial<IMidweekSchedule>) => Promise<void>;
    onUpdatePart: (partId: string, data: Partial<IMidweekMeetingPart>) => Promise<void>;
    onAddCustomPart: (data: {
        title: string;
        timeMinutes: number;
        method?: string;
        sourceMaterial?: string;
        custom_speaker_name?: string;
        section?: MidweekSection;
        partType?: MidweekPartType;
    }) => Promise<void>;
    onDeletePart: (partId: string) => Promise<void>;
    onOpenCustomPartModal: () => void;
}

export const MidweekSectionLiving: React.FC<MidweekSectionLivingProps> = ({
    schedule,
    parts,
    startPartNumber = 7,
    onUpdateSchedule,
    onUpdatePart,
    onAddCustomPart,
    onDeletePart,
    onOpenCustomPartModal
}) => {
    const isCoVisit = schedule.isSpecial && schedule.specialType === MidweekSpecialType.CIRCUIT_OVERSEER_VISIT;

    // Partes normais (excluindo CBS e Discurso de Serviço se for visita do SC)
    const mainParts = parts
        .filter(
            p => p.room === MidweekRoom.MAIN &&
                 p.partType !== MidweekPartType.CBS &&
                 !p.title.toLowerCase().includes("discurso de serviço")
        )
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    const formatNumberedTitle = (num: number, title: string) => {
        if (/^\d+\./.test(title)) return title;
        return `${num}. ${title}`;
    };

    const cbsPart = parts.find(p => p.partType === MidweekPartType.CBS && p.isActive);
    const serviceTalkPart = parts.find(
        p => (p.title.toLowerCase().includes("discurso de serviço") || p.partType === MidweekPartType.CUSTOM) && p.isActive
    );

    const [serviceTalkTheme, setServiceTalkTheme] = useState(
        serviceTalkPart?.sourceMaterial || serviceTalkPart?.title || "Discurso de Serviço"
    );
    const [serviceTalkSpeaker, setServiceTalkSpeaker] = useState(
        serviceTalkPart?.custom_speaker_name || schedule.specialName || "Superintendente de Circuito"
    );
    const [savingTalk, setSavingTalk] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    useEffect(() => {
        if (serviceTalkPart) {
            setServiceTalkTheme(serviceTalkPart.sourceMaterial || serviceTalkPart.title || "Discurso de Serviço");
            setServiceTalkSpeaker(serviceTalkPart.custom_speaker_name || schedule.specialName || "Superintendente de Circuito");
        } else {
            setServiceTalkTheme("Discurso de Serviço");
            setServiceTalkSpeaker(schedule.specialName || "Superintendente de Circuito");
        }
    }, [serviceTalkPart, schedule.specialName, schedule.id]);

    const handleSaveServiceTalk = async () => {
        setSavingTalk(true);
        try {
            if (serviceTalkPart) {
                await onUpdatePart(serviceTalkPart.id, {
                    title: "Discurso de Serviço",
                    sourceMaterial: serviceTalkTheme.trim(),
                    custom_speaker_name: serviceTalkSpeaker.trim(),
                    timeMinutes: 30
                });
            } else {
                await onAddCustomPart({
                    title: "Discurso de Serviço",
                    sourceMaterial: serviceTalkTheme.trim(),
                    custom_speaker_name: serviceTalkSpeaker.trim(),
                    timeMinutes: 30,
                    method: "Discurso",
                    section: MidweekSection.LIVING,
                    partType: MidweekPartType.CUSTOM
                });
            }
            setSavedSuccess(true);
            toast.success("Discurso de Serviço salvo com sucesso!");
            setTimeout(() => setSavedSuccess(false), 2500);
        } catch (error) {
            console.error("Erro ao salvar discurso do viajante:", error);
            toast.error("Erro ao salvar Discurso de Serviço.");
        } finally {
            setSavingTalk(false);
        }
    };

    return (
        <div className="flex flex-col rounded-xl border border-surface-300 bg-surface-100 overflow-hidden shadow-sm">
            {/* Header da Seção com cor e ícone oficiais */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#BA2A12] text-white">
                <div className="flex items-center gap-3">
                    <MidweekLivingIcon className="h-6 w-6" size={24} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">
                        Nossa Vida Cristã
                    </h3>
                </div>

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onOpenCustomPartModal}
                    className="text-xs text-white hover:bg-[#96210E] flex items-center gap-1 h-7 px-2 cursor-pointer"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Adicionar Parte</span>
                </Button>
            </div>

            {/* Lista de Partes de Vida Cristã */}
            <div className="divide-y divide-surface-300 p-2">
                {mainParts.map((part, index) => {
                    const partNum = startPartNumber + index;
                    const isLocalNeeds = part.partType === MidweekPartType.LOCAL_NEEDS;
                    const isCustom = part.partType === MidweekPartType.CUSTOM;

                    return (
                        <div
                            key={part.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-3 gap-3 hover:bg-surface-200/70 rounded-lg transition-colors"
                        >
                            <div className="flex flex-col gap-1 md:w-1/2">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-typography-700 bg-surface-200 px-2 py-0.5 rounded">
                                        <Clock className="h-3 w-3 text-typography-500" />
                                        {part.timeMinutes} min
                                    </span>

                                    {isLocalNeeds && (
                                        <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                                            Necessidades Locais
                                        </span>
                                    )}

                                    {isCustom && (
                                        <span className="text-[11px] font-medium text-typography-700 bg-surface-200 px-1.5 py-0.5 rounded">
                                            Personalizada
                                        </span>
                                    )}

                                    {part.method && (
                                        <span className="text-[11px] text-typography-500">
                                            ({part.method})
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-bold text-sm text-[#BA2A12] dark:text-rose-400 leading-snug">
                                    {formatNumberedTitle(partNum, part.title)}
                                </h4>

                                {part.sourceMaterial && (
                                    <p className="text-xs text-typography-500 italic mt-0.5 leading-relaxed">
                                        {part.sourceMaterial}
                                    </p>
                                )}
                            </div>

                            <div className="md:w-1/2 flex items-center justify-end gap-2">
                                <div className="w-full max-w-sm">
                                    <MidweekPublisherSelect
                                        partId={part.id}
                                        value={part.assigned_publisher_id}
                                        publisher={part.assignedPublisher}
                                        onChange={(pubId) => onUpdatePart(part.id, { assigned_publisher_id: pubId })}
                                        placeholder="Selecione o irmão..."
                                    />
                                </div>

                                {isCustom && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDeletePart(part.id)}
                                        className="h-8 w-8 text-typography-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                                        title="Excluir parte personalizada"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* CASO 1: Visita do Superintendente de Circuito -> Discurso de Serviço (30 min) */}
                {isCoVisit ? (
                    <div className="p-4 bg-amber-500/10 rounded-xl my-2 border border-amber-500/30 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                            <div className="flex items-center gap-2">
                                <Mic className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h4 className="font-bold text-sm text-[#BA2A12] dark:text-rose-400 flex items-center gap-2">
                                        <span>{formatNumberedTitle(startPartNumber + mainParts.length, "Discurso de Serviço (30 min)")}</span>
                                    </h4>
                                    <p className="text-xs text-typography-500">
                                        Proferido pelo Superintendente de Circuito durante a semana da visita.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-6 flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800">
                                    Tema do Discurso de Serviço
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Fortaleça sua fé para os dias à frente..."
                                    value={serviceTalkTheme}
                                    onChange={(e) => setServiceTalkTheme(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>

                            <div className="sm:col-span-4 flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800">
                                    Nome do Orador / Superintendente
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Carlos Silva (Superintendente)"
                                    value={serviceTalkSpeaker}
                                    onChange={(e) => setServiceTalkSpeaker(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>

                            <div className="sm:col-span-2 flex justify-end">
                                <Button
                                    size="sm"
                                    disabled={savingTalk}
                                    onClick={handleSaveServiceTalk}
                                    className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center justify-center gap-1 h-8 shadow-sm cursor-pointer"
                                >
                                    {savingTalk ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : savedSuccess ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : null}
                                    <span>{savingTalk ? "Salvando..." : savedSuccess ? "Salvo!" : "Salvar"}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* CASO 2: Semana Normal -> Estudo Bíblico de Congregação (CBS) */
                    <div className="p-3 bg-surface-200/50 rounded-xl my-2 border border-surface-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-3 border-b border-surface-300">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-[#BA2A12] dark:text-rose-400">
                                    {formatNumberedTitle(startPartNumber + mainParts.length, "Estudo Bíblico de Congregação (30 min)")}
                                </h4>
                            </div>
                            {cbsPart?.sourceMaterial && (
                                <span className="text-xs text-typography-500 italic">
                                    {cbsPart.sourceMaterial}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-typography-700 flex items-center gap-1">
                                    <User className="h-3.5 w-3.5 text-blue-500" />
                                    Dirigente
                                </span>
                                <MidweekPublisherSelect
                                    scheduleId={schedule.id}
                                    role="CBS_CONDUCTOR"
                                    value={schedule.cbs_conductor_id}
                                    publisher={schedule.cbsConductor}
                                    onChange={(pubId) => onUpdateSchedule({ cbs_conductor_id: pubId })}
                                    placeholder="Selecione o dirigente..."
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-typography-700 flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                                    Leitor
                                </span>
                                <MidweekPublisherSelect
                                    scheduleId={schedule.id}
                                    role="CBS_READER"
                                    value={schedule.cbs_reader_id}
                                    publisher={schedule.cbsReader}
                                    onChange={(pubId) => onUpdateSchedule({ cbs_reader_id: pubId })}
                                    placeholder="Selecione o leitor..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};