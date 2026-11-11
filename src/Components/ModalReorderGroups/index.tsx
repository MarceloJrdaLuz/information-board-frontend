import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical, Loader2, RotateCcw } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";

export interface IReorderGroupItem {
    id: string;
    currentNumber: number;
    customName?: string | null;
    membersCount?: number;
    extraInfo?: string | null;
}

interface ModalReorderGroupsProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    items: IReorderGroupItem[];
    onSave: (orderedIds: string[]) => Promise<void>;
}

interface ReorderItemRowProps {
    item: IReorderGroupItem;
    index: number;
    total: number;
    isSaving: boolean;
    onPositionChange: (fromIndex: number, newPosition: number) => void;
    onMove: (index: number, direction: "up" | "down") => void;
}

function ReorderItemRow({
    item,
    index,
    total,
    isSaving,
    onPositionChange,
    onMove,
}: ReorderItemRowProps) {
    const dragControls = useDragControls();
    const newNumber = index + 1;
    const isChanged = newNumber !== item.currentNumber;

    return (
        <Reorder.Item
            key={item.id}
            value={item}
            dragListener={false}
            dragControls={dragControls}
            className={`flex items-center justify-between p-3 rounded-xl border bg-surface-100 transition-all select-none touch-pan-y ${
                isChanged
                    ? "border-primary-200/60 shadow-xs"
                    : "border-surface-300 shadow-2xs"
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                {/* Alça exclusiva para iniciar o arrasto - Não bloqueia scroll no restante do card */}
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: "none" }}
                    className="cursor-grab active:cursor-grabbing text-typography-400 hover:text-typography-600 p-2.5 -m-1.5 shrink-0 touch-none"
                    title="Segure e arraste por este ícone para reordenar"
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isChanged
                                ? "bg-primary-200 text-white shadow-xs"
                                : "bg-primary-200/10 text-primary-200"
                        }`}
                    >
                        {newNumber}
                    </div>
                </div>

                <div className="flex flex-col min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-typography-900 truncate">
                            Grupo {newNumber}
                        </span>
                        {item.customName && (
                            <span className="text-xs text-typography-500 truncate" title={item.customName}>
                                • {item.customName}
                            </span>
                        )}
                        {isChanged && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                                era Grupo {item.currentNumber}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-typography-500 truncate">
                        {item.membersCount !== undefined && (
                            <span>{item.membersCount} {item.membersCount === 1 ? "membro" : "membros"}</span>
                        )}
                        {item.extraInfo && (
                            <span>• {item.extraInfo}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {/* Dropdown de posição direta */}
                <select
                    value={newNumber}
                    onChange={(e) => onPositionChange(index, Number(e.target.value))}
                    disabled={isSaving}
                    className="h-8 px-2 bg-surface-200 border border-surface-300 rounded-lg text-xs font-semibold text-typography-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-200"
                    title="Escolha a nova posição"
                >
                    {Array.from({ length: total }, (_, i) => i + 1).map((pos) => (
                        <option key={pos} value={pos}>
                            Pos. {pos}
                        </option>
                    ))}
                </select>

                {/* Botões Mover para Cima / Baixo */}
                <button
                    type="button"
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0 || isSaving}
                    className="p-1.5 rounded-lg text-typography-500 hover:text-typography-800 hover:bg-surface-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Mover para cima"
                >
                    <ArrowUp className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onMove(index, "down")}
                    disabled={index === total - 1 || isSaving}
                    className="p-1.5 rounded-lg text-typography-500 hover:text-typography-800 hover:bg-surface-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Mover para baixo"
                >
                    <ArrowDown className="w-4 h-4" />
                </button>
            </div>
        </Reorder.Item>
    );
}

export default function ModalReorderGroups({
    open,
    onClose,
    title,
    description = "Arraste pela alça, use as setas ou selecione uma nova posição para reordenar a sequência.",
    items,
    onSave,
}: ModalReorderGroupsProps) {
    const [orderedItems, setOrderedItems] = useState<IReorderGroupItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setOrderedItems([...items]);
        }
    }, [open, items]);

    const handleReset = () => {
        setOrderedItems([...items]);
    };

    const handleMove = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= orderedItems.length) return;

        const updated = [...orderedItems];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);
        setOrderedItems(updated);
    };

    const handlePositionChange = (fromIndex: number, newPosition: number) => {
        const toIndex = newPosition - 1;
        if (toIndex < 0 || toIndex >= orderedItems.length || toIndex === fromIndex) return;

        const updated = [...orderedItems];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setOrderedItems(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(orderedItems.map((item) => item.id));
            onClose();
        } catch (error) {
            console.error("Erro ao salvar nova ordem:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const total = orderedItems.length;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && !isSaving && onClose()}>
            <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col p-5 sm:p-6 overflow-hidden">
                <DialogHeader className="gap-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                            <ArrowUpDown className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle className="text-base sm:text-lg font-bold text-typography-900">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-typography-500 mt-0.5">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex items-center justify-between py-2 border-b border-surface-300 text-xs text-typography-500 shrink-0">
                    <span>{total} {total === 1 ? "grupo no arranjo" : "grupos no arranjo"}</span>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 text-typography-500 hover:text-primary-200 text-xs font-medium transition cursor-pointer"
                        title="Restaurar ordem original"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-2 min-h-[220px] touch-pan-y overscroll-contain">
                    <Reorder.Group
                        axis="y"
                        values={orderedItems}
                        onReorder={setOrderedItems}
                        className="space-y-2"
                    >
                        {orderedItems.map((item, index) => (
                            <ReorderItemRow
                                key={item.id}
                                item={item}
                                index={index}
                                total={total}
                                isSaving={isSaving}
                                onPositionChange={handlePositionChange}
                                onMove={handleMove}
                            />
                        ))}
                    </Reorder.Group>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-surface-300 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                        className="rounded-xl text-xs"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl text-xs gap-1.5 font-semibold"
                    >
                        {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Salvar Nova Ordem</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
