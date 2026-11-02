import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Square, Clock, Plus, RotateCcw, Maximize2, Minimize2, Bell, BellRing, Smartphone } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface MinistryStopwatchProps {
    onFinish: (elapsedMinutes: number) => void;
}

export interface StoredTimer {
    running: boolean;
    startedAt: number | null;
    accumulatedMs: number;
}

const STORAGE_KEY = "ministry-field-stopwatch";

const EMPTY_TIMER: StoredTimer = {
    running: false,
    startedAt: null,
    accumulatedMs: 0
};

function clockLabel(milliseconds: number) {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return [hours, minutes, rest].map((value) => String(value).padStart(2, "0")).join(":");
}

function timerElapsed(timer: StoredTimer, now: number) {
    const activeElapsed = timer.running && timer.startedAt !== null
        ? Math.max(0, now - timer.startedAt)
        : 0;
    return Math.max(0, timer.accumulatedMs + activeElapsed);
}

function parseStoredTimer(value: string | null, now = Date.now()): StoredTimer {
    if (!value) return { ...EMPTY_TIMER };
    try {
        const parsed = JSON.parse(value) as Partial<StoredTimer> | null;
        if (!parsed || typeof parsed !== "object") return { ...EMPTY_TIMER };
        const accumulatedMs = typeof parsed.accumulatedMs === "number" && Number.isFinite(parsed.accumulatedMs)
            ? Math.max(0, parsed.accumulatedMs)
            : 0;
        const savedStartedAt = typeof parsed.startedAt === "number" && Number.isFinite(parsed.startedAt) && parsed.startedAt > 0
            ? parsed.startedAt
            : null;
        const running = parsed.running === true && savedStartedAt !== null;
        return {
            running,
            startedAt: running ? Math.min(savedStartedAt, now) : null,
            accumulatedMs
        };
    } catch {
        return { ...EMPTY_TIMER };
    }
}

function syncTimerNotification(timer: StoredTimer, elapsedMs: number) {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("Notification" in window) || Notification.permission !== "granted") return;
    void navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
            type: "HORA_TIMER_NOTIFICATION",
            timer: { running: timer.running, elapsedMs }
        });
    }).catch(() => undefined);
}

function closeTimerNotification() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({ type: "HORA_TIMER_NOTIFICATION_CLOSE" });
    }).catch(() => undefined);
}

