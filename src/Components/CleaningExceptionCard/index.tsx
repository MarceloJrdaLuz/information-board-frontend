import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useState } from "react";
import { toast } from "react-toastify";
import Calendar from "../Calendar";
import { Button } from "@/Components/ui/button";
import { useSetAtom } from "jotai";
import { createCleaningExceptionAtom, deleteCleaningExceptionAtom } from "@/atoms/cleaningScheduleAtoms";
import { CreateCleningExceptionPayload } from "@/atoms/cleaningScheduleAtoms/types";
import { CalendarOff, Loader2, Plus, Trash2 } from "lucide-react";

dayjs.locale("pt-br");

export function CleaningExceptionsCard() {
    const { congregation } = useCongregationContext();
    const createCleaningException = useSetAtom(createCleaningExceptionAtom);
    const deleteCleaningException = useSetAtom(deleteCleaningExceptionAtom);

    const [date, setDate] = useState<string | null>(dayjs().format("YYYY-MM-DD"));
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const url = congregation
        ? `${API_ROUTES.CLEANING_EXCEPTIONS}/congregation/${congregation.id}`
        : "";

    const { data: exceptions, mutate } = useAuthorizedFetch<any[]>(url, {
        allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
    });

    const handleAdd = async () => {
        if (!congregation || !date) {
            toast.error("Informe a data.");
            return;
        }

        const payload: CreateCleningExceptionPayload = {
            date,
            reason: reason.trim() || "Sem limpeza",
        };

        setLoading(true);
        try {
            await createCleaningException(congregation.id, payload);
            toast.success("Exceção adicionada com sucesso!");
            setReason("");
            await mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar exceção.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCleaningException(id);
            toast.success("Exceção removida!");
            await mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover exceção.");
        }
    };

    return (
        <div className="flex flex-col gap-4 p-5 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm w-full">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-300">
                <CalendarOff className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-base text-typography-800">
                    Cadastrar Data sem Limpeza
                </h3>
            </div>

            {/* Formulário de Adição */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <Calendar
                    label="Data da Exceção"
                    selectedDate={date}
                    handleDateChange={setDate}
                    full
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-typography-700">
                        Motivo (opcional):
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Congresso, Assembleia, Feriado"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full h-11 px-3.5 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                </div>
            </div>

            <Button
                onClick={handleAdd}
                disabled={loading || !date}
                className="w-full bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm h-10"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Adicionar Data sem Limpeza</span>
            </Button>

            {/* Lista de Exceções Cadastradas */}
            <div className="mt-2 space-y-2 pt-3 border-t border-surface-300">
                <span className="text-xs font-semibold text-typography-500 block">
                    Datas cadastradas ({exceptions?.length || 0}):
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {exceptions && exceptions.length > 0 ? (
                        exceptions.map((exc) => {
                            const excDate = dayjs(exc.date);
                            return (
                                <div
                                    key={exc.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-surface-200 border border-surface-300 text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-typography-800">
                                                {excDate.format("DD/MM/YYYY")}
                                            </span>
                                            <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                                {excDate.format("dddd")}
                                            </span>
                                        </div>
                                        {exc.reason && (
                                            <p className="text-typography-500 text-[11px]">
                                                {exc.reason}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(exc.id)}
                                        className="p-1.5 text-typography-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                        title="Remover exceção"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-xs text-typography-400 italic py-2">
                            Nenhuma exceção cadastrada.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
