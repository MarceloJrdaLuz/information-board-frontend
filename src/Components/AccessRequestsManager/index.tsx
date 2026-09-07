import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";
import { AccessRequestStatus, IAccessRequest } from "@/types/accessRequest";
import { ICongregation } from "@/types/types";
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Hash,
    Loader2,
    Mail,
    MessageSquare,
    Search,
    User,
    XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ApproveAccessModal from "../ApproveAccessModal";
import RejectAccessModal from "../RejectAccessModal";

interface AccessRequestsManagerProps {
    onPendingCountChange?: (count: number) => void;
}

export default function AccessRequestsManager({
    onPendingCountChange,
}: AccessRequestsManagerProps) {
    const { user } = useAuthContext();
    const [congregations, setCongregations] = useState<ICongregation[]>([]);
    const [selectedCongregationId, setSelectedCongregationId] = useState<string>(
        user?.congregation?.id || ""
    );
    const [requests, setRequests] = useState<IAccessRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<"PENDING" | "ALL" | "APPROVED" | "REJECTED">(
        "PENDING"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modais de aprovação e recusa
    const [approveTarget, setApproveTarget] = useState<{
        id: string;
        userName: string;
        userEmail?: string;
        userCode?: string;
    } | null>(null);
    const [rejectTarget, setRejectTarget] = useState<{ id: string; userName: string } | null>(null);

    const isAdmin = user?.roles?.some((r) => r.name === "ADMIN");

    // Para super admin carregar lista de congregações
    useEffect(() => {
        if (isAdmin) {
            api
                .get<ICongregation[]>("/congregations")
                .then((res) => {
                    const list = res.data || [];
                    setCongregations(list);
                    if (!selectedCongregationId && list.length > 0) {
                        setSelectedCongregationId(list[0].id);
                    }
                })
                .catch((err) => console.error("Erro ao buscar congregações:", err));
        } else if (user?.congregation?.id) {
            setSelectedCongregationId(user.congregation.id);
        }
    }, [isAdmin, user?.congregation?.id, selectedCongregationId]);

    const loadRequests = useCallback(async () => {
        if (!selectedCongregationId) return;

        setLoading(true);
        try {
            const res = await api.get<IAccessRequest[]>(
                `/access-requests/congregation/${selectedCongregationId}`
            );
            const data = res.data || [];
            setRequests(data);

            const pendingCount = data.filter((r) => r.status === AccessRequestStatus.PENDING).length;
            if (pendingCount === 0) {
                sessionStorage.removeItem("access_requests_redirected");
            }
            onPendingCountChange?.(pendingCount);
        } catch (err: any) {
            console.error("Erro ao carregar solicitações:", err);
            toast.error("Não foi possível carregar as solicitações de acesso.");
        } finally {
            setLoading(false);
        }
    }, [selectedCongregationId, onPendingCountChange]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    // Ações
    const handleApproveConfirm = async () => {
        if (!approveTarget) return;

        setProcessingId(approveTarget.id);
        try {
            await api.patch(`/access-requests/${approveTarget.id}/approve`);
            await api.patch(`/access-requests/${approveTarget.id}/approve`, {
                congregation_id: selectedCongregationId,
            });
            await api.patch(
                `/access-requests/congregation/${selectedCongregationId}/${approveTarget.id}/approve`
            );
            toast.success(`Acesso de ${approveTarget.userName} aprovado com sucesso!`);
            await loadRequests();
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message || "Erro ao aprovar solicitação. Tente novamente.";
            toast.error(errorMsg);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectConfirm = async (observation: string) => {
        if (!rejectTarget) return;

        setProcessingId(rejectTarget.id);
        try {
            await api.patch(`/access-requests/${rejectTarget.id}/reject`, {
                congregation_id: selectedCongregationId,
                response_observation: observation || undefined,
            });
            await api.patch(
                `/access-requests/congregation/${selectedCongregationId}/${rejectTarget.id}/reject`,
                {
                    response_observation: observation || undefined,
                }
            );
            toast.success("Solicitação recusada.");
            await loadRequests();
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message || "Erro ao recusar solicitação. Tente novamente.";
            toast.error(errorMsg);
        } finally {
            setProcessingId(null);
        }
    };

    // Estatísticas
    const stats = useMemo(() => {
        const pending = requests.filter((r) => r.status === AccessRequestStatus.PENDING).length;
        const approved = requests.filter((r) => r.status === AccessRequestStatus.APPROVED).length;
        const rejected = requests.filter((r) => r.status === AccessRequestStatus.REJECTED).length;
        return { pending, approved, rejected, total: requests.length };
    }, [requests]);

    // Filtragem
    const filteredRequests = useMemo(() => {
        return requests.filter((r) => {
            // Filtro de status
            if (statusFilter !== "ALL" && r.status !== statusFilter) {
                return false;
            }

            // Filtro de busca
            if (searchTerm.trim()) {
                const s = searchTerm.toLowerCase();
                const userName = r.user?.fullName?.toLowerCase() || "";
                const userEmail = r.user?.email?.toLowerCase() || "";
                const userCode = r.user?.code?.toLowerCase() || "";
                return (
                    userName.includes(s) || userEmail.includes(s) || userCode.includes(s)
                );
            }

            return true;
        });
    }, [requests, statusFilter, searchTerm]);

    return (
        <div className="w-full max-w-5xl flex flex-col gap-6">
            {/* Super Admin - seletor de congregação */}
            {isAdmin && congregations.length > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm">
                    <div className="flex items-center gap-2 text-typography-500 text-sm font-medium">
                        <Building2 className="w-4 h-4 text-primary-200" />
                        <span>Congregação ativa:</span>
                    </div>
                    <select
                        value={selectedCongregationId}
                        onChange={(e) => setSelectedCongregationId(e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-xl border border-surface-300 bg-surface-100 text-typography-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        {congregations.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.city ? `(${c.city})` : ""}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                    type="button"
                    onClick={() => setStatusFilter("PENDING")}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        statusFilter === "PENDING"
                            ? "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/30 shadow-sm"
                            : "bg-surface-100 border-surface-300 hover:border-amber-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <span>Pendentes</span>
                        <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-typography-700 mt-2">
                        {stats.pending}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setStatusFilter("APPROVED")}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        statusFilter === "APPROVED"
                            ? "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/30 shadow-sm"
                            : "bg-surface-100 border-surface-300 hover:border-emerald-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>Aprovadas</span>
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-typography-700 mt-2">
                        {stats.approved}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setStatusFilter("REJECTED")}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        statusFilter === "REJECTED"
                            ? "bg-red-500/10 border-red-500/50 ring-2 ring-red-500/30 shadow-sm"
                            : "bg-surface-100 border-surface-300 hover:border-red-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                        <span>Recusadas</span>
                        <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-typography-700 mt-2">
                        {stats.rejected}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        statusFilter === "ALL"
                            ? "bg-primary-100/15 border-primary-200 ring-2 ring-primary-200/30 shadow-sm"
                            : "bg-surface-100 border-surface-300 hover:border-primary-100"
                    }`}
                >
                    <div className="flex items-center justify-between text-xs font-semibold text-primary-200">
                        <span>Total</span>
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-typography-700 mt-2">
                        {stats.total}
                    </span>
                </button>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-typography-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, e-mail ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-surface-300 bg-surface-100 text-typography-700 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {(
                        [
                            { id: "PENDING", label: "Pendentes" },
                            { id: "ALL", label: "Todas" },
                            { id: "APPROVED", label: "Aprovadas" },
                            { id: "REJECTED", label: "Recusadas" },
                        ] as const
                    ).map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            onClick={() => setStatusFilter(filter.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                                statusFilter === filter.id
                                    ? "bg-primary-200 text-white shadow-sm"
                                    : "bg-surface-100 border border-surface-300 text-typography-500 hover:text-typography-100 hover:bg-surface-200"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Solicitações */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-surface-100 rounded-2xl border border-surface-300">
                    <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-2" />
                    <span className="text-xs text-typography-500">
                        Carregando solicitações de acesso...
                    </span>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-100 rounded-2xl border border-surface-300">
                    <div className="p-3 rounded-full bg-surface-200 text-typography-400 mb-3">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-typography-100">
                        Nenhuma solicitação encontrada
                    </h3>
                    <p className="text-xs text-typography-500 max-w-sm mt-1">
                        {statusFilter === "PENDING"
                            ? "Não há nenhuma solicitação pendente de aprovação no momento."
                            : "Não foram encontradas solicitações com os filtros atuais."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredRequests.map((req) => {
                        const isPending = req.status === AccessRequestStatus.PENDING;
                        const isApproved = req.status === AccessRequestStatus.APPROVED;
                        const isRejected = req.status === AccessRequestStatus.REJECTED;
                        const isProcessing = processingId === req.id;
                        const displayName = req.user?.fullName || req.user?.email || "Usuário";

                        return (
                            <div
                                key={req.id}
                                className={`p-4 sm:p-5 rounded-2xl border bg-surface-100 transition-all flex flex-col gap-3 ${
                                    isPending
                                        ? "border-amber-500/40 shadow-sm"
                                        : "border-surface-300"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    {/* Informações do Usuário */}
                                    <div className="flex items-start sm:items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {displayName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-sm text-typography-700">
                                                    {displayName}
                                                </span>
                                                {req.user?.code && (
                                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-surface-200 text-[11px] font-mono text-typography-500">
                                                        <Hash className="w-3 h-3" />
                                                        {req.user.code}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-typography-500 mt-0.5 flex-wrap">
                                                <span className="inline-flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {req.user?.email}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(req.created_at).toLocaleDateString(
                                                        "pt-BR",
                                                        {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge & Ações */}
                                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                                        {/* Status */}
                                        {isPending && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                Pendente
                                            </span>
                                        )}
                                        {isApproved && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Aprovado
                                            </span>
                                        )}
                                        {isRejected && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-600 dark:text-red-400">
                                                <XCircle className="w-3.5 h-3.5" />
                                                Recusado
                                            </span>
                                        )}
                                        {req.status === AccessRequestStatus.CANCELED && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-300 text-typography-500">
                                                Cancelado
                                            </span>
                                        )}

                                        {/* Botões de Aprovar/Recusar */}
                                        {isPending && (
                                            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                                                <button
                                                    type="button"
                                                    disabled={isProcessing}
                                                    onClick={() =>
                                                        setRejectTarget({
                                                            id: req.id,
                                                            userName: displayName,
                                                        })
                                                    }
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Recusar</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isProcessing}
                                                    onClick={() =>
                                                        setApproveTarget({
                                                            id: req.id,
                                                            userName: displayName,
                                                            userEmail: req.user?.email,
                                                            userCode: req.user?.code,
                                                        })
                                                    }
                                                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50"
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>Aprovar</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mensagem do solicitante */}
                                {req.message && (
                                    <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300/60 text-xs text-typography-500 flex items-start gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary-200" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-typography-100">
                                                Mensagem do solicitante:
                                            </span>
                                            <span className="italic">&ldquo;{req.message}&rdquo;</span>
                                        </div>
                                    </div>
                                )}

                                {/* Motivo de recusa se houver */}
                                {isRejected && req.response_observation && (
                                    <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                                        <strong>Motivo da recusa:</strong> {req.response_observation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de confirmação de aprovação */}
            <ApproveAccessModal
                isOpen={!!approveTarget}
                userName={approveTarget?.userName || ""}
                userEmail={approveTarget?.userEmail}
                userCode={approveTarget?.userCode}
                congregationName={
                    congregations.find((c) => c.id === selectedCongregationId)?.name ||
                    user?.congregation?.name
                }
                onClose={() => setApproveTarget(null)}
                onConfirm={handleApproveConfirm}
            />

            {/* Modal de confirmação de recusa */}
            <RejectAccessModal
                isOpen={!!rejectTarget}
                userName={rejectTarget?.userName || ""}
                onClose={() => setRejectTarget(null)}
                onConfirm={handleRejectConfirm}
            />
        </div>
    );
}
