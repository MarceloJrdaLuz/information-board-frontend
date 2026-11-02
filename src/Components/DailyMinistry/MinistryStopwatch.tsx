import React, { useState, useEffect } from "react";
import { Play, Pause, Square, Clock, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface MinistryStopwatchProps {
    onFinish: (elapsedMinutes: number) => void;
}

export default function MinistryStopwatch({ onFinish }: MinistryStopwatchProps) {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // Recuperar estado salvo do localStorage se o usuário fechar/recarregar a página
        const savedStart = localStorage.getItem("ministry_timer_start");
        const savedIsActive = localStorage.getItem("ministry_timer_active") === "true";
        const savedAccumulated = parseInt(localStorage.getItem("ministry_timer_accumulated") || "0", 10);

        if (savedIsActive && savedStart) {
            const now = Date.now();
            const elapsedSinceStart = Math.floor((now - parseInt(savedStart, 10)) / 1000);
            setSeconds(savedAccumulated + elapsedSinceStart);
            setIsActive(true);
        } else if (savedAccumulated > 0) {
            setSeconds(savedAccumulated);
            setIsActive(false);
        }
    }, []);

    useEffect(() => {
        let interval: any = null;

        if (isActive) {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive]);

    // Tentar exibir status na MediaSession para controles e barra de notificações do celular
    useEffect(() => {
        if (typeof window !== "undefined" && "mediaSession" in navigator) {
            if (isActive) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: "Ministério em Andamento",
                    artist: formatTime(seconds),
                    album: "Quadro de Anúncios"
                });
            }
        }
    }, [seconds, isActive]);

    const handleStart = () => {
        const now = Date.now();
        localStorage.setItem("ministry_timer_start", now.toString());
        localStorage.setItem("ministry_timer_active", "true");
        localStorage.setItem("ministry_timer_accumulated", seconds.toString());
        setIsActive(true);
    };

    const handlePause = () => {
        setIsActive(false);
        localStorage.setItem("ministry_timer_active", "false");
        localStorage.setItem("ministry_timer_accumulated", seconds.toString());
        localStorage.removeItem("ministry_timer_start");
    };

    const handleReset = () => {
        setIsActive(false);
        setSeconds(0);
        localStorage.removeItem("ministry_timer_start");
        localStorage.removeItem("ministry_timer_active");
        localStorage.removeItem("ministry_timer_accumulated");
    };

    const handleStopAndSave = () => {
        handlePause();
        const minutes = Math.round(seconds / 60);
        onFinish(minutes);
    };

    const formatTime = (totalSecs: number) => {
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`p-3 rounded-xl shrink-0 transition-colors ${
                    isActive ? "bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20" : "bg-primary-200/10 text-primary-200"
                }`}>
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-typography-500 block">
                        Cronômetro do Ministério
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-typography-900 tracking-tight">
                        {formatTime(seconds)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {!isActive ? (
                    <Button
                        onClick={handleStart}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{seconds > 0 ? "Continuar" : "Iniciar Campo"}</span>
                    </Button>
                ) : (
                    <Button
                        onClick={handlePause}
                        variant="outline"
                        className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 font-semibold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pausar</span>
                    </Button>
                )}

                {seconds > 0 && (
                    <>
                        <Button
                            onClick={handleStopAndSave}
                            className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Lançar Tempo</span>
                        </Button>

                        <Button
                            onClick={handleReset}
                            variant="ghost"
                            size="icon"
                            title="Zerar cronômetro"
                            className="h-9 w-9 text-typography-400 hover:text-rose-500 hover:bg-surface-200 rounded-xl cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
