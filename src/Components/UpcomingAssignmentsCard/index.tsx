import { IAssignment } from "@/types/assignment";
import { formatNameCongregation } from "@/utils/formatCongregationName";
import {
    BookOpen,
    Calendar,
    CalendarDays,
    Clock,
    MapPin,
    Mic,
    Sparkles,
    User
} from "lucide-react";
import { LocationLink } from "../LocationLink";
import LifeAndMinistryIcon from "../Icons/LifeAndMinistryIcon";
import { useState } from "react";
import { formatHour } from "@/utils/formatTime";
import dayjs from "dayjs";
import "dayjs/locale/pt-br"
import isBetween from "dayjs/plugin/isBetween"
dayjs.extend(isBetween)
dayjs.locale("pt-br")

interface UpcomingAssignmentsCardProps {
    assignments: IAssignment[];
}

export function UpcomingAssignmentsCard({ assignments }: UpcomingAssignmentsCardProps) {
    const hasAssignments = assignments && assignments.length > 0;
    const [expanded, setExpanded] = useState(false);

    const MAX_VISIBLE = 5;

    const today = dayjs().startOf("day");
    const endOfWeek = dayjs().add(7, "days").endOf("day");

    const thisWeekAssignments = assignments.filter(a =>
        dayjs(a.date).isBetween(today, endOfWeek, undefined, "[]")
    );

    const futureAssignments = assignments.filter(a =>
        dayjs(a.date).isAfter(endOfWeek)
    );

    const visibleFutureAssignments = expanded
        ? futureAssignments
        : futureAssignments.slice(0, MAX_VISIBLE);

    const hiddenCount =
        futureAssignments.length > MAX_VISIBLE
            ? futureAssignments.length - MAX_VISIBLE
            : 0;

    const getBorderColor = (role: string) => {
        switch (role) {
            case "Limpeza do Salão":
                return "border-l-green-400";
            case "Presidente":
                return "border-l-amber-300";
            case "Leitor":
                return "border-l-[#961526]";
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

    const renderAssignment = (assignment: IAssignment, i: number) => (
        <li
            key={i}
            className={`flex bg-surface-100 border border-surface-300 border-l-4 rounded-sm overflow-hidden hover:bg-surface-200/40 transition ${getBorderColor(assignment.role)}`}
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
                            <strong>Limpeza do salão</strong>
                        </div>
                    )}

                    {assignment.role === "Presidente" && (
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-typography-400" />
                            <strong>Presidente da reunião</strong>
                        </div>
                    )}

                    {assignment.role === "Leitor" && (
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-typography-400" />
                            <strong>Leitor</strong>
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
                                <strong>Dirigente de Campo</strong>
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
                                <strong>Testemunho Público</strong>
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
                </div>
            </div>
        </li>
    );

    return (
        <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full">
            {hasAssignments ? (
                <>
                    {thisWeekAssignments.length > 0 && (
                        <>
                            <h2 className="text-base font-semibold mb-3 text-typography-700">
                                Esta semana
                            </h2>
                            <ul className="space-y-2 mb-6">
                                {thisWeekAssignments.map(renderAssignment)}
                            </ul>
                        </>
                    )}

                    {futureAssignments.length > 0 && (
                        <>
                            <h2 className="text-base font-semibold mb-3 text-typography-700">
                                Próximas designações
                            </h2>
                            <ul className="space-y-2">
                                {visibleFutureAssignments.map(renderAssignment)}
                            </ul>

                            {hiddenCount > 0 && (
                                <div className="mt-3 text-center">
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="text-xs font-medium text-primary-200 hover:underline"
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
                    <Clock size={28} className="mb-2" />
                    <p className="text-sm">Nenhuma designação futura</p>
                </div>
            )}
        </div>
    );
}
