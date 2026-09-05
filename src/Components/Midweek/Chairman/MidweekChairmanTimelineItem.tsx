import React from "react";
import { ITimelineItem, ITimerState } from "@/types/midweekChairman";
import { Play, Pause, RotateCcw, CheckCircle2, Circle, Clock, Music, User, BookOpen, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/Components/ui/button";

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

    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                timer.isCompleted
                    ? "bg-surface-200/50 border-surface-300 opacity-60"
                    : timer.isRunning
                    ? "bg-surface-100 border-primary-200 shadow-md ring-1 ring-primary-200/30"
                    : item.isChairmanComment
                    ? "bg-surface-100/60 border-dashed border-surface-300"
                    : "bg-surface-100 border-surface-300 hover:border-surface-400 shadow-sm"
            }`}
        >
            {/* Lado Esquerdo: Horário Previsto + Detalhes da Parte */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
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
                <div className="flex flex-col items-center justify-center px-2 py-1 bg-surface-200 border border-surface-300 rounded-lg min-w-[76px] flex-shrink-0">
                    <span className="text-xs font-bold text-typography-900 tracking-tight font-mono">
                        {item.startTime}
                    </span>
                    <span className="text-[10px] text-typography-500 font-mono">
                        até {item.endTime}
                    </span>
                </div>

                {/* Informações da Parte */}
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Tag de Duração */}
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-200 text-typography-700 border border-surface-300 flex-shrink-0">
                            {item.durationMinutes} min
                        </span>

                        {/* Tag da Seção */}
                        {!item.isChairmanComment && (
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded text-white tracking-wide uppercase"
                                style={{ backgroundColor: item.sectionColor }}
                            >
                                {item.sectionTitle}
                            </span>
                        )}

                        {item.isSong && (
                            <span className="text-[10px] font-semibold flex items-center gap-1 text-primary-200">
                                <Music className="w-3 h-3" /> Cântico {item.songNumber ? `#${item.songNumber}` : ""}
                            </span>
                        )}
                    </div>

                    {/* Título da Parte */}
                    <h4
                        className={`text-sm font-bold mt-1 leading-snug break-words ${
                            timer.isCompleted
                                ? "line-through text-typography-500"
                                : item.isChairmanComment
                                ? "text-typography-700 font-medium italic"
                                : "text-typography-900"
                        }`}
                    >
                        {item.title}
                    </h4>

                    {/* Informações de Lição/Ponto de Estudo */}
                    {item.lessonInfo && (
                        <div className="mt-0.5">
                            <span className="text-typography-600 font-medium bg-surface-200/80 px-2 py-0.5 rounded text-[11px] border border-surface-300 inline-block">
                                {item.lessonInfo}
                            </span>
                        </div>
                    )}

                    {/* Material Fonte / Descrição da Tarefa */}
                    {item.sourceMaterial && (
                        <div className="mt-1.5 p-2 rounded-lg bg-surface-200/50 border border-surface-300/60 text-xs text-typography-700 leading-relaxed flex items-start gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-typography-500 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{item.sourceMaterial}</span>
                        </div>
                    )}

                    {/* Participantes / Designados da Parte */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        {/* Seção de Estudante (Faça Seu Melhor) com Salão Principal e Sala Auxiliar */}
                        {item.isStudentPart ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full flex-wrap">
                                {/* Salão Principal */}
                                <div className="flex items-center gap-1.5 bg-surface-200/80 px-2.5 py-1 rounded-md border border-surface-300">
                                    <User className="w-3.5 h-3.5 text-primary-200 flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-typography-900">
                                        {item.auxAssignedName ? "Principal:" : (item.assignedRoleLabel ? `${item.assignedRoleLabel}:` : "Titular:")}
                                    </span>
                                    <span className="text-typography-800 font-medium">{item.assignedName || "A designar"}</span>

                                    {item.assistantName && (
                                        <>
                                            <span className="text-typography-400 mx-0.5">•</span>
                                            <span className="text-[11px] text-typography-500">Ajudante:</span>
                                            <span className="text-typography-800 font-medium">{item.assistantName}</span>
                                        </>
                                    )}
                                </div>

                                {/* Sala Auxiliar (se houver) */}
                                {item.auxAssignedName && (
                                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 text-amber-900 dark:text-amber-200">
                                        <Users className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                        <span className="text-[11px] font-bold">Sala B:</span>
                                        <span className="font-medium">{item.auxAssignedName}</span>

                                        {item.auxAssistantName && (
                                            <>
                                                <span className="opacity-40 mx-0.5">•</span>
                                                <span className="text-[11px] opacity-80">Ajudante:</span>
                                                <span className="font-medium">{item.auxAssistantName}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : item.auxReaderName ? (
                            /* Leitura da Bíblia com Salão Principal e Sala Auxiliar */
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 bg-surface-200/80 px-2.5 py-1 rounded-md border border-surface-300">
                                    <User className="w-3.5 h-3.5 text-primary-200 flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-typography-900">Principal:</span>
                                    <span className="text-typography-800 font-medium">{item.assignedName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 text-amber-900 dark:text-amber-200">
                                    <Users className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                    <span className="text-[11px] font-bold">Sala B:</span>
                                    <span className="font-medium">{item.auxReaderName}</span>
                                </div>
                            </div>
                        ) : (
                            /* Demais partes (Orador, Dirigente, Presidente, Oração) */
                            <div className="flex items-center gap-2 flex-wrap">
                                {item.assignedName && (
                                    <div className="flex items-center gap-1.5 bg-surface-200/80 px-2.5 py-1 rounded-md border border-surface-300">
                                        <User className="w-3.5 h-3.5 text-typography-500 flex-shrink-0" />
                                        {item.assignedRoleLabel && (
                                            <span className="text-[11px] font-bold text-typography-900">
                                                {item.assignedRoleLabel}:
                                            </span>
                                        )}
                                        <span className="text-typography-800 font-medium">{item.assignedName}</span>
                                    </div>
                                )}

                                {item.readerName && (
                                    <div className="flex items-center gap-1.5 bg-surface-200/80 px-2.5 py-1 rounded-md border border-surface-300">
                                        <BookOpen className="w-3.5 h-3.5 text-typography-500 flex-shrink-0" />
                                        <span className="text-[11px] font-bold text-typography-900">Leitor:</span>
                                        <span className="text-typography-800 font-medium">{item.readerName}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lado Direito: Cronômetro e Controles */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0 border-t sm:border-t-0 border-surface-200 pt-2 sm:pt-0 flex-shrink-0">
                {/* Display do Cronômetro */}
                <div className="flex flex-col items-end">
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-base tracking-wider ${timerBadgeClass}`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(timer.elapsedSeconds)}</span>
                    </div>

                    {/* Indicador de tempo excedido ou restante */}
                    {isOvertime ? (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            +{formatTime(diffSeconds)}
                        </span>
                    ) : (
                        <span className="text-[10px] text-typography-400 mt-0.5">
                            meta: {item.durationMinutes}:00
                        </span>
                    )}
                </div>

                {/* Botões de Ação do Cronômetro */}
                <div className="flex items-center gap-1">
                    {timer.isRunning ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onPause}
                            className="h-8 px-2.5 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                            title="Pausar cronômetro"
                        >
                            <Pause className="w-4 h-4 fill-current" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onStart}
                            className="h-8 px-2.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                            title="Iniciar cronômetro"
                        >
                            <Play className="w-4 h-4 fill-current" />
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onReset}
                        disabled={timer.elapsedSeconds === 0 && !timer.isRunning}
                        className="h-8 w-8 p-0 text-typography-400 hover:text-typography-800 disabled:opacity-30"
                        title="Zerar cronômetro"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
