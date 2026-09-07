import React, { useState } from "react";
import { IMidweekSchedule } from "@/types/midweek";
import { MidweekPublisherSelect } from "./MidweekPublisherSelect";
import { MidweekSongSelect } from "./MidweekSongSelect";
import { Music, UserCheck, ShieldAlert, BookOpen, ArrowRightLeft } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface MidweekWeekHeaderProps {
    schedule: IMidweekSchedule;
    onUpdateSchedule: (data: Partial<IMidweekSchedule>) => Promise<void>;
    onOpenSpecialWeekModal: () => void;
}

export const MidweekWeekHeader: React.FC<MidweekWeekHeaderProps> = ({
    schedule,
    onUpdateSchedule,
    onOpenSpecialWeekModal
}) => {
    const [presidentPrays, setPresidentPrays] = useState<boolean>(true);

    const handleChairmanChange = (chairmanId: string | null) => {
        if (presidentPrays) {
            onUpdateSchedule({
                chairman_id: chairmanId,
                opening_prayer_id: chairmanId
            });
        } else {
            onUpdateSchedule({ chairman_id: chairmanId });
        }
    };

    const handleSyncPresidentPrayer = () => {
        if (schedule.chairman_id) {
            onUpdateSchedule({ opening_prayer_id: schedule.chairman_id });
        }
    };

    return (
        <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-xl p-4 shadow-sm">
            {/* Topo do Header: Leitura Bíblica & Semana Especial */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-300">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary-100/20 text-primary-200">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-typography-500 uppercase tracking-wider">
                            Leitura Bíblica da Semana
                        </span>
                        <h2 className="text-base font-bold text-typography-900">
                            {schedule.weeklyBibleReading || "Programação da Semana"}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {schedule.isSpecial ? (
                        <div
                            onClick={onOpenSpecialWeekModal}
                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200/60 transition-colors"
                        >
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                            <span>{schedule.specialName || "Semana Especial"}</span>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenSpecialWeekModal}
                            className="text-xs text-typography-700 border-surface-300 hover:bg-surface-200"
                        >
                            Configurar Semana Especial
                        </Button>
                    )}
                </div>
            </div>

            {/* Cânticos e Designações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Cânticos (Início, Meio, Fim) com seletor manual */}
                <div className="flex flex-col gap-2 p-3 bg-surface-200 rounded-lg border border-surface-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-800">
                            <Music className="h-4 w-4 text-indigo-500" />
                            <span>Cânticos</span>
                        </div>
                        <span className="text-[10px] text-typography-500 italic">
                            (Clique p/ trocar)
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        <MidweekSongSelect
                            label="Início"
                            value={schedule.songOpen}
                            onChange={(num) => onUpdateSchedule({ songOpen: num })}
                        />
                        <MidweekSongSelect
                            label="Meio"
                            value={schedule.songMiddle}
                            onChange={(num) => onUpdateSchedule({ songMiddle: num })}
                        />
                        <MidweekSongSelect
                            label="Fim"
                            value={schedule.songEnd}
                            onChange={(num) => onUpdateSchedule({ songEnd: num })}
                        />
                    </div>
                </div>

                {/* 2. Presidente da Reunião */}
                <div className="flex flex-col gap-1.5 p-3 bg-surface-200 rounded-lg border border-surface-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-800">
                            <UserCheck className="h-4 w-4 text-blue-500" />
                            <span>Presidente</span>
                        </div>

                        <label
                            className="flex items-center gap-1 text-[10px] text-typography-600 hover:text-typography-900 cursor-pointer select-none"
                            title="Quando ativado, ao escolher o presidente ele também é colocado automaticamente na oração inicial"
                        >
                            <input
                                type="checkbox"
                                checked={presidentPrays}
                                onChange={(e) => setPresidentPrays(e.target.checked)}
                                className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-3 w-3"
                            />
                            <span>Ora no início</span>
                        </label>
                    </div>

                    <MidweekPublisherSelect
                        scheduleId={schedule.id}
                        role="CHAIRMAN"
                        value={schedule.chairman_id}
                        publisher={schedule.chairman}
                        onChange={handleChairmanChange}
                        placeholder="Escolha o presidente..."
                    />
                </div>

                {/* 3. Oração Inicial */}
                <div className="flex flex-col gap-1.5 p-3 bg-surface-200 rounded-lg border border-surface-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-typography-800">Oração Inicial</span>
                        {schedule.chairman_id && schedule.opening_prayer_id !== schedule.chairman_id && (
                            <button
                                type="button"
                                onClick={handleSyncPresidentPrayer}
                                className="text-[10px] text-primary-200 hover:underline flex items-center gap-0.5"
                                title="Definir presidente nesta oração"
                            >
                                <ArrowRightLeft className="h-2.5 w-2.5" />
                                Usar Presidente
                            </button>
                        )}
                    </div>

                    <MidweekPublisherSelect
                        scheduleId={schedule.id}
                        role="OPENING_PRAYER"
                        value={schedule.opening_prayer_id}
                        publisher={schedule.openingPrayer}
                        onChange={(pubId) => onUpdateSchedule({ opening_prayer_id: pubId })}
                        placeholder="Selecione o irmão..."
                    />
                </div>

                {/* 4. Oração Final */}
                <div className="flex flex-col gap-1.5 p-3 bg-surface-200 rounded-lg border border-surface-300">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-typography-800">Oração Final</span>
                    </div>

                    <MidweekPublisherSelect
                        scheduleId={schedule.id}
                        role="CLOSING_PRAYER"
                        value={schedule.closing_prayer_id}
                        publisher={schedule.closingPrayer}
                        onChange={(pubId) => onUpdateSchedule({ closing_prayer_id: pubId })}
                        placeholder="Selecione o irmão..."
                    />
                </div>
            </div>
        </div>
    );
};
