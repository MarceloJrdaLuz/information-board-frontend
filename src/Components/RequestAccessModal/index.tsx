import { api } from "@/services/api";
import { ICongregation } from "@/types/types";
import { Building2, Check, Loader2, MapPin, Search, Send, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

interface RequestAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestSent: () => void;
}

export default function RequestAccessModal({
    isOpen,
    onClose,
    onRequestSent,
}: RequestAccessModalProps) {
    const [congregations, setCongregations] = useState<ICongregation[]>([]);
    const [loadingCongregations, setLoadingCongregations] = useState(false);
    const [selectedCongregation, setSelectedCongregation] = useState<ICongregation | null>(null);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setLoadingCongregations(true);
        api
            .get<ICongregation[]>("/congregations/system")
            .then((res) => {
                if (isMounted) {
                    setCongregations(res.data || []);
                }
            })
            .catch((err) => {
                console.error("Erro ao carregar congregações:", err);
                toast.error("Não foi possível carregar as congregações.");
            })
            .finally(() => {
                if (isMounted) setLoadingCongregations(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    const filteredCongregations = useMemo(() => {
        if (!search.trim()) return congregations;
        const s = search.toLowerCase();
        return congregations.filter(
            (c) =>
                c.name?.toLowerCase().includes(s) ||
                c.city?.toLowerCase().includes(s) ||
                c.number?.toLowerCase().includes(s)
        );
    }, [congregations, search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCongregation) {
            toast.warn("Selecione uma congregação.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/access-requests", {
                congregation_id: selectedCongregation.id,
                message: message.trim() || undefined,
            });

            toast.success("Solicitação enviada com sucesso!");
            onRequestSent();
            onClose();
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                "Não foi possível enviar a solicitação. Tente novamente.";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="relative w-full max-w-lg bg-surface-100 rounded-2xl shadow-2xl border border-surface-300 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-200/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary-100 text-primary-200">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-typography-100">
                                Solicitar Acesso à Congregação
                            </h2>
                            <p className="text-xs text-typography-500">
                                Escolha a sua congregação para solicitar entrada
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-1.5 rounded-lg text-typography-500 hover:text-typography-100 hover:bg-surface-300 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden p-6 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-typography-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, cidade ou número..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-300 bg-surface-100 text-typography-100 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Congregations List */}
                    <div className="flex-1 overflow-y-auto max-h-56 pr-1 space-y-2 border border-surface-200 rounded-xl p-2 bg-surface-200/30">
                        {loadingCongregations ? (
                            <div className="flex flex-col items-center justify-center py-8 text-typography-400">
                                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                <span className="text-xs">Carregando congregações...</span>
                            </div>
                        ) : filteredCongregations.length === 0 ? (
                            <div className="text-center py-8 text-typography-400 text-xs">
                                Nenhuma congregação encontrada.
                            </div>
                        ) : (
                            filteredCongregations.map((cong) => {
                                const isSelected = selectedCongregation?.id === cong.id;
                                return (
                                    <button
                                        key={cong.id}
                                        type="button"
                                        onClick={() => setSelectedCongregation(cong)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition-all border ${
                                            isSelected
                                                ? "bg-primary-100/15 border-primary-200 text-primary-200 font-medium"
                                                : "bg-surface-100 border-surface-300/60 hover:border-primary-100/60 text-typography-100"
                                        }`}
                                    >
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="truncate font-semibold text-sm">
                                                {cong.name}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-typography-500 truncate">
                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                {cong.city} {cong.number ? `• Nº ${cong.number}` : ""}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-primary-200 text-white flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Message textarea */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="request-message"
                            className="text-xs font-semibold text-typography-500"
                        >
                            Mensagem para os administradores (opcional)
                        </label>
                        <textarea
                            id="request-message"
                            rows={3}
                            placeholder="Ex: Olá! Sou publicador e gostaria de ter acesso ao quadro de anúncios da minha congregação..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={300}
                            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-surface-300 bg-surface-100 text-typography-100 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent transition-all resize-none"
                        />
                        <span className="text-[10px] text-right text-typography-500">
                            {message.length}/300
                        </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-surface-300 text-typography-500 hover:bg-surface-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedCongregation || submitting}
                            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-primary-200 text-white hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-200/20"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Enviar Solicitação</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

