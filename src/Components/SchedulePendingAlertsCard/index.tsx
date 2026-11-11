import CleanIcon from "@/Components/Icons/CleanIcon";
import LifeAndMinistryIcon from "@/Components/Icons/LifeAndMinistryIcon";
import PreachingHomeIcon from "@/Components/Icons/PreachingHomeIcon";
import PublicPreachingIcon from "@/Components/Icons/PublicPreachingIcon";
import SpeakerIcon from "@/Components/Icons/SpeakerIcon";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { IScheduleAlert, IScheduleAlertsResponse } from "@/types/scheduleReminder";
import { ArrowRight, BellRing, CalendarClock, ChevronDown, ChevronRight, ChevronUp, X } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SchedulePendingAlertsCard() {
    const { congregation } = useCongregationContext();
    const router = useRouter();
    const [dismissed, setDismissed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const alertsUrl = congregation
        ? `${API_ROUTES.SCHEDULE_REMINDERS_ALERTS}/congregation/${congregation.id}`
        : "";

    const { data, isLoading } = useAuthorizedFetch<IScheduleAlertsResponse>(alertsUrl);

    if (isLoading || !data || !data.alerts || data.alerts.length === 0 || dismissed) {
        return null;
    }

    const alerts = data.alerts;

    const getModuleIcon = (module: IScheduleAlert["module"]) => {
        switch (module) {
            case "CLEANING":
                return <CleanIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
            case "FIELD_SERVICE":
                return <PreachingHomeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
            case "PUBLIC_WITNESS":
                return <PublicPreachingIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
            case "MIDWEEK_MEETING":
                return <LifeAndMinistryIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
            case "WEEKEND_MEETING":
                return <SpeakerIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
            default:
                return <CalendarClock className="w-5 h-5 text-primary-200" />;
        }
    };

    const getModuleBadgeColor = (module: IScheduleAlert["module"]) => {
        switch (module) {
            case "CLEANING":
                return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
            case "FIELD_SERVICE":
                return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
            case "PUBLIC_WITNESS":
                return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
            case "MIDWEEK_MEETING":
                return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
            case "WEEKEND_MEETING":
                return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
            default:
                return "bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-500/20";
        }
    };

    return (
        <div className="w-full max-w-4xl rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 p-3.5 sm:p-5 shadow-sm space-y-3 animate-fade-in">
            {/* Header com título, badge e botão de fechar */}
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                        <BellRing className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-typography-900 leading-tight">
                                Lembretes de Programações
                            </h3>
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500 text-white shrink-0 whitespace-nowrap leading-none">
                                {alerts.length} {alerts.length === 1 ? "pendência" : "pendências"}
                            </span>
                        </div>
                        <p className="text-xs text-typography-500 hidden sm:block mt-0.5">
                            Programações do próximo mês que necessitam da sua atenção para serem geradas ou completadas.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="p-1.5 text-typography-400 hover:text-typography-700 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Dispensar aviso nesta sessão"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Lista de Alertas (mostra apenas o primeiro por padrão caso haja múltiplos) */}
            <div className="grid gap-2.5 sm:grid-cols-1 pt-1">
                {(isExpanded ? alerts : alerts.slice(0, 1)).map((alert) => (
                    <div
                        key={alert.id}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-surface-100 rounded-xl border border-surface-300 shadow-2xs hover:border-amber-400/50 transition-all"
                    >
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-surface-200/80 shrink-0 mt-0.5">
                                {getModuleIcon(alert.module)}
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${getModuleBadgeColor(
                                            alert.module
                                        )}`}
                                    >
                                        {alert.title}
                                    </span>
                                    {alert.daysRemaining <= 7 ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                                            Faltam {alert.daysRemaining} {alert.daysRemaining === 1 ? "dia" : "dias"}
                                        </span>
                                    ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-typography-500 whitespace-nowrap">
                                            Faltam {alert.daysRemaining} dias
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-typography-700 leading-snug">
                                    {alert.message}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push(alert.link)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold rounded-xl bg-primary-200 hover:bg-primary-300 text-white shadow-xs transition-colors cursor-pointer shrink-0 mt-1 sm:mt-0"
                        >
                            <span>{alert.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Botão de Expandir / Recolher quando há mais de 1 pendência */}
            {alerts.length > 1 && (
                <div className="flex justify-center pt-1">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-typography-600 hover:text-typography-900 bg-surface-100 hover:bg-surface-200/80 border border-surface-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Ocultar pendências adicionais</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>Ver mais {alerts.length - 1} {alerts.length - 1 === 1 ? "pendência" : "pendências"}</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
