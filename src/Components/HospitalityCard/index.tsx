import { IPublicSchedule } from "@/types/weekendSchedule"
import { CheckCircle2, Clock, UserIcon, UsersIcon } from "lucide-react"
import { useState } from "react"

export function HospitalityCard({ item }: { item: IPublicSchedule }) {
    const [open, setOpen] = useState(true)

    return (
        <div className="mt-1 border-t pt-3">
            <div
                onClick={() => setOpen(!open)}
                className="flex justify-center items-center gap-5 mb-3 cursor-pointer"
            >
                <p className="font-semibold text-sm text-typography-700">Hospitalidade</p>
                <span className="text-typography-500">{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <div className="flex flex-wrap justify-between lg:justify-around gap-4">
                    {item.hospitality?.map((hosp, idx) => (
                        <div key={idx} className="flex flex-col w-full lg:w-fit bg-typography-50 rounded-lg p-3 shadow-sm">
                            <p className="text-sm font-semibold text-typography-800 border-b border-typography-300 pb-1 mb-2">
                                {hosp.eventType === "DINNER" && "🍽️ Jantar"}
                                {hosp.eventType === "LUNCH" && "🥗 Almoço"}
                                {hosp.eventType === "HOSTING" && "🏡 Hospedagem"}
                            </p>

                            {/* Anfitrião */}
                            <div className="flex gap-2 text-sm text-typography-700 mb-1">
                                <UserIcon size={16} className="text-typography-500" />
                                <span className="font-medium">{hosp.host}</span>
                            </div>

                            {/* Membros */}
                            {hosp.members && hosp.members.length > 0 && (
                                <div className="flex flex-wrap gap-2 text-sm text-typography-600">
                                    <UsersIcon size={16} className="text-typography-500 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                        {hosp.members.map((m, i) => (
                                            <span key={i} className="self-start">{m}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="mt-2 flex items-center gap-1 text-xs font-semibold">
                                {hosp.completed ? (
                                    <>
                                        <CheckCircle2 size={14} className="text-green-600" />
                                        <span className="text-green-600">Confirmado</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock size={14} className="text-orange-500" />
                                        <span className="text-orange-500">A confirmar</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
