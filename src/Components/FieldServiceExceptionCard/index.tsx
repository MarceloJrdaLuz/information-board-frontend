import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
dayjs.locale("pt-br")
import { useState } from "react"
import { toast } from "react-toastify"
import Calendar from "../Calendar"
import Button from "../Button"
import Input from "../Input"
import { Trash } from "lucide-react"
import { useSetAtom } from "jotai"
import {
    createFieldServiceExceptionAtom,
    deleteFieldServiceExceptionAtom,
} from "@/atoms/fieldServiceAtoms"
import { CreateFieldServiceExceptionPayload } from "@/atoms/fieldServiceAtoms/types"
import { useCongregationContext } from "@/context/CongregationContext"


export function FieldServiceExceptionsCard() {
    const { congregation } = useCongregationContext()
    const createException = useSetAtom(createFieldServiceExceptionAtom)
    const deleteException = useSetAtom(deleteFieldServiceExceptionAtom)

    const [date, setDate] = useState<string | null>(
        dayjs().format("YYYY-MM-DD")
    )
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    const url = congregation
        ? `${API_ROUTES.FIELD_SERVICE_EXCEPTIONS}/congregation/${congregation?.id}`
        : ""

    const { data: exceptions, mutate } = useAuthorizedFetch<any[]>(url, {
        allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
    })

    const handleAdd = async () => {
        if (!date) {
            toast.error("Informe a data.")
            return
        }

        const payload: CreateFieldServiceExceptionPayload = {
            date,
            reason,
        }

        setLoading(true)

        await toast
            .promise(createException(congregation?.id ?? "", payload), {
                pending: "Salvando exceção...",
            })
            .then(() => {
                setReason("")
                mutate()
            })
            .finally(() => setLoading(false))
    }

    const handleDelete = async (id: string) => {
        await toast
            .promise(deleteException(id), {
                pending: "Removendo exceção...",
            })
            .then(() => mutate())
    }

    return (
        <div className="flex flex-col  p-5 gap-4 bg-surface-100 rounded-md">
            <Calendar
                label="Data"
                titleHidden
                full
                selectedDate={date}
                handleDateChange={setDate}
            />

            <Input
                type="text"
                placeholder="Motivo"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />

            <Button
                className="w-full"
                onClick={handleAdd}
                disabled={loading}
            >
                {loading ? "Salvando..." : "Adicionar"}
            </Button>

            <ul className="mt-2">
                {exceptions?.map((exc) => (
                    <li
                        key={exc.id}
                        className="flex justify-between items-center p-2 border-b text-sm text-typography-700"
                    >
                        <span>
                            {dayjs(exc.date).format("DD/MM/YYYY")}
                            {" ("}
                            {dayjs(exc.date).format("dddd")}
                            {")"} — {exc.reason}

                        </span>
                        <button
                            className="text-red-500 hover:opacity-70"
                            onClick={() => handleDelete(exc.id)}
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </li>
                ))}

                {exceptions?.length === 0 && (
                    <p className="text-sm text-typography-500 italic">
                        Nenhuma exceção cadastrada.
                    </p>
                )}
            </ul>
        </div>
    )
}
