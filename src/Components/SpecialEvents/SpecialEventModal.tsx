import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/Components/ui/dialog";
import { Switch } from "@/Components/ui/switch";
import { CreateSpecialEventDTO, EventImpactScope, ISpecialEvent, SpecialEventType } from "@/types/specialEvent";
import {
    CalendarDays,
    CalendarPlus,
    CheckCircle2,
    Globe,
    Heart,
    Loader2,
    MapPin,
    Mic,
    Radio,
    ShieldAlert,
    Sparkles,
    Trash2,
    Users
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface SpecialEventModalProps {
    open: boolean;
    onClose: () => void;
    event?: ISpecialEvent | null;
    onSave: (data: CreateSpecialEventDTO) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

interface EventTypeOption {
    type: SpecialEventType;
    title: string;
    description: string;
    icon: React.ElementType;
    colorClasses: {
        bg: string;
        text: string;
        border: string;
    };
    defaults: {
        title: string;
        affectsWholeWeek: boolean;
        cancelMidweekMeeting: boolean;
        cancelWeekendMeeting: boolean;
        isCircuitOverseerVisit: boolean;
        cancelCleaning: boolean;
        fieldServiceImpact: EventImpactScope;
        publicWitnessingImpact: EventImpactScope;
        showOnPublicBoard: boolean;
    };
}

const EVENT_PRESETS: EventTypeOption[] = [
    {
        type: SpecialEventType.CIRCUIT_ASSEMBLY,
        title: "Assembleia de Circuito",
        description: "Cancela reuniões de meio e fim de semana. Campo e testemunho suspensos nos dias do evento.",
        icon: Users,
        colorClasses: {
            bg: "bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            border: "border-blue-500/30"
        },
        defaults: {
            title: "Assembleia de Circuito",
            affectsWholeWeek: true,
            cancelMidweekMeeting: true,
            cancelWeekendMeeting: true,
            isCircuitOverseerVisit: false,
            cancelCleaning: false,
            fieldServiceImpact: EventImpactScope.EVENT_DAYS_ONLY,
            publicWitnessingImpact: EventImpactScope.EVENT_DAYS_ONLY,
            showOnPublicBoard: true
        }
    },
    {
        type: SpecialEventType.REGIONAL_CONVENTION,
        title: "Congresso Regional",
        description: "Geralmente afeta a semana toda, cancela reuniões e suspende atividades nos dias do congresso.",
        icon: Sparkles,
        colorClasses: {
            bg: "bg-purple-500/10",
            text: "text-purple-600 dark:text-purple-400",
            border: "border-purple-500/30"
        },
        defaults: {
            title: "Congresso Regional",
            affectsWholeWeek: true,
            cancelMidweekMeeting: true,
            cancelWeekendMeeting: true,
            isCircuitOverseerVisit: false,
            cancelCleaning: false,
            fieldServiceImpact: EventImpactScope.EVENT_DAYS_ONLY,
            publicWitnessingImpact: EventImpactScope.EVENT_DAYS_ONLY,
            showOnPublicBoard: true
        }
    },
    {
        type: SpecialEventType.MEMORIAL,
        title: "Celebração da Morte de Cristo",
        description: "Data pontual solene. Cancela a reunião regular de meio de semana.",
        icon: Heart,
        colorClasses: {
            bg: "bg-rose-500/10",
            text: "text-rose-600 dark:text-rose-400",
            border: "border-rose-500/30"
        },
        defaults: {
            title: "Celebração da Morte de Cristo",
            affectsWholeWeek: false,
            cancelMidweekMeeting: true,
            cancelWeekendMeeting: false,
            isCircuitOverseerVisit: false,
            cancelCleaning: false,
            fieldServiceImpact: EventImpactScope.EVENT_DAYS_ONLY,
            publicWitnessingImpact: EventImpactScope.EVENT_DAYS_ONLY,
            showOnPublicBoard: true
        }
    },
    {
        type: SpecialEventType.CIRCUIT_OVERSEER_VISIT,
        title: "Visita do Superintendente de Circuito",
        description: "Reuniões mantidas com discurso de serviço. Campo ativo com o superintendente.",
        icon: Mic,
        colorClasses: {
            bg: "bg-amber-500/10",
            text: "text-amber-600 dark:text-amber-400",
            border: "border-amber-500/30"
        },
        defaults: {
            title: "Visita do Superintendente de Circuito",
            affectsWholeWeek: true,
            cancelMidweekMeeting: false,
            cancelWeekendMeeting: false,
            isCircuitOverseerVisit: true,
            cancelCleaning: false,
            fieldServiceImpact: EventImpactScope.NONE,
            publicWitnessingImpact: EventImpactScope.NONE,
            showOnPublicBoard: true
        }
    },
    {
        type: SpecialEventType.SPECIAL_TALK,
        title: "Discurso Especial",
        description: "Discurso temático comemorativo do fim de semana.",
        icon: Radio,
        colorClasses: {
            bg: "bg-cyan-500/10",
            text: "text-cyan-600 dark:text-cyan-400",
            border: "border-cyan-500/30"
        },
        defaults: {
            title: "Discurso Especial",
            affectsWholeWeek: false,
            cancelMidweekMeeting: false,
            cancelWeekendMeeting: false,
            isCircuitOverseerVisit: false,
            cancelCleaning: false,
            fieldServiceImpact: EventImpactScope.NONE,
            publicWitnessingImpact: EventImpactScope.NONE,
            showOnPublicBoard: true
        }
    },
    {
        type: SpecialEventType.CUSTOM,
        title: "Outro Evento Local",
        description: "Configure conforme a necessidade específica da sua congregação.",
        icon: CalendarPlus,
        colorClasses: {
            bg: "bg-slate-500/10",
            text: "text-slate-600 dark:text-slate-400",
            border: "border-slate-500/30"
        },
        defaults: {
            title: "Evento Especial",
            affectsWholeWeek: false,
            cancelMidweekMeeting: false,
            cancelWeekendMeeting: false,
            isCircuitOverseerVisit: false,
            cancelCleaning: false,
            fieldServiceImpact: EventImpactScope.NONE,
            publicWitnessingImpact: EventImpactScope.NONE,
            showOnPublicBoard: true
        }
    }
];

export const SpecialEventModal: React.FC<SpecialEventModalProps> = ({
    open,
    onClose,
    event,
    onSave,
    onDelete
}) => {
    const isEditing = Boolean(event?.id);

    const [type, setType] = useState<SpecialEventType>(SpecialEventType.CIRCUIT_ASSEMBLY);
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [affectsWholeWeek, setAffectsWholeWeek] = useState(true);

    // Impact toggles
    const [cancelMidweekMeeting, setCancelMidweekMeeting] = useState(true);
    const [cancelWeekendMeeting, setCancelWeekendMeeting] = useState(true);
    const [isCircuitOverseerVisit, setIsCircuitOverseerVisit] = useState(false);
    const [cancelCleaning, setCancelCleaning] = useState(false);
    const [fieldServiceImpact, setFieldServiceImpact] = useState<EventImpactScope>(EventImpactScope.EVENT_DAYS_ONLY);
    const [publicWitnessingImpact, setPublicWitnessingImpact] = useState<EventImpactScope>(EventImpactScope.EVENT_DAYS_ONLY);
    const [showOnPublicBoard, setShowOnPublicBoard] = useState(true);

    // Metadata
    const [theme, setTheme] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (event) {
            setType(event.type || SpecialEventType.CUSTOM);
            setTitle(event.title || "");
            setStartDate(event.startDate || "");
            setEndDate(event.endDate || "");
            setAffectsWholeWeek(event.affectsWholeWeek ?? true);
            setCancelMidweekMeeting(event.cancelMidweekMeeting ?? false);
            setCancelWeekendMeeting(event.cancelWeekendMeeting ?? false);
            setIsCircuitOverseerVisit(event.isCircuitOverseerVisit ?? false);
            setCancelCleaning(event.cancelCleaning ?? false);
            setFieldServiceImpact(event.fieldServiceImpact || EventImpactScope.NONE);
            setPublicWitnessingImpact(event.publicWitnessingImpact || EventImpactScope.NONE);
            setShowOnPublicBoard(event.showOnPublicBoard ?? true);
            setTheme(event.theme || "");
            setLocation(event.location || "");
            setNotes(event.notes || "");
        } else {
            // Apply Circuit Assembly default on new creation
            const def = EVENT_PRESETS[0];
            setType(def.type);
            setTitle(def.defaults.title);
            setStartDate("");
            setEndDate("");
            setAffectsWholeWeek(def.defaults.affectsWholeWeek);
            setCancelMidweekMeeting(def.defaults.cancelMidweekMeeting);
            setCancelWeekendMeeting(def.defaults.cancelWeekendMeeting);
            setIsCircuitOverseerVisit(def.defaults.isCircuitOverseerVisit);
            setCancelCleaning(def.defaults.cancelCleaning);
            setFieldServiceImpact(def.defaults.fieldServiceImpact);
            setPublicWitnessingImpact(def.defaults.publicWitnessingImpact);
            setShowOnPublicBoard(def.defaults.showOnPublicBoard);
            setTheme("");
            setLocation("");
            setNotes("");
        }
    }, [event, open]);

    const handleSelectPreset = (preset: EventTypeOption) => {
        setType(preset.type);
        // Only update title if creating new or if previous title matched another preset's default
        const isPrevDefault = EVENT_PRESETS.some(p => p.defaults.title === title) || !title;
        if (isPrevDefault) {
            setTitle(preset.defaults.title);
        }
        setAffectsWholeWeek(preset.defaults.affectsWholeWeek);
        setCancelMidweekMeeting(preset.defaults.cancelMidweekMeeting);
        setCancelWeekendMeeting(preset.defaults.cancelWeekendMeeting);
        setIsCircuitOverseerVisit(preset.defaults.isCircuitOverseerVisit);
        setCancelCleaning(preset.defaults.cancelCleaning);
        setFieldServiceImpact(preset.defaults.fieldServiceImpact);
        setPublicWitnessingImpact(preset.defaults.publicWitnessingImpact);
        setShowOnPublicBoard(preset.defaults.showOnPublicBoard);
    };

    const handleStartDateChange = (val: string) => {
        setStartDate(val);
        // If endDate is empty or earlier than startDate, synchronize it
        if (!endDate || endDate < val) {
            setEndDate(val);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.warn("Por favor, preencha o título do evento.");
            return;
        }

        if (!startDate || !endDate) {
            toast.warn("Informe as datas de início e término.");
            return;
        }

        if (endDate < startDate) {
            toast.warn("A data de término não pode ser anterior à data de início.");
            return;
        }

        setLoading(true);
        try {
            await onSave({
                type,
                title: title.trim(),
                startDate,
                endDate,
                affectsWholeWeek,
                cancelMidweekMeeting,
                cancelWeekendMeeting,
                isCircuitOverseerVisit,
                cancelCleaning,
                fieldServiceImpact,
                publicWitnessingImpact,
                showOnPublicBoard,
                theme: theme.trim() || null,
                location: location.trim() || null,
                notes: notes.trim() || null
            });
            toast.success(isEditing ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!");
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Erro ao salvar evento especial.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!event?.id || !onDelete) return;
        if (!confirm("Tem certeza que deseja excluir este evento especial? As programações associadas voltarão ao estado normal.")) {
            return;
        }

        setDeleting(true);
        try {
            await onDelete(event.id);
            toast.success("Evento especial excluído.");
            onClose();
        } catch (error: any) {
            toast.error("Erro ao excluir evento.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-3xl w-[95vw] max-h-[92vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-6 overflow-hidden">
                <DialogHeader className="pb-3 border-b border-surface-300">
                    <DialogTitle className="text-base sm:text-lg font-bold text-typography-900 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary-200" />
                        {isEditing ? "Editar Evento Especial" : "Cadastrar Novo Evento Especial"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-typography-500">
                        Crie o evento uma única vez e configure a matriz de impactos para que reuniões, saídas de campo, limpeza e mural público se adaptem automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-5 py-2 pr-1">
                    {/* 1. Escolha do Tipo / Preset */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                            1. Tipo de Evento (Pré-configuração):
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {EVENT_PRESETS.map((preset) => {
                                const isSelected = type === preset.type;
                                const Icon = preset.icon;

                                return (
                                    <button
                                        key={preset.type}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset)}
                                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                                            isSelected
                                                ? "bg-primary-100/15 border-primary-200 ring-2 ring-primary-200/40 shadow-xs"
                                                : "bg-surface-100 border-surface-300 hover:bg-surface-200/70"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <div className={`p-1.5 rounded-lg ${preset.colorClasses.bg} ${preset.colorClasses.text}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="h-4 w-4 text-primary-200" />
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-typography-900 leading-tight">
                                            {preset.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Informações Gerais */}
                    <div className="flex flex-col gap-3 p-3.5 bg-surface-200/50 rounded-xl border border-surface-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2 flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800">
                                    Título do Evento *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Assembleia de Circuito, Visita do SC, etc."
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200 font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800">
                                    Data de Início *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800">
                                    Data de Término *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800 flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    Tema do Evento (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="Ex: 'Declarai as Boas Novas!'"
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-800 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                                    Local / Cidade (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ex: Salão de Assembleias de Cesário Lange"
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-surface-300/70">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-typography-800">
                                    Considerar a semana toda como semana do evento?
                                </span>
                                <span className="text-[11px] text-typography-500">
                                    Recomendado para Assembleias e Congressos (segunda a domingo).
                                </span>
                            </div>
                            <Switch
                                checked={affectsWholeWeek}
                                onCheckedChange={setAffectsWholeWeek}
                            />
                        </div>
                    </div>

                    {/* 3. Matriz de Impacto Automatizada */}
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-typography-800 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert className="h-4 w-4 text-primary-200" />
                                2. Matriz de Impactos na Congregação:
                            </label>
                            <span className="text-[11px] text-typography-400">
                                Ajuste qualquer opção livremente
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {/* Reunião Meio de Semana */}
                            <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                                cancelMidweekMeeting ? "bg-red-500/10 border-red-500/30" : "bg-surface-100 border-surface-300"
                            }`}>
                                <div className="flex flex-col gap-0.5">
                                    <strong className="text-xs font-bold text-typography-900">
                                        Reunião Meio de Semana
                                    </strong>
                                    <span className="text-[11px] text-typography-500">
                                        {cancelMidweekMeeting
                                            ? "Reunião regular cancelada (limpa participantes)"
                                            : isCircuitOverseerVisit
                                            ? "Visita do SC (mantém tesouros e substitui estudo de livro)"
                                            : "Reunião regular mantida normalmente"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold uppercase text-typography-500">
                                        Cancelar?
                                    </span>
                                    <Switch
                                        checked={cancelMidweekMeeting}
                                        onCheckedChange={setCancelMidweekMeeting}
                                    />
                                </div>
                            </div>

                            {/* Reunião Fim de Semana */}
                            <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                                cancelWeekendMeeting ? "bg-red-500/10 border-red-500/30" : "bg-surface-100 border-surface-300"
                            }`}>
                                <div className="flex flex-col gap-0.5">
                                    <strong className="text-xs font-bold text-typography-900">
                                        Reunião Fim de Semana
                                    </strong>
                                    <span className="text-[11px] text-typography-500">
                                        {cancelWeekendMeeting
                                            ? "Reunião de fim de semana cancelada nesta data"
                                            : "Reunião de fim de semana mantida normalmente"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold uppercase text-typography-500">
                                        Cancelar?
                                    </span>
                                    <Switch
                                        checked={cancelWeekendMeeting}
                                        onCheckedChange={setCancelWeekendMeeting}
                                    />
                                </div>
                            </div>

                            {/* Limpeza do Salão */}
                            <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                                cancelCleaning ? "bg-amber-500/10 border-amber-500/30" : "bg-surface-100 border-surface-300"
                            }`}>
                                <div className="flex flex-col gap-0.5">
                                    <strong className="text-xs font-bold text-typography-900">
                                        Limpeza do Salão do Reino
                                    </strong>
                                    <span className="text-[11px] text-typography-500">
                                        {cancelCleaning
                                            ? "Escala de limpeza suspensa nesta semana/período"
                                            : "Escala de limpeza mantida normalmente"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold uppercase text-typography-500">
                                        Suspender?
                                    </span>
                                    <Switch
                                        checked={cancelCleaning}
                                        onCheckedChange={setCancelCleaning}
                                    />
                                </div>
                            </div>

                            {/* Exibir no Mural Público */}
                            <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                                showOnPublicBoard ? "bg-primary-100/15 border-primary-200/40" : "bg-surface-100 border-surface-300"
                            }`}>
                                <div className="flex flex-col gap-0.5">
                                    <strong className="text-xs font-bold text-typography-900 flex items-center gap-1.5">
                                        <Globe className="h-3.5 w-3.5 text-primary-200" />
                                        Mural Público
                                    </strong>
                                    <span className="text-[11px] text-typography-500">
                                        {showOnPublicBoard
                                            ? "Exibir na página pública e no quadro de anúncios"
                                            : "Apenas para organização interna"}
                                    </span>
                                </div>
                                <Switch
                                    checked={showOnPublicBoard}
                                    onCheckedChange={setShowOnPublicBoard}
                                />
                            </div>

                            {/* Impacto no Serviço de Campo */}
                            <div className="p-3 rounded-xl border border-surface-300 bg-surface-100 flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <strong className="text-xs font-bold text-typography-900">
                                        Saídas para o Campo
                                    </strong>
                                    <span className="text-[11px] text-typography-500">
                                        Como o evento afeta os arranjos de pregação:
                                    </span>
                                </div>
                                <select
                                    value={fieldServiceImpact}
                                    onChange={(e) => setFieldServiceImpact(e.target.value as EventImpactScope)}
                                    className="px-2.5 py-1.5 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200 cursor-pointer"
                                >
                                    <option value={EventImpactScope.NONE}>Normal (Não altera saídas de campo)</option>
                                    <option value={EventImpactScope.EVENT_DAYS_ONLY}>Suspender apenas nos dias do evento</option>
                                    <option value={EventImpactScope.ALL_DAYS}>Suspender toda a semana do evento</option>
                                </select>
                            </div>

                            {/* Impacto no Testemunho Público */}
                            <div className="p-3 rounded-xl border border-surface-300 bg-surface-100 flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <strong className="text-xs font-bold text-typography-900">
                                        Testemunho Público (Carrinho)
                                    </strong>
                                    <span className="text-[11px] text-typography-500">
                                        Como o evento afeta os pontos de carrinho:
                                    </span>
                                </div>
                                <select
                                    value={publicWitnessingImpact}
                                    onChange={(e) => setPublicWitnessingImpact(e.target.value as EventImpactScope)}
                                    className="px-2.5 py-1.5 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200 cursor-pointer"
                                >
                                    <option value={EventImpactScope.NONE}>Normal (Não altera testemunho público)</option>
                                    <option value={EventImpactScope.EVENT_DAYS_ONLY}>Suspender apenas nos dias do evento</option>
                                    <option value={EventImpactScope.ALL_DAYS}>Suspender toda a semana do evento</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Observações */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-typography-800">
                            Observações Gerais (opcional)
                        </label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Informações adicionais para os publicadores ou anciãos..."
                            className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-surface-100 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200 resize-none"
                        />
                    </div>

                    <DialogFooter className="mt-2 flex sm:justify-between items-center gap-2 pt-3 border-t border-surface-300">
                        {isEditing && onDelete ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleting || loading}
                                className="text-xs text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
                            >
                                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                <span>Excluir Evento</span>
                            </Button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={loading || deleting}
                                className="text-xs text-typography-700 hover:bg-surface-200"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={loading || deleting}
                                className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm px-4 py-2"
                            >
                                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                <span>{isEditing ? "Salvar Alterações" : "Criar Evento"}</span>
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
