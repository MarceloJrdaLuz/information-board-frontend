import CleanIcon from "@/Components/Icons/CleanIcon";
import LifeAndMinistryIcon from "@/Components/Icons/LifeAndMinistryIcon";
import PreachingHomeIcon from "@/Components/Icons/PreachingHomeIcon";
import PublicPreachingIcon from "@/Components/Icons/PublicPreachingIcon";
import SpeakerIcon from "@/Components/Icons/SpeakerIcon";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { IScheduleAlert, IScheduleAlertsResponse } from "@/types/scheduleReminder";
import { ArrowRight, BellRing, CalendarClock, ChevronDown, ChevronUp, X } from "lucide-react";
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
                return <CleanIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
            case "FIELD_SERVICE":
                return <PreachingHomeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
            case "PUBLIC_WITNESS":
                return <PublicPreachingIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
            case "MIDWEEK_MEETING":
                return <LifeAndMinistryIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
            case "WEEKEND_MEETING":
                return <SpeakerIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
            default:
                return <CalendarClock className="w-4 h-4 text-primary-200" />;
        }
    };

    const getModuleBadgeColor = (module: IScheduleAlert["module"]) => {
        switch (module) {
            case "CLEANING":
                return "text-emerald-700 dark:text-emerald-300";
            case "FIELD_SERVICE":
                return "text-blue-700 dark:text-blue-300";
            case "PUBLIC_WITNESS":
                return "text-purple-700 dark:text-purple-300";
            case "MIDWEEK_MEETING":
                return "text-amber-700 dark:text-amber-300";
            case "WEEKEND_MEETING":
                return "text-rose-700 dark:text-rose-300";
            default:
                return "text-primary-700 dark:text-primary-300";
        }
    };

    return (
        <div className="w-full max-w-4xl rounded-2xl bg-surface-100 border border-amber-500/30 shadow-xs overflow-hidden animate-fade-in">
            {/* Linha de destaque suave superior */}
            <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 w-full" />

            <div className="p-3.5 sm:p-4.5 space-y-3">
                {/* Header com título, badge e botão de fechar */}
                <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                            <BellRing className="w-4 h-4" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-typography-900 leading-tight">
                                Lembretes de Programações
                            </h3>
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0 whitespace-nowrap leading-none">
                                {alerts.length} {alerts.length === 1 ? "pendência" : "pendências"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="p-1 text-typography-400 hover:text-typography-700 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer shrink-0"
                        title="Dispensar aviso nesta sessão"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Lista de Alertas com visual limpo e moderno */}
                <div className="divide-y divide-surface-200 dark:divide-surface-700/50">
                    {(isExpanded ? alerts : alerts.slice(0, 1)).map((alert) => (
                        <div
                            key={alert.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                        >
                            <div className="flex items-start gap-2.5 min-w-0">
                                <div className="p-2 rounded-lg bg-surface-200/60 dark:bg-surface-300/20 shrink-0 mt-0.5 sm:mt-0">
                                    {getModuleIcon(alert.module)}
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${getModuleBadgeColor(alert.module)}`}>
                                            {alert.title}
                                        </span>
                                        <span className="text-[11px] text-typography-400">•</span>
                                        {alert.daysRemaining <= 7 ? (
                                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                                Faltam {alert.daysRemaining} {alert.daysRemaining === 1 ? "dia" : "dias"}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-medium text-typography-500">
                                                Faltam {alert.daysRemaining} dias
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-typography-700 font-medium leading-snug">
                                        {alert.message}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push(alert.link)}
                                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-200 hover:bg-primary-300 text-white transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                            >
                                <span>{alert.actionLabel}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Botão de Expandir / Recolher mais limpo e sutil */}
                {alerts.length > 1 && (
                    <div className="flex justify-center pt-1 border-t border-surface-200 dark:divide-surface-700/50">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-typography-600 hover:text-typography-900 dark:hover:text-typography-100 py-1 px-2.5 rounded-lg hover:bg-surface-200/50 transition-colors cursor-pointer"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                    <span>Ocultar pendências</span>
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
        </div>
    );
}