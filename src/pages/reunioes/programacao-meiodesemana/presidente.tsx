import React, { useEffect, useState, useMemo } from "react";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";
import { IMidweekSchedule, MidweekSpecialType } from "@/types/midweek";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { buildMidweekTimeline } from "@/utils/midweekTimelineBuilder";
import { useMidweekChairmanTimer } from "@/hooks/useMidweekChairmanTimer";
import { MidweekChairmanHeader } from "@/Components/Midweek/Chairman/MidweekChairmanHeader";
import { MidweekChairmanTimelineItem } from "@/Components/Midweek/Chairman/MidweekChairmanTimelineItem";
import { useAtom } from "jotai";
import { CalendarOff, Loader2, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
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
            { label: "Início", link: "/dashboard" },
            { label: "Reuniões Meio de Semana", link: "/reunioes/programacao-meiodesemana" },
            { label: "Presidente", link: "/reunioes/programacao-meiodesemana/presidente" }
        ]);
    }, [setPageActive, setCrumbs]);

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
            <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-5xl mx-auto w-full">
                <BreadCrumbs crumbs={crumbs} pageActive="Presidente" />

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
                            onResetAll={timer.resetAllTimers}
                            hasPrevWeek={hasPrevWeek}
                            hasNextWeek={hasNextWeek}
                        />

                        <div className="p-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-center flex flex-col items-center gap-2">
                            <AlertCircle className="w-10 h-10 text-amber-600" />
                            <h4 className="text-base font-bold text-amber-900 dark:text-amber-200">
                                Reunião Comum Cancelada
                            </h4>
                            <p className="text-sm text-amber-800 dark:text-amber-300 max-w-md">
                                Esta semana está marcada como <strong>{currentSchedule.specialName || "Evento Especial"}</strong>. Não há partes regulares para serem cronometradas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Cabeçalho do Presidente com Navegação e Relógio */}
                        <MidweekChairmanHeader
                            schedule={currentSchedule}
                            meetingStartTime={timer.meetingStartTime}
                            onMeetingStartTimeChange={timer.setMeetingStartTime}
                            totalExpectedMinutes={totalExpectedMinutes}
                            completedPartsCount={completedPartsCount}
                            totalPartsCount={timelineItems.length}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                            onResetAll={timer.resetAllTimers}
                            hasPrevWeek={hasPrevWeek}
                            hasNextWeek={hasNextWeek}
                        />

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
                    </div>
                )}
            </div>
        </ContentDashboard>
    );
}

MidweekChairmanPage.getLayout = withProtectedLayout();
MidweekChairmanPage.getLayout = withProtectedLayout([
    "ADMIN",
    "ADMIN_CONGREGATION",
    "MIDWEEK_MANAGER",
    "MIDWEEK_VIEWER"
]);

export default MidweekChairmanPage;

