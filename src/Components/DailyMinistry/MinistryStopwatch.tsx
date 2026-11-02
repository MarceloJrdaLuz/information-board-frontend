import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, Clock, Plus, RotateCcw, Smartphone } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface MinistryStopwatchProps {
    onFinish: (elapsedMinutes: number) => void;
}

export default function MinistryStopwatch({ onFinish }: MinistryStopwatchProps) {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const accumulatedSecsRef = useRef<number>(0);

    const playSilentAudio = useCallback(() => {
        try {
            if (typeof window === "undefined") return;

            // Criar stream de áudio contínuo (Live Stream infinito) via AudioContext.
            // Por ser infinito/live, o Android/iOS remove a barra de progresso (seekbar) da notificação!
            if (!audioContextRef.current) {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                    const ctx = new AudioCtx();
                    const dest = ctx.createMediaStreamDestination();
                    const gain = ctx.createGain();
                    gain.gain.value = 0; // silêncio absoluto
                    const osc = ctx.createOscillator();
                    osc.connect(gain);
                    gain.connect(dest);
                    osc.start();

                    audioContextRef.current = ctx;
                    streamRef.current = dest.stream;
                }
            }

            if (audioContextRef.current && audioContextRef.current.state === "suspended") {
                audioContextRef.current.resume().catch(() => {});
            }

            if (!audioRef.current) {
                const audio = new Audio();
                audioRef.current = audio;
            }

            // Atribuir o stream infinito como srcObject
            if (streamRef.current) {
                if (audioRef.current.srcObject !== streamRef.current) {
                    audioRef.current.srcObject = streamRef.current;
                }
            } else if (!audioRef.current.src) {
                audioRef.current.src = "/silence.wav";
                audioRef.current.loop = true;
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
            if (audioContextRef.current && audioContextRef.current.state === "running") {
                audioContextRef.current.suspend().catch(() => {});
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

    // Recuperar estado salvo do localStorage se o usuário fechar/recarregar a página
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

    // Intervalo de contagem de tempo
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

    const handleReset = () => {
        startTimeRef.current = null;
        accumulatedSecsRef.current = 0;
        setIsActive(false);
        setSeconds(0);
        localStorage.removeItem("ministry_timer_start");
        localStorage.removeItem("ministry_timer_active");
        localStorage.removeItem("ministry_timer_accumulated");
        pauseSilentAudio();
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "none";
        }
    };

    const handleStopAndSave = () => {
        const finalSecs = syncTime();
        handlePause();
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "none";
        }
        const minutes = Math.round(finalSecs / 60);
        onFinish(minutes);
    };

    // Sincronização com o painel de mídia do Android / iOS (MediaSession API)
    useEffect(() => {
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            if (isActive) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: `⏱️ Ministério: ${formatTime(seconds)}`,
                    artist: "Quadro de Anúncios • Em andamento",
                    album: "Minhas Atividades",
                    artwork: [
                        { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
                        { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png" }
                    ]
                });
                navigator.mediaSession.playbackState = "playing";
            } else if (seconds > 0) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: `⏸️ Pausado: ${formatTime(seconds)}`,
                    artist: "Quadro de Anúncios • Pausado",
                    album: "Minhas Atividades",
                    artwork: [
                        { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png" },
                        { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png" }
                    ]
                });
                navigator.mediaSession.playbackState = "paused";
            } else {
                navigator.mediaSession.playbackState = "none";
            }
        }
    }, [seconds, isActive]);

    // Ações na tela de bloqueio e barra de notificações do celular (Play, Pause, Stop)
    useEffect(() => {
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            try {
                navigator.mediaSession.setActionHandler("play", () => {
                    handleStart();
                });
                navigator.mediaSession.setActionHandler("pause", () => {
                    handlePause();
                });
                navigator.mediaSession.setActionHandler("stop", () => {
                    handlePause();
                });
                // Desabilitar explicitamente ações de seek para não exibir controles ou barra de busca
                try { navigator.mediaSession.setActionHandler("seekto" as any, null); } catch {}
                try { navigator.mediaSession.setActionHandler("seekbackward" as any, null); } catch {}
                try { navigator.mediaSession.setActionHandler("seekforward" as any, null); } catch {}
            } catch (err) {
                console.error("Erro ao configurar MediaSession handlers:", err);
            }
        }
    });

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
                            onClick={handleReset}
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
        </div>
    );
}

