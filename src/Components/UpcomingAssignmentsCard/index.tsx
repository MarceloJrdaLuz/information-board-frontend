import { IAssignment } from "@/types/assignment"
import { formatNameCongregation } from "@/utils/formatCongregationName";
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, MapPin } from "lucide-react"
import moment from "moment";
import "moment/locale/pt-br"; // importa o idioma
import { LocationLink } from "../LocationLink";
moment.defineLocale("pt-br", null)


interface UpcomingAssignmentsCardProps {
    assignments: IAssignment[]
}

export function UpcomingAssignmentsCard({ assignments }: UpcomingAssignmentsCardProps) {
    const hasAssignments = assignments && assignments.length > 0

    return (
        <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full">
            <h2 className="text-base font-semibold text-typography-800 mb-3">
                Próximas Designações
            </h2>

            {hasAssignments ? (
                <ul className="space-y-2">
                    {assignments.map((assignment, i) => {
                        const formattedDate = moment(assignment.date).locale("pt-br").format("dddd, DD [de] MMMM")

                        return (
                            <li
                                key={i}
                                className="border border-surface-300 rounded-lg p-2.5 hover:bg-surface-200/30 transition"
                            >
                                {/* Data */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="text-typography-300" size={15} />
                                        <span className="text-sm font-bold text-primary-200 leading-loose">
                                            {formattedDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Conteúdo */}
                                <div className="text-xs mt-1.5 text-typography-600 space-y-1.5">
                                    {assignment.role === "Limpeza do Salão" && <strong>Limpeza do salão</strong>}


                                    {assignment.role === "Presidente" && <strong>Presidente da reunião</strong>}

                                    {assignment.role === "Leitor" && <strong>Leitor</strong>}

                                    {assignment.role === "Orador" && (
                                        <div className="flex flex-col gap-1">
                                            <div>
                                                <strong>Discurso: </strong>
                                                {assignment.talk?.title || "Tema não informado"}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} className="text-typography-400" />
                                                <span>
                                                    {formatNameCongregation(assignment.destinationCongregation.name, assignment.destinationCongregation.city)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {assignment.role === "Discurso Externo" && (
                                        <div className="flex flex-col gap-2">
                                            <div>
                                                <strong>Discurso Fora:</strong>{" "}
                                                {assignment.talk?.title || "Tema não informado"}
                                            </div>
                                            {assignment.destinationCongregation && (
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-center gap-1 ml-4">
                                                        <MapPin size={12} className="text-typography-400" />
                                                        <span className="leading-none">
                                                            {`${assignment.destinationCongregation.address ?? ""} ${formatNameCongregation(assignment.destinationCongregation.name, assignment.destinationCongregation.city)}`}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <LocationLink latitude={assignment.destinationCongregation.latitude} longitude={assignment.destinationCongregation.longitude} />
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <strong>Dia / Hora: </strong>
                                                {assignment.destinationCongregation?.dayMeetingPublic}{" "}
                                                às {assignment.destinationCongregation?.hourMeetingPublic?.slice(0, 5)}
                                            </div>
                                            <div>
                                                <strong>Status: </strong>
                                                <span
                                                    className={`font-medium 
                                                        ${assignment.status === "confirmed" ? "text-green-500" : ""}
                                                        ${assignment.status === "pending" ? "text-yellow-500" : ""}
                                                        ${assignment.status === "canceled" ? "text-red-500" : ""}`}
                                                >
                                                    {assignment.status === "pending" && "Pendente"}
                                                    {assignment.status === "confirmed" && "Confirmado"}
                                                    {assignment.status === "canceled" && "Cancelado"}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {(assignment.role === "Anfitrião" ||
                                        assignment.role === "Hospitalidade") && (
                                            <div className="flex flex-col">
                                                <strong>{assignment.role}</strong>
                                                <div>
                                                    <strong>Tipo: </strong>
                                                    {assignment.eventType === "DINNER" && "🍽️ Jantar"}
                                                    {assignment.eventType === "LUNCH" && "🥗 Almoço"}
                                                    {assignment.eventType === "HOSTING" && "🏡 Hospedagem"}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </li>
                        )
                    })}
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
