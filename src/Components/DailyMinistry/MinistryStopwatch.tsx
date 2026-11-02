import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Clock, Plus, RotateCcw, Smartphone, AlertTriangle } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/Components/ui/dialog";

interface MinistryStopwatchProps {
    onFinish: (elapsedMinutes: number) => void;
}

export default function MinistryStopwatch({ onFinish }: MinistryStopwatchProps) {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const accumulatedSecsRef = useRef<number>(0);

    const playSilentAudio = useCallback(() => {
        try {
            if (typeof window === "undefined") return;

            if (!audioRef.current) {
                const audio = new Audio("/silence.wav");
                audio.loop = true;
                audioRef.current = audio;
            }

            audioRef.current.play().catch((err) => {
                console.log("Audio play error:", err);
            });
        } catch (e) {
            console.error("Audio init error:", e);
        }
    }, []);

    const pauseSilentAudio = useCallback(() => {
        try {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        } catch {}
    }, []);

    const formatTime = (totalSecs: number) => {
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    // Atualiza tempo com precisão baseada em Date.now()
    const syncTime = useCallback(() => {
        if (startTimeRef.current) {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimeRef.current) / 1000);
            const total = accumulatedSecsRef.current + elapsed;
            setSeconds(total);
            return total;
        }
        return accumulatedSecsRef.current;
    }, []);

    // Recupera estado salvo do localStorage se o usuário fechar/recarregar a página
    useEffect(() => {
        const savedStart = localStorage.getItem("ministry_timer_start");
        const savedIsActive = localStorage.getItem("ministry_timer_active") === "true";
        const savedAccumulated = parseInt(localStorage.getItem("ministry_timer_accumulated") || "0", 10);

        accumulatedSecsRef.current = savedAccumulated;

        if (savedIsActive && savedStart) {
            const startTimestamp = parseInt(savedStart, 10);
            startTimeRef.current = startTimestamp;
            const now = Date.now();
            const elapsedSinceStart = Math.floor((now - startTimestamp) / 1000);
            const total = savedAccumulated + elapsedSinceStart;
            setSeconds(total);
            setIsActive(true);
        } else if (savedAccumulated > 0) {
            setSeconds(savedAccumulated);
            setIsActive(false);
        }
    }, []);

    // Intervalo de contagem
    useEffect(() => {
        let interval: any = null;

        if (isActive) {
            interval = setInterval(() => {
                syncTime();
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, syncTime]);

    // Ao voltar para a aba ou desbloquear a tela do celular, sincroniza o tempo instantaneamente
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && isActive) {
                syncTime();
            }
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);

        return () => {
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
        };
    }, [isActive, syncTime]);

    const handleStart = () => {
        const now = Date.now();
        startTimeRef.current = now;
        accumulatedSecsRef.current = seconds;
        localStorage.setItem("ministry_timer_start", now.toString());
        localStorage.setItem("ministry_timer_active", "true");
        localStorage.setItem("ministry_timer_accumulated", seconds.toString());
        setIsActive(true);
        playSilentAudio();
    };

    const handlePause = () => {
        const currentTotal = syncTime();
        startTimeRef.current = null;
        accumulatedSecsRef.current = currentTotal;
        setIsActive(false);
        localStorage.setItem("ministry_timer_active", "false");
        localStorage.setItem("ministry_timer_accumulated", currentTotal.toString());
        localStorage.removeItem("ministry_timer_start");
        pauseSilentAudio();
    };

    const handleResetClick = () => {
        if (seconds === 0) return;
        setIsResetModalOpen(true);
    };

    const confirmReset = () => {
        setIsResetModalOpen(false);
        startTimeRef.current = null;
        accumulatedSecsRef.current = 0;
        setIsActive(false);
        setSeconds(0);
        localStorage.removeItem("ministry_timer_start");
        localStorage.removeItem("ministry_timer_active");
        localStorage.removeItem("ministry_timer_accumulated");
        pauseSilentAudio();
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "none";
        }
    };

    const handleStopAndSave = () => {
        const finalSecs = syncTime();
        handlePause();
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "none";
        }
        const minutes = Math.round(finalSecs / 60);
        onFinish(minutes);
    };

    // Sincronização com a barra de notificações e tela de bloqueio do celular (MediaSession API)
    useEffect(() => {
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            try {
                if (isActive) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: `⏱️ ${formatTime(seconds)}`,
                        artist: " ", // Espaço em branco impede que o Chrome no Android preencha com a URL/domínio do site
                        album: " ",
                        artwork: [
                            { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
                            { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png" }
                        ]
                    });
                    navigator.mediaSession.playbackState = "playing";
                } else if (seconds > 0) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: `⏸️ ${formatTime(seconds)}`,
                        artist: " ",
                        album: " ",
                        artwork: [
                            { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
                            { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png" }
                        ]
                    });
                    navigator.mediaSession.playbackState = "paused";
                } else {
                    navigator.mediaSession.playbackState = "none";
                }
            } catch (err) {
                console.error("MediaSession error:", err);
            }
        }
    }, [seconds, isActive]);

    const handleStartRef = useRef(handleStart);
    handleStartRef.current = handleStart;
    const handlePauseRef = useRef(handlePause);
    handlePauseRef.current = handlePause;

    // Ações na tela de bloqueio e barra de notificações do celular (Play, Pause, Stop)
    useEffect(() => {
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            try {
                navigator.mediaSession.setActionHandler("play", () => {
                    handleStartRef.current();
                });
                navigator.mediaSession.setActionHandler("pause", () => {
                    handlePauseRef.current();
                });
                navigator.mediaSession.setActionHandler("stop", () => {
                    handlePauseRef.current();
                });
            } catch (err) {
                console.error("Erro ao configurar MediaSession handlers:", err);
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            pauseSilentAudio();
        };
    }, [pauseSilentAudio]);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 transition-colors ${
                    isActive ? "bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20" : "bg-primary-200/10 text-primary-200"
                }`}>
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-typography-500 block truncate">
                            Cronômetro do Ministério
                        </span>
                        {isActive && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <Smartphone className="w-3 h-3" />
                                Ativo na barra do celular
                            </span>
                        )}
                    </div>
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-typography-900 tracking-tight">
                        {formatTime(seconds)}
                    </span>
                    {isActive && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium sm:hidden flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Controle ativo na barra de notificações
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:w-auto items-center gap-2 w-full justify-end">
                {!isActive ? (
                    <Button
                        onClick={handleStart}
                        className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                            seconds === 0 ? "col-span-2 sm:col-span-1" : ""
                        }`}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{seconds > 0 ? "Continuar" : "Iniciar Campo"}</span>
                    </Button>
                ) : (
                    <Button
                        onClick={handlePause}
                        variant="outline"
                        className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 font-semibold text-xs h-9 px-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pausar</span>
                    </Button>
                )}

                {seconds > 0 && (
                    <div className="flex items-center gap-1.5 col-span-1">
                        <Button
                            onClick={handleStopAndSave}
                            className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs h-9 px-3.5 rounded-xl flex-1 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Lançar Tempo</span>
                        </Button>

                        <Button
                            onClick={handleResetClick}
                            variant="ghost"
                            size="icon"
                            title="Zerar cronômetro"
                            className="h-9 w-9 text-typography-400 hover:text-rose-500 hover:bg-surface-200 rounded-xl cursor-pointer shrink-0"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação para Zerar o Cronômetro */}
            <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-sm bg-surface-100 border border-surface-300 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-base font-bold text-typography-900">
                            Zerar cronômetro?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-typography-500 text-center">
                            O tempo atual de <strong className="text-typography-900 font-mono font-bold">{formatTime(seconds)}</strong> será descartado e o cronômetro voltará para 00:00:00.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-end mt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsResetModalOpen(false)}
                            className="w-full sm:w-auto text-xs font-semibold rounded-xl h-9"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmReset}
                            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl h-9 shadow-xs"
                        >
                            Zerar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
