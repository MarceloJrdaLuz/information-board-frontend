import React, { useState } from "react";
import { Plus, Trash2, User, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { IPublisherBibleStudent } from "@/types/dailyMinistry";
import { api } from "@/services/api";
import { toast } from "react-toastify";

interface BibleStudentsManagerProps {
    students: IPublisherBibleStudent[];
    onRefresh: () => void;
}

export default function BibleStudentsManager({ students, onRefresh }: BibleStudentsManagerProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            await api.post("/daily-ministry/students", { name: name.trim() });
            toast.success("Estudante cadastrado com sucesso!");
            setName("");
            setIsCreateOpen(false);
            onRefresh();
        } catch {
            toast.error("Erro ao cadastrar estudante.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/daily-ministry/students/${deletingId}`);
            toast.success("Estudante removido com sucesso!");
            setDeletingId(null);
            onRefresh();
        } catch {
            toast.error("Erro ao excluir estudante.");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-typography-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-200" />
                        Meus Estudantes da Bíblia
                    </h3>
                    <p className="text-xs text-typography-500 mt-0.5">
                        Cadastre os nomes das pessoas com quem você estuda para marcar quando dirigir estudos no mês.
                    </p>
                </div>

                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Estudante</span>
                </Button>
            </div>

            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center gap-2">
                    <div className="p-3 bg-surface-200/60 rounded-full text-typography-400">
                        <User className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-typography-700">Nenhum estudante cadastrado</span>
                    <p className="text-xs text-typography-400 max-w-sm">
                        Adicione os nomes dos seus estudantes bíblicos para registrar as sessões de estudo facilmente.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {students.map((student) => (
                        <div
                            key={student.id}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-surface-100 border border-surface-300 shadow-2xs hover:border-primary-200/40 transition-all"
                        >
                            <div className="flex items-center gap-3 truncate">
                                <div className="w-9 h-9 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0 font-bold text-sm">
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-typography-800 truncate">
                                    {student.name}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setDeletingId(student.id)}
                                title="Excluir estudante"
                                className="p-1.5 rounded-lg text-typography-400 hover:text-rose-500 hover:bg-surface-200 transition-colors cursor-pointer shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Novo Estudante */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-sm bg-surface-100 border border-surface-300 p-5 rounded-2xl">
                    <DialogHeader className="pb-3 border-b border-surface-300">
                        <DialogTitle className="text-base font-bold text-typography-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary-200" />
                            Novo Estudante da Bíblia
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-typography-800">
                                Nome da Pessoa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                autoFocus
                                required
                                placeholder="Ex: Carlos Silva"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl bg-surface-200/70 border border-surface-300 text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition-all"
                            />
                        </div>

                        <DialogFooter className="pt-3 border-t border-surface-300 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateOpen(false)}
                                className="text-xs border-surface-300 hover:bg-surface-200"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={submitting || !name.trim()}
                                className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs"
                            >
                                {submitting ? "Salvando..." : "Salvar Estudante"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Confirmar Exclusão */}
            <Dialog open={Boolean(deletingId)} onOpenChange={() => setDeletingId(null)}>
                <DialogContent className="max-w-sm bg-surface-100 border border-surface-300 p-5 rounded-2xl">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-base font-bold text-typography-900 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            Excluir Estudante?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-typography-600 mt-2">
                        Tem certeza que deseja remover este estudante? Suas anotações anteriores deste mês não serão apagadas.
                    </p>
                    <DialogFooter className="pt-4 border-t border-surface-300 gap-2 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingId(null)}
                            className="text-xs border-surface-300 hover:bg-surface-200"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleDelete}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs"
                        >
                            Sim, Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
