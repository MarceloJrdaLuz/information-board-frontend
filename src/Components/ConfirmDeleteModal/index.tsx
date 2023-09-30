import React, { ReactElement } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import Button from "../Button";
import { AlertTriangleIcon, Trash } from "lucide-react";

interface ConfirmDeleteProps {
    button: ReactElement
    onDelete: () => void
}

export function ConfirmDeleteModal({ button, onDelete }: ConfirmDeleteProps) {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(!open)
    }

    const handleDelete = () => {
        onDelete()
        handleOpen()
    }

    return (
        <>
            <div onClick={handleOpen}>
                {button}
            </div>
            <Dialog
                open={open}
                handler={handleOpen}
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogHeader>
                    <span className="text-red-400 ">Confirmar a exclusão</span>
                    </DialogHeader>
                <DialogBody divider>
                    <div className="text-red-400 flex gap-3">
                        <AlertTriangleIcon/>
                        Ao clicar em confirmar isso não poderá ser revertido!
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        color="red"
                        onClick={handleOpen}
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
    );
}