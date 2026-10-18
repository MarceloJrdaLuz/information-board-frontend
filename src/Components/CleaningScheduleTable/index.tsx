import { updateCleaningScheduleGroupAtom } from "@/atoms/cleaningScheduleAtoms";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
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
import { ICleaningGroup, ICleaningSchedule, ICleaningScheduleResponse } from "@/types/cleaning";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useSetAtom } from "jotai";
import { Loader2, Pencil, Sparkles, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

dayjs.locale("pt-br");

interface Props {
    schedule: ICleaningScheduleResponse;
    onDelete?: (id: string) => Promise<void>;
    onScheduleUpdated?: () => any;
}

export default function CleaningScheduleTable({ schedule, onDelete, onScheduleUpdated }: Props) {
    const { congregation } = useCongregationContext();
    const updateGroupAtom = useSetAtom(updateCleaningScheduleGroupAtom);

    const groupsUrl = congregation
        ? `${API_ROUTES.CLEANING_GROUPS}/congregation/${congregation.id}`
        : "";

    const { data: groups } = useAuthorizedFetch<ICleaningGroup[]>(groupsUrl, {
        allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
    });

    const [editingSchedule, setEditingSchedule] = useState<ICleaningSchedule | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [isUpdating, setIsUpdating] = useState(false);

    if (!schedule.schedules || schedule.schedules.length === 0) {
        return null;
    }

    const sortedSchedules = [...schedule.schedules].sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
    );

    const handleSaveGroupChange = async () => {
        if (!editingSchedule || !selectedGroupId) return;
        setIsUpdating(true);
        try {
            await updateGroupAtom(editingSchedule.id, selectedGroupId);
            setEditingSchedule(null);
            if (onScheduleUpdated) {
                await onScheduleUpdated();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-200" />
                    <h3 className="font-bold text-lg text-typography-800">
                        Escala Semanal de Limpeza
                    </h3>
                </div>
                <span className="text-xs font-semibold text-typography-500 bg-surface-100 px-3 py-1.5 rounded-xl border border-surface-300">
                    {sortedSchedules.length} semanas programadas
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedSchedules.map((item) => {
                    const itemDate = dayjs(item.date);
                    const dayFormatted = itemDate.format("DD");
                    const monthFormatted = itemDate.format("MMM").toUpperCase();
                    const weekDayFormatted = itemDate.format("dddd");

                    return (
                        <div
                            key={item.date}
                            className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="space-y-3">
                                {/* Header da Data */}
                                <div className="flex items-center justify-between pb-3 border-b border-surface-300">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary-200/10 text-primary-200 rounded-xl font-bold border border-primary-200/20 shrink-0">
                                            <span className="text-base leading-none">{dayFormatted}</span>
                                            <span className="text-[10px] tracking-wider uppercase">{monthFormatted}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-primary-200 uppercase tracking-wide">
                                                {weekDayFormatted}
                                            </span>
                                            <h4 className="text-sm font-bold text-typography-800">
                                                {itemDate.format("DD [de] MMMM [de] YYYY")}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {/* Botão de Trocar Grupo */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingSchedule(item);
                                                setSelectedGroupId(item.group_id || item.group?.id || "");
                                            }}
                                            className="p-1.5 text-typography-400 hover:text-primary-200 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors"
                                            title="Trocar grupo desta data"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>

                                        {/* Botão de Excluir */}
                                        {onDelete && item.id && (
                                            <button
                                                type="button"
                                                onClick={() => onDelete(item.id)}
                                                className="p-1.5 text-typography-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                title="Excluir esta data da limpeza"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Grupo Designado */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-typography-500">
                                            Grupo Responsável:
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20">
                                            {item.group.name}
                                        </span>
                                    </div>

                                    {/* Membros do Grupo */}
                                    <div className="pt-2 border-t border-surface-300">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-600 mb-2">
                                            <Users className="w-3.5 h-3.5 text-typography-400" />
                                            <span>Membros do Grupo:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.group.publishers && item.group.publishers.length > 0 ? (
                                                item.group.publishers.map((pub) => (
                                                    <span
                                                        key={pub.id}
                                                        className="px-2 py-1 rounded-lg text-xs bg-surface-100 text-typography-700 border border-surface-300 font-medium"
                                                    >
                                                        {pub.nickname?.trim() || pub.fullName?.trim()}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-typography-400 italic">
                                                    Nenhum membro vinculado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal: Trocar Grupo Manualmente */}
            <Dialog open={!!editingSchedule} onOpenChange={(open) => !open && setEditingSchedule(null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Pencil className="w-5 h-5 text-primary-200" />
                            <span>Trocar Grupo da Limpeza</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {editingSchedule && (
                                <>
                                    Designação de{" "}
                                    <strong>
                                        {dayjs(editingSchedule.date).format("dddd, DD [de] MMMM [de] YYYY")}
                                    </strong>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <label className="text-xs font-semibold text-typography-700">
                            Selecione o novo grupo responsável:
                        </label>
                        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                            <SelectTrigger className="w-full h-10 rounded-xl bg-surface-100 border border-surface-300 text-xs">
                                <SelectValue placeholder="Escolha um grupo..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {groups?.map((g) => {
                                    const count = g.publishers?.length || 0;
                                    return (
                                        <SelectItem key={g.id} value={g.id} className="text-xs font-medium">
                                            {g.name} ({count} {count === 1 ? "membro" : "membros"})
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingSchedule(null)}
                            disabled={isUpdating}
                            className="rounded-xl text-xs"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveGroupChange}
                            disabled={isUpdating || !selectedGroupId}
                            className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 text-xs font-semibold"
                        >
                            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Salvar Alteração</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}