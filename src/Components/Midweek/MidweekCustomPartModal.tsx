import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { MidweekPartType, MidweekSection } from "@/types/midweek";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface MidweekCustomPartModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (data: {
        title: string;
        timeMinutes: number;
        section: MidweekSection;
        partType: MidweekPartType;
        method?: string;
    }) => Promise<void>;
}

export const MidweekCustomPartModal: React.FC<MidweekCustomPartModalProps> = ({
    open,
    onClose,
    onCreate
}) => {
    const [title, setTitle] = useState("");
    const [timeMinutes, setTimeMinutes] = useState(15);
    const [section, setSection] = useState<MidweekSection>(MidweekSection.LIVING);
    const [method, setMethod] = useState("Discurso");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.warning("Digite o tema da parte.");
            return;
        }

        setLoading(true);
        try {
            await onCreate({
                title: title.trim(),
                timeMinutes: Number(timeMinutes),
                section,
                partType: MidweekPartType.CUSTOM,
                method: method.trim() || undefined
            });
            toast.success("Parte personalizada adicionada com sucesso!");
            setTitle("");
            setTimeMinutes(15);
            onClose();
        } catch (error) {
            toast.error("Erro ao adicionar parte.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md bg-surface-100 border border-surface-300">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-typography-900 flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-primary-200" />
                        Adicionar Parte Personalizada
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                        Crie uma parte extra na programação da semana (ex: Necessidades Locais extra, Discurso Especial).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Tema da Parte *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Discurso de Serviço do SC..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Duração (minutos)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={60}
                                value={timeMinutes}
                                onChange={(e) => setTimeMinutes(Number(e.target.value))}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Método / Formato
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Discurso, Vídeo..."
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Seção da Reunião
                        </label>
                        <select
                            value={section}
                            onChange={(e) => setSection(e.target.value as MidweekSection)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                            <option value={MidweekSection.LIVING}>Nossa Vida Cristã</option>
                            <option value={MidweekSection.TREASURES}>Tesouros da Palavra de Deus</option>
                            <option value={MidweekSection.MINISTRY}>Faça Seu Melhor no Ministério</option>
                        </select>
                    </div>

                    <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading} className="text-xs">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white font-medium"
                        >
                            {loading ? "Salvando..." : "Adicionar Parte"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
