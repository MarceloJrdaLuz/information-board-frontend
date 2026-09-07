import { AlertTriangle, Loader2, X } from "lucide-react";
import React, { useState } from "react";

interface RejectAccessModalProps {
    isOpen: boolean;
    userName: string;
    onClose: () => void;
    onConfirm: (observation: string) => Promise<void>;
}

export default function RejectAccessModal({
    isOpen,
    userName,
    onClose,
    onConfirm,
}: RejectAccessModalProps) {
    const [observation, setObservation] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onConfirm(observation.trim());
            setObservation("");
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
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-base font-bold text-typography-100">
                            Recusar Solicitação
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-1 rounded-lg text-typography-500 hover:text-typography-100 hover:bg-surface-300 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleConfirm} className="p-6 flex flex-col gap-4">
                    <p className="text-xs sm:text-sm text-typography-500">
                        Tem certeza de que deseja recusar a solicitação de{" "}
                        <strong className="text-typography-100">{userName}</strong>? O usuário será
                        notificado desta decisão.
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="reject-obs"
                            className="text-xs font-semibold text-typography-500"
                        >
                            Motivo / Observação (opcional)
                        </label>
                        <textarea
                            id="reject-obs"
                            rows={3}
                            placeholder="Ex: Não foi possível identificar seu cadastro como publicador desta congregação..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            maxLength={250}
                            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-surface-300 bg-surface-100 text-typography-100 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-surface-300 text-typography-500 hover:bg-surface-200 transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-600/20"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Recusando...</span>
                                </>
                            ) : (
                                <span>Confirmar Recusa</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

