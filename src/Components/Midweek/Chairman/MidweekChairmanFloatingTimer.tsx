import { Button } from "@/Components/ui/button";
import { ITimelineItem, ITimerState } from "@/types/midweekChairman";
import { AlertTriangle, Check, ChevronDown, ChevronUp, ExternalLink, Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface MidweekChairmanFloatingTimerProps {
    activeItem: ITimelineItem | null;
    timerState: ITimerState;
    status: 'idle' | 'running' | 'warning' | 'overtime' | 'completed';
    onStart: (id: string) => void;
    onPause: (id: string) => void;
    onReset: (id: string) => void;
    onToggleCompleted: (id: string) => void;
    formatTime: (seconds: number) => string;
}

export const MidweekChairmanFloatingTimer: React.FC<MidweekChairmanFloatingTimerProps> = ({
    activeItem,
    timerState,
    status,
    onStart,
    onPause,
    onReset,
    onToggleCompleted,
    formatTime
}) => {
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const [isPipActive, setIsPipActive] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const pipAnimRef = useRef<number | null>(null);

    // Se não há item ativo ou se está zerado e inativo, não renderiza nada
    if (!activeItem || (timerState.elapsedSeconds === 0 && !timerState.isRunning)) {
        return null;
    }

    const durationSeconds = activeItem.durationMinutes * 60;
    const diffSeconds = timerState.elapsedSeconds - durationSeconds;
    const isOvertime = status === 'overtime';
    const isWarning = status === 'warning';

    // Cores e status
    const statusColor = isOvertime
        ? "text-rose-500 bg-rose-500/10 border-rose-500/30"
        : isWarning
        ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
        : timerState.isRunning
        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
        : "text-typography-600 bg-surface-200 border-surface-300";

    // Desenha HUD no Canvas para Picture-in-Picture
    const drawPipCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        // Fundo escuro elegante
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, h);

        // Barra de status no topo
        ctx.fillStyle = isOvertime ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
        ctx.fillRect(0, 0, w, 8);

        // Seção da Parte
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(activeItem.sectionTitle.toUpperCase(), 20, 36);

        // Título da Parte
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 20px sans-serif";
        const titleText = activeItem.title.length > 28 ? activeItem.title.slice(0, 26) + "..." : activeItem.title;
        ctx.fillText(titleText, 20, 68);

        // Designado
        if (activeItem.assignedName) {
            ctx.fillStyle = "#cbd5e1";
            ctx.font = "15px sans-serif";
            ctx.fillText(`👤 ${activeItem.assignedName}`, 20, 95);
        }

        // Tempo Principal
        const timeStr = formatTime(timerState.elapsedSeconds);
        ctx.fillStyle = isOvertime ? "#f87171" : isWarning ? "#fbbf24" : "#34d399";
        ctx.font = "bold 56px monospace";
        ctx.fillText(timeStr, 20, 160);

        // Tempo Previsto e Diferença
        ctx.fillStyle = "#94a3b8";
        ctx.font = "16px monospace";
        const targetStr = `Previsto: ${String(activeItem.durationMinutes).padStart(2, '0')}:00`;
        const diffStr = isOvertime
            ? `(+${formatTime(diffSeconds)})`
            : timerState.elapsedSeconds > 0
            ? `(-${formatTime(Math.abs(diffSeconds))})`
            : "";
        ctx.fillText(`${targetStr}  ${diffStr}`, 20, 195);
    };

    // Atualiza canvas continuamente quando PiP estiver ativo
    useEffect(() => {
        if (!isPipActive) return;

        const renderLoop = () => {
            drawPipCanvas();
            pipAnimRef.current = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        return () => {
            if (pipAnimRef.current) {
                cancelAnimationFrame(pipAnimRef.current);
            }
        };
    }, [isPipActive, timerState.elapsedSeconds, isOvertime, isWarning, activeItem]);

    // Dispara Picture-in-Picture nativo do navegador
    const handleTogglePip = async () => {
        if (typeof document === "undefined") return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                setIsPipActive(false);
                return;
            }

            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (!canvas || !video) return;

            drawPipCanvas();

            // Atribui canvas stream ao vídeo se ainda não estiver vinculado
            if (!video.srcObject) {
                const stream = canvas.captureStream(10);
                video.srcObject = stream;
            }

            await video.play();
            await video.requestPictureInPicture();
            setIsPipActive(true);

            video.addEventListener(
                "leavepictureinpicture",
                () => {
                    setIsPipActive(false);
                },
                { once: true }
            );
        } catch (error) {
            console.warn("Picture-in-picture não suportado ou negado:", error);
        }
    };

    const isPipSupported = typeof document !== "undefined" && "pictureInPictureEnabled" in document && document.pictureInPictureEnabled;

    return (
        <>
            {/* Canvas e Vídeo invisíveis para streaming do Picture-in-Picture */}
            <canvas ref={canvasRef} width={420} height={220} className="hidden" />
            <video ref={videoRef} muted playsInline className="hidden" />

            <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] sm:max-w-md transition-all duration-200">
                {isMinimized ? (
                    // Visualização Minimizada (Pílula Compacta)
                    <div className="flex items-center gap-2 p-2 bg-surface-100/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-300 shadow-xl rounded-full">
                        <button
                            onClick={() => setIsMinimized(false)}
                            className="flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold rounded-full bg-surface-200 text-typography-900 hover:bg-surface-300 transition-colors"
                            title="Expandir cronômetro flutuante"
                        >
                            <span className={`w-2 h-2 rounded-full ${timerState.isRunning ? "bg-emerald-500 animate-pulse" : "bg-typography-400"}`} />
                            <span>{formatTime(timerState.elapsedSeconds)}</span>
                            <span className="text-[10px] text-typography-500 font-sans truncate max-w-[120px]">
                                {activeItem.title}
                            </span>
                        </button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => timerState.isRunning ? onPause(activeItem.id) : onStart(activeItem.id)}
                            className="h-8 w-8 p-0 rounded-full"
                        >
                            {timerState.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </Button>

                        <button
                            onClick={() => setIsMinimized(false)}
                            className="p-1 text-typography-500 hover:text-typography-900"
                            title="Expandir"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    // Visualização Expandida Completa
                    <div className="flex flex-col gap-3 p-4 bg-surface-100/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-300 shadow-2xl rounded-2xl">
                        {/* Topo do Card Flutuante */}
                        <div className="flex items-center justify-between gap-2 border-b border-surface-200 pb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: activeItem.sectionColor }}
                                />
                                <span className="text-[11px] font-semibold text-typography-500 uppercase tracking-wider truncate">
                                    {activeItem.sectionTitle}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                {isPipSupported && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleTogglePip}
                                        className={`h-7 px-2 text-xs gap-1 ${isPipActive ? "text-primary-500 font-bold" : "text-typography-500"}`}
                                        title="Abrir Janela Flutuante sobre outros aplicativos (Picture-in-Picture)"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Janela PiP</span>
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsMinimized(true)}
                                    className="h-7 w-7 p-0 text-typography-500 hover:text-typography-900"
                                    title="Minimizar"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Conteúdo Principal: Título & Designado */}
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-typography-900 truncate" title={activeItem.title}>
                                {activeItem.title}
                            </h4>
                            {activeItem.sourceMaterial && (
                                <p className="text-xs text-primary-600 dark:text-primary-300 font-medium truncate mt-0.5">
                                    📖 {activeItem.sourceMaterial}
                                </p>
                            )}
                            {activeItem.assignedName && (
                                <p className="text-xs text-typography-600 truncate mt-0.5">
                                    👤 {activeItem.assignedName}
                                </p>
                            )}
                        </div>

                        {/* Relógio Digital e Métricas */}
                        <div className="flex items-center justify-between gap-3 bg-surface-200/80 rounded-xl p-3 border border-surface-300">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-semibold text-typography-500 uppercase">
                                    Tempo Decorrido
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-2xl font-mono font-black ${isOvertime ? "text-rose-500" : isWarning ? "text-amber-500" : "text-typography-900"}`}>
                                        {formatTime(timerState.elapsedSeconds)}
                                    </span>
                                    <span className="text-xs font-mono text-typography-500">
                                        / {String(activeItem.durationMinutes).padStart(2, '0')}:00
                                    </span>
                                </div>
                            </div>

                            {/* Badge de Diferença */}
                            {isOvertime ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-mono font-bold animate-pulse">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>+{formatTime(diffSeconds)}</span>
                                </div>
                            ) : timerState.elapsedSeconds > 0 ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-300 text-typography-700 text-xs font-mono font-medium">
                                    <span>-{formatTime(Math.abs(diffSeconds))}</span>
                                </div>
                            ) : null}
                        </div>

                        {/* Controles de Ação */}
                        <div className="flex items-center gap-2 pt-1">
                            {timerState.isRunning ? (
                                <Button
                                    size="sm"
                                    onClick={() => onPause(activeItem.id)}
                                    className="flex-1 h-9 bg-amber-600 hover:bg-amber-700 text-white gap-1.5 font-bold"
                                >
                                    <Pause className="w-4 h-4" />
                                    Pausar
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => onStart(activeItem.id)}
                                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold"
                                >
                                    <Play className="w-4 h-4" />
                                    {timerState.elapsedSeconds > 0 ? "Continuar" : "Iniciar"}
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant={timerState.isCompleted ? "outline" : "secondary"}
                                onClick={() => onToggleCompleted(activeItem.id)}
                                className={`h-9 px-3 gap-1.5 text-xs font-semibold ${
                                    timerState.isCompleted
                                        ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                                        : ""
                                }`}
                                title={timerState.isCompleted ? "Marcar como não concluída" : "Marcar como concluída"}
                            >
                                <Check className="w-4 h-4" />
                                <span>{timerState.isCompleted ? "Concluída" : "Concluir"}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
