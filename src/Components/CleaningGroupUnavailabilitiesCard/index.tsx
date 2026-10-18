import {
    createCleaningGroupUnavailabilityAtom,
    deleteCleaningGroupUnavailabilityAtom,
} from "@/atoms/cleaningScheduleAtoms";
import Calendar from "@/Components/Calendar";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { ICleaningGroup, ICleaningGroupUnavailability } from "@/types/cleaning";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useSetAtom } from "jotai";
import { Calendar as CalendarIcon, CalendarOff, Loader2, Plus, Trash2, UserX } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

dayjs.locale("pt-br");

export function CleaningGroupUnavailabilitiesCard() {
    const { congregation } = useCongregationContext();
    const createUnavailability = useSetAtom(createCleaningGroupUnavailabilityAtom);
    const deleteUnavailability = useSetAtom(deleteCleaningGroupUnavailabilityAtom);

    const url = congregation
        ? `${API_ROUTES.CLEANING_GROUP_UNAVAILABILITIES}/congregation/${congregation.id}`
        : "";

    const { data: unavailabilities, mutate } = useAuthorizedFetch<
        ICleaningGroupUnavailability[]
    >(url, {
        allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
    });

    const groupsUrl = congregation
        ? `${API_ROUTES.CLEANING_GROUPS}/congregation/${congregation.id}`
        : "";

    const { data: groups } = useAuthorizedFetch<ICleaningGroup[]>(groupsUrl, {
        allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!congregation || !selectedGroupId || !startDate || !endDate) {
            toast.error("Preencha o grupo e o período de datas.");
            return;
        }

        if (dayjs(endDate).isBefore(dayjs(startDate))) {
            toast.error("A data final não pode ser anterior à data inicial.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createUnavailability(congregation.id, {
                group_id: selectedGroupId,
                startDate,
                endDate,
                reason: reason.trim() || undefined,
            });
            setIsAddModalOpen(false);
            setSelectedGroupId("");
            setReason("");
            await mutate();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteUnavailability(id);
            await mutate();
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-surface-300 pr-7 sm:pr-8">
                <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                        <UserX className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg text-typography-800">
                            Indisponibilidades de Grupos
                        </h3>
                        <p className="text-xs text-typography-500 mt-0.5 leading-relaxed">
                            Períodos em que um grupo não pode limpar. O gerador irá adiá-los automaticamente.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    size="sm"
                    className="w-full sm:w-auto bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-1.5 font-semibold shadow-sm shrink-0 h-9"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nova Indisponibilidade</span>
                </Button>
            </div>

            {/* Lista de Indisponibilidades */}
            {!unavailabilities || unavailabilities.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface-200/40 rounded-xl border border-dashed border-surface-300 text-center">
                    <CalendarIcon className="w-8 h-8 text-typography-400 mb-2" />
                    <p className="text-xs font-semibold text-typography-700">
                        Nenhuma indisponibilidade registrada
                    </p>
                    <p className="text-[11px] text-typography-500 mt-0.5">
                        Todos os grupos estão disponíveis para as escalas regulares.
                    </p>
                </div>
            ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                    {unavailabilities.map((item) => {
                        const start = dayjs(item.startDate);
                        const end = dayjs(item.endDate);
                        const isSameDay = item.startDate === item.endDate;
                        const periodLabel = isSameDay
                            ? start.format("DD [de] MMMM [de] YYYY")
                            : `${start.format("DD/MM/YYYY")} até ${end.format("DD/MM/YYYY")}`;

                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-surface-200/50 border border-surface-300/80 gap-3"
                            >
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            {item.group?.name || "Grupo"}
                                        </span>
                                        {item.reason && (
                                            <span className="text-[11px] text-typography-500 truncate" title={item.reason}>
                                                • {item.reason}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-typography-700">
                                        <CalendarOff className="w-3.5 h-3.5 text-typography-400 shrink-0" />
                                        <span>{periodLabel}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="p-1.5 text-typography-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                                    title="Remover indisponibilidade"
                                >
                                    {deletingId === item.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Adicionar Indisponibilidade */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <UserX className="w-5 h-5 text-amber-500" />
                            <span>Indisponibilidade de Grupo</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Defina qual grupo e em qual período ele não poderá limpar. O gerador pulará este grupo nessas datas e o manterá na fila para quando estiver livre.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-4 py-2">
                        {/* Seletor de Grupo */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-typography-700">
                                Grupo de Limpeza *
                            </label>
                            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                <SelectTrigger className="w-full h-10 rounded-xl bg-surface-100 border border-surface-300 text-xs">
                                    <SelectValue placeholder="Selecione o grupo..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {groups?.map((g) => (
                                        <SelectItem key={g.id} value={g.id} className="text-xs font-medium">
                                            {g.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Datas de Início e Fim */}
                        <div className="space-y-3">
                            <Calendar
                                label="Data Inicial *"
                                selectedDate={startDate}
                                handleDateChange={(date) => {
                                    if (date) {
                                        setStartDate(date);
                                        if (dayjs(date).isAfter(dayjs(endDate))) {
                                            setEndDate(date);
                                        }
                                    }
                                }}
                                isClearable={false}
                                full
                            />

                            <Calendar
                                label="Data Final *"
                                selectedDate={endDate}
                                handleDateChange={(date) => {
                                    if (date) setEndDate(date);
                                }}
                                minDate={startDate}
                                isClearable={false}
                                full
                            />
                        </div>

                        {/* Motivo Opcional */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-typography-700">
                                Motivo / Observação (Opcional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Ex: Viagem da maioria dos membros"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="h-10 rounded-xl bg-surface-100 border border-surface-300 text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                disabled={isSubmitting}
                                className="rounded-xl text-xs"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !selectedGroupId}
                                className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 text-xs font-semibold"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Salvar Indisponibilidade</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CleaningGroupUnavailabilitiesCard;
