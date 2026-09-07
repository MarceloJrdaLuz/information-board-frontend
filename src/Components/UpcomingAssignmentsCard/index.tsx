import { IAssignment } from "@/types/assignment";
import { formatNameCongregation } from "@/utils/formatCongregationName";
import { formatHour } from "@/utils/formatTime";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isBetween from "dayjs/plugin/isBetween";
import {
    BookOpen,
    Calendar,
    CalendarDays,
    Clock,
    Cpu,
    MapPin,
    Mic,
    Monitor,
    Radio,
    ShieldCheck,
    Sparkles,
    User,
    Volume2,
    Wrench
} from "lucide-react";
import { useMemo, useState } from "react";
import LifeAndMinistryIcon from "../Icons/LifeAndMinistryIcon";
import { LocationLink } from "../LocationLink";

dayjs.extend(isBetween);
dayjs.locale("pt-br");

type TabType = "ALL" | "MEETINGS" | "MECHANICAL" | "MINISTRY" | "OTHERS";

interface UpcomingAssignmentsCardProps {
    assignments: IAssignment[];
}

export function UpcomingAssignmentsCard({ assignments }: UpcomingAssignmentsCardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("ALL");
    const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

    const isMeetingAssignment = (a: IAssignment) => {
        return (
            a.role === "Presidente" ||
            a.role === "Leitor" ||
            a.role === "Orador" ||
            a.role === "Discurso Externo" ||
            a.role === "Oração Inicial" ||
            a.role === "Oração Final" ||
            a.role === "Conselheiro" ||
            a.role === "Dirigente do Estudo Bíblico" ||
            a.role === "Leitor do Estudo Bíblico" ||
            a.role === "Meio de Semana" ||
            a.role === "Ajudante (Meio de Semana)"
        );
    };

    const isMechanicalAssignment = (a: IAssignment) => {
        return (
            a.role === "Tarefa Mecânica" ||
            a.role === "Indicador" ||
            a.role === "Som" ||
            a.role === "Mídias" ||
            a.role === "Som e Mídias" ||
            a.role === "Microfone Volante" ||
            a.role === "Pedestal" ||
            Boolean((a as any).mechanicalRole)
        );
    };

    const isMinistryAssignment = (a: IAssignment) => {
        return a.role === "Dirigente de Campo" || a.role === "Testemunho Público";
    };

    const isOtherAssignment = (a: IAssignment) => {
        return a.role === "Limpeza do Salão" || a.role === "Anfitrião" || a.role === "Hospitalidade";
    };

    const sortedAssignments = useMemo(() => {
        return [...(assignments || [])].sort(
            (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
        );
    }, [assignments]);

    const allCount = sortedAssignments.length;
    const meetingsCount = sortedAssignments.filter(isMeetingAssignment).length;
    const mechanicalCount = sortedAssignments.filter(isMechanicalAssignment).length;
    const ministryCount = sortedAssignments.filter(isMinistryAssignment).length;
    const othersCount = sortedAssignments.filter(isOtherAssignment).length;

    const filteredByCategory = useMemo(() => {
        return sortedAssignments.filter(a => {
            if (activeTab === "MEETINGS") return isMeetingAssignment(a);
            if (activeTab === "MECHANICAL") return isMechanicalAssignment(a);
            if (activeTab === "MINISTRY") return isMinistryAssignment(a);
            if (activeTab === "OTHERS") return isOtherAssignment(a);
            return true;
        });
    }, [sortedAssignments, activeTab]);

    const today = dayjs().startOf("day");
    const endOfWeek = dayjs().add(7, "days").endOf("day");

    const thisWeekCount = useMemo(() => {
        return filteredByCategory.filter(a =>
            dayjs(a.date).isBetween(today, endOfWeek, undefined, "[]")
        ).length;
    }, [filteredByCategory, today, endOfWeek]);

    const availableMonths = useMemo(() => {
        const map = new Map<string, { key: string; label: string; count: number }>();
        filteredByCategory.forEach(a => {
            if (!a.date) return;
            const key = dayjs(a.date).format("YYYY-MM");
            const existing = map.get(key);
            if (existing) {
                existing.count += 1;
            } else {
                const rawMonth = dayjs(a.date).locale("pt-br").format("MMMM");
                const label = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
                map.set(key, { key, label, count: 1 });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
    }, [filteredByCategory]);

    const displayedAssignments = useMemo(() => {
        if (selectedMonth === "THIS_WEEK") {
            return filteredByCategory.filter(a =>
                dayjs(a.date).isBetween(today, endOfWeek, undefined, "[]")
            );
        }
        if (selectedMonth !== "ALL") {
            const hasMonth = availableMonths.some(m => m.key === selectedMonth);
            if (hasMonth) {
                return filteredByCategory.filter(a => dayjs(a.date).format("YYYY-MM") === selectedMonth);
            }
        }
        return filteredByCategory;
    }, [filteredByCategory, selectedMonth, availableMonths, today, endOfWeek]);

    const groupedByMonth = useMemo(() => {
        const groups: {
            monthKey: string;
            monthLabel: string;
            yearLabel: string;
            items: IAssignment[];
        }[] = [];

        displayedAssignments.forEach(a => {
            const monthKey = dayjs(a.date).format("YYYY-MM");
            let group = groups.find(g => g.monthKey === monthKey);
            if (!group) {
                const rawMonth = dayjs(a.date).locale("pt-br").format("MMMM");
                const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
                const yearLabel = dayjs(a.date).format("YYYY");
                group = { monthKey, monthLabel, yearLabel, items: [] };
                groups.push(group);
            }
            group.items.push(a);
        });

        return groups;
    }, [displayedAssignments]);

    const getBorderColor = (assignment: IAssignment) => {
        if ('section' in assignment && assignment.section) {
            switch (assignment.section) {
                case "TREASURES":
                    return "border-l-[#2F7682]";
                case "MINISTRY":
                    return "border-l-[#D49000]";
                case "LIVING":
                    return "border-l-[#BA2A12]";
            }
        }

        if (isMechanicalAssignment(assignment)) {
            const mRole = (assignment as any).mechanicalRole;
            switch (mRole) {
                case "ATTENDANT":
                    return "border-l-indigo-500";
                case "SOUND":
                case "SOUND_AND_MEDIA":
                    return "border-l-cyan-600";
                case "MEDIA":
                    return "border-l-blue-600";
                case "ROVING_MIC":
                case "STAGE_MIC":
                    return "border-l-sky-500";
                default:
                    return "border-l-cyan-600";
            }
        }

        if (assignment.role === "Presidente") {
            return (assignment as any).title?.includes("Meio") ? "border-l-[#2F7682]" : "border-l-amber-300";
        }

        switch (assignment.role) {
            case "Limpeza do Salão":
                return "border-l-emerald-500";
            case "Leitor":
                return "border-l-[#961526]";
            case "Dirigente do Estudo Bíblico":
            case "Leitor do Estudo Bíblico":
                return "border-l-[#BA2A12]";
            case "Oração Inicial":
            case "Oração Final":
                return "border-l-[#2F7682]";
            case "Conselheiro":
                return "border-l-[#D49000]";
            case "Dirigente de Campo":
                return "border-l-[#c18626]";
            case "Orador":
                return "border-l-[#28456C]";
            case "Discurso Externo":
                return "border-l-purple-500";
            case "Anfitrião":
            case "Hospitalidade":
                return "border-l-rose-500";
            case "Testemunho Público":
                return "border-l-sky-500";
            default:
                return "border-l-primary-200";
        }
    };

    const getTextColor = (assignment: IAssignment) => {
        if ('section' in assignment && assignment.section) {
            switch (assignment.section) {
                case "TREASURES":
                    return "text-[#2F7682] dark:text-teal-400";
                case "MINISTRY":
                    return "text-[#D49000] dark:text-amber-400";
                case "LIVING":
                    return "text-[#BA2A12] dark:text-rose-400";
            }
        }

        if (assignment.role === "Presidente") {
            return (assignment as any).title?.includes("Meio") ? "text-[#2F7682] dark:text-teal-400" : "text-typography-900";
        }

        if (assignment.role === "Dirigente do Estudo Bíblico" || assignment.role === "Leitor do Estudo Bíblico") {
            return "text-[#BA2A12] dark:text-rose-400";
        }

        if (assignment.role === "Oração Inicial" || assignment.role === "Oração Final") {
            return "text-[#2F7682] dark:text-teal-400";
        }

        if (assignment.role === "Conselheiro") {
            return "text-[#D49000] dark:text-amber-400";
        }

        return "text-typography-900";
    };

    const renderMechanicalIcon = (mRole?: string) => {
        switch (mRole) {
            case "ATTENDANT":
                return <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />;
            case "SOUND":
            case "SOUND_AND_MEDIA":
                return <Volume2 size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />;
            case "MEDIA":
                return <Monitor size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />;
            case "ROVING_MIC":
                return <Mic size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />;
            case "STAGE_MIC":
                return <Radio size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />;
            default:
                return <Wrench size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />;
        }
    };

    const renderAssignment = (assignment: IAssignment, i: number) => {
        const isThisWeek = dayjs(assignment.date).isBetween(today, endOfWeek, undefined, "[]");

        return (
            <li
                key={(assignment as any).id || (assignment as any)._id || `${assignment.date}-${assignment.role}-${i}`}
                className={`flex bg-surface-100 border border-surface-300 border-l-4 rounded-xl overflow-hidden hover:bg-surface-200/40 transition-all shadow-2xs ${getBorderColor(assignment)}`}
            >
                {/* Barra lateral + data */}
                <div className="flex flex-col items-center justify-center w-16 bg-surface-200/40 border-r border-surface-300 py-3 shrink-0">
                    <span className="text-lg font-bold text-typography-700">
                        {dayjs(assignment.date).locale("pt-br").format("DD")}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-typography-500 -mt-1">
                        {dayjs(assignment.date).locale("pt-br").format("MMM")}
                    </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 p-3 min-w-0">
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-typography-600 capitalize">
                                {dayjs(assignment.date).locale("pt-br").format("dddd")}
                            </span>
                            {isThisWeek && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Esta semana
                                </span>
                            )}
                        </div>

                        {assignment.status && (
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                                    ${assignment.status === "confirmed" && "bg-green-500/10 text-green-400"}
                                    ${assignment.status === "pending" && "bg-yellow-500/10 text-yellow-400"}
                                    ${assignment.status === "canceled" && "bg-red-500/10 text-red-400"}
                                `}
                            >
                                {assignment.status === "pending" && "Pendente"}
                                {assignment.status === "confirmed" && "Confirmado"}
                                {assignment.status === "canceled" && "Cancelado"}
                            </span>
                        )}
                    </div>

                    {/* Corpo */}
                    <div className="mt-2 text-sm text-typography-700 space-y-1">
                        {/* Tarefa Mecânica */}
                        {isMechanicalAssignment(assignment) && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {renderMechanicalIcon((assignment as any).mechanicalRole)}
                                    <strong className="text-sm font-bold text-typography-900">
                                        {(assignment as any).title || assignment.role}
                                    </strong>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                                        Tarefa Mecânica
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-typography-500 ml-6">
                                    <CalendarDays size={12} />
                                    <span>
                                        {(assignment as any).meetingType === "MIDWEEK"
                                            ? "Reunião de Meio de Semana"
                                            : (assignment as any).meetingType === "WEEKEND"
                                            ? "Reunião de Fim de Semana"
                                            : "Reunião Congregacional"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {assignment.role === "Limpeza do Salão" && (
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-typography-400" />
                                <strong className="text-sm font-bold text-typography-900">Limpeza do Salão</strong>
                            </div>
                        )}

                        {assignment.role === "Presidente" && (
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-typography-400" />
                                <strong className={`text-sm font-bold ${getTextColor(assignment)}`}>
                                    {(assignment as any).title?.includes("Meio") ? "Presidente (Meio de Semana)" : "Presidente (Fim de Semana)"}
                                </strong>
                            </div>
                        )}

                        {assignment.role === "Leitor" && (
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-typography-400" />
                                <strong className="text-sm font-bold text-typography-900">
                                    Leitor da Sentinela
                                </strong>
                            </div>
                        )}

                        {assignment.role === "Orador" && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Mic size={16} className="text-typography-400" />
                                    <span>
                                        <strong>Discurso:</strong>{" "}
                                        {assignment.talk?.title || "Tema não informado"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-typography-500 ml-6">
                                    <MapPin size={12} />
                                    <span>
                                        {formatNameCongregation(
                                            assignment.destinationCongregation?.name,
                                            assignment.destinationCongregation?.city
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {assignment.role === "Dirigente de Campo" && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <LifeAndMinistryIcon className="w-5 h-5 text-typography-400" />
                                    <strong className="text-sm font-bold text-typography-900">Dirigente de Campo</strong>
                                </div>

                                {assignment.fieldServiceLocation && (
                                    <div className="flex items-start gap-1 text-xs text-typography-500 ml-6">
                                        <MapPin size={12} />
                                        <span>{assignment.fieldServiceLocation}</span>
                                    </div>
                                )}

                                {assignment.fieldServiceHour && (
                                    <div className="flex items-center gap-1 text-xs text-typography-500 ml-6">
                                        <Clock size={12} />
                                        {formatHour(assignment.fieldServiceHour)}
                                    </div>
                                )}
                            </div>
                        )}

                        {assignment.role === "Testemunho Público" && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-typography-400" />
                                    <strong className="text-sm font-bold text-typography-900">Testemunho Público</strong>
                                </div>

                                {assignment.start_time && assignment.end_time && (
                                    <div className="flex items-center gap-1 text-xs text-typography-500 ml-6">
                                        <Clock size={12} />
                                        {`${formatHour(assignment.start_time)} - ${formatHour(assignment.end_time)}`}
                                    </div>
                                )}

                                {Array.isArray(assignment.publishers) && assignment.publishers.length > 0 && (
                                    <div className="flex items-start gap-1 text-xs text-typography-500 ml-6">
                                        <User size={12} />
                                        <span className="leading-tight">
                                            {assignment.publishers.map(p => p.name).join(" • ")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {assignment.role === "Discurso Externo" && (
                            <div className="space-y-2">
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2 items-center">
                                        <Mic size={16} className="text-typography-400 " />
                                        <strong>Discurso fora:</strong>{" "}
                                    </div>
                                    <span className="ml-6">{assignment.talk?.title || "Tema não informado"}</span>
                                </div>

                                {assignment.destinationCongregation && (
                                    <div className="ml-6 space-y-1 text-xs text-typography-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {formatNameCongregation(
                                                assignment.destinationCongregation.name,
                                                assignment.destinationCongregation.city
                                            )}
                                        </div>

                                        <LocationLink
                                            latitude={assignment.destinationCongregation.latitude}
                                            longitude={assignment.destinationCongregation.longitude}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-1 text-xs mt-2 ml-6">
                                    <CalendarDays size={14} className="text-typography-500" />
                                    {assignment.destinationCongregation?.dayMeetingPublic} às{" "}
                                    {assignment.destinationCongregation?.hourMeetingPublic?.slice(0, 5)}
                                </div>
                            </div>
                        )}

                        {(assignment.role === "Anfitrião" || assignment.role === "Hospitalidade") && (
                            <div>
                                <strong>🏡 {assignment.role}</strong>
                            </div>
                        )}

                        {(
                            assignment.role === "Oração Inicial" || 
                            assignment.role === "Oração Final" || 
                            assignment.role === "Conselheiro" || 
                            assignment.role === "Dirigente do Estudo Bíblico" || 
                            assignment.role === "Leitor do Estudo Bíblico" ||
                            assignment.role === "Meio de Semana" || 
                            assignment.role === "Ajudante (Meio de Semana)"
                        ) && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <BookOpen size={16} className="text-typography-400 shrink-0" />
                                    <strong className={`text-sm font-bold leading-snug ${getTextColor(assignment)}`}>
                                        {assignment.role === "Meio de Semana" || assignment.role === "Ajudante (Meio de Semana)"
                                            ? ((assignment as any).title || assignment.role)
                                            : assignment.role === "Oração Inicial"
                                            ? "Oração Inicial (Meio de Semana)"
                                            : assignment.role === "Oração Final"
                                            ? "Oração Final (Meio de Semana)"
                                            : assignment.role === "Dirigente do Estudo Bíblico"
                                            ? "Dirigente do Estudo Bíblico"
                                            : assignment.role === "Leitor do Estudo Bíblico"
                                            ? "Leitor do Estudo Bíblico"
                                            : assignment.role === "Conselheiro"
                                            ? `Conselheiro (${(assignment as any).room || "Sala Auxiliar"})`
                                            : assignment.role}
                                    </strong>

                                    {assignment.role === "Ajudante (Meio de Semana)" && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            Ajudante
                                        </span>
                                    )}
                                </div>
                                
                                {/* Detalhes extras (tempo, sala, parceiro) */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 ml-6 text-xs text-typography-500">
                                    {(assignment as any).timeMinutes && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{(assignment as any).timeMinutes} min</span>
                                        </div>
                                    )}
                                    {(assignment as any).room && (
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} />
                                            <span>{(assignment as any).room}</span>
                                        </div>
                                    )}
                                    {(assignment as any).partner && (
                                        <div className="flex items-center gap-1">
                                            <User size={12} />
                                            <span>{assignment.role === "Meio de Semana" ? "Ajudante: " : "Estudante: "}<strong>{(assignment as any).partner}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full">
            {/* Cabeçalho do Card com Abas de Filtro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-surface-300 pb-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary-200" />
                    <h2 className="text-base font-bold text-typography-900">
                        Minhas Designações
                    </h2>
                </div>

                {/* Abas / Filtros Rápidos por Categoria */}
                <div className="flex items-center gap-1 bg-surface-200/60 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
                    <button
                        type="button"
                        onClick={() => { setActiveTab("ALL"); setSelectedMonth("ALL"); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "ALL"
                                ? "bg-surface-100 text-typography-900 shadow-2xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200/60"
                        }`}
                    >
                        <span>Todas</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {allCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab("MEETINGS"); setSelectedMonth("ALL"); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "MEETINGS"
                                ? "bg-surface-100 text-typography-900 shadow-2xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200/60"
                        }`}
                    >
                        <span>Reuniões</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {meetingsCount}
                        </span>
                    </button>

                    {/* Aba Tarefas Mecânicas */}
                    <button
                        type="button"
                        onClick={() => { setActiveTab("MECHANICAL"); setSelectedMonth("ALL"); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "MECHANICAL"
                                ? "bg-surface-100 text-typography-900 shadow-2xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200/60"
                        }`}
                    >
                        <span>Mecânica</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {mechanicalCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab("MINISTRY"); setSelectedMonth("ALL"); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "MINISTRY"
                                ? "bg-surface-100 text-typography-900 shadow-2xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200/60"
                        }`}
                    >
                        <span>Pregação</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {ministryCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab("OTHERS"); setSelectedMonth("ALL"); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "OTHERS"
                                ? "bg-surface-100 text-typography-900 shadow-2xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200/60"
                        }`}
                    >
                        <span>Outros</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {othersCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* Pílulas de Filtro por Mês */}
            {availableMonths.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setSelectedMonth("ALL")}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                            selectedMonth === "ALL"
                                ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                        }`}
                    >
                        Todos os meses ({filteredByCategory.length})
                    </button>

                    {thisWeekCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setSelectedMonth("THIS_WEEK")}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                                selectedMonth === "THIS_WEEK"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Esta semana ({thisWeekCount})
                        </button>
                    )}

                    {availableMonths.map((m) => (
                        <button
                            key={m.key}
                            type="button"
                            onClick={() => setSelectedMonth(m.key)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                                selectedMonth === m.key
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                            }`}
                        >
                            {m.label} ({m.count})
                        </button>
                    ))}
                </div>
            )}

            {/* Listagem de Designações Agrupadas por Mês */}
            {displayedAssignments.length > 0 ? (
                <div className="space-y-6">
                    {groupedByMonth.map((group) => (
                        <div key={group.monthKey} className="space-y-2.5">
                            {/* Cabeçalho do Mês */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-surface-200">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-primary-200/10 text-primary-200">
                                        <Calendar size={14} />
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-typography-800">
                                        {group.monthLabel} de {group.yearLabel}
                                    </h3>
                                </div>
                                <span className="text-[11px] font-semibold text-typography-500 bg-surface-200/80 px-2.5 py-0.5 rounded-full">
                                    {group.items.length}{" "}
                                    {group.items.length === 1 ? "designação" : "designações"}
                                </span>
                            </div>

                            {/* Lista de designações do mês */}
                            <ul className="space-y-2.5">
                                {group.items.map(renderAssignment)}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                /* Estado Vazio */
                <div className="flex flex-col items-center justify-center py-10 text-center text-typography-400">
                    <div className="p-3 rounded-2xl bg-surface-200/80 text-typography-400 mb-2">
                        <Clock size={26} className="opacity-70" />
                    </div>
                    <p className="text-sm font-semibold text-typography-700">
                        Nenhuma designação encontrada
                    </p>
                    <p className="text-xs text-typography-400 max-w-xs mt-0.5">
                        {selectedMonth === "THIS_WEEK"
                            ? "Você não possui nenhuma designação agendada para os próximos 7 dias."
                            : selectedMonth !== "ALL"
                            ? "Nenhuma designação encontrada para o mês selecionado neste filtro."
                            : activeTab === "MEETINGS"
                            ? "Nenhuma designação de reunião agendada no momento."
                            : activeTab === "MECHANICAL"
                            ? "Nenhuma tarefa mecânica agendada no momento."
                            : activeTab === "MINISTRY"
                            ? "Nenhuma designação de pregação agendada no momento."
                            : activeTab === "OTHERS"
                            ? "Nenhum outro serviço agendado no momento."
                            : "Você não possui designações futuras agendadas no momento."}
                    </p>
                </div>
            )}
        </div>
    );
}
