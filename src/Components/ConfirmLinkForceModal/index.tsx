"use client";

import { ReactElement } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { AlertTriangleIcon } from "lucide-react";
import { useSetAtom } from "jotai";
import { showConfirmForceModal } from "@/atoms/atom";
import { Button } from "../ui/button";

interface ConfirmDeleteProps {
    button: ReactElement;
    onDelete: () => void;
    message?: string;
    canOpen?: boolean;
}

export function ConfirmLinkForceModal({
    button,
    onDelete,
    message,
    canOpen,
}: ConfirmDeleteProps) {
    const setModalForceLink = useSetAtom(showConfirmForceModal);

    const handleDelete = () => {
        onDelete();
    };

    return (
        <>
            {/* BOTÃO QUE ABRE O MODAL */}
            <div className="w-full sm:w-auto">{button}</div>

            {/* MODAL */}
            <Dialog open={canOpen ?? false} onOpenChange={setModalForceLink}>
                <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full bg-surface-100 border border-surface-300 rounded-2xl p-6 shadow-xl">
                    <DialogHeader className="gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangleIcon className="w-5 h-5" />
                            </div>
                            <DialogTitle className="text-base sm:text-lg font-bold text-typography-900 text-left">
                                Forçar atualização de vínculo?
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs sm:text-sm text-typography-500 text-left">
                            Isso atualizará o vínculo do publicador imediatamente.
                        </DialogDescription>
                    </DialogHeader>

                    {message && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed my-2">
                            <AlertTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>{message}</span>
                        </div>
                    )}

                    <DialogFooter className="flex-row justify-end gap-2 mt-4 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setModalForceLink(false)}
                            className="h-9 px-4 rounded-xl border-surface-300 hover:bg-surface-200 text-typography-700 font-semibold text-xs transition cursor-pointer"
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={handleDelete}
                            className="h-9 px-5 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                        >
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
