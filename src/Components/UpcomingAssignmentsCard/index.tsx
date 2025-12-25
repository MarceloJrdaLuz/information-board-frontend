import { IAssignment } from "@/types/assignment";
import { formatNameCongregation } from "@/utils/formatCongregationName";
import { BookOpen, Calendar, CalendarDays, Clock, MapPin, Mic, Sparkles, User } from "lucide-react";
import moment from "moment";
import "moment/locale/pt-br"; // importa o idioma
import { LocationLink } from "../LocationLink";
import LifeAndMinistryIcon from "../Icons/LifeAndMinistryIcon";
import { useState } from "react";
import { formatHour } from "@/utils/formatTime";
moment.defineLocale("pt-br", null)


interface UpcomingAssignmentsCardProps {
    assignments: IAssignment[]
}

export function UpcomingAssignmentsCard({ assignments }: UpcomingAssignmentsCardProps) {
    const hasAssignments = assignments && assignments.length > 0
    const [expanded, setExpanded] = useState(false);

    const MAX_VISIBLE = 5;

    const visibleAssignments = expanded
        ? assignments
        : assignments.slice(0, MAX_VISIBLE);

    const hiddenCount =
        assignments.length > MAX_VISIBLE
            ? assignments.length - MAX_VISIBLE
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
            default:
                return "border-l-primary-200";
        }
    };


    return (
        <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full">
            <h2 className="text-base font-semibold text-typography-800 mb-3">
                Próximas Designações
            </h2>

            {hasAssignments ? (
                <ul className="space-y-2">
                    {visibleAssignments.map((assignment, i) => {
                        const formattedDate = moment(assignment.date).locale("pt-br").format("dddd, DD [de] MMMM")

                        return (
                            <li
                                key={i}
                                className={`flex bg-surface-100 border border-surface-300 border-l-4 rounded-sm overflow-hidden hover:bg-surface-200/40 transition ${getBorderColor(assignment.role)}`}
                            >
                                {/* Barra lateral + data */}
                                <div className="flex flex-col items-center justify-center w-16 bg-surface-200/40 border-r border-surface-300 py-3">
                                    <span className="text-lg font-bold text-typography-700">
                                        {moment(assignment.date).locale("pt-br").format("DD")}
                                    </span>
                                    <span className="text-[10px] uppercase text-typography-500 -mt-1">
                                        {moment(assignment.date).locale("pt-br").format("MMM")}
                                    </span>
                                </div>

                                {/* Conteúdo */}
                                <div className="flex-1 p-3">
                                    {/* Cabeçalho */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-typography-600">
                                            {moment(assignment.date).locale("pt-br").format("dddd")}
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
                                                <Sparkles size={16} className="text-typography-400 flex-shrink-0" />
                                                <strong className="leading-tight">Limpeza do salão</strong>
                                            </div>
                                        )}

                                        {assignment.role === "Presidente" && (
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-typography-400 flex-shrink-0" />
                                                <strong className="leading-tight">Presidente da reunião</strong>
                                            </div>
                                        )}

                                        {assignment.role === "Leitor" && (
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={16} className="text-typography-400 flex-shrink-0" />
                                                <strong className="leading-tight">Leitor</strong>
                                            </div>
                                        )}

                                        {assignment.role === "Orador" && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Mic size={16} className="text-typography-400 flex-shrink-0" />
                                                    <span>
                                                        <strong>Discurso:</strong>{" "}
                                                        {assignment.talk?.title || "Tema não informado"}
                                                    </span>
                                                </div>

                                                <div className="flex items-start gap-1 text-xs text-typography-500 ml-6">
                                                    <MapPin size={12} className="flex-shrink-0 mt-[2px]" />
                                                    <span className="leading-tight break-words">
                                                        {formatNameCongregation(
                                                            assignment.destinationCongregation.name,
                                                            assignment.destinationCongregation.city
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {assignment.role === "Dirigente de Campo" && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <LifeAndMinistryIcon className="text-typography-400 w-5 h-5 flex-shrink-0" />
                                                    <strong className="leading-tight">Dirigente de Campo</strong>
                                                </div>

                                                {assignment.fieldServiceLocation && (
                                                    <div className="flex items-start gap-1 text-xs text-typography-500 ml-6">
                                                        <MapPin size={12} className="flex-shrink-0 mt-[2px]" />
                                                        <span className="leading-tight break-words">
                                                            {assignment.fieldServiceLocation}
                                                        </span>
                                                    </div>
                                                )}

                                                {assignment.fieldServiceHour && (
                                                    <div className="flex items-center gap-1 text-xs text-typography-500 ml-6 leading-tight">
                                                        <Clock size={12} />
                                                        <span>
                                                            {formatHour(assignment.fieldServiceHour)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {assignment.role === "Discurso Externo" && (
                                            <div className="flex flex-col gap-2 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Mic size={16} className="text-typography-400 flex-shrink-0" />
                                                    <span className="leading-tight">
                                                        <strong className="leading-tight">Discurso fora:</strong>{" "}
                                                        {assignment.talk?.title || "Tema não informado"}
                                                    </span>
                                                </div>

                                                {assignment.destinationCongregation && (
                                                    <div className="text-xs text-typography-500 flex flex-col gap-1 space-y-1 mt-1 ml-2">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin size={14} className="flex-shrink-0 mt-[2px]" />
                                                            <span className="leading-tight break-words">
                                                                {`${assignment.destinationCongregation.address ?? ""} ${formatNameCongregation(
                                                                    assignment.destinationCongregation.name,
                                                                    assignment.destinationCongregation.city
                                                                )}`}
                                                            </span>
                                                        </div>


                                                        <LocationLink
                                                            latitude={assignment.destinationCongregation.latitude}
                                                            longitude={assignment.destinationCongregation.longitude}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex flex-start items-center gap-1 text-xs mt-2">
                                                    <CalendarDays size={14} className="text-typography-500" />
                                                    <strong className="leading-tight">Dia/Hora:</strong>{" "}
                                                    {assignment.destinationCongregation?.dayMeetingPublic} às{" "}
                                                    {assignment.destinationCongregation?.hourMeetingPublic?.slice(0, 5)}
                                                </div>
                                            </div>
                                        )}

                                        {(assignment.role === "Anfitrião" ||
                                            assignment.role === "Hospitalidade") && (
                                                <div className="space-y-0.5">
                                                    <strong>🏡 {assignment.role}</strong>
                                                    <div className="text-xs">
                                                        <strong>Tipo:</strong>{" "}
                                                        {assignment.eventType === "DINNER" && "🍽️ Jantar"}
                                                        {assignment.eventType === "LUNCH" && "🥗 Almoço"}
                                                        {assignment.eventType === "HOSTING" && "🏡 Hospedagem"}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </li>

                        )
                    })}
                    {hiddenCount > 0 && (
                        <div className="mt-3 text-center">
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-xs font-medium text-primary-200 hover:underline"
                            >
                                {expanded
                                    ? "Ver menos"
                                    : `Ver mais (${hiddenCount})`}
                            </button>
                        </div>
                    )}

                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-typography-400">
                    <Clock size={28} className="mb-2 text-typography-300" />
                    <p className="text-sm">Nenhuma designação futura</p>
                </div>
            )}
        </div>
    )
}
