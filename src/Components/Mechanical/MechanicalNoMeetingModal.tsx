import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/Components/ui/dialog";
import { AlertCircle, CalendarX2, Check, Loader2, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";

interface MechanicalNoMeetingModalProps {
    open: boolean;
    onClose: () => void;
    weekStartDate: string;
    formattedWeek: string;
    initialEventTitle?: string | null;
    onConfirm: (weekStartDate: string, eventTitle: string | null) => Promise<void>;
    loading?: boolean;
}

const PRESET_REASONS = [
    { label: "Assembleia de Circuito", icon: "🏛️" },
    { label: "Congresso Regional", icon: "✨" },
    { label: "Visita do Superintendente", icon: "🎤" },
    { label: "Celebração da Morte de Cristo", icon: "🍷" },
    { label: "Manutenção do Salão do Reino", icon: "🔨" },
    { label: "Sem Reunião Presencial", icon: "📅" }
];

export const MechanicalNoMeetingModal: React.FC<MechanicalNoMeetingModalProps> = ({
    open,
    onClose,
    weekStartDate,
    formattedWeek,
    initialEventTitle,
    onConfirm,
    loading = false
}) => {
    const [eventTitle, setEventTitle] = useState("");

    useEffect(() => {
        if (open) {
            setEventTitle(initialEventTitle || "");
        }
    }, [open, initialEventTitle]);

    const handleSelectPreset = (label: string) => {
        setEventTitle(label);
    };

    const handleConfirm = async () => {
        await onConfirm(weekStartDate, eventTitle.trim() || null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !loading && !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
                        <div className="p-2 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl border border-amber-500/20">
                            <CalendarX2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-typography-900">
                                Semana Sem Reunião
                            </DialogTitle>
                            <span className="text-xs text-typography-500 font-medium">
                                {formattedWeek}
                            </span>
                        </div>
                    </div>
                    <DialogDescription className="text-xs text-typography-600 mt-1.5">
                        Indique o motivo ou nome do evento especial. As designações mecânicas desta semana serão desativadas.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Sugestões rápidas */}
                    <div>
                        <label className="text-[11px] font-semibold text-typography-500 uppercase tracking-wider block mb-2">
                            Motivos frequentes
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {PRESET_REASONS.map((preset) => {
                                const isSelected = eventTitle === preset.label;
                                return (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset.label)}
                                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                                            isSelected
                                                ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold shadow-xs"
                                                : "bg-surface-200/60 border-typography-200/40 text-typography-700 hover:bg-surface-200 hover:border-typography-300"
                                        }`}
                                    >
                                        <span>{preset.icon}</span>
                                        <span>{preset.label}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 ml-0.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Campo de texto customizado */}
                    <div>
                        <label
                            htmlFor="eventTitleInput"
                            className="text-xs font-semibold text-typography-700 block mb-1.5"
                        >
                            Nome do evento ou observação
                        </label>
                        <input
                            id="eventTitleInput"
                            type="text"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="Ex: Assembleia de Circuito, Congresso Regional, Manutenção..."
                            className="w-full px-3.5 py-2 text-sm border rounded-xl bg-surface-100 border-typography-300/80 text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                        />
                    </div>

                    {/* Aviso informativo */}
                    <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>
                            Nenhum irmão será escalado automaticamente nesta semana e os cartões mecânicos ficarão pausados.
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-end gap-2 pt-2 border-t border-typography-200/40">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                        className="text-xs"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 font-semibold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <CalendarX2 className="w-3.5 h-3.5" />
                                Confirmar Sem Reunião
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

