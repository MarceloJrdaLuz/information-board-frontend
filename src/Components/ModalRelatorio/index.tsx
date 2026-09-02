import { IPublisher } from "@/types/types"
import { BookOpen, CheckCircle2, Clock, MessageSquare, User } from "lucide-react"
import { FullNameShow } from "../FullNameShow"

interface ModalRelatorioProps {
    month: string
    year: string
    publisher: IPublisher
    hours: number
    studies?: number
    observations?: string
}

export default function ModalRelatorio({
    publisher,
    hours,
    studies,
    observations
}: ModalRelatorioProps) {
    const displayName = publisher.nickname || publisher.fullName
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join("")

    return (
        <li className="flex flex-col bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 justify-between group min-h-[220px]">
            {/* Header: Avatar, Name, Group/Privilege */}
            <div>
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-200/10 text-primary-200 font-bold flex items-center justify-center text-xs shrink-0 border border-primary-200/20 group-hover:bg-primary-200 group-hover:text-typography-100 transition-colors">
                        {initials || <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-typography-900 text-sm truncate group-hover:text-primary-200 transition-colors">
                            <FullNameShow defaultName={displayName} />
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {publisher.group?.number && (
                                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-200 text-typography-600">
                                    Grupo {publisher.group.number}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Participation Badge */}
                <div className="mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 w-full">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Participou no ministério</span>
                    </div>
                </div>

                {/* Metrics: Hours & Studies */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-surface-200/50 border border-surface-300 flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-typography-500 mb-0.5">
                            <Clock className="w-3.5 h-3.5 text-primary-200" />
                            <span>Horas</span>
                        </div>
                        <span className="text-base font-bold text-typography-900">
                            {hours > 0 ? `${hours}h` : "—"}
                        </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-200/50 border border-surface-300 flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-typography-500 mb-0.5">
                            <BookOpen className="w-3.5 h-3.5 text-primary-200" />
                            <span>Estudos</span>
                        </div>
                        <span className="text-base font-bold text-typography-900">
                            {typeof studies === "number" ? studies : 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Observations */}
            {observations && observations.trim().length > 0 && (
                <div className="p-2.5 rounded-xl bg-surface-200/40 border border-surface-300/60 text-xs text-typography-600 flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-typography-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 italic">{observations}</p>
                </div>
            )}
        </li>
    )
}