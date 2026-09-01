import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Calendar, CheckCircle2, Info, Loader2, Sparkles, Wand2 } from "lucide-react";
import React, { useState } from "react";

interface MidweekAutoAssignModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (scope: "WEEK" | "MONTH", options: { chairmanPrays: boolean }) => Promise<void>;
    loading: boolean;
    weekDateFormatted?: string;
    monthFormatted?: string;
}

export const MidweekAutoAssignModal: React.FC<MidweekAutoAssignModalProps> = ({
    open,
    onClose,
    onConfirm,
    loading,
    weekDateFormatted,
    monthFormatted
}) => {
    const [scope, setScope] = useState<"WEEK" | "MONTH">("WEEK");
    const [chairmanPrays, setChairmanPrays] = useState(true);

    const handleSubmit = async () => {
        await onConfirm(scope, { chairmanPrays });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !loading && !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary-200">
                        <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
                            <Wand2 className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-lg font-bold">
                            Preenchimento Automático
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-typography-500 mt-1.5 leading-relaxed">
                        O algoritmo analisa o histórico de designações recentes, qualificações e indisponibilidades para sugerir uma escala justa e equilibrada.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Seleção do Escopo (Semana ou Mês) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                            Escolha o que deseja preencher:
                        </label>

                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setScope("WEEK")}
                                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    scope === "WEEK"
                                        ? "border-primary-200 bg-primary-50/40 dark:bg-primary-950/30 shadow-sm"
                                        : "border-surface-300 hover:bg-surface-200/50"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 text-xs font-bold text-typography-900">
                                    <Calendar className="h-3.5 w-3.5 text-primary-200" />
                                    <span>Apenas Esta Semana</span>
                                </div>
                                <span className="text-[11px] text-typography-500 mt-1 truncate max-w-full">
                                    {weekDateFormatted || "Semana selecionada"}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setScope("MONTH")}
                                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    scope === "MONTH"
                                        ? "border-purple-500 bg-purple-50/40 dark:bg-purple-950/30 shadow-sm"
                                        : "border-surface-300 hover:bg-surface-200/50"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 text-xs font-bold text-typography-900">
                                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                    <span>O Mês Inteiro</span>
                                </div>
                                <span className="text-[11px] text-typography-500 mt-1 truncate max-w-full">
                                    {monthFormatted || "Todas as semanas"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Opções adicionais */}
                    <div className="flex flex-col gap-2.5 p-3 bg-surface-200/50 rounded-xl border border-surface-300">
                        <label className="text-xs font-semibold text-typography-800">
                            Opções da Reunião
                        </label>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="modal-chairman-prays"
                                checked={chairmanPrays}
                                onCheckedChange={(checked) => setChairmanPrays(!!checked)}
                            />
                            <label
                                htmlFor="modal-chairman-prays"
                                className="text-xs text-typography-700 cursor-pointer select-none font-medium leading-none"
                            >
                                O Presidente faz a oração inicial
                            </label>
                        </div>
                    </div>

                    {/* Aviso de Segurança (Não-destrutivo) */}
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-900 dark:text-blue-200">
                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                        <p className="text-[11px] leading-relaxed">
                            <strong>Proteção:</strong> As designações que você já preencheu manualmente <u>não serão alteradas</u>. O preenchimento automático atua somente nas partes que estão vazias.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-surface-300">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={onClose}
                        className="text-xs border-surface-300"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="text-xs bg-primary-200 hover:opacity-90 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                        {loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>{loading ? "Preenchendo..." : "Confirmar e Preencher"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