export default function MinistryStopwatch({ onFinish }: MinistryStopwatchProps) {
    const [timer, setTimer] = useState<StoredTimer>(EMPTY_TIMER);
    const [now, setNow] = useState(0);
    const [hydrated, setHydrated] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");
    const [fullscreen, setFullscreen] = useState(false);
    const timerActionRef = useRef<(action: string) => void>(() => undefined);
    const lastNotificationTick = useRef(-1);

    // WakeLock para manter a tela do celular acesa durante o modo foco
    useEffect(() => {
        let wakeLockSentinel: any = null;
        if (fullscreen && timer.running && typeof navigator !== "undefined" && "wakeLock" in navigator) {
            (navigator as any).wakeLock
                .request("screen")
                .then((lock: any) => { wakeLockSentinel = lock; })
                .catch(() => undefined);
        }
        return () => {
            if (wakeLockSentinel && typeof wakeLockSentinel.release === "function") {
                void wakeLockSentinel.release().catch(() => undefined);
            }
        };
    }, [fullscreen, timer.running]);

    // Recupera dados salvos no localStorage no primeiro frame
    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            const timestamp = Date.now();
            let saved: string | null = null;
            try { saved = window.localStorage.getItem(STORAGE_KEY); } catch {}
            setTimer(parseStoredTimer(saved, timestamp));
            setNow(timestamp);
            setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
            setHydrated(true);
        });
        return () => window.cancelAnimationFrame(frame);
    }, []);

    // Salva no localStorage quando o timer mudar
    useEffect(() => {
        if (!hydrated) return;
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timer)); } catch {}
    }, [hydrated, timer]);

    // Tick a cada segundo
    useEffect(() => {
        if (!timer.running) return;
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, [timer.running]);

    // Sincroniza ao trocar de aba, focar ou em abas secundárias
    useEffect(() => {
        if (!hydrated) return;
        const refresh = () => setNow(Date.now());
        const syncFromAnotherTab = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) return;
            const timestamp = Date.now();
            setTimer(parseStoredTimer(event.newValue, timestamp));
            setNow(timestamp);
        };
        document.addEventListener("visibilitychange", refresh);
        window.addEventListener("focus", refresh);
        window.addEventListener("storage", syncFromAnotherTab);
        return () => {
            document.removeEventListener("visibilitychange", refresh);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("storage", syncFromAnotherTab);
        };
    }, [hydrated]);

    const elapsedMs = useMemo(() => timerElapsed(timer, now), [now, timer]);

    function startOrResume() {
        if (!hydrated) return;
        const timestamp = Date.now();
        setNow(timestamp);
        setTimer((current) => ({ ...current, running: true, startedAt: timestamp }));
    }

    function pause() {
        const timestamp = Date.now();
        setNow(timestamp);
        setTimer((current) => ({
            ...current,
            running: false,
            startedAt: null,
            accumulatedMs: timerElapsed(current, timestamp)
        }));
    }

    function reset() {
        if (elapsedMs > 0 && !window.confirm("Deseja zerar o cronômetro?")) return;
        setTimer({ ...EMPTY_TIMER });
        setNow(Date.now());
        closeTimerNotification();
    }

    function finish() {
        const timestamp = Date.now();
        const finalElapsedMs = timerElapsed(timer, timestamp);
        const minutes = Math.max(1, Math.round(finalElapsedMs / 60000));
        setTimer({ ...EMPTY_TIMER });
        setNow(timestamp);
        closeTimerNotification();
        if (fullscreen) setFullscreen(false);
        onFinish(minutes);
    }

    async function enableNotifications() {
        if (typeof window === "undefined" || !("Notification" in window)) return;
        try {
            const request = Notification.requestPermission() as Promise<NotificationPermission> | undefined;
            const permission = request ? await request : Notification.permission;
            setNotificationPermission(permission);
            if (permission === "granted" && elapsedMs > 0) {
                syncTimerNotification(timer, elapsedMs);
            }
        } catch {
            setNotificationPermission(Notification.permission);
        }
    }

    useEffect(() => {
        timerActionRef.current = (action: string) => {
            if (action === "pause") pause();
            if (action === "resume") startOrResume();
            if (action === "stop") finish();
        };
    });

    // Atualiza a notificação do Service Worker: imediatamente no início/pausa e a cada 15 segundos para economizar bateria
    useEffect(() => {
        if (!hydrated) return;
        const seconds = Math.floor(elapsedMs / 1000);
        if (!elapsedMs) {
            closeTimerNotification();
            lastNotificationTick.current = -1;
            return;
        }
        if (!timer.running || seconds < 2 || seconds % 15 === 0) {
            if (lastNotificationTick.current !== seconds || !timer.running) {
                syncTimerNotification(timer, elapsedMs);
                lastNotificationTick.current = seconds;
            }
        }
    }, [elapsedMs, hydrated, timer]);

    // Escuta mensagens disparadas pelos botões da Notificação do celular via Service Worker
    useEffect(() => {
        if (!hydrated || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
        const onMessage = (event: MessageEvent) => {
            if (event.data?.type === "HORA_TIMER_ACTION") {
                timerActionRef.current(String(event.data.action ?? ""));
            }
        };
        navigator.serviceWorker.addEventListener("message", onMessage);

        // Tratamento para caso a página seja aberta/recarregada por um clique de ação na notificação
        const url = new URL(window.location.href);
        const requestedAction = url.searchParams.get("timerAction");
        if (requestedAction) {
            url.searchParams.delete("timerAction");
            window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
            window.setTimeout(() => timerActionRef.current(requestedAction), 50);
        }
        return () => navigator.serviceWorker.removeEventListener("message", onMessage);
    }, [hydrated]);

    return (
        <div className="flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 transition-colors ${
                        timer.running ? "bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20" : "bg-primary-200/10 text-primary-200"
                    }`}>
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-typography-500 block truncate">
                                Cronômetro do Ministério
                            </span>
                            {timer.running && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Em andamento
                                </span>
                            )}
                        </div>
                        <span className="text-2xl sm:text-3xl font-mono font-bold text-typography-900 tracking-tight">
                            {clockLabel(elapsedMs)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:w-auto items-center gap-2 w-full justify-end">
                    {!timer.running ? (
                        <Button
                            onClick={startOrResume}
                            className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                                elapsedMs === 0 ? "col-span-2 sm:col-span-1" : ""
                            }`}
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{elapsedMs > 0 ? "Continuar" : "Iniciar Campo"}</span>
                        </Button>
                    ) : (
                        <Button
                            onClick={pause}
                            variant="outline"
                            className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 font-semibold text-xs h-9 px-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pausar</span>
                        </Button>
                    )}

                    {elapsedMs > 0 && (
                        <div className="flex items-center gap-1.5 col-span-1">
                            <Button
                                onClick={finish}
                                className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs h-9 px-3.5 rounded-xl flex-1 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Lançar Tempo</span>
                            </Button>

                            <Button
                                onClick={reset}
                                variant="ghost"
                                size="icon"
                                title="Zerar cronômetro"
                                className="h-9 w-9 text-typography-400 hover:text-rose-500 hover:bg-surface-200 rounded-xl cursor-pointer shrink-0"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Botão de Modo Foco em Tela Cheia */}
                    <Button
                        onClick={() => setFullscreen(true)}
                        variant="ghost"
                        size="icon"
                        title="Modo Foco em Tela Cheia"
                        className="h-9 w-9 text-typography-500 hover:text-typography-900 hover:bg-surface-200 rounded-xl cursor-pointer shrink-0 hidden sm:inline-flex"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Rodapé Informativo / Permissão de Notificações */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 pt-2 border-t border-surface-300/60 text-[11px] text-typography-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {notificationPermission === "default" ? (
                        <button
                            type="button"
                            onClick={() => void enableNotifications()}
                            className="text-primary-200 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <Bell className="w-3.5 h-3.5" />
                            <span>Ativar controle na barra de notificações do celular (opcional)</span>
                        </button>
                    ) : notificationPermission === "granted" ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <BellRing className="w-3.5 h-3.5" />
                            <span>Notificações ativas com botões de Pausar e Finalizar na barra</span>
                        </span>
                    ) : (
                        <span>Cronômetro funciona com precisão contínua em segundo plano.</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setFullscreen(true)}
                    className="sm:hidden text-primary-200 hover:underline font-semibold flex items-center gap-1 self-end cursor-pointer"
                >
                    <Maximize2 className="w-3 h-3" />
                    <span>Modo tela cheia</span>
                </button>
            </div>

            {/* Modal / Overlay de Modo Foco em Tela Cheia */}
            {fullscreen && (
                <div
                    className="fixed inset-0 z-[100] bg-surface-100 flex flex-col justify-between p-6 sm:p-10 text-typography-900 select-none animate-in fade-in-0 duration-200"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-200" />
                            <span className="font-bold text-sm tracking-wide uppercase text-typography-600">
                                Ministério de Campo • Modo Foco
                            </span>
                        </div>
                        <Button
                            onClick={() => setFullscreen(false)}
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-10 w-10 text-typography-600 hover:text-typography-900 hover:bg-surface-200"
                            title="Sair do modo tela cheia"
                        >
                            <Minimize2 className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex flex-col items-center justify-center my-auto text-center gap-4">
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-typography-400">
                            {timer.running ? "Contagem em andamento" : elapsedMs ? "Contagem pausada" : "Pronto para iniciar"}
                        </span>
                        <output className="text-6xl sm:text-8xl md:text-9xl font-mono font-black tracking-tight text-typography-900">
                            {clockLabel(elapsedMs)}
                        </output>
                        {notificationPermission === "granted" && (
                            <span className="text-xs text-typography-400 flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5" />
                                Controles sincronizados com a barra do celular
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto w-full">
                        {timer.running ? (
                            <Button
                                onClick={pause}
                                variant="outline"
                                className="h-14 px-8 text-base font-bold rounded-2xl border-amber-500/40 text-amber-600 hover:bg-amber-500/10 flex items-center gap-2 flex-1"
                            >
                                <Pause className="w-5 h-5 fill-current" />
                                <span>Pausar</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={startOrResume}
                                className="h-14 px-8 text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 flex-1 shadow-md"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span>{elapsedMs > 0 ? "Continuar" : "Iniciar"}</span>
                            </Button>
                        )}

                        <Button
                            onClick={finish}
                            disabled={!elapsedMs}
                            className="h-14 px-8 text-base font-bold rounded-2xl bg-primary-200 hover:opacity-90 text-white flex items-center gap-2 flex-1 shadow-md disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Lançar Tempo</span>
                        </Button>

                        <Button
                            onClick={reset}
                            disabled={!elapsedMs}
                            variant="ghost"
                            className="h-14 px-5 text-sm font-bold rounded-2xl text-typography-400 hover:text-rose-500 hover:bg-surface-200 disabled:opacity-30"
                            title="Zerar"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
