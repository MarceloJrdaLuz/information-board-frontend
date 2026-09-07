import React, { useState } from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import EditIcon from "../Icons/EditIcon"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import {
    AlertCircle,
    Bell,
    BellOff,
    Calendar,
    Check,
    Clock,
    Copy,
    Plus,
    Repeat,
    Trash
} from "lucide-react"
import dayjs from "dayjs"
import { INotice } from "@/types/types"

export default function ListNotices({ notices, onDelete }: IListItemsProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (notice: INotice) => {
        const textToCopy = `📢 *${notice.title}*\n\n${notice.text}`
        navigator.clipboard.writeText(textToCopy)
        setCopiedId(notice.id)
        setTimeout(() => setCopiedId(null), 2500)
    }

    if (!notices || notices.length === 0) {
        return (
            <div className="bg-surface-100 border border-surface-300 rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center gap-3 shadow-sm my-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-200/10 text-primary-200 flex items-center justify-center mb-1">
                    <BellOff size={32} />
                </div>
                <h3 className="text-lg font-bold text-typography-800">
                    Nenhum anúncio encontrado
                </h3>
                <p className="text-xs sm:text-sm text-typography-500 max-w-md">
                    Não há anúncios cadastrados ou correspondentes ao filtro selecionado. Crie um novo comunicado para exibição no mural digital.
                </p>
                <Button
                    onClick={() => Router.push("/congregacao/anuncios/add")}
                    className="mt-3 inline-flex items-center gap-2 text-xs sm:text-sm py-2 px-5 font-bold"
                >
                    <Plus size={16} />
                    <span>Criar Primeiro Anúncio</span>
                </Button>
            </div>
        )
    }

    const todayDay = new Date().getDate()
    const now = dayjs()

    return (
        <div className="flex flex-col gap-4 w-full">
            {notices.map((notice) => {
                const isRecurrent = Boolean(notice.startDay && notice.endDay)
                const isExpired = notice.expired
                    ? now.isAfter(dayjs(notice.expired).endOf("day"))
                    : false
                const isRecurrentActiveToday =
                    isRecurrent &&
                    notice.startDay &&
                    notice.endDay &&
                    todayDay >= notice.startDay &&
                    todayDay <= notice.endDay
                const isActiveToday = !isExpired && (!isRecurrent || isRecurrentActiveToday)

                return (
                    <article
                        key={notice.id}
                        className="bg-surface-100 border border-surface-300 hover:border-surface-400 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden group"
                    >
                        {/* Barra lateral de destaque */}
                        <div
                            className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2 ${
                                isExpired
                                    ? "bg-typography-400"
                                    : isActiveToday
                                    ? "bg-primary-200"
                                    : "bg-amber-500"
                            }`}
                        />

                        {/* Topo do Card: Título, Badges de Status e Ações */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-1">
                            <div className="flex flex-col gap-1.5 min-w-0">
                                {/* Badges de status e recorrência */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {isExpired ? (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
                                            <AlertCircle size={11} />
                                            <span>Expirado</span>
                                        </span>
                                    ) : isActiveToday ? (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            <span>Ativo no Quadro</span>
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                                            <Clock size={11} />
                                            <span>Inativo Hoje</span>
                                        </span>
                                    )}

                                    {isRecurrent && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-200/10 text-primary-200 border border-primary-200/20 flex items-center gap-1">
                                            <Repeat size={11} />
                                            <span>
                                                Dias {notice.startDay} a {notice.endDay} de cada mês
                                            </span>
                                        </span>
                                    )}

                                    {notice.expired && (
                                        <span className="text-[10px] font-medium text-typography-500 flex items-center gap-1">
                                            <Calendar size={11} />
                                            <span>
                                                Expira em {dayjs(notice.expired).format("DD/MM/YYYY")}
                                            </span>
                                        </span>
                                    )}
                                </div>

                                {/* Título */}
                                <h2 className="text-base sm:text-lg font-bold text-typography-800 leading-snug">
                                    {notice.title}
                                </h2>

                                {/* Data de publicação */}
                                <span className="text-[11px] text-typography-400">
                                    Publicado em{" "}
                                    {new Date(notice.created_at).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>

                            {/* Ações Rápidas */}
                            <div className="flex items-center gap-1.5 shrink-0 self-start mt-1 sm:mt-0">
                                {/* Botão Copiar */}
                                <button
                                    type="button"
                                    onClick={() => handleCopy(notice)}
                                    className="h-8 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-surface-200/80 hover:bg-surface-300 text-typography-700 text-xs font-medium transition cursor-pointer border border-surface-300/40"
                                    title="Copiar texto do anúncio"
                                >
                                    {copiedId === notice.id ? (
                                        <>
                                            <Check size={13} className="text-emerald-500" />
                                            <span className="text-emerald-500 font-semibold">Copiado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={13} />
                                            <span>Copiar</span>
                                        </>
                                    )}
                                </button>

                                {/* Botão Editar */}
                                <button
                                    type="button"
                                    onClick={() => Router.push(`/congregacao/anuncios/edit/${notice.id}`)}
                                    className="h-8 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl border border-surface-300 bg-surface-100 hover:bg-surface-200 text-typography-700 hover:text-primary-200 text-xs font-medium transition cursor-pointer"
                                    title="Editar anúncio"
                                >
                                    <EditIcon className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                </button>

                                {/* Botão Excluir */}
                                <ConfirmDeleteModal
                                    onDelete={() => onDelete(String(notice.id))}
                                    button={
                                        <button
                                            type="button"
                                            className="h-8 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-surface-100 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600 text-xs font-medium transition cursor-pointer"
                                            title="Excluir anúncio"
                                        >
                                            <Trash size={13} />
                                            <span>Excluir</span>
                                        </button>
                                    }
                                />
                            </div>
                        </div>

                        {/* Corpo / Conteúdo da Mensagem */}
                        <div className="pl-1 text-xs sm:text-sm text-typography-700 leading-relaxed whitespace-pre-wrap font-normal bg-surface-200/30 rounded-xl p-4 border border-surface-300/40">
                            {notice.text}
                        </div>
                    </article>
                )
            })}
        </div>
    )
}
