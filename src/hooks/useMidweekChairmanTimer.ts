import { useState, useEffect, useCallback, useRef } from "react";
import { IChairmanMeetingState, ITimerState, TimersMap } from "@/types/midweekChairman";

const STORAGE_PREFIX = "midweek_chairman_";
const MAX_STORAGE_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 dias

function getStorageKey(scheduleId: string): string {
    return `${STORAGE_PREFIX}${scheduleId}`;
}

/**
 * Limpa chaves antigas de reuniões anteriores para não acumular dados desnecessários no navegador.
 */
function cleanupOldStorage(): void {
    if (typeof window === 'undefined') return;
    try {
        const now = Date.now();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw) as IChairmanMeetingState;
                        if (parsed.updatedAt && now - parsed.updatedAt > MAX_STORAGE_AGE_MS) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch {
                    // Ignora itens com formato inválido
                }
            }
        }
    } catch {
        // Ignora erros de acesso ao storage
    }
}

export function useMidweekChairmanTimer(scheduleId: string, defaultStartTime: string = "19:00") {
    const [meetingStartTime, setMeetingStartTimeState] = useState<string>(defaultStartTime);
    const [timers, setTimers] = useState<TimersMap>({});
    const isInitializedRef = useRef(false);

    // Carrega dados persistidos do localStorage
    useEffect(() => {
        if (!scheduleId || typeof window === 'undefined') return;

        cleanupOldStorage();

        try {
            const savedRaw = localStorage.getItem(getStorageKey(scheduleId));
            if (savedRaw) {
                const parsed = JSON.parse(savedRaw) as IChairmanMeetingState;
                if (parsed.meetingStartTime) {
                    setMeetingStartTimeState(parsed.meetingStartTime);
                }

                if (parsed.timers) {
                    const now = Date.now();
                    const restoredTimers: TimersMap = {};

                    // Se a página foi recarregada enquanto algum cronômetro estava rodando,
                    // calcula o tempo transcorrido no intervalo
                    Object.entries(parsed.timers).forEach(([id, timer]) => {
                        let elapsed = timer.elapsedSeconds;
                        if (timer.isRunning && timer.startedAtTimestamp) {
                            const additionalSeconds = Math.floor((now - timer.startedAtTimestamp) / 1000);
                            elapsed += Math.max(0, additionalSeconds);
                        }

                        restoredTimers[id] = {
                            elapsedSeconds: elapsed,
                            isRunning: timer.isRunning,
                            startedAtTimestamp: timer.isRunning ? now : null,
                            isCompleted: !!timer.isCompleted
                        };
                    });

                    setTimers(restoredTimers);
                }
            }
        } catch (e) {
            console.warn("Erro ao carregar estado dos cronômetros do presidente:", e);
        }

        isInitializedRef.current = true;
    }, [scheduleId]);

    // Salva no localStorage sempre que houver alteração
    const saveToLocalStorage = useCallback((newTimers: TimersMap, startTime: string) => {
        if (!scheduleId || typeof window === 'undefined') return;
        try {
            const dataToSave: IChairmanMeetingState = {
                meetingStartTime: startTime,
                timers: newTimers,
                updatedAt: Date.now()
            };
            localStorage.setItem(getStorageKey(scheduleId), JSON.stringify(dataToSave));
        } catch (e) {
            console.warn("Erro ao salvar dados do cronômetro no localStorage:", e);
        }
    }, [scheduleId]);

    // Intervalo de contagem a cada segundo para todos os cronômetros ativos
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => {
                const hasRunning = Object.values(prev).some(t => t.isRunning);
                if (!hasRunning) return prev;

                const updated: TimersMap = {};
                let changed = false;

                Object.entries(prev).forEach(([id, timer]) => {
                    if (timer.isRunning) {
                        updated[id] = {
                            ...timer,
                            elapsedSeconds: timer.elapsedSeconds + 1
                        };
                        changed = true;
                    } else {
                        updated[id] = timer;
                    }
                });

                if (changed) {
                    saveToLocalStorage(updated, meetingStartTime);
                    return updated;
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [meetingStartTime, saveToLocalStorage]);

    // Altera o horário de início da reunião
    const setMeetingStartTime = useCallback((newTime: string) => {
        setMeetingStartTimeState(newTime);
        saveToLocalStorage(timers, newTime);
    }, [timers, saveToLocalStorage]);

    // Inicia cronômetro para uma parte (pausando outros cronômetros em execução)
    const startTimer = useCallback((itemId: string) => {
        setTimers(prev => {
            const now = Date.now();
            const updated: TimersMap = {};

            Object.entries(prev).forEach(([id, timer]) => {
                if (id === itemId) {
                    updated[id] = {
                        ...timer,
                        isRunning: true,
                        startedAtTimestamp: now
                    };
                } else if (timer.isRunning) {
                    // Pausa outros cronômetros ativos
                    updated[id] = {
                        ...timer,
                        isRunning: false,
                        startedAtTimestamp: null
                    };
                } else {
                    updated[id] = timer;
                }
            });

            if (!updated[itemId]) {
                updated[itemId] = {
                    elapsedSeconds: 0,
                    isRunning: true,
                    startedAtTimestamp: now,
                    isCompleted: false
                };
            }

            saveToLocalStorage(updated, meetingStartTime);
            return updated;
        });
    }, [meetingStartTime, saveToLocalStorage]);

    // Pausa cronômetro de uma parte
    const pauseTimer = useCallback((itemId: string) => {
        setTimers(prev => {
            const current = prev[itemId];
            if (!current || !current.isRunning) return prev;

            const updated: TimersMap = {
                ...prev,
                [itemId]: {
                    ...current,
                    isRunning: false,
                    startedAtTimestamp: null
                }
            };

            saveToLocalStorage(updated, meetingStartTime);
            return updated;
        });
    }, [meetingStartTime, saveToLocalStorage]);

    // Reseta cronômetro de uma parte
    const resetTimer = useCallback((itemId: string) => {
        setTimers(prev => {
            const updated: TimersMap = {
                ...prev,
                [itemId]: {
                    elapsedSeconds: 0,
                    isRunning: false,
                    startedAtTimestamp: null,
                    isCompleted: false
                }
            };

            saveToLocalStorage(updated, meetingStartTime);
            return updated;
        });
    }, [meetingStartTime, saveToLocalStorage]);

    // Alterna status de concluído
    const toggleCompleted = useCallback((itemId: string) => {
        setTimers(prev => {
            const current = prev[itemId] || {
                elapsedSeconds: 0,
                isRunning: false,
                startedAtTimestamp: null,
                isCompleted: false
            };

            const updated: TimersMap = {
                ...prev,
                [itemId]: {
                    ...current,
                    isCompleted: !current.isCompleted,
                    // Ao marcar como concluído, se estiver rodando, pausa
                    isRunning: !current.isCompleted ? false : current.isRunning
                }
            };

            saveToLocalStorage(updated, meetingStartTime);
            return updated;
        });
    }, [meetingStartTime, saveToLocalStorage]);

    // Reseta todos os cronômetros desta reunião
    const resetAllTimers = useCallback(() => {
        setTimers({});
        saveToLocalStorage({}, meetingStartTime);
    }, [meetingStartTime, saveToLocalStorage]);

    // Retorna o estado do timer de um item (com fallback seguro)
    const getTimer = useCallback((itemId: string): ITimerState => {
        return timers[itemId] || {
            elapsedSeconds: 0,
            isRunning: false,
            startedAtTimestamp: null,
            isCompleted: false
        };
    }, [timers]);

    /**
     * Formata segundos em MM:SS ou HH:MM:SS
     */
    const formatTimeDisplay = useCallback((totalSeconds: number): string => {
        const isNegative = totalSeconds < 0;
        const absSeconds = Math.abs(totalSeconds);
        const mins = Math.floor(absSeconds / 60);
        const secs = absSeconds % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return isNegative ? `-${formatted}` : formatted;
    }, []);

    /**
     * Retorna o status visual do timer em relação ao tempo previsto:
     * - 'idle': cronômetro zerado
     * - 'running': em execução dentro do tempo
     * - 'warning': faltando 30s ou menos para acabar o tempo da parte
     * - 'overtime': ultrapassou o tempo previsto
     * - 'completed': marcado como concluído
     */
    const getTimerStatus = useCallback((itemId: string, durationMinutes: number): 'idle' | 'running' | 'warning' | 'overtime' | 'completed' => {
        const timer = getTimer(itemId);
        if (timer.isCompleted) return 'completed';
        if (timer.elapsedSeconds === 0 && !timer.isRunning) return 'idle';

        const maxSeconds = durationMinutes * 60;
        if (timer.elapsedSeconds > maxSeconds) return 'overtime';
        if (maxSeconds - timer.elapsedSeconds <= 30 && timer.isRunning) return 'warning';

        return 'running';
    }, [getTimer]);

    return {
        meetingStartTime,
        setMeetingStartTime,
        timers,
        getTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        toggleCompleted,
        resetAllTimers,
        formatTimeDisplay,
        getTimerStatus
    };
}

