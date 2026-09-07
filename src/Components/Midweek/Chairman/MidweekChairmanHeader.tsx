import React, { useState, useEffect } from "react";
import { IMidweekSchedule } from "@/types/midweek";
import { Clock, Calendar, User, ChevronLeft, ChevronRight, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/Components/ui/button";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

interface MidweekChairmanHeaderProps {
    schedule: IMidweekSchedule;
    meetingStartTime: string;
    onMeetingStartTimeChange: (newTime: string) => void;
    totalExpectedMinutes: number;
    completedPartsCount: number;
    totalPartsCount: number;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onResetAll: () => void;
    hasPrevWeek: boolean;
    hasNextWeek: boolean;
}

export const MidweekChairmanHeader: React.FC<MidweekChairmanHeaderProps> = ({
    schedule,
    meetingStartTime,
    onMeetingStartTimeChange,
    totalExpectedMinutes,
    completedPartsCount,
    totalPartsCount,
    onPrevWeek,
    onNextWeek,
    onResetAll,
    hasPrevWeek,
    hasNextWeek
}) => {
    // Relógio em tempo real
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Calcula horário previsto de encerramento
    const calculateEndTime = () => {
        if (!meetingStartTime) return "--:--";
        const [h, m] = meetingStartTime.split(':').map(Number);
        const totalMinutes = (h || 0) * 60 + (m || 0) + totalExpectedMinutes;
        const endH = Math.floor((totalMinutes % 1440) / 60);
        const endM = totalMinutes % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    };

    const formattedMeetingDate = schedule.meetingDate
        ? dayjs(schedule.meetingDate).format("dddd, DD [de] MMMM")
        : dayjs(schedule.weekDate).format("Semana de DD [de] MMMM");

    return (
        <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-xl p-4 shadow-sm">
            {/* Linha Superior: Navegação de Semanas & Relógio Atual */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-300">
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onPrevWeek}
                        disabled={!hasPrevWeek}
                        className="h-8 px-2"
                        title="Semana anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-200" />
                        <span className="font-bold text-sm sm:text-base text-typography-900 capitalize">
                            {formattedMeetingDate}
                        </span>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onNextWeek}
                        disabled={!hasNextWeek}
                        className="h-8 px-2"
                        title="Próxima semana"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Relógio do Sistema em Tempo Real */}
                <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1 bg-surface-200 border border-surface-300 rounded-lg text-typography-800 font-mono text-sm">
                    <Clock className="w-4 h-4 text-typography-500" />
                    <span>Agora: <strong>{currentTime || "--:--:--"}</strong></span>
                </div>
            </div>

            {/* Linha Central: Leitura Bíblica & Presidente da Reunião */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-200/60 border border-surface-300">
                    <div className="p-2 rounded-lg bg-primary-100/20 text-primary-200">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-typography-500 uppercase tracking-wider block">
                            Leitura da Semana
                        </span>
                        <h3 className="text-sm font-bold text-typography-900 truncate">
                            {schedule.weeklyBibleReading || "Programação da Semana"}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-200/60 border border-surface-300">
                    <div className="p-2 rounded-lg bg-primary-100/20 text-primary-200">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-typography-500 uppercase tracking-wider block">
                            Presidente da Reunião
                        </span>
                        <h3 className="text-sm font-bold text-typography-900 truncate">
                            {schedule.chairman?.fullName || "Presidente a designar"}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Linha Inferior: Controle do Horário de Início & Resumo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-surface-300">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Seletor de Horário de Início da Reunião */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="meeting-start-time" className="text-xs font-semibold text-typography-600">
                            Início da Reunião:
                        </label>
                        <input
                            id="meeting-start-time"
                            type="time"
                            value={meetingStartTime}
                            onChange={(e) => onMeetingStartTimeChange(e.target.value)}
                            className="h-8 px-2.5 text-xs font-bold font-mono rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                        />
                    </div>

                    {/* Previsão de Término */}
                    <div className="text-xs text-typography-600">
                        Término previsto: <strong className="font-mono text-typography-900">{calculateEndTime()}</strong>
                        <span className="text-typography-400 ml-1">({totalExpectedMinutes} min)</span>
                    </div>

                    {/* Progresso de partes */}
                    <div className="text-xs text-typography-500">
                        Concluídas: <strong className="text-typography-800">{completedPartsCount}</strong> de {totalPartsCount}
                    </div>
                </div>

                {/* Ação de Zerar Cronômetros */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onResetAll}
                    className="h-8 text-xs text-typography-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 self-start sm:self-auto gap-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Zerar todos os cronômetros
                </Button>
            </div>
        </div>
    );
};

