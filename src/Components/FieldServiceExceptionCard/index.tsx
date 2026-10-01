import { deleteFieldServiceExceptionAtom } from "@/atoms/fieldServiceAtoms";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useSetAtom } from "jotai";
import { ArrowUpRight, Calendar, CalendarOff, CalendarPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

dayjs.locale("pt-br");

export function FieldServiceExceptionsCard() {
    const { congregation } = useCongregationContext();
    const deleteException = useSetAtom(deleteFieldServiceExceptionAtom);

    const url = congregation
        ? `${API_ROUTES.FIELD_SERVICE_EXCEPTIONS}/congregation/${congregation?.id}`
        : "";

    const { data: exceptions, mutate } = useAuthorizedFetch<any[]>(url, {
        allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
    });

    const handleDelete = async (id: string) => {
        try {
            await deleteException(id);
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
                    Datas sem Saída de Campo (Exceções)
                </h3>
            </div>

            {/* Redirecionamento Unificado para a Central de Eventos */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-primary-50/60 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 text-xs">
                <div className="flex items-start gap-2.5">
                    <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-semibold text-primary-900 dark:text-primary-200 text-sm">
                            Gestão Centralizada de Eventos Especiais
                        </p>
                        <p className="text-typography-600 dark:text-typography-400 leading-relaxed">
                            Para suspender saídas de campo em dias de Congresso, Assembleia, Celebração ou Visita do SC, cadastre diretamente na <strong>Central de Eventos Especiais</strong>. O sistema aplicará o cancelamento automático dos arranjos sem conflitos.
                        </p>
                    </div>
                </div>

                <Link
                    href="/congregacao/eventos-especiais?action=new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-200 hover:bg-primary-300 text-white rounded-xl font-semibold shadow-sm transition-colors text-xs"
                >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Cadastrar Evento Especial na Central</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Lista de Exceções */}
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
