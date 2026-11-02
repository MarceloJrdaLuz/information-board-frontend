import React, { useState, useEffect } from "react";
import { Target, TrendingUp, CheckCircle, AlertCircle, Edit2, Sparkles, X, Check } from "lucide-react";
import { Button } from "@/Components/ui/button";
import dayjs, { Dayjs } from "dayjs";

interface MinistryGoalProgressProps {
    currentDate: Dayjs;
    totalMinutes: number; // total realizado no mês (campo + créditos)
}

const PRESET_GOALS = [
    { label: "15h", value: 15, desc: "Pion. Auxiliar" },
    { label: "30h", value: 30, desc: "Pion. Auxiliar" },
    { label: "50h", value: 50, desc: "Pion. Regular" },
    { label: "100h", value: 100, desc: "Pion. Especial" },
];

export default function MinistryGoalProgress({
    currentDate,
    totalMinutes
}: MinistryGoalProgressProps) {
    const year = currentDate.format("YYYY");
    const month = currentDate.format("MM");
    const monthKey = `ministry_goal_hours_${year}_${month}`;
    const defaultKey = "ministry_goal_hours_default";

    const [goalHours, setGoalHours] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [customInput, setCustomInput] = useState("");

    // Carregar meta salva (específica do mês ou padrão)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedMonth = localStorage.getItem(monthKey);
        if (savedMonth !== null) {
            const val = parseInt(savedMonth, 10);
            setGoalHours(isNaN(val) || val <= 0 ? null : val);
            return;
        }

        const savedDefault = localStorage.getItem(defaultKey);
        if (savedDefault !== null) {
            const val = parseInt(savedDefault, 10);
            setGoalHours(isNaN(val) || val <= 0 ? null : val);
            return;
        }

        setGoalHours(null);
    }, [monthKey, defaultKey]);

    const handleSaveGoal = (hours: number | null) => {
        if (typeof window === "undefined") return;
        if (hours === null || hours <= 0) {
            localStorage.removeItem(monthKey);
            setGoalHours(null);
        } else {
            localStorage.setItem(monthKey, hours.toString());
            localStorage.setItem(defaultKey, hours.toString());
            setGoalHours(hours);
        }
        setIsEditing(false);
    };

    const formatMinutesToString = (totalM: number) => {
        const h = Math.floor(totalM / 60);
        const m = totalM % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${String(m).padStart(2, "0")}m`;
    };

    // Cálculos de ritmo e prazo
    const goalMinutes = (goalHours || 0) * 60;
    const isCompleted = goalHours !== null && totalMinutes >= goalMinutes;
    const remainingMinutes = Math.max(0, goalMinutes - totalMinutes);
    const progressPercent = goalHours ? Math.min(100, Math.round((totalMinutes / goalMinutes) * 100)) : 0;

    const now = dayjs();
    const isCurrentMonth = currentDate.format("YYYY-MM") === now.format("YYYY-MM");
    const isPastMonth = currentDate.format("YYYY-MM") < now.format("YYYY-MM");
    const isFutureMonth = currentDate.format("YYYY-MM") > now.format("YYYY-MM");

    const daysInMonth = currentDate.daysInMonth();
    const todayDay = isCurrentMonth ? now.date() : isPastMonth ? daysInMonth : 1;
    const remainingDays = Math.max(1, daysInMonth - (isCurrentMonth ? todayDay : 0));

    // Ritmo esperado até a data de hoje
    const expectedMinutesSoFar = goalHours
        ? Math.round((goalMinutes / daysInMonth) * todayDay)
        : 0;

    const diffMinutes = totalMinutes - expectedMinutesSoFar;
    const paceNeededMinutes = Math.max(0, Math.round(remainingMinutes / remainingDays));

    return (
        <div className="w-full bg-surface-100 rounded-2xl border border-surface-300 p-3.5 sm:p-5 shadow-xs flex flex-col gap-3">
            {/* Cabeçalho do Card */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h2 className="text-xs sm:text-sm font-bold text-typography-900 flex items-center gap-1.5">
                            Meta de Horas do Mês
                            {goalHours !== null && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-primary-200/15 text-primary-200 border border-primary-200/30">
                                    {goalHours}h
                                </span>
                            )}
                        </h2>
                        <span className="text-[10px] sm:text-xs text-typography-500">
                            {goalHours !== null
                                ? `${progressPercent}% da meta concluída`
                                : "Defina um objetivo para acompanhar seu ritmo"}
                        </span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setIsEditing(!isEditing);
                        if (!isEditing && goalHours) setCustomInput(goalHours.toString());
                    }}
                    className="h-8 px-2.5 text-xs font-semibold text-typography-600 hover:text-typography-900 rounded-xl cursor-pointer"
                >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    <span>{goalHours !== null ? "Alterar" : "Definir Meta"}</span>
                </Button>
            </div>

            {/* Painel de Edição da Meta (Inline e Responsivo) */}
            {isEditing && (
                <div className="p-3 sm:p-4 rounded-xl bg-surface-200/60 border border-surface-300 flex flex-col gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-typography-800">
                            Escolha sua meta para {currentDate.format("MMMM")}:
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="p-1 text-typography-400 hover:text-typography-700 rounded-lg cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_GOALS.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => handleSaveGoal(preset.value)}
                                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                                    goalHours === preset.value
                                        ? "bg-primary-200 text-white border-primary-200 font-bold shadow-xs"
                                        : "bg-surface-100 text-typography-800 border-surface-300 hover:border-primary-200/60"
                                }`}
                            >
                                <span className="text-sm font-black">{preset.label}</span>
                                <span className={`text-[10px] ${goalHours === preset.value ? "text-white/80" : "text-typography-500"}`}>
                                    {preset.desc}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-surface-300/60">
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="number"
                                min="1"
                                max="200"
                                placeholder="Outra quantidade (h)"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-100 border border-surface-300 text-typography-900 focus:outline-none focus:ring-2 focus:ring-primary-200/20"
                            />
                            <Button
                                size="sm"
                                onClick={() => {
                                    const val = parseInt(customInput, 10);
                                    if (!isNaN(val) && val > 0) handleSaveGoal(val);
                                }}
                                className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs h-8 px-3 rounded-xl cursor-pointer shrink-0"
                            >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Salvar
                            </Button>
                        </div>

                        {goalHours !== null && (
                            <button
                                type="button"
                                onClick={() => handleSaveGoal(null)}
                                className="text-[11px] font-semibold text-rose-500 hover:underline py-1 text-center sm:text-right cursor-pointer"
                            >
                                Remover meta
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Visualização da Meta quando definida */}
            {goalHours !== null ? (
                <div className="flex flex-col gap-2.5">
                    {/* Barra de Progresso com Gradiente */}
                    <div className="w-full bg-surface-200 rounded-full h-3 sm:h-3.5 overflow-hidden p-0.5 border border-surface-300/80">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                    : "bg-gradient-to-r from-primary-200 via-primary-200/90 to-primary-150"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Linha de Estatísticas Realizado vs Falta */}
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-typography-800">
                        <div className="flex items-center gap-1.5">
                            <span className="text-typography-500 font-normal text-[11px] sm:text-xs">Feito:</span>
                            <span className="font-bold font-mono text-primary-200">
                                {formatMinutesToString(totalMinutes)}
                            </span>
                            <span className="text-typography-400 font-normal">/ {goalHours}h</span>
                        </div>

                        <div>
                            {isCompleted ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px] sm:text-xs">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Meta atingida!
                                </span>
                            ) : (
                                <span className="text-typography-600 font-medium text-[11px] sm:text-xs">
                                    Falta: <strong className="text-typography-900 font-mono">{formatMinutesToString(remainingMinutes)}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status de Ritmo ("Está em dia?") */}
                    <div
                        className={`p-2.5 sm:p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                            isCompleted
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300"
                                : diffMinutes >= 0
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                                : "bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-200"
                        }`}
                    >
                        <div className="mt-0.5 shrink-0">
                            {isCompleted || diffMinutes >= 0 ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                            )}
                        </div>

                        <div className="flex flex-col gap-0.5 text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold">
                                    {isCompleted
                                        ? "Parabéns! Meta do mês concluída!"
                                        : isPastMonth
                                        ? "Mês encerrado"
                                        : isFutureMonth
                                        ? "Meta planejada para o próximo mês"
                                        : diffMinutes >= 0
                                        ? "Você está em dia com a meta!"
                                        : "Você está atrás do ritmo esperado"}
                                </span>

                                {!isCompleted && isCurrentMonth && (
                                    <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                            diffMinutes >= 0
                                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                                : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                                        }`}
                                    >
                                        {diffMinutes >= 0
                                            ? `+${formatMinutesToString(diffMinutes)} adiantado`
                                            : `-${formatMinutesToString(Math.abs(diffMinutes))} do ideal`}
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] sm:text-xs opacity-90 leading-relaxed">
                                {isCompleted
                                    ? `Você já atingiu sua meta de ${goalHours}h e acumulou ${formatMinutesToString(totalMinutes - goalMinutes)} extras!`
                                    : isCurrentMonth
                                    ? diffMinutes >= 0
                                        ? `Ritmo ideal para hoje (dia ${todayDay}) era ${formatMinutesToString(expectedMinutesSoFar)}. Para manter a meta, faça cerca de ${formatMinutesToString(paceNeededMinutes)}/dia nos ${remainingDays} dias restantes.`
                                        : `O ritmo ideal para hoje (dia ${todayDay}) seria ter feito ${formatMinutesToString(expectedMinutesSoFar)}. Para alcançar sua meta, procure fazer em média ${formatMinutesToString(paceNeededMinutes)}/dia nos ${remainingDays} dias restantes.`
                                    : isFutureMonth
                                    ? `Para atingir as ${goalHours}h, o ritmo médio será de aproximadamente ${formatMinutesToString(Math.round(goalMinutes / daysInMonth))}/dia.`
                                    : `Total realizado no mês: ${formatMinutesToString(totalMinutes)} (${progressPercent}% do objetivo).`}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Estado sem meta definida */
                !isEditing && (
                    <div
                        onClick={() => setIsEditing(true)}
                        className="p-3 sm:p-3.5 rounded-xl bg-surface-200/50 hover:bg-surface-200/80 border border-dashed border-surface-300 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <TrendingUp className="w-4 h-4 text-primary-200 shrink-0" />
                            <span className="text-xs text-typography-600">
                                Deseja estabelecer uma meta de horas para este mês?
                            </span>
                        </div>
                        <span className="text-xs font-bold text-primary-200 hover:underline shrink-0">
                            + Configurar
                        </span>
                    </div>
                )
            )}
        </div>
    );
}

