import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { api } from "@/services/api";
import { IMechanicalQualificationItem, MechanicalRole } from "@/types/mechanical";
import { Loader2, Search, UserCheck } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

interface MechanicalQualificationsModalProps {
    open: boolean;
    onClose: () => void;
    congregationId: string;
}

export const MechanicalQualificationsModal: React.FC<MechanicalQualificationsModalProps> = ({
    open,
    onClose,
    congregationId
}) => {
    const [qualifications, setQualifications] = useState<IMechanicalQualificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [togglingMap, setTogglingMap] = useState<Record<string, boolean>>({});

    const fetchQualifications = async () => {
        if (!congregationId) return;
        setLoading(true);
        try {
            const res = await api.get(`/congregations/${congregationId}/mechanical-qualifications`);
            setQualifications(res.data);
        } catch (error) {
            console.error("Erro ao carregar qualificações:", error);
            toast.error("Erro ao carregar qualificações mecânicas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchQualifications();
        }
    }, [open, congregationId]);

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return qualifications;
        const norm = searchTerm.toLowerCase().trim();
        return qualifications.filter(
            q =>
                q.fullName.toLowerCase().includes(norm) ||
                (q.nickname && q.nickname.toLowerCase().includes(norm))
        );
    }, [qualifications, searchTerm]);

    const handleToggle = async (
        publisherId: string,
        role: MechanicalRole,
        field: keyof IMechanicalQualificationItem
    ) => {
        const item = qualifications.find(q => q.id === publisherId);
        if (!item) return;

        const currentValue = Boolean(item[field]);
        const newValue = !currentValue;

        const toggleKey = `${publisherId}:${role}`;
        setTogglingMap(prev => ({ ...prev, [toggleKey]: true }));

        // Optimistic update
        setQualifications(prev =>
            prev.map(q => (q.id === publisherId ? { ...q, [field]: newValue } : q))
        );

        try {
            await api.post(`/congregations/${congregationId}/mechanical-qualifications/toggle`, {
                publisher_id: publisherId,
                role,
                enabled: newValue
            });
            toast.success("Privilégio atualizado!");
        } catch (error) {
            console.error("Erro ao atualizar privilégio:", error);
            toast.error("Erro ao atualizar privilégio.");
            // Revert
            setQualifications(prev =>
                prev.map(q => (q.id === publisherId ? { ...q, [field]: currentValue } : q))
            );
        } finally {
            setTogglingMap(prev => {
                const next = { ...prev };
                delete next[toggleKey];
                return next;
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[800px] max-h-[88vh] flex flex-col p-6">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary-200">
                        <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
                            <UserCheck className="h-5 w-5 text-primary-200" />
                        </div>
                        <DialogTitle className="text-lg font-bold">
                            Irmãos Habilitados para Partes Mecânicas
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-typography-500 mt-1">
                        Marque quais funções cada irmão pode realizar. O sistema de auto-preenchimento respeitará estas permissões.
                    </DialogDescription>
                </DialogHeader>

                {/* Barra de busca */}
                <div className="relative my-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-typography-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou apelido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl bg-surface-100 border-typography-200 focus:outline-none focus:ring-1 focus:ring-primary-200"
                    />
                </div>

                {/* Tabela de irmãos */}
                <div className="flex-1 overflow-y-auto border border-typography-200/60 rounded-xl mt-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-typography-500 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary-200" />
                            <span className="text-sm">Carregando irmãos...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-sm text-typography-500">
                            Nenhum irmão encontrado.
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-surface-200 text-typography-700 sticky top-0 font-semibold select-none z-10">
                                <tr>
                                    <th className="py-2.5 px-3">Irmão</th>
                                    <th className="py-2.5 px-2 text-center">Indicador</th>
                                    <th className="py-2.5 px-2 text-center">Som</th>
                                    <th className="py-2.5 px-2 text-center">Mídias</th>
                                    <th className="py-2.5 px-2 text-center">Som & Mídias</th>
                                    <th className="py-2.5 px-2 text-center">Volante</th>
                                    <th className="py-2.5 px-2 text-center">Pedestal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-typography-200/40">
                                {filtered.map((pub) => (
                                    <tr
                                        key={pub.id}
                                        className="hover:bg-surface-100/80 transition-colors"
                                    >
                                        <td className="py-2 px-3">
                                            <div className="font-medium text-typography-800 text-sm">
                                                {pub.nickname || pub.fullName}
                                            </div>
                                            {pub.nickname && (
                                                <div className="text-[11px] text-typography-400">
                                                    {pub.fullName}
                                                </div>
                                            )}
                                        </td>

                                        {/* Indicador */}
                                        <td className="py-2 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={pub.canAttendant}
                                                onChange={() => handleToggle(pub.id, MechanicalRole.ATTENDANT, "canAttendant")}
                                                className="rounded text-primary-200 focus:ring-primary-200 h-4 w-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Som */}
                                        <td className="py-2 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={pub.canSound}
                                                onChange={() => handleToggle(pub.id, MechanicalRole.SOUND, "canSound")}
                                                className="rounded text-primary-200 focus:ring-primary-200 h-4 w-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Mídias */}
                                        <td className="py-2 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={pub.canMedia}
                                                onChange={() => handleToggle(pub.id, MechanicalRole.MEDIA, "canMedia")}
                                                className="rounded text-primary-200 focus:ring-primary-200 h-4 w-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Som e Mídias */}
                                        <td className="py-2 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={pub.canSoundAndMedia}
                                                onChange={() => handleToggle(pub.id, MechanicalRole.SOUND_AND_MEDIA, "canSoundAndMedia")}
                                                className="rounded text-primary-200 focus:ring-primary-200 h-4 w-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Volante */}
                                        <td className="py-2 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={pub.canRovingMic}
                                                onChange={() => handleToggle(pub.id, MechanicalRole.ROVING_MIC, "canRovingMic")}
                                                className="rounded text-primary-200 focus:ring-primary-200 h-4 w-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Pedestal */}
                                        <td className="py-2 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={pub.canStageMic}
                                                onChange={() => handleToggle(pub.id, MechanicalRole.STAGE_MIC, "canStageMic")}
                                                className="rounded text-primary-200 focus:ring-primary-200 h-4 w-4 cursor-pointer"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex justify-end pt-3">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-primary-200 text-white hover:bg-primary-300"
                    >
                        Concluído
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

