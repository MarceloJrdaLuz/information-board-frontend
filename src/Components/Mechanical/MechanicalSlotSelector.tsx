import { api } from "@/services/api";
import { IMechanicalAssignment, IMechanicalCandidateSuggestion, MechanicalRole, MechanicalRoleLabels } from "@/types/mechanical";
import * as Popover from "@radix-ui/react-popover";
import { AlertCircle, AlertTriangle, Check, ChevronDown, Clock, Loader2, Search, Sparkles, UserX } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface MechanicalSlotSelectorProps {
    assignment: IMechanicalAssignment;
    scheduleId: string;
    congregationId: string;
    onAssignmentUpdated: (updated: IMechanicalAssignment) => void;
}

export const MechanicalSlotSelector: React.FC<MechanicalSlotSelectorProps> = ({
    assignment,
    scheduleId,
    congregationId,
    onAssignmentUpdated
}) => {
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<IMechanicalCandidateSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/congregations/${congregationId}/mechanical-suggestions`, {
                params: {
                    schedule_id: scheduleId,
                    role: assignment.role
                }
            });
            setSuggestions(res.data);
        } catch (error) {
            console.error("Erro ao buscar sugestões:", error);
            toast.error("Erro ao buscar irmãos disponíveis.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchSuggestions();
            setSearchTerm("");
        }
    }, [open]);

    const handleSelectPublisher = async (publisherId: string | null) => {
        setUpdating(true);
        try {
            const res = await api.put(`/mechanical-assignments/${assignment.id}`, {
                publisher_id: publisherId
            });
            onAssignmentUpdated(res.data);
            setOpen(false);
            toast.success("Designação atualizada!");
        } catch (error) {
            console.error("Erro ao atualizar designação:", error);
            toast.error("Erro ao salvar designação.");
        } finally {
            setUpdating(false);
        }
    };

    const filtered = suggestions.filter((s) => {
        if (!searchTerm.trim()) return true;
        const norm = searchTerm.toLowerCase();
        return (
            s.fullName.toLowerCase().includes(norm) ||
            (s.nickname && s.nickname.toLowerCase().includes(norm))
        );
    });

    const currentPublisherName = assignment.publisher
        ? assignment.publisher.nickname || assignment.publisher.fullName
        : null;

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className={`group w-full flex items-center justify-between text-left p-2 rounded-lg border transition-all cursor-pointer ${
                        currentPublisherName
                            ? "bg-surface-100/90 border-typography-200 hover:border-primary-200/80 shadow-xs"
                            : "bg-surface-100/70 border-dashed border-typography-300 hover:bg-surface-200/50"
                    }`}
                >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                                currentPublisherName ? "bg-emerald-500" : "bg-typography-300"
                            }`}
                        />
                        <span
                            className={`text-xs truncate font-medium ${
                                currentPublisherName
                                    ? "text-typography-900"
                                    : "text-typography-400 italic"
                            }`}
                        >
                            {currentPublisherName || "Vago"}
                        </span>
                        {assignment.isManual && currentPublisherName && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold shrink-0">
                                Manual
                            </span>
                        )}
                    </div>
                    <ChevronDown className="h-3 w-3 text-typography-400 group-hover:text-primary-200 shrink-0 ml-1 transition-colors" />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className="z-50 w-72 sm:w-80 p-2.5 rounded-xl bg-surface-100 border border-typography-200 shadow-xl focus:outline-none"
                    sideOffset={5}
                    align="start"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-typography-200/60 mb-2">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-primary-200" />
                            <span className="text-xs font-bold text-typography-800">
                                Designar {MechanicalRoleLabels[assignment.role]}
                            </span>
                        </div>
                        {updating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-200" />}
                    </div>

                    {/* Busca */}
                    <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-typography-400" />
                        <input
                            type="text"
                            placeholder="Buscar irmão..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg bg-surface-100 border-typography-200 focus:outline-none focus:ring-1 focus:ring-primary-200"
                        />
                    </div>

                    {/* Botão para Deixar Vago */}
                    {assignment.publisher_id && (
                        <button
                            type="button"
                            onClick={() => handleSelectPublisher(null)}
                            disabled={updating}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 mb-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                            <UserX className="h-3.5 w-3.5" />
                            <span>Deixar slot vago</span>
                        </button>
                    )}

                    {/* Lista de Sugestões Inteligentes */}
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-typography-400 gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary-200" />
                                <span className="text-xs">Carregando sugestões...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-6 text-center text-xs text-typography-400">
                                Nenhum irmão encontrado.
                            </div>
                        ) : (
                            filtered.map((candidate, idx) => {
                                const isSelected = candidate.id === assignment.publisher_id;
                                const isTopPick = idx === 0 && !candidate.isUnavailable && !candidate.isMidweekChairman;

                                return (
                                    <button
                                        key={candidate.id}
                                        type="button"
                                        onClick={() => handleSelectPublisher(candidate.id)}
                                        disabled={updating}
                                        className={`w-full flex flex-col items-start p-2 rounded-lg text-left transition-colors cursor-pointer border ${
                                            isSelected
                                                ? "bg-primary-50 dark:bg-primary-950/40 border-primary-300"
                                                : "hover:bg-surface-100 border-transparent"
                                        }`}
                                    >
                                        <div className="w-full flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <span className="text-xs font-semibold text-typography-900 truncate">
                                                    {candidate.nickname || candidate.fullName}
                                                </span>
                                                {isTopPick && (
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                                                        Top
                                                    </span>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <Check className="h-3.5 w-3.5 text-primary-200 shrink-0" />
                                            )}
                                        </div>

                                        {/* Avisos Importantes */}
                                        {candidate.isMidweekChairman && (
                                            <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                                <span>Presidente da Reunião do Meio de Semana</span>
                                            </div>
                                        )}

                                        {candidate.isUnavailable && (
                                            <div className="flex items-center gap-1 text-[10px] text-rose-600 mt-0.5">
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                <span>{candidate.unavailabilityReason || "Ausente / Indisponível"}</span>
                                            </div>
                                        )}

                                        {candidate.isAssignedThisMeeting && (
                                            <div className="flex items-center gap-1 text-[10px] text-purple-600 mt-0.5">
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                <span>Já tem função nesta reunião</span>
                                            </div>
                                        )}

                                        {/* Histórico / Recência */}
                                        <div className="flex items-center gap-2 text-[10px] text-typography-400 mt-0.5">
                                            <span className="flex items-center gap-0.5">
                                                <Clock className="h-2.5 w-2.5" />
                                                {candidate.daysSinceLastAny === null
                                                    ? "Nunca fez mecânica"
                                                    : `Há ${candidate.daysSinceLastAny} dias`}
                                            </span>
                                            {candidate.lastRole && (
                                                <span>
                                                    • Última: {MechanicalRoleLabels[candidate.lastRole as MechanicalRole] || candidate.lastRole}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};

