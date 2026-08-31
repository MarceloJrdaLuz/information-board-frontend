import { IPublicSchedule } from "@/types/weekendSchedule"
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Home, Utensils, Users, User } from "lucide-react"
import { useState } from "react"

export function HospitalityCard({ item }: { item: IPublicSchedule }) {
    const [open, setOpen] = useState(true)

    if (!item.hospitality || item.hospitality.length === 0) return null

    return (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between cursor-pointer hover:bg-emerald-500/15 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Utensils size={15} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Hospitalidade do Fim de Semana
                    </span>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {open && (
                <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {item.hospitality.map((hosp, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col justify-between bg-surface-100 border border-surface-300 rounded-xl p-3.5 shadow-2xs gap-3"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 border-b border-surface-200 pb-2 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
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
                                    <div className="flex items-start gap-2 text-xs text-typography-600 mt-2 pt-2 border-t border-surface-200/60">
                                        <Users size={14} className="text-typography-400 shrink-0 mt-0.5" />
                                        <div className="flex flex-wrap gap-1">
                                            {hosp.members.map((m, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-block bg-surface-200/70 text-typography-700 px-2 py-0.5 rounded-md text-[11px]"
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
            )}
        </div>
    )
}