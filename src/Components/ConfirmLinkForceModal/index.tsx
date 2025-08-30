import React, { ReactElement } from "react"
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react"
import Button from "../Button"
import { AlertTriangleIcon, Trash } from "lucide-react"
import { useSetAtom } from "jotai"
import { showConfirmForceModal } from "@/atoms/atom"

interface ConfirmDeleteProps {
    button: ReactElement
    onDelete: () => void
    message?: string
    canOpen?: boolean
}

export function ConfirmLinkForceModal({ button, onDelete, message, canOpen }: ConfirmDeleteProps) {
    const setModalForceLink = useSetAtom(showConfirmForceModal)


    const handleDelete = () => {
        onDelete()
    }

    return (
        <>
            <div >
                {button}
            </div>
            <Dialog
                open={canOpen ?? false}
                handler={() => {}}
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogHeader>
                    <span className="text-red-400 ">Forçar atualização de vínculo de publicador?</span>
                </DialogHeader>
                <DialogBody divider>
                    <div className="text-red-400 flex gap-3">
                        <AlertTriangleIcon />
                        {message}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        color="red"
                        onClick={() => setModalForceLink(false)}
                        className="mr-1"
                    >
                        <span>Cancelar</span>
                    </Button>
                    <Button onClick={handleDelete}>
                        <span>Confirmar</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    )
}