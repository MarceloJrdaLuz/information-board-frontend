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
    Layers,
    MapPin,
    Mic,
    Sparkles,
    User
} from "lucide-react";
import { useState } from "react";
import LifeAndMinistryIcon from "../Icons/LifeAndMinistryIcon";
import { LocationLink } from "../LocationLink";
dayjs.extend(isBetween);
dayjs.locale("pt-br");

type TabType = "ALL" | "MEETINGS" | "MINISTRY" | "OTHERS";

interface UpcomingAssignmentsCardProps {
    assignments: IAssignment[];
}

export function UpcomingAssignmentsCard({ assignments }: UpcomingAssignmentsCardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("ALL");
    const [expanded, setExpanded] = useState(false);

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

    const isMinistryAssignment = (a: IAssignment) => {
        return a.role === "Dirigente de Campo" || a.role === "Testemunho Público";
    };

    const isOtherAssignment = (a: IAssignment) => {
        return a.role === "Limpeza do Salão" || a.role === "Anfitrião" || a.role === "Hospitalidade";
    };

    const allCount = assignments?.length || 0;
    const meetingsCount = assignments?.filter(isMeetingAssignment).length || 0;
    const ministryCount = assignments?.filter(isMinistryAssignment).length || 0;
    const othersCount = assignments?.filter(isOtherAssignment).length || 0;

    const filteredAssignments = (assignments || []).filter(a => {
        if (activeTab === "MEETINGS") return isMeetingAssignment(a);
        if (activeTab === "MINISTRY") return isMinistryAssignment(a);
        if (activeTab === "OTHERS") return isOtherAssignment(a);
        return true;
    });

    const hasAssignments = filteredAssignments.length > 0;
    const MAX_VISIBLE = 5;

    const today = dayjs().startOf("day");
    const endOfWeek = dayjs().add(7, "days").endOf("day");

    const thisWeekAssignments = filteredAssignments.filter(a =>
        dayjs(a.date).isBetween(today, endOfWeek, undefined, "[]")
    );

    const futureAssignments = filteredAssignments.filter(a =>
        dayjs(a.date).isAfter(endOfWeek)
    );

    const visibleFutureAssignments = expanded
        ? futureAssignments
        : futureAssignments.slice(0, MAX_VISIBLE);

    const hiddenCount =
        futureAssignments.length > MAX_VISIBLE
            ? futureAssignments.length - MAX_VISIBLE
            : 0;

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

        if (assignment.role === "Presidente") {
            return (assignment as any).title?.includes("Meio") ? "border-l-[#2F7682]" : "border-l-amber-300";
        }

        switch (assignment.role) {
            case "Limpeza do Salão":
                return "border-l-green-400";
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
                return "border-l-indigo-400";
            case "Anfitrião":
            case "Hospitalidade":
                return "border-l-emerald-400";
            case "Testemunho Público":
                return "border-l-sky-400";
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

    const renderAssignment = (assignment: IAssignment, i: number) => (
        <li
            key={i}
            className={`flex bg-surface-100 border border-surface-300 border-l-4 rounded-sm overflow-hidden hover:bg-surface-200/40 transition ${getBorderColor(assignment)}`}
        >
            {/* Barra lateral + data */}
            <div className="flex flex-col items-center justify-center w-16 bg-surface-200/40 border-r border-surface-300 py-3">
                <span className="text-lg font-bold text-typography-700">
                    {dayjs(assignment.date).locale("pt-br").format("DD")}
                </span>
                <span className="text-[10px] uppercase text-typography-500 -mt-1">
                    {dayjs(assignment.date).locale("pt-br").format("MMM")}
                </span>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-3">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-typography-600">
                        {dayjs(assignment.date).locale("pt-br").format("dddd")}
                    </span>

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
                            {/* Título Principal com a cor da seção */}
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

                {/* Abas / Filtros Rápidos */}
                <div className="flex items-center gap-1 bg-surface-200/60 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
                    <button
                        type="button"
                        onClick={() => { setActiveTab("ALL"); setExpanded(false); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "ALL"
                                ? "bg-surface-100 text-typography-900 shadow-xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200"
                        }`}
                    >
                        <span>Todas</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {allCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab("MEETINGS"); setExpanded(false); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "MEETINGS"
                                ? "bg-surface-100 text-typography-900 shadow-xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200"
                        }`}
                    >
                        <span>Reuniões</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {meetingsCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab("MINISTRY"); setExpanded(false); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "MINISTRY"
                                ? "bg-surface-100 text-typography-900 shadow-xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200"
                        }`}
                    >
                        <span>Pregação</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {ministryCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setActiveTab("OTHERS"); setExpanded(false); }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "OTHERS"
                                ? "bg-surface-100 text-typography-900 shadow-xs"
                                : "text-typography-500 hover:text-typography-700 hover:bg-surface-200"
                        }`}
                    >
                        <span>Outros</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-300/60 text-typography-700">
                            {othersCount}
                        </span>
                    </button>
                </div>
            </div>

            {hasAssignments ? (
                <>
                    {thisWeekAssignments.length > 0 && (
                        <>
                            <h3 className="text-sm font-semibold mb-2.5 text-typography-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Esta semana
                            </h3>
                            <ul className="space-y-2 mb-5">
                                {thisWeekAssignments.map(renderAssignment)}
                            </ul>
                        </>
                    )}

                    {futureAssignments.length > 0 && (
                        <>
                            <h3 className="text-sm font-semibold mb-2.5 text-typography-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-primary-200" />
                                Próximas designações
                            </h3>
                            <ul className="space-y-2">
                                {visibleFutureAssignments.map(renderAssignment)}
                            </ul>

                            {hiddenCount > 0 && (
                                <div className="mt-3 text-center">
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="text-xs font-medium text-primary-200 hover:underline cursor-pointer"
                                    >
                                        {expanded ? "Ver menos" : `Ver mais (${hiddenCount})`}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-typography-400">
                    <Clock size={28} className="mb-2 opacity-50" />
                    <p className="text-sm">
                        {activeTab === "ALL"
                            ? "Nenhuma designação futura"
                            : activeTab === "MEETINGS"
                            ? "Nenhuma designação de reunião no momento"
                            : activeTab === "MINISTRY"
                            ? "Nenhuma designação de pregação no momento"
                            : "Nenhum outro serviço agendado no momento"}
                    </p>
                </div>
            )}
        </div>
    );
}
