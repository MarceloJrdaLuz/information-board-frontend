import React, { useState, useEffect } from "react";
import { Plus, Clock, Award, BookOpen, FileText } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import Calendar from "@/Components/Calendar";
import { IPublisherBibleStudent, IPublisherFieldActivity } from "@/types/dailyMinistry";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

interface ActivityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialMinutes?: number;
    initialDate?: string;
    activityToEdit?: IPublisherFieldActivity | null;
    students: IPublisherBibleStudent[];
}

export default function ActivityFormModal({
    isOpen,
    onClose,
    onSuccess,
    initialMinutes = 0,
    initialDate,
    activityToEdit,
    students
}: ActivityFormModalProps) {
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [hoursInput, setHoursInput] = useState(0);
    const [minutesInput, setMinutesInput] = useState(0);
    const [creditHoursInput, setCreditHoursInput] = useState(0);
    const [creditMinutesInput, setCreditMinutesInput] = useState(0);
    const [creditDescription, setCreditDescription] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (activityToEdit) {
            setDate(activityToEdit.date);
            const totalM = activityToEdit.minutes || 0;
            setHoursInput(Math.floor(totalM / 60));
            setMinutesInput(totalM % 60);

            const totalCredM = activityToEdit.credit_minutes || 0;
            setCreditHoursInput(Math.floor(totalCredM / 60));
            setCreditMinutesInput(totalCredM % 60);

            setCreditDescription(activityToEdit.credit_description || "");
            setSelectedStudentId(activityToEdit.bible_student_id || "");
            setNotes(activityToEdit.notes || "");
        } else {
            setDate(initialDate || dayjs().format("YYYY-MM-DD"));
            const totalM = initialMinutes || 0;
            setHoursInput(Math.floor(totalM / 60));
            setMinutesInput(totalM % 60);

            setCreditHoursInput(0);
            setCreditMinutesInput(0);
            setCreditDescription("");
            setSelectedStudentId("");
            setNotes("");
        }
    }, [activityToEdit, initialMinutes, initialDate, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const totalMinutes = (hoursInput * 60) + minutesInput;
        const totalCreditMinutes = (creditHoursInput * 60) + creditMinutesInput;

        if (totalMinutes === 0 && totalCreditMinutes === 0 && !selectedStudentId) {
            toast.warn("Informe o tempo de ministério, crédito ou um estudo dirigido.");
            return;
        }

        if (totalCreditMinutes > 0 && !creditDescription.trim()) {
            toast.warn("Informe a atividade aprovada correspondente ao crédito de horas.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                date,
                minutes: totalMinutes,
                credit_minutes: totalCreditMinutes,
                credit_description: creditDescription.trim() || null,
                bible_student_id: selectedStudentId || null,
                notes: notes.trim() || null
            };

            if (activityToEdit) {
                await api.put(`/daily-ministry/activities/${activityToEdit.id}`, payload);
                toast.success("Atividade atualizada com sucesso!");
            } else {
                await api.post("/daily-ministry/activities", payload);
                toast.success("Atividade registrada com sucesso!");
            }

            onSuccess();
            onClose();
        } catch {
            toast.error("Erro ao salvar atividade.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-surface-100 border border-surface-300 p-5 rounded-2xl max-h-[92dvh] overflow-y-auto thin-scrollbar">
                <DialogHeader className="pb-3 border-b border-surface-300">
                    <DialogTitle className="text-base font-bold text-typography-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-200" />
                        {activityToEdit ? "Editar Atividade Diária" : "Lançar Atividade no Ministério"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-3">
                    {/* Data */}
                    <div>
                        <Calendar
                            label="Data da Atividade *"
                            selectedDate={date}
                            handleDateChange={(d) => setDate(d || dayjs().format("YYYY-MM-DD"))}
                            full
                        />
                    </div>

                    {/* Tempo de Ministério de Campo */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-200/50 border border-surface-300/80">
                        <label className="text-xs font-bold text-typography-800 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary-200" />
                            Tempo de Campo
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] text-typography-500 font-semibold mb-1 block">HORAS</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    value={hoursInput || ""}
                                    onChange={(e) => setHoursInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm rounded-xl bg-surface-100 border border-surface-300 text-typography-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary-200/20"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-typography-500 font-semibold mb-1 block">MINUTOS</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutesInput || ""}
                                    onChange={(e) => setMinutesInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm rounded-xl bg-surface-100 border border-surface-300 text-typography-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary-200/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Crédito de Horas (Atividade Aprovada) */}
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <label className="text-xs font-bold text-typography-800 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-500" />
                            Crédito de Horas <span className="text-typography-400 font-normal">(opcional)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] text-typography-500 font-semibold mb-1 block">HORAS</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={creditHoursInput || ""}
                                    onChange={(e) => setCreditHoursInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm rounded-xl bg-surface-100 border border-surface-300 text-typography-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-typography-500 font-semibold mb-1 block">MINUTOS</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={creditMinutesInput || ""}
                                    onChange={(e) => setCreditMinutesInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm rounded-xl bg-surface-100 border border-surface-300 text-typography-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        {(creditHoursInput > 0 || creditMinutesInput > 0) && (
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-[10px] text-typography-600 font-semibold">
                                    ATIVIDADE APROVADA * (irá para as observações do relatório)
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Construção de Salão do Reino / LDC"
                                    value={creditDescription}
                                    onChange={(e) => setCreditDescription(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-100 border border-surface-300 text-typography-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                        )}
                    </div>

                    {/* Estudo Bíblico Dirigido */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-typography-800 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-primary-200" />
                            Estudo Bíblico Dirigido <span className="text-typography-400 font-normal">(se realizou hoje)</span>
                        </label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface-200/70 border border-surface-300 text-typography-900 focus:outline-none focus:ring-2 focus:ring-primary-200/20 cursor-pointer"
                        >
                            <option value="">Nenhum estudo hoje</option>
                            {students.map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Observações Pessoais */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-typography-800 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-typography-400" />
                            Anotações Pessoais <span className="text-typography-400 font-normal">(apenas você vê)</span>
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Ex: Trabalhei no território 04, conversei com o morador da casa amarela..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2.5 text-xs rounded-xl bg-surface-200/70 border border-surface-300 text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/20 resize-none"
                        />
                    </div>

                    <DialogFooter className="pt-3 border-t border-surface-300 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="text-xs border-surface-300 hover:bg-surface-200"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting}
                            className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs"
                        >
                            {submitting ? "Salvando..." : activityToEdit ? "Salvar Alterações" : "Registrar Atividade"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
