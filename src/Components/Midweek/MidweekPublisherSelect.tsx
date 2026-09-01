import { Button } from "@/Components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";
import { IPublisherMini, IPublisherSuggestion } from "@/types/midweek";
import dayjs from "dayjs";
import { AlertTriangle, Calendar, Check, ChevronsUpDown, RefreshCw, Sparkles, User, Users2, UserX, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface MidweekPublisherSelectProps {
    value?: string | null;
    publisher?: IPublisherMini | null;
    onChange: (publisherId: string | null) => void;
    partId?: string;
    scheduleId?: string;
    role?: "CHAIRMAN" | "OPENING_PRAYER" | "CLOSING_PRAYER" | "AUX_COUNSELOR" | "CBS_CONDUCTOR" | "CBS_READER";
    isAssistant?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

export const MidweekPublisherSelect: React.FC<MidweekPublisherSelectProps> = ({
    value,
    publisher,
    onChange,
    partId,
    scheduleId,
    role,
    isAssistant = false,
    placeholder = "Selecione o publicador...",
    disabled = false
}) => {
    const { user } = useAuthContext();
    const congregationId = user?.congregation?.id;

    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<IPublisherSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [genderFilter, setGenderFilter] = useState<"ALL" | "Masculino" | "Feminino">("ALL");

    const fetchSuggestions = async () => {
        if (!congregationId) return;
        setLoading(true);
        setHasError(false);
        try {
            let res;
            if (partId) {
                res = await api.get(
                    `/midweek/parts/${partId}/suggestions/congregation/${congregationId}${isAssistant ? "?isAssistant=true" : ""}`
                );
            } else if (scheduleId && role) {
                res = await api.get(
                    `/midweek/schedules/${scheduleId}/role-suggestions/congregation/${congregationId}?role=${role}&isAssistant=${isAssistant}`
                );
            }

            if (res && res.data) {
                setSuggestions(res.data);
            }
        } catch (error) {
            console.error("Erro ao buscar sugestões:", error);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchSuggestions();
        }
    }, [open]);

    const filteredSuggestions = useMemo(() => {
        // Oculta publicadores indisponíveis na data da reunião (exceto se for o atualmente selecionado)
        let availableList = suggestions.filter(s => !s.isUnavailable || s.id === value);
        // filtro de gênero
        if (genderFilter !== "ALL") {
            availableList = availableList.filter(s => s.gender === genderFilter);
        }
        // filtro de família: impede que um estudante seja pareado com alguém da mesma família do mesmo sexo
        const selectedPub = publisher; // publicador já selecionado como estudante
        if (selectedPub && selectedPub.family_id) {
            // Excluir pares do mesmo sexo dentro da mesma família
            availableList = availableList.filter(s => !(s.gender === selectedPub.gender && s.family_id === selectedPub.family_id));
        }
        // filtro de busca textual
        if (!searchTerm.trim()) return availableList;
        const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const term = normalize(searchTerm);
        return availableList.filter(s =>
            normalize(s.fullName).includes(term) ||
            (s.nickname && normalize(s.nickname).includes(term))
        );
    }, [suggestions, searchTerm, value, genderFilter, publisher]);

    const selectedName =
        publisher?.nickname?.trim() ||
        publisher?.fullName ||
        suggestions.find(s => s.id === value)?.nickname?.trim() ||
        suggestions.find(s => s.id === value)?.fullName;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="flex items-center gap-1 w-full">
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className="w-full justify-between font-normal text-left h-9 px-3 bg-surface-100 border-surface-300 hover:bg-surface-200 text-typography-900"
                    >
                        <div className="flex items-center gap-2 truncate">
                            <User className="h-4 w-4 text-typography-400 shrink-0" />
                            {selectedName ? (
                                <span className="font-medium text-typography-900 truncate">{selectedName}</span>
                            ) : (
                                <span className="text-typography-500 text-xs">{placeholder}</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-typography-500" />
                    </Button>
                </PopoverTrigger>

                {value && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                        }}
                        className="h-8 w-8 text-typography-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                        title="Remover designação"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            
            <PopoverContent className="w-80 sm:w-[460px] p-2 shadow-xl border border-surface-300 bg-surface-100 text-typography-900 z-50">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between pb-1 border-b border-surface-300 px-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-800">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>Sugestões Inteligentes</span>
                        </div>
                        <span className="text-[10px] text-typography-500">
                            {isAssistant ? "Prioridade: mais tempo sem parte e duplas novas" : "Ordenado por histórico"}
                        </span>
                    </div>

                    <input
                        type="text"
                        placeholder="Buscar publicador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-surface-300 bg-surface-200 text-typography-900 placeholder:text-typography-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
                        autoFocus
                    />
                    <div className="flex gap-2 w-full">

                        <div className="flex items-center bg-surface-200 border border-surface-300 rounded-md p-0.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setGenderFilter("ALL")}
                                className={`px-2 py-1 text-[10px] font-medium rounded-sm transition-colors ${genderFilter === "ALL" ? "bg-surface-100 text-typography-900 shadow-sm" : "text-typography-500 hover:text-typography-700"}`}
                            >
                                Todos
                            </button>
                            <button
                                type="button"
                                onClick={() => setGenderFilter("Masculino")}
                                className={`px-2 py-1 text-[10px] font-medium rounded-sm transition-colors ${genderFilter === "Masculino" ? "bg-surface-100 text-typography-900 shadow-sm" : "text-typography-500 hover:text-typography-700"}`}
                                title="Apenas Homens"
                            >
                                Homens
                            </button>
                            <button
                                type="button"
                                onClick={() => setGenderFilter("Feminino")}
                                className={`px-2 py-1 text-[10px] font-medium rounded-sm transition-colors ${genderFilter === "Feminino" ? "bg-surface-100 text-typography-900 shadow-sm" : "text-typography-500 hover:text-typography-700"}`}
                                title="Apenas Mulheres"
                            >
                                Mulheres
                            </button>
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto flex flex-col gap-1 pr-1">
                        {loading ? (
                            <div className="py-6 text-center text-xs text-typography-500 flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-200 border-t-transparent"></div>
                                <span>Calculando histórico e parcerias...</span>
                            </div>
                        ) : hasError ? (
                            <div className="py-6 text-center text-xs text-red-500 flex flex-col items-center gap-2">
                                <span>Erro ao carregar sugestões (servidor offline ou reiniciando).</span>
                                <Button size="sm" variant="outline" onClick={fetchSuggestions} className="text-xs flex items-center gap-1 border-surface-300">
                                    <RefreshCw className="h-3 w-3" /> Tentar Novamente
                                </Button>
                            </div>
                        ) : filteredSuggestions.length === 0 ? (
                            <div className="py-6 text-center text-xs text-typography-500">
                                Nenhum publicador encontrado ou qualificado.
                            </div>
                        ) : (
                            filteredSuggestions.map((pub) => {
                                const isSelected = pub.id === value;
                                const hasDaysThisPart = pub.daysSinceLastThisPart !== null;
                                const hasDaysAnyPart = pub.daysSinceLastAnyPart !== null;

                                return (
                                    <button
                                        key={pub.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(pub.id);
                                            setOpen(false);
                                        }}
                                        className={`flex flex-col w-full text-left p-2.5 rounded-lg transition-colors ${
                                            isSelected
                                                ? "bg-primary-100/20 border border-primary-200"
                                                : "hover:bg-surface-200 border border-transparent"
                                        } ${pub.isUnavailable ? "opacity-60 bg-red-50/50 dark:bg-red-950/20" : ""}`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-semibold text-xs text-typography-900 truncate">
                                                    {pub.nickname?.trim() || pub.fullName}
                                                </span>
                                                {pub.nickname?.trim() && pub.nickname.trim() !== pub.fullName && (
                                                    <span className="text-[10px] text-typography-400 truncate">
                                                        ({pub.fullName})
                                                    </span>
                                                )}
                                                {pub.isFamilyMatch && (
                                                    <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded font-semibold shrink-0">
                                                        Família
                                                    </span>
                                                )}
                                            </div>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary-200 shrink-0" />}
                                        </div>

                                        {/* Histórico e Status */}
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-typography-500">
                                            {hasDaysThisPart ? (
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    Última vez há {pub.daysSinceLastThisPart} dias
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                                                    <Calendar className="h-3 w-3" />
                                                    Nunca fez esta parte
                                                </span>
                                            )}

                                            {pub.isUnavailable && (
                                                <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400 font-medium" title={pub.unavailabilityReason || "Ausente"}>
                                                    <UserX className="h-3 w-3" />
                                                    {pub.unavailabilityReason || "Ausente"}
                                                </span>
                                            )}

                                            {pub.hasConflictSameWeek && (
                                                <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium" title={pub.conflictDescription || "Conflito na semana"}>
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {pub.conflictDescription}
                                                </span>
                                            )}
                                        </div>

                                        {/* Histórico Específico de Dupla (para ajudantes) */}
                                        {isAssistant && (
                                            <div className="mt-1 pt-1 border-t border-surface-300 flex items-center gap-1.5 text-[10px]">
                                                {pub.timesPairedWithStudent && pub.timesPairedWithStudent > 0 ? (
                                                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium">
                                                        <Users2 className="h-3 w-3" />
                                                        Já fez dupla {pub.timesPairedWithStudent}x (Última: {pub.lastPairedWithStudentDate ? dayjs(pub.lastPairedWithStudentDate).format("DD/MM/YYYY") : "—"}{pub.daysSinceLastPairedWithStudent !== null ? ` - há ${pub.daysSinceLastPairedWithStudent} dias` : ""})
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                                                        <Sparkles className="h-3 w-3 text-emerald-500" />
                                                        Nunca fez dupla com ela (Excelente para variar)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
