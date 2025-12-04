import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";
import Calendar from "../Calendar";
import Button from "../Button";
import { useSetAtom } from "jotai";
import { createCleaningExceptionAtom, deleteCleaningExceptionAtom } from "@/atoms/cleaningScheduleAtoms";
import { CreateCleningExceptionPayload } from "@/atoms/cleaningScheduleAtoms/types";
import { Trash } from "lucide-react";
import Input from "../Input";

export function CleaningExceptionsCard() {
    const { congregation } = useCongregationContext()
    const createCleaningException = useSetAtom(createCleaningExceptionAtom)
    const deleteCleaningException = useSetAtom(deleteCleaningExceptionAtom)

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
            reason
        }

        setLoading(true);

        await toast.promise(
            createCleaningException(congregation.id, payload),
            { pending: "Salvando..." }
        );

        setReason("");
        mutate();
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        await toast.promise(
            deleteCleaningException(id),
            { pending: "Removendo..." }
        );
        mutate();
    };

    return (
        <div className="flex flex-col w-full max-w-[400px] m-4 p-5 gap-4 bg-surface-100 rounded-md shadow">
            <h3 className="font-semibold mb-2 text-typography-700">
                Dias sem limpeza
            </h3>

            {/* Seleção da Data */}
            <Calendar
                label="Data"
                titleHidden
                full
                handleDateChange={setDate}
                selectedDate={date}
            />

            {/* Motivo */}
            <Input
                type="text"
                placeholder="Motivo (ex.: Assembleia)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />

            <Button className="w-full text-typography-200" onClick={handleAdd} disabled={loading}>
                {loading ? "Salvando..." : "Adicionar"}
            </Button>

            {/* Lista */}
            <ul className="mt-2">
                {exceptions?.map(exc => (
                    <li
                        key={exc.id}
                        className="flex justify-between items-center p-2 border-b text-typography-700"
                    >
                        <span>{dayjs(exc.date).format("DD/MM/YYYY")} — {exc.reason}</span>
                        <button
                            className="text-red-500 hover:underline"
                            onClick={() => handleDelete(exc.id)}
                        >
                            <Trash className="w-5 h-5"/>
                        </button>
                    </li>
                ))}

                {exceptions?.length === 0 && (
                    <p className="text-sm text-typography-500">Nenhuma exceção cadastrada.</p>
                )}
            </ul>
        </div>
    );
}
