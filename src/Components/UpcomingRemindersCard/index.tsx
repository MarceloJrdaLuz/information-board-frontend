import { useState } from "react"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { Bell, Calendar, CheckCircle, ChevronDown, Pencil } from "lucide-react"
import { IReminder } from "@/types/reminder"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import Router from "next/router"
import { useSetAtom } from "jotai"
import { completeReminderAtom } from "@/atoms/remindersAtom"
import { toast } from "react-toastify"
dayjs.extend(isSameOrAfter)
dayjs.locale("pt-br")

interface Props {
    reminders: IReminder[]
    mutateReminders?: () => void
}

export function UpcomingRemindersCard({ reminders, mutateReminders }: Props) {
    const [expanded, setExpanded] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const completeReminder = useSetAtom(completeReminderAtom)

    async function handleCompleteReminder(reminder_id: string) {

        await toast.promise(completeReminder(reminder_id), {
            pending: "Atualizando..."
        }).then(() => {
            mutateReminders?.()
        }).catch(err => console.log(err))
    }


    const MAX_VISIBLE = 5

    const today = dayjs().startOf("day")

    const upcoming = reminders.filter(r =>
        dayjs(r.endDate).isSameOrAfter(today, "day")
    )

    const visible = expanded
        ? upcoming
        : upcoming.slice(0, MAX_VISIBLE)

    const hiddenCount =
        upcoming.length > MAX_VISIBLE
            ? upcoming.length - MAX_VISIBLE
            : 0

    function toggleExpand(id: string) {
        setExpandedId(prev => (prev === id ? null : id))
    }


    return (
        <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full">
            {upcoming.length > 0 ? (
                <>
                    <h2 className="text-base font-semibold mb-3 text-typography-700">
                        Lembretes
                    </h2>

                    <div className="w-full flex justify-end my-2">
                        <button
                            onClick={() => Router.push("/meus-lembretes/add")}
                            className="text-xs font-medium text-primary-200 hover:underline"
                        >
                            + Novo
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {visible.map(reminder => (
                            <li
                                key={reminder.id}
                                className="flex bg-surface-100 border border-surface-300 border-l-4 border-l-primary-200 rounded-sm overflow-hidden hover:bg-surface-200/40 transition"
                            >

                                {/* Data */}
                                <div className="flex flex-col items-center justify-center w-16 bg-surface-200/40 border-r border-surface-300 py-3">
                                    <span className="text-lg font-bold text-typography-700">
                                        {dayjs(reminder.startDate).format("DD")}
                                    </span>
                                    <span className="text-[10px] uppercase text-typography-500 -mt-1">
                                        {dayjs(reminder.startDate).format("MMM")}
                                    </span>
                                </div>

                                {/* Conteúdo */}
                                <div className="flex-1 p-3">
                                    <div className="flex items-start gap-2">
                                        <Bell
                                            size={14}
                                            className="text-typography-400 shrink-0 mt-0.5"
                                        />

                                        <strong className="text-sm text-typography-700 leading-snug break-words">
                                            {reminder.title}
                                        </strong>

                                        <button
                                            onClick={() => Router.push(`/meus-lembretes//edit/${reminder.id}`)}
                                            className="ml-auto text-typography-400 hover:text-primary-200 transition"
                                            aria-label="Editar lembrete"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>

                                    {reminder.description && <button
                                        onClick={() => toggleExpand(reminder.id)}
                                        className="text-typography-400 hover:text-primary-200  text-xs transition"
                                    >
                                        Detalhes
                                    </button>}
                                    {expandedId === reminder.id && reminder.description && (
                                        <p className="mt-2 text-xs text-typography-600 leading-relaxed">
                                            {reminder.description}
                                        </p>
                                    )}

                                    <div className="mt-2 flex items-center gap-1 text-xs text-typography-500">
                                        <Calendar size={12} />
                                        {dayjs(reminder.startDate).format("DD/MM/YYYY")}
                                        {" → "}
                                        {dayjs(reminder.endDate).format("DD/MM/YYYY")}
                                    </div>
                                    <div className="w-full flex justify-end items-center gap-2 mt-2">
                                        <button
                                            onClick={() => handleCompleteReminder(reminder.id)}
                                            className=" rounded-full transition-colors hover:bg-green-100"
                                            title="Marcar como concluído"
                                        >
                                            <CheckCircle
                                                size={16}
                                                className={`transition-colors ${reminder.completed_until ? "text-green-500" : "text-gray-300 hover:text-green-500"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {hiddenCount > 0 && (
                        <div className="mt-3 text-center">
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary-200 hover:underline"
                            >
                                {expanded ? "Ver menos" : `Ver mais (${hiddenCount})`}
                                <ChevronDown
                                    size={14}
                                    className={`transition ${expanded ? "rotate-180" : ""}`}
                                />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => Router.push("/meus-lembretes")}
                        className="text-xs text-typography-400 hover:text-primary-200 hover:underline"
                    >
                        Ir para página de lembretes
                    </button>

                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-typography-400">
                    <Bell size={28} className="mb-2" />
                    <p className="text-sm">Nenhum lembrete ativo</p>
                </div>
            )}
        </div>
    )
}
