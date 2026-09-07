import { IPublicSchedule } from "@/types/weekendSchedule"
import { CheckCircle2, Clock, User, Users } from "lucide-react"

export function HospitalityCard({ item }: { item: IPublicSchedule }) {
    if (!item.hospitality || item.hospitality.length === 0) return null

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {item.hospitality.map((hosp, idx) => (
                <div
                    key={idx}
                    className="flex flex-col justify-between bg-surface-200/40 border border-surface-300/70 rounded-xl p-3.5 shadow-2xs gap-2.5"
                >
                    <div>
                        <div className="flex items-center justify-between gap-2 border-b border-surface-300/60 pb-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#A06A00] dark:text-amber-400 flex items-center gap-1.5">
                                {hosp.eventType === "DINNER" && "🍽️ Jantar"}
                                {hosp.eventType === "LUNCH" && "🥗 Almoço"}
                                {hosp.eventType === "HOSTING" && "🏡 Hospedagem"}
                                {hosp.eventType !== "DINNER" && hosp.eventType !== "LUNCH" && hosp.eventType !== "HOSTING" && "🤝 Hospitalidade"}
                            </span>

                            {hosp.completed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={11} /> Confirmado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    <Clock size={11} /> A confirmar
                                </span>
                            )}
                        </div>

                        {/* Anfitrião */}
                        <div className="flex items-center gap-2 text-xs text-typography-700 mb-1.5">
                            <User size={14} className="text-typography-400 shrink-0" />
                            <span className="font-bold text-typography-900">{hosp.host}</span>
                            <span className="text-[10px] text-typography-400 uppercase font-medium">(Anfitrião)</span>
                        </div>

                        {/* Membros */}
                        {hosp.members && hosp.members.length > 0 && (
                            <div className="flex items-start gap-2 text-xs text-typography-600 mt-2 pt-2 border-t border-surface-300/40">
                                <Users size={14} className="text-typography-400 shrink-0 mt-0.5" />
                                <div className="flex flex-wrap gap-1">
                                    {hosp.members.map((m, i) => (
                                        <span
                                            key={i}
                                            className="inline-block bg-surface-100 dark:bg-surface-300/50 border border-surface-300 text-typography-700 px-2 py-0.5 rounded-md text-[11px]"
                                        >
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}