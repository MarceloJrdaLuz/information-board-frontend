import { AlertTriangle, Loader2, UserMinus, X } from "lucide-react";
import React, { useState } from "react";

interface RevokeAccessModalProps {
    isOpen: boolean;
    userName: string;
    userEmail?: string;
    congregationName?: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function RevokeAccessModal({
    isOpen,
    userName,
    userEmail,
    congregationName,
    onClose,
    onConfirm,
}: RevokeAccessModalProps) {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="relative w-full max-w-md bg-surface-100 rounded-2xl shadow-2xl border border-surface-300 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-200/50">
                    <div className="flex items-center gap-2 text-rose-500">
                        <UserMinus className="w-5 h-5" />
                        <h2 className="text-base font-bold text-typography-900">
                            Revogar Acesso à Congregação
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-1 rounded-lg text-typography-500 hover:text-typography-900 hover:bg-surface-300 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4">
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <strong className="font-semibold block">Atenção! Esta ação desvinculará o usuário.</strong>
                            <span>
                                Todas as permissões e papéis locais deste usuário na congregação serão revogados imediatamente.
                            </span>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-typography-600 leading-relaxed">
                        Tem certeza que deseja revogar o acesso de{" "}
                        <strong className="text-typography-900 font-bold">{userName}</strong>
                        {userEmail && <span className="text-typography-500"> ({userEmail})</span>}
                        {congregationName ? (
                            <>
                                {" "}à congregação{" "}
                                <strong className="text-typography-900 font-bold">{congregationName}</strong>?
                            </>
                        ) : (
                            "?"
                        )}
                    </p>

                    <p className="text-xs text-typography-500">
                        A conta dele no sistema continuará existindo, mas ele deixará de ver qualquer dado ou programação desta congregação.
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-typography-500 hover:text-typography-900 hover:bg-surface-200 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Revogando...</span>
                                </>
                            ) : (
                                <span>Confirmar Revogação</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
