import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { IMidweekSchedule, MidweekSpecialType } from "@/types/midweek";
import {
    AlertCircle,
    Calendar,
    CalendarPlus,
    CheckCircle2,
    Heart,
    Loader2,
    Mic,
    Radio,
    ShieldAlert,
    Sparkles,
    Users
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface MidweekSpecialWeekModalProps {
    open: boolean;
    onClose: () => void;
    schedule: IMidweekSchedule;
    onSave: (data: {
        isSpecial: boolean;
        specialType: MidweekSpecialType;
        specialName?: string | null;
        notes?: string | null;
    }) => Promise<void>;
}

interface EventOption {
    type: MidweekSpecialType;
    title: string;
    description: string;
    icon: React.ElementType;
    colorClasses: {
        bg: string;
        text: string;
        badge: string;
    };
    defaultName: string;
}

const EVENT_OPTIONS: EventOption[] = [
    {
        type: MidweekSpecialType.NONE,
        title: "Programação Regular",
        description: "Reunião padrão da apostila com todas as seções e partes normais.",
        icon: Calendar,
        colorClasses: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-600 dark:text-emerald-400",
            badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        },
        defaultName: ""
    },
    {
        type: MidweekSpecialType.CIRCUIT_OVERSEER_VISIT,
        title: "Visita do Superintendente de Circuito",
        description: "Tesouros e Ministério normais. Substitui o Estudo de Livro pelo Discurso de Serviço (30 min).",
        icon: Mic,
        colorClasses: {
            bg: "bg-amber-500/10",
            text: "text-amber-600 dark:text-amber-400",
            badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        },
        defaultName: "Visita do Superintendente de Circuito"
    },
    {
        type: MidweekSpecialType.CIRCUIT_ASSEMBLY,
        title: "Assembleia de Circuito",
        description: "Não haverá reunião de meio de semana na congregação nesta semana.",
        icon: Users,
        colorClasses: {
            bg: "bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
        },
        defaultName: "Assembleia de Circuito"
    },
    {
        type: MidweekSpecialType.REGIONAL_CONVENTION,
        title: "Congresso Regional",
        description: "Não haverá reunião de meio de semana na congregação nesta semana.",
        icon: Sparkles,
        colorClasses: {
            bg: "bg-purple-500/10",
            text: "text-purple-600 dark:text-purple-400",
            badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
        },
        defaultName: "Congresso Regional"
    },
    {
        type: MidweekSpecialType.MEMORIAL,
        title: "Celebração da Morte de Cristo",
        description: "Não haverá reunião de meio de semana regular devido à Celebração.",
        icon: Heart,
        colorClasses: {
            bg: "bg-rose-500/10",
            text: "text-rose-600 dark:text-rose-400",
            badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        },
        defaultName: "Celebração da Morte de Cristo"
    },
    {
        type: MidweekSpecialType.SPECIAL_TALK,
        title: "Discurso Especial",
        description: "Semana com discurso temático extraordinário ou comemorativo.",
        icon: Radio,
        colorClasses: {
            bg: "bg-cyan-500/10",
            text: "text-cyan-600 dark:text-cyan-400",
            badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300"
        },
        defaultName: "Discurso Especial"
    },
    {
        type: MidweekSpecialType.CUSTOM,
        title: "Outro Evento Personalizado",
        description: "Defina o nome e os detalhes de um evento específico.",
        icon: CalendarPlus,
        colorClasses: {
            bg: "bg-slate-500/10",
            text: "text-slate-600 dark:text-slate-400",
            badge: "bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
        },
        defaultName: "Evento Especial"
    }
];

