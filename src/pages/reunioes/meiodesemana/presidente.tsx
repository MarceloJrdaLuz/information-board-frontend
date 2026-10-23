import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { MidweekChairmanFloatingTimer } from "@/Components/Midweek/Chairman/MidweekChairmanFloatingTimer";
import { MidweekChairmanHeader } from "@/Components/Midweek/Chairman/MidweekChairmanHeader";
import { MidweekChairmanNextWeekPreview } from "@/Components/Midweek/Chairman/MidweekChairmanNextWeekPreview";
import { MidweekChairmanReportModal } from "@/Components/Midweek/Chairman/MidweekChairmanReportModal";
import { MidweekChairmanTimelineItem } from "@/Components/Midweek/Chairman/MidweekChairmanTimelineItem";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useAuthContext } from "@/context/AuthContext";
import { useMidweekChairmanTimer } from "@/hooks/useMidweekChairmanTimer";
import { api } from "@/services/api";
import { IMidweekSchedule, MidweekSpecialType } from "@/types/midweek";
import { buildMidweekTimeline } from "@/utils/midweekTimelineBuilder";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useAtom } from "jotai";
import { AlertCircle, CalendarOff, Clock, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

dayjs.extend(isBetween);

function MidweekChairmanPage() {
    const { user } = useAuthContext();
    const congregationId = user?.congregation?.id;
    const defaultMeetingTime = user?.congregation?.hourMeetingLifeAndMinistary?.slice(0, 5) || "19:00";

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const now = dayjs();
    const [year, setYear] = useState<number>(now.year());
    const [month, setMonth] = useState<number>(now.month() + 1);

    const [schedules, setSchedules] = useState<IMidweekSchedule[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setPageActive("Presidente");
        setCrumbs([
            { label: "Início", link: "/dashboard" }
        ]);
    }, [setPageActive, setCrumbs]);

    // Relógio em tempo real
    const [currentTime, setCurrentTime] = useState<string>("");
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const updateClock = () => {
            const date = new Date();
            setCurrentTime(date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Detecta rolagem para exibir o relógio flutuante de forma discreta sem ocupar espaço na tela
    useEffect(() => {
        const scrollContainer = document.getElementById("dashboard-scroll-container");
        const handleScroll = () => {
            const top = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
            setIsScrolled(top > 140);
        };

        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        }
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener("scroll", handleScroll);
            }
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Busca programações do mês através da rota da congregação
    const fetchSchedules = async () => {
        if (!congregationId) return;
        setLoading(true);
        try {
            const res = await api.get(
                `/midweek/schedules/congregation/${congregationId}?year=${year}&month=${month}`
            );
            const fetchedSchedules: IMidweekSchedule[] = res.data || [];

            // Ordena as semanas por weekDate
            fetchedSchedules.sort((a, b) => (a.weekDate || "").localeCompare(b.weekDate || ""));
            setSchedules(fetchedSchedules);

            if (fetchedSchedules.length > 0) {
                // Tenta encontrar a reunião da semana corrente
                const today = dayjs().startOf('day');
                const matchingSchedule = fetchedSchedules.find(s => {
                    const startOfWeek = dayjs(s.weekDate).startOf('week');
                    const endOfWeek = dayjs(s.weekDate).endOf('week');
                    return today.isBetween(startOfWeek, endOfWeek, 'day', '[]');
                });

                if (matchingSchedule) {
                    setSelectedScheduleId(matchingSchedule.id);
                } else if (!selectedScheduleId || !fetchedSchedules.some(s => s.id === selectedScheduleId)) {
                    setSelectedScheduleId(fetchedSchedules[0].id);
                }
            } else {
                setSelectedScheduleId(null);
            }
        } catch (error) {
            console.error("Erro ao carregar reunião para o presidente:", error);
            toast.error("Erro ao carregar dados da reunião de meio de semana.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [congregationId, year, month]);

    // Reunião selecionada
    const currentSchedule = useMemo(() => {
        return schedules.find(s => s.id === selectedScheduleId) || null;
    }, [schedules, selectedScheduleId]);

    // Hook do cronômetro persistido localmente
    const timer = useMidweekChairmanTimer(currentSchedule?.id || "", defaultMeetingTime);

    // Linha do tempo calculada
    const timelineItems = useMemo(() => {
        if (!currentSchedule) return [];
        return buildMidweekTimeline(currentSchedule, timer.meetingStartTime);
    }, [currentSchedule, timer.meetingStartTime]);

    // Total de minutos previstos da reunião
    const totalExpectedMinutes = useMemo(() => {
        return timelineItems.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    }, [timelineItems]);

    // Contagem de partes concluídas
    const completedPartsCount = useMemo(() => {
        return timelineItems.filter(item => timer.getTimer(item.id).isCompleted).length;
    }, [timelineItems, timer.getTimer]);

    // Navegação entre semanas da lista
    const currentIndex = schedules.findIndex(s => s.id === selectedScheduleId);
    const hasPrevWeek = currentIndex > 0 || month > 1 || year > now.year() - 1;
    const hasNextWeek = currentIndex < schedules.length - 1 || month < 12 || year < now.year() + 1;

    // Prefetch da programação do próximo mês se estiver na última semana
    const [nextMonthSchedules, setNextMonthSchedules] = useState<IMidweekSchedule[]>([]);

    useEffect(() => {
        if (!congregationId) return;
        const isLastWeekOfMonth = currentIndex === schedules.length - 1 && schedules.length > 0;
        if (isLastWeekOfMonth) {
            const nextMonth = month === 12 ? 1 : month + 1;
            const nextYear = month === 12 ? year + 1 : year;
            api.get(`/midweek/schedules/congregation/${congregationId}?year=${nextYear}&month=${nextMonth}`)
                .then(res => {
                    const fetched: IMidweekSchedule[] = res.data || [];
                    fetched.sort((a, b) => (a.weekDate || "").localeCompare(b.weekDate || ""));
                    setNextMonthSchedules(fetched);
                })
                .catch(() => setNextMonthSchedules([]));
        } else {
            setNextMonthSchedules([]);
        }
    }, [currentIndex, schedules.length, congregationId, year, month]);

    // Próxima programação (mesmo mês ou próximo mês)
    const nextSchedule = useMemo(() => {
        if (currentIndex >= 0 && currentIndex < schedules.length - 1) {
            return schedules[currentIndex + 1];
        }
        if (nextMonthSchedules.length > 0) {
            return nextMonthSchedules[0];
        }
        return null;
    }, [currentIndex, schedules, nextMonthSchedules]);

    // Item ativo para o cronômetro flutuante (item rodando ou com tempo pausado não concluído)
    const activeTimelineItem = useMemo(() => {
        const running = timelineItems.find(item => timer.timers[item.id]?.isRunning);
        if (running) return running;
        const pausedWithTime = timelineItems.find(item => {
            const t = timer.timers[item.id];
            return t && t.elapsedSeconds > 0 && !t.isCompleted;
        });
        return pausedWithTime || null;
    }, [timelineItems, timer.timers]);

    // Abre o modal de compartilhamento do relatório de tempos (texto ou imagem)
    const handleCopyReport = () => {
        setIsReportModalOpen(true);
    };

    const [dismissedPromptScheduleId, setDismissedPromptScheduleId] = useState<string | null>(null);

    const handleClearCurrentWeek = () => {
        timer.clearWeekStorage();
        setDismissedPromptScheduleId(currentSchedule?.id || null);
        toast.success("Dados salvos e cronômetros desta semana foram limpos do dispositivo!");
    };

    const handleClearAllWeeks = () => {
        timer.clearAllStorage();
        setDismissedPromptScheduleId(currentSchedule?.id || null);
        toast.success("Todos os dados do presidente salvos no dispositivo foram limpos!");
    };

    const handlePrevWeek = () => {
        if (currentIndex > 0) {
            setSelectedScheduleId(schedules[currentIndex - 1].id);
        } else {
            // Volta para o mês anterior
            if (month === 1) {
                setMonth(12);
                setYear(prev => prev - 1);
            } else {
                setMonth(prev => prev - 1);
            }
        }
    };

    const handleNextWeek = () => {
        if (currentIndex < schedules.length - 1) {
            setSelectedScheduleId(schedules[currentIndex + 1].id);
        } else {
            // Avança para o próximo mês
            if (month === 12) {
                setMonth(1);
                setYear(prev => prev + 1);
            } else {
                setMonth(prev => prev + 1);
            }
        }
    };

    // Verifica se a reunião é um evento especial que cancela a reunião comum
    const isCancelledMeeting = currentSchedule?.isSpecial && (
        currentSchedule.specialType === MidweekSpecialType.CIRCUIT_ASSEMBLY ||
        currentSchedule.specialType === MidweekSpecialType.REGIONAL_CONVENTION ||
        currentSchedule.specialType === MidweekSpecialType.MEMORIAL
    );

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Presidente" />

            {/* Relógio Flutuante Compacto que surge apenas quando a página é rolada para baixo, sem ocupar espaço da tela */}
            {isScrolled && (
                <div className="fixed top-[4.75rem] right-3 sm:right-6 z-30 transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-100/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-300 rounded-full shadow-md text-xs font-mono text-typography-900">
                        <Clock className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
                        <span>Agora: <strong>{currentTime}</strong></span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-5xl mx-auto w-full">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-typography-500">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-200" />
                        <span className="text-sm font-medium">Carregando programação da reunião...</span>
                    </div>
                ) : !currentSchedule ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-100 border border-surface-300 rounded-xl text-center">
                        <CalendarOff className="w-12 h-12 text-typography-400 mb-3" />
                        <h3 className="text-lg font-bold text-typography-900 mb-1">
                            Nenhuma programação encontrada para este período
                        </h3>
                        <p className="text-sm text-typography-500 max-w-md">
                            Certifique-se de que a programação da semana foi cadastrada ou importada na tela de Programação do Meio de Semana.
                        </p>
                    </div>
                ) : isCancelledMeeting ? (
                    <div className="flex flex-col gap-4">
                        <MidweekChairmanHeader
                            schedule={currentSchedule}
                            meetingStartTime={timer.meetingStartTime}
                            onMeetingStartTimeChange={timer.setMeetingStartTime}
                            totalExpectedMinutes={0}
                            completedPartsCount={0}
                            totalPartsCount={0}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                            onResetAll={handleClearCurrentWeek}
                            onCopyReport={handleCopyReport}
                            hasPrevWeek={hasPrevWeek}
                            hasNextWeek={hasNextWeek}
                        />

                        {/* Aviso de Dados Salvos no LocalStorage */}
                        {timer.hasSavedData && dismissedPromptScheduleId !== currentSchedule.id && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex items-start sm:items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                                        <RotateCcw className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                                            <span>Tempos salvos encontrados no dispositivo</span>
                                        </h4>
                                        <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                                            Há registros de cronômetros e partes salvos para esta semana no navegador. Deseja limpá-los para começar do zero?
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleClearCurrentWeek}
                                        className="h-8 px-3 text-xs font-semibold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                                        title="Apagar dados e cronômetros salvos desta reunião"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Limpar esta semana</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleClearAllWeeks}
                                        className="h-8 px-2.5 text-xs text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                        title="Apagar dados salvos de todas as semanas gravadas no navegador"
                                    >
                                        <span>Limpar todas as semanas</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setDismissedPromptScheduleId(currentSchedule.id)}
                                        className="h-8 px-2 text-xs text-typography-600 hover:text-typography-900 cursor-pointer"
                                        title="Manter os dados salvos e fechar este aviso"
                                    >
                                        Manter dados
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="p-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-center flex flex-col items-center gap-2">
                            <AlertCircle className="w-10 h-10 text-amber-600" />
                            <h4 className="text-base font-bold text-amber-900 dark:text-amber-200">
                                Reunião Comum Cancelada
                            </h4>
                            <p className="text-sm text-amber-800 dark:text-amber-300 max-w-md">
                                Esta semana está marcada como <strong>{currentSchedule.specialName || "Evento Especial"}</strong>. Não há partes regulares para serem cronometradas.
                            </p>
                        </div>

                        {/* Prévia da próxima semana para navegação */}
                        <MidweekChairmanNextWeekPreview
                            nextSchedule={nextSchedule}
                            hasNextWeek={hasNextWeek}
                            onNextWeek={handleNextWeek}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Cabeçalho do Presidente com Navegação, Relógio e Ações */}
                        <MidweekChairmanHeader
                            schedule={currentSchedule}
                            meetingStartTime={timer.meetingStartTime}
                            onMeetingStartTimeChange={timer.setMeetingStartTime}
                            totalExpectedMinutes={totalExpectedMinutes}
                            completedPartsCount={completedPartsCount}
                            totalPartsCount={timelineItems.length}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                            onResetAll={handleClearCurrentWeek}
                            onCopyReport={handleCopyReport}
                            hasPrevWeek={hasPrevWeek}
                            hasNextWeek={hasNextWeek}
                        />

                        {/* Aviso de Dados Salvos no LocalStorage */}
                        {timer.hasSavedData && dismissedPromptScheduleId !== currentSchedule.id && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex items-start sm:items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                                        <RotateCcw className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                                            <span>Tempos salvos encontrados no dispositivo</span>
                                        </h4>
                                        <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                                            Há registros de cronômetros e partes salvos para esta semana no navegador. Deseja limpá-los para começar do zero?
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleClearCurrentWeek}
                                        className="h-8 px-3 text-xs font-semibold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                                        title="Apagar dados e cronômetros salvos desta reunião"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Limpar esta semana</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleClearAllWeeks}
                                        className="h-8 px-2.5 text-xs text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                        title="Apagar dados salvos de todas as semanas gravadas no navegador"
                                    >
                                        <span>Limpar todas as semanas</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setDismissedPromptScheduleId(currentSchedule.id)}
                                        className="h-8 px-2 text-xs text-typography-600 hover:text-typography-900 cursor-pointer"
                                        title="Manter os dados salvos e fechar este aviso"
                                    >
                                        Manter dados
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Lista da Linha do Tempo */}
                        <div className="flex flex-col gap-2.5">
                            {timelineItems.map((item) => (
                                <MidweekChairmanTimelineItem
                                    key={item.id}
                                    item={item}
                                    timer={timer.getTimer(item.id)}
                                    status={timer.getTimerStatus(item.id, item.durationMinutes)}
                                    onStart={() => timer.startTimer(item.id)}
                                    onPause={() => timer.pauseTimer(item.id)}
                                    onReset={() => timer.resetTimer(item.id)}
                                    onToggleCompleted={() => timer.toggleCompleted(item.id)}
                                    formatTime={timer.formatTimeDisplay}
                                />
                            ))}
                        </div>

                        {/* Prévia dos Participantes da Próxima Semana & Botão Avançar */}
                        <MidweekChairmanNextWeekPreview
                            nextSchedule={nextSchedule}
                            hasNextWeek={hasNextWeek}
                            onNextWeek={handleNextWeek}
                        />
                    </div>
                )}

                {/* Cronômetro Flutuante com Suporte a Picture-in-Picture */}
                {activeTimelineItem && (
                    <MidweekChairmanFloatingTimer
                        activeItem={activeTimelineItem}
                        timerState={timer.getTimer(activeTimelineItem.id)}
                        status={timer.getTimerStatus(activeTimelineItem.id, activeTimelineItem.durationMinutes)}
                        onStart={timer.startTimer}
                        onPause={timer.pauseTimer}
                        onReset={timer.resetTimer}
                        onToggleCompleted={timer.toggleCompleted}
                        formatTime={timer.formatTimeDisplay}
                    />
                )}

                {/* Modal de Compartilhamento do Relatório (Texto ou Imagem com Estilo PDF) */}
                {currentSchedule && (
                    <MidweekChairmanReportModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        schedule={currentSchedule}
                        timelineItems={timelineItems}
                        timers={timer.timers}
                        meetingStartTime={timer.meetingStartTime}
                        congregationName={user?.congregation?.name}
                        formatTime={timer.formatTimeDisplay}
                    />
                )}
            </div>
        </ContentDashboard>
    );
}

MidweekChairmanPage.getLayout = withProtectedLayout([
    "ADMIN",
    "ADMIN_CONGREGATION",
    "MIDWEEK_MANAGER",
    "MIDWEEK_VIEWER"
]);

export default MidweekChairmanPage;

