import { useFetch } from "@/hooks/useFetch";
import { api } from "@/services/api";
import { AccessRequestStatus, IAccessRequest } from "@/types/accessRequest";
import {
    AlertCircle,
    AlertTriangle,
    Building2,
    Calendar,
    Clock,
    Loader2,
    MapPin,
    PlusCircle,
    X,
    XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import RequestAccessModal from "../RequestAccessModal";

export default function AccessRequestCard() {
    const { data: requests, isLoading, mutate } = useFetch<IAccessRequest[]>("/access-requests/my");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const [cancelingId, setCancelingId] = useState<string | null>(null);

    const pendingRequest = requests?.find((r) => r.status === AccessRequestStatus.PENDING);
    const lastRejectedRequest = requests?.find((r) => r.status === AccessRequestStatus.REJECTED);

    const handleConfirmCancel = async () => {
        if (!pendingRequest) return;

        setCancelingId(pendingRequest.id);
        try {
            await api.delete(`/access-requests/my/${pendingRequest.id}`);
            toast.success("Solicitação cancelada com sucesso.");
            setConfirmCancelOpen(false);
            mutate();
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message || "Erro ao cancelar solicitação. Tente novamente.";
            toast.error(errorMsg);
        } finally {
            setCancelingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-xl bg-surface-100 rounded-2xl border border-surface-300 p-6 flex flex-col items-center justify-center min-h-[220px] shadow-sm animate-pulse">
                <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                <span className="text-xs text-typography-500">Verificando status de acesso...</span>
            </div>
        );
    }

    return (
        <>
            <div className="w-full max-w-2xl bg-surface-100 rounded-2xl border border-surface-300 shadow-sm overflow-hidden transition-all">
                {/* Header decorativo com gradiente */}
                <div className="h-2 bg-gradient-to-r from-primary-200 via-primary-100 to-primary-300" />

                <div className="p-6 sm:p-8">
                    {pendingRequest ? (
                        /* Estado 1: Solicitação Pendente */
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                                        <Clock className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                Aguardando Aprovação
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-typography-100 mt-1">
                                            Solicitação de Acesso Enviada
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-surface-200/60 border border-surface-300/80 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-typography-100 font-semibold text-sm">
                                    <Building2 className="w-4 h-4 text-primary-200 flex-shrink-0" />
                                    <span>{pendingRequest.congregation?.name}</span>
                                    {pendingRequest.congregation?.number && (
                                        <span className="text-xs font-normal text-typography-500">
                                            (Nº {pendingRequest.congregation.number})
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-typography-500">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{pendingRequest.congregation?.city}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-typography-500">
                                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>
                                        Enviada em {new Date(pendingRequest.created_at).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                {pendingRequest.message && (
                                    <div className="mt-1 pt-2 border-t border-surface-300/60 text-xs text-typography-500 italic">
                                        &ldquo;{pendingRequest.message}&rdquo;
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-typography-500 leading-relaxed">
                                Os administradores da congregação foram notificados. Assim que a sua solicitação for avaliada, você receberá uma notificação e terá acesso completo ao quadro de anúncios.
                            </p>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmCancelOpen(true)}
                                    disabled={cancelingId === pendingRequest.id}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-all disabled:opacity-50"
                                >
                                    {cancelingId === pendingRequest.id ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Cancelando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-3.5 h-3.5" />
                                            <span>Cancelar Solicitação</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Estado 2: Sem solicitação pendente */
                        <div className="flex flex-col gap-5">
                            {lastRejectedRequest && (
                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold">
                                            Sua solicitação para {lastRejectedRequest.congregation?.name} não foi aceita.
                                        </span>
                                        {lastRejectedRequest.response_observation && (
                                            <span>
                                                Observação: {lastRejectedRequest.response_observation}
                                            </span>
                                        )}
                                        <span className="text-[11px] opacity-80 mt-0.5">
                                            Você pode solicitar novamente para outra congregação abaixo.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className="p-3.5 rounded-2xl bg-primary-100 text-primary-200 flex-shrink-0 shadow-inner">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-bold text-typography-100">
                                        Você ainda não tem congregação vinculada
                                    </h3>
                                    <p className="text-xs sm:text-sm text-typography-500 leading-relaxed">
                                        Para acessar os quadros de avisos, programações de reuniões, designações, grupos de campo e muito mais, solicite acesso à sua congregação.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-surface-200">
                                <span className="text-xs text-typography-400 text-center sm:text-left">
                                    Os administradores analisarão seu pedido rapidamente.
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-200 text-white font-semibold text-xs sm:text-sm hover:bg-primary-300 transition-all shadow-md shadow-primary-200/20"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Solicitar Acesso à Congregação</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RequestAccessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRequestSent={() => mutate()}
            />

            {/* Modal de confirmação para cancelar solicitação */}
            {confirmCancelOpen && pendingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div
                        className="relative w-full max-w-md bg-surface-100 rounded-3xl shadow-2xl border border-surface-300 overflow-hidden flex flex-col transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-2 bg-gradient-to-r from-red-500 to-amber-500" />
                        <div className="p-6 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => setConfirmCancelOpen(false)}
                                    type="button"
                                    disabled={!!cancelingId}
                                    className="p-2 rounded-xl text-typography-500 hover:text-typography-100 hover:bg-surface-200 transition-colors"
                                    aria-label="Fechar"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <h2 className="text-lg sm:text-xl font-bold text-typography-100">
                                    Cancelar Solicitação de Acesso
                                </h2>
                                <p className="text-xs sm:text-sm text-typography-500 leading-relaxed">
                                    Tem certeza de que deseja cancelar sua solicitação para a congregação{" "}
                                    <strong className="text-typography-100">{pendingRequest.congregation?.name}</strong>?
                                    Você poderá enviar um novo pedido a qualquer momento.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-200">
                                <button
                                    type="button"
                                    onClick={() => setConfirmCancelOpen(false)}
                                    disabled={!!cancelingId}
                                    className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-surface-300 text-typography-500 hover:bg-surface-200 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCancel}
                                    disabled={!!cancelingId}
                                    className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-600/25 disabled:opacity-50"
                                >
                                    {cancelingId ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Cancelando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            <span>Sim, Cancelar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