export const MidweekSpecialWeekModal: React.FC<MidweekSpecialWeekModalProps> = ({
    open,
    onClose,
    schedule,
    onSave
}) => {
    const [isSpecial, setIsSpecial] = useState<boolean>(schedule.isSpecial || false);
    const [specialType, setSpecialType] = useState<MidweekSpecialType>(
        schedule.specialType || MidweekSpecialType.NONE
    );
    const [specialName, setSpecialName] = useState<string>(schedule.specialName || "");
    const [notes, setNotes] = useState<string>(schedule.notes || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsSpecial(schedule.isSpecial || false);
        setSpecialType(schedule.specialType || MidweekSpecialType.NONE);
        setSpecialName(schedule.specialName || "");
        setNotes(schedule.notes || "");
    }, [schedule, open]);

    const handleSelectOption = (opt: EventOption) => {
        setSpecialType(opt.type);
        if (opt.type === MidweekSpecialType.NONE) {
            setIsSpecial(false);
            setSpecialName("");
        } else {
            setIsSpecial(true);
            // Só altera o nome se estiver vazio ou se era o default de outro evento
            const isPrevDefault = EVENT_OPTIONS.some(o => o.defaultName === specialName);
            if (!specialName || isPrevDefault) {
                setSpecialName(opt.defaultName);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                isSpecial,
                specialType,
                specialName: isSpecial ? specialName.trim() || null : null,
                notes: notes.trim() || null
            });
            toast.success("Configuração de semana especial salva!");
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar semana especial.");
        } finally {
            setLoading(false);
        }
    };

    const selectedOption = EVENT_OPTIONS.find(o => o.type === specialType) || EVENT_OPTIONS[0];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-6 overflow-hidden">
                <DialogHeader className="pb-3 border-b border-surface-300">
                    <DialogTitle className="text-base sm:text-lg font-bold text-typography-900 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                        Configurar Evento ou Semana Especial
                    </DialogTitle>
                    <DialogDescription className="text-xs text-typography-500">
                        Escolha a modalidade da semana para que o sistema adapte automaticamente a programação e as designações.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-1">
                    {/* Grid de Cards de Seleção de Eventos */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                            Selecione o Tipo de Semana:
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {EVENT_OPTIONS.map((opt) => {
                                const isSelected = specialType === opt.type;
                                const Icon = opt.icon;

                                return (
                                    <button
                                        key={opt.type}
                                        type="button"
                                        onClick={() => handleSelectOption(opt)}
                                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                                            isSelected
                                                ? "bg-primary-100/15 border-primary-200 ring-2 ring-primary-200/40 shadow-sm"
                                                : "bg-surface-100 border-surface-300 hover:bg-surface-200/70 hover:border-surface-300"
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${opt.colorClasses.bg} ${opt.colorClasses.text} shrink-0 mt-0.5`}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-xs font-bold text-typography-900 leading-tight">
                                                    {opt.title}
                                                </h4>
                                            </div>
                                            <p className="text-[11px] text-typography-500 mt-1 leading-snug">
                                                {opt.description}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <CheckCircle2 className="h-4 w-4 text-primary-200 absolute top-3 right-3 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Campos adicionais quando um evento especial for ativado */}
                    {isSpecial && (
                        <div className="flex flex-col gap-3 p-3.5 bg-surface-200/70 rounded-xl border border-surface-300 mt-1">
                            {specialType !== MidweekSpecialType.CIRCUIT_OVERSEER_VISIT && (
                                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-xs shadow-xs">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                                    <div className="flex flex-col gap-0.5">
                                        <strong className="font-bold text-red-800 dark:text-red-200">Atenção aos dados salvos:</strong>
                                        <span>Ao definir esta semana como evento sem reunião ({selectedOption.title}), todas as designações de participantes e partes salvas nesta semana serão apagadas permanentemente.</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800">
                                    Título / Nome do Evento *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Visita do SC - Irmão Silva..."
                                    value={specialName}
                                    onChange={(e) => setSpecialName(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800">
                                    Observações Adicionais (opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Ex: Não haverá reunião de meio de semana no Salão do Reino..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-2 flex sm:justify-between items-center gap-2 pt-2 border-t border-surface-300">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                            className="text-xs text-typography-700 hover:bg-surface-200"
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading}
                            className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm px-4 py-2"
                        >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Salvar Configuração</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
