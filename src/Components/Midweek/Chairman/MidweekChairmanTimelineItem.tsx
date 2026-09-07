import React from "react";
import { Button } from "@/Components/ui/button";
import { ITimelineItem, ITimerState } from "@/types/midweekChairman";
import { AlertTriangle, CheckCircle2, Circle, Clock, Music, Pause, Play, RotateCcw } from "lucide-react";

interface MidweekChairmanTimelineItemProps {
    item: ITimelineItem;
    timer: ITimerState;
    status: 'idle' | 'running' | 'warning' | 'overtime' | 'completed';
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onToggleCompleted: () => void;
    formatTime: (seconds: number) => string;
}

export const MidweekChairmanTimelineItem: React.FC<MidweekChairmanTimelineItemProps> = ({
    item,
    timer,
    status,
    onStart,
    onPause,
    onReset,
    onToggleCompleted,
    formatTime
}) => {
    const maxSeconds = item.durationMinutes * 60;
    const isOvertime = timer.elapsedSeconds > maxSeconds;
    const diffSeconds = timer.elapsedSeconds - maxSeconds;

    // Cores e estilos baseados no status do cronômetro
    let timerBadgeClass = "bg-surface-200 text-typography-700 border-surface-300";
    if (status === 'running') {
        timerBadgeClass = "bg-primary-100/20 text-primary-200 border-primary-200 font-bold animate-pulse";
    } else if (status === 'warning') {
        timerBadgeClass = "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-400 font-bold animate-pulse";
    } else if (status === 'overtime') {
        timerBadgeClass = "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500 font-bold";
    } else if (status === 'completed') {
        timerBadgeClass = "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300";
    }

    // Cor do título da parte baseada na seção
    const getPartTitleClass = () => {
        if (timer.isCompleted) return "line-through text-typography-500";
        if (item.isChairmanComment) return "text-typography-600 dark:text-typography-400 font-medium italic";
        if (item.section === 'TREASURES' || item.section === 'HEADER') return "text-[#205B6F] dark:text-[#38BDF8]";
        if (item.section === 'MINISTRY') return "text-[#B45309] dark:text-[#FBBF24]";
        if (item.section === 'LIVING' || item.section === 'CONCLUSION') return "text-[#973934] dark:text-[#F87171]";
        return "text-typography-900";
    };

    return (
        <div
            className={`flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl border border-l-4 transition-all ${
                timer.isCompleted
                    ? "bg-surface-200/50 border-surface-300 opacity-60"
                    : timer.isRunning
                    ? "bg-surface-100 border-primary-200 shadow-md ring-1 ring-primary-200/30"
                    : item.isChairmanComment
                    ? "bg-surface-100/60 border-dashed border-surface-300"
                    : "bg-surface-100 border-surface-300 hover:border-surface-400 shadow-sm"
            }`}
            style={{
                borderLeftColor: item.isChairmanComment ? undefined : (item.sectionColor || undefined)
            }}
        >
            {/* 1. TOPO: Checkbox + Horário Previsto + Duração/Cântico + Título */}
            <div className="flex items-start gap-2.5 sm:gap-3 w-full">
                {/* Botão de Concluir / Check */}
                <button
                    type="button"
                    onClick={onToggleCompleted}
                    className="mt-0.5 text-typography-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                    title={timer.isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                >
                    {timer.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                        <Circle className="w-5 h-5" />
                    )}
                </button>

                {/* Badge de Horário Previsto (ex: 19:00 - 19:05) */}
                <div className="flex flex-col items-center justify-center px-1.5 sm:px-2 py-1 bg-surface-200 border border-surface-300 rounded-lg min-w-[66px] sm:min-w-[76px] flex-shrink-0 text-center">
                    <span className="text-[11px] sm:text-xs font-bold text-typography-900 tracking-tight font-mono">
                        {item.startTime}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-typography-500 font-mono">
                        até {item.endTime}
                    </span>
                </div>

                {/* Informações da Parte: Tags e Título */}
                <div className="flex flex-col min-w-0 flex-1 gap-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {/* Tag de Duração */}
                        <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-200 text-typography-700 border border-surface-300 flex-shrink-0">
                            {item.durationMinutes} min
                        </span>

                        {item.isSong && (
                            <span className="text-[10px] sm:text-xs font-semibold flex items-center gap-1 text-primary-200 flex-shrink-0">
                                <Music className="w-3 h-3" /> Cântico {item.songNumber ? `#${item.songNumber}` : ""}
                            </span>
                        )}
                    </div>

                    {/* Título da Parte */}
                    <h4
                        className={`text-sm sm:text-base font-bold leading-snug break-words ${getPartTitleClass()}`}
                    >
                        {item.title}
                    </h4>
                </div>
            </div>

            {/* Bloco em largura total para Material Fonte e Lição (APENAS para Faça Seu Melhor no Ministério) */}
            {item.section === 'MINISTRY' && (item.sourceMaterial || item.lessonInfo) && (
                <div className="flex flex-col gap-0.5 w-full">
                    {item.sourceMaterial && (
                        <span className="text-xs sm:text-sm text-typography-800 dark:text-typography-200 font-medium leading-snug break-words">
                            {item.sourceMaterial}
                        </span>
                    )}

                    {item.lessonInfo && (
                        <span className="text-[11px] sm:text-xs text-typography-500 italic leading-snug break-words">
                            {item.lessonInfo}
                        </span>
                    )}
                </div>
            )}

            {/* Para Leitura da Bíblia em Tesouros (apenas ponto de estudo / lição, se houver) */}
            {item.section === 'TREASURES' && item.partType === 'BIBLE_READING' && item.lessonInfo && (
                <div className="w-full">
                    <span className="text-[11px] sm:text-xs text-typography-500 italic leading-snug break-words">
                        {item.lessonInfo}
                    </span>
                </div>
            )}

            {/* 2. MEIO: Designações dos Irmãos (Estilo Carrossel Público: badges em largura total) */}
            {(item.assignedName || item.auxAssignedName || item.readerName || item.auxReaderName) && (
                <div className="w-full flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs pt-1">
                    {/* Seção de Estudante (Faça Seu Melhor) com Salão Principal e Sala Auxiliar */}
                    {item.isStudentPart ? (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
                            {/* Salão Principal */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-surface-100 px-2.5 py-1.5 rounded-lg border border-surface-300 shadow-2xs max-w-full">
                                <span className="font-bold text-typography-900">
                                    {item.assignedName || "A designar"}
                                </span>

                                {item.assistantName && (
                                    <span className="text-typography-700 flex items-center gap-1">
                                        <span className="text-typography-400 font-normal text-[11px]">Ajudante:</span>
                                        <span className="font-medium text-typography-800">{item.assistantName}</span>
                                    </span>
                                )}
                            </div>

                            {/* Sala Auxiliar / Sala B (se houver) */}
                            {item.auxAssignedName && (
                                <div className="flex flex-wrap items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-900 dark:text-amber-200 max-w-full">
                                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Sala B:</span>
                                    <span className="font-bold">{item.auxAssignedName}</span>

                                    {item.auxAssistantName && (
                                        <span className="flex items-center gap-1">
                                            <span className="opacity-60 text-[11px]">Ajudante:</span>
                                            <span className="font-medium">{item.auxAssistantName}</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : item.auxReaderName ? (
                        /* Leitura da Bíblia com Salão Principal e Sala Auxiliar */
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
                            <div className="flex items-center gap-1.5 bg-surface-100 px-2.5 py-1.5 rounded-lg border border-surface-300 shadow-2xs">
                                <span className="text-[11px] font-bold text-[#205B6F] dark:text-[#38BDF8]">Salão Principal:</span>
                                <span className="font-bold text-typography-900">{item.assignedName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-900 dark:text-amber-200">
                                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Sala B:</span>
                                <span className="font-bold">{item.auxReaderName}</span>
                            </div>
                        </div>
                    ) : (
                        /* Demais partes (Orador, Dirigente, Presidente, Oração) */
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
                            {item.assignedName && (
                                <div className="flex items-center gap-1.5 bg-surface-100 px-2.5 py-1.5 rounded-lg border border-surface-300 shadow-2xs">
                                    {item.assignedRoleLabel && (
                                        <span className="text-[11px] font-bold text-typography-500">
                                            {item.assignedRoleLabel}:
                                        </span>
                                    )}
                                    <span className="font-bold text-typography-900">{item.assignedName}</span>
                                </div>
                            )}

                            {item.readerName && (
                                <div className="flex items-center gap-1.5 bg-surface-100 px-2.5 py-1.5 rounded-lg border border-surface-300 shadow-2xs">
                                    <span className="text-[11px] font-bold text-typography-500">Leitor:</span>
                                    <span className="font-bold text-typography-900">{item.readerName}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 3. FIM: Cronômetro e Controles em Barra Inferior */}
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-surface-200/80 flex-shrink-0 w-full">
                {/* Display do Cronômetro + Meta */}
                <div className="flex items-center gap-2">
                    <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-sm sm:text-base tracking-wider ${timerBadgeClass}`}
                    >
                        <Clock className="w-4 h-4 md:w-3.5 md:h-3.5 flex-shrink-0" />
                        <span className="font-bold">{formatTime(timer.elapsedSeconds)}</span>
                    </div>

                    {/* Indicador de tempo excedido ou restante */}
                    {isOvertime ? (
                        <span className="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 md:w-3 md:h-3" />
                            +{formatTime(diffSeconds)}
                        </span>
                    ) : (
                        <span className="text-[11px] sm:text-xs text-typography-400 font-medium">
                            meta: {item.durationMinutes}:00
                        </span>
                    )}
                </div>

                {/* Botões de Ação do Cronômetro */}
                <div className="flex items-center gap-1.5 sm:gap-1">
                    {timer.isRunning ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onPause}
                            className="h-8 sm:h-8 px-3 sm:px-2.5 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 gap-1.5"
                            title="Pausar cronômetro"
                        >
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-medium">Pausar</span>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onStart}
                            className="h-8 sm:h-8 px-3 sm:px-2.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 gap-1.5"
                            title="Iniciar cronômetro"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-medium">Iniciar</span>
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onReset}
                        disabled={timer.elapsedSeconds === 0 && !timer.isRunning}
                        className="h-8 w-8 sm:h-8 sm:w-8 p-0 text-typography-400 hover:text-typography-800 disabled:opacity-30"
                        title="Zerar cronômetro"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
