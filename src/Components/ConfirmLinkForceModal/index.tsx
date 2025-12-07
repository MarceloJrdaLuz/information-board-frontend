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
            <div>{button}</div>

            {/* MODAL */}
            <Dialog open={canOpen ?? false} onOpenChange={setModalForceLink}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">
                            Forçar atualização de vínculo?
                        </DialogTitle>
                        <DialogDescription>
                            Isso atualizará o vínculo do publicador imediatamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-start gap-3 text-red-500 text-sm py-4">
                        <AlertTriangleIcon className="mt-0.5" />
                        {message}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalForceLink(false)}>
                            Cancelar
                        </Button>

                        <Button onClick={handleDelete}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
