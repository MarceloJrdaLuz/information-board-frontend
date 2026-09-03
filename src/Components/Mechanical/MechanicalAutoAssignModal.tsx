import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { AlertCircle, CheckCircle2, Loader2, Sparkles, Wand2 } from "lucide-react";
import React, { useState } from "react";

interface MechanicalAutoAssignModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (options: { forceReassignManual: boolean }) => Promise<void>;
    loading: boolean;
    monthFormatted: string;
}

export const MechanicalAutoAssignModal: React.FC<MechanicalAutoAssignModalProps> = ({
    open,
    onClose,
    onConfirm,
    loading,
    monthFormatted
}) => {
    const [forceReassignManual, setForceReassignManual] = useState(false);

    const handleConfirm = async () => {
        await onConfirm({ forceReassignManual });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !loading && !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary-200">
                        <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
                            <Wand2 className="h-5 w-5 text-primary-200" />
                        </div>
                        <DialogTitle className="text-lg font-bold">
                            Preenchimento Automático
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-typography-500 mt-1">
                        Gerar a programação de partes mecânicas para as semanas de <strong>{monthFormatted}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                    {/* Regras e critérios do algoritmo */}
                    <div className="p-3.5 bg-surface-200/60 rounded-xl border border-typography-200/40 text-xs space-y-2 text-typography-700">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Prioridade por antiguidade:</strong> Irmãos há mais tempo sem designação são escalados primeiro.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Mesclagem de funções:</strong> O mesmo irmão não repete a mesma função seguidamente, alternando entre seus privilégios.</span>
                        </div>
                        <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 font-medium">
                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Restrição do Presidente:</strong> O irmão designado como Presidente da Reunião do Meio de Semana é preservado e não recebe função mecânica.</span>
                        </div>
                    </div>

                    {/* Checkbox sobrescrever manuais */}
                    <div className="flex items-center gap-2.5 p-2 rounded-lg border border-typography-200/30 bg-surface-100">
                        <input
                            type="checkbox"
                            id="forceReassign"
                            checked={forceReassignManual}
                            onChange={(e) => setForceReassignManual(e.target.checked)}
                            className="rounded text-primary-200 focus:ring-primary-200 h-4 w-4"
                        />
                        <label
                            htmlFor="forceReassign"
                            className="text-xs text-typography-700 cursor-pointer select-none"
                        >
                            Sobrescrever inclusive os irmãos que fixei manualmente
                        </label>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="text-typography-600"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-primary-200 text-white hover:bg-primary-300 gap-1.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Preenchendo...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Gerar Programação
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

