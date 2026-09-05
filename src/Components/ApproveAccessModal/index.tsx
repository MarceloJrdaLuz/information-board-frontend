import { CheckCircle2, Hash, Loader2, Mail, ShieldCheck, X } from "lucide-react";
import React, { useState } from "react";

interface ApproveAccessModalProps {
    isOpen: boolean;
    userName: string;
    userEmail?: string;
    userCode?: string;
    congregationName?: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function ApproveAccessModal({
    isOpen,
    userName,
    userEmail,
    userCode,
    congregationName,
    onClose,
    onConfirm,
}: ApproveAccessModalProps) {
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const initials = userName
        ? userName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0].toUpperCase())
              .join("")
        : "U";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="relative w-full max-w-md bg-surface-100 rounded-3xl shadow-2xl border border-surface-300 overflow-hidden flex flex-col transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Decorativo */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />

                <div className="p-6 flex flex-col gap-5">
                    {/* Botão Fechar no canto superior */}
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            type="button"
                            className="p-2 rounded-xl text-typography-500 hover:text-typography-100 hover:bg-surface-200 transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Título e Texto explicativo */}
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-lg sm:text-xl font-bold text-typography-800">
                            Aprovar Acesso ao Domínio
                        </h2>
                        <p className="text-xs sm:text-sm text-typography-500 leading-relaxed">
                            Você está prestes a vincular este usuário à sua congregação. Ele terá acesso completo aos quadros de anúncios, designações e programações.
                        </p>
                    </div>

                    {/* Card de Detalhes do Usuário */}
                    <div className="p-4 rounded-2xl bg-surface-200/70 border border-surface-300/80 flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-200 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                            {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-typography-700 truncate">
                                {userName}
                            </span>
                            {userEmail && (
                                <span className="flex items-center gap-1 text-xs text-typography-500 truncate">
                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                    {userEmail}
                                </span>
                            )}
                            {userCode && (
                                <span className="flex items-center gap-1 text-[11px] text-typography-400 font-mono mt-0.5">
                                    <Hash className="w-3 h-3 flex-shrink-0" />
                                    Código: {userCode}
                                </span>
                            )}
                        </div>
                    </div>

                    {congregationName && (
                        <div className="text-xs text-typography-500 px-1">
                            Congregação de destino: <strong className="text-typography-700">{congregationName}</strong>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-surface-300 text-typography-500 hover:bg-surface-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Aprovando...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Aprovar e Vincular</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

