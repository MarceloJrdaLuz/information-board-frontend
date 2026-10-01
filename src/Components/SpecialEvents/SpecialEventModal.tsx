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
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
    AlertTriangle,
    CalendarCheck,
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
        cancelMechanical: boolean;
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
            cancelMechanical: true,
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
            cancelMechanical: true,
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
            cancelMechanical: false,
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
            cancelMechanical: false,
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
            cancelMechanical: false,
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
            cancelMechanical: false,
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
    const [cancelMechanical, setCancelMechanical] = useState(true);
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
            setCancelMechanical(event.cancelMechanical ?? false);
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
            setCancelMechanical(def.defaults.cancelMechanical);
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
        setCancelMechanical(preset.defaults.cancelMechanical);
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

    // Modais de confirmação
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
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

        setConfirmSaveOpen(true);
    };

    const executeSave = async () => {
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
                cancelMechanical,
                fieldServiceImpact,
                publicWitnessingImpact,
                showOnPublicBoard,
                theme: theme.trim() || null,
                location: location.trim() || null,
                notes: notes.trim() || null
            });
            toast.success(isEditing ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!");
            setConfirmSaveOpen(false);
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Erro ao salvar evento especial.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!event?.id || !onDelete) return;
        setConfirmDeleteOpen(true);
    };

    const executeDelete = async () => {
        if (!event?.id || !onDelete) return;
        setDeleting(true);
        try {
            await onDelete(event.id);
            toast.success("Evento especial excluído.");
            setConfirmDeleteOpen(false);
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Erro ao excluir evento.");
        } finally {
            setDeleting(false);
        }
    };

    const isSingleDay = startDate === endDate;
    const sDateObj = dayjs(startDate).locale("pt-br");
    const eDateObj = dayjs(endDate).locale("pt-br");
    const totalDays = startDate && endDate ? eDateObj.diff(sDateObj, "day") + 1 : 1;

    const deleteStartDate = startDate || event?.startDate;
    const deleteEndDate = endDate || event?.endDate;
    const isDeleteSingleDay = !deleteEndDate || deleteStartDate === deleteEndDate;
    const sDelObj = dayjs(deleteStartDate).locale("pt-br");
    const eDelObj = dayjs(deleteEndDate).locale("pt-br");

    const fieldServiceImpactInfo = (() => {
        switch (fieldServiceImpact) {
            case EventImpactScope.EVENT_DAYS_ONLY:
                return { label: "Suspensa (dias do evento)", color: "font-bold text-amber-600 dark:text-amber-400" };
            case EventImpactScope.ALL_DAYS:
                return { label: "Suspensa (semana toda)", color: "font-bold text-red-500" };
            case EventImpactScope.NONE:
            default:
                return { label: "Mantida", color: "font-semibold text-emerald-600" };
        }
    })();

    const publicWitnessingImpactInfo = (() => {
        switch (publicWitnessingImpact) {
            case EventImpactScope.EVENT_DAYS_ONLY:
                return { label: "Suspenso (dias do evento)", color: "font-bold text-amber-600 dark:text-amber-400" };
            case EventImpactScope.ALL_DAYS:
                return { label: "Suspenso (semana toda)", color: "font-bold text-red-500" };
            case EventImpactScope.NONE:
            default:
                return { label: "Mantido", color: "font-semibold text-emerald-600" };
        }
    })();

    return (
        <>
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-3xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[92vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-6 overflow-hidden">
                <DialogHeader className="shrink-0 pb-3 border-b border-surface-300">
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

                            {/* Partes Mecânicas (Indicadores e Som) */}
                            <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                                cancelMechanical ? "bg-amber-500/10 border-amber-500/30" : "bg-surface-100 border-surface-300"
                            }`}>
                                <div className="flex flex-col gap-0.5">
                                    <strong className="text-xs font-bold text-typography-900">
                                        Partes Mecânicas (Indicadores e Som)
                                    </strong>
                                    <span className="text-[11px] text-typography-500">
                                        {cancelMechanical
                                            ? "Escala e geração automática suspensas nesta semana/período"
                                            : "Escala mantida normalmente"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold uppercase text-typography-500">
                                        Suspender?
                                    </span>
                                    <Switch
                                        checked={cancelMechanical}
                                        onCheckedChange={setCancelMechanical}
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

                    <DialogFooter className="shrink-0 mt-2 flex sm:justify-between items-center gap-2 pt-3 border-t border-surface-300">
                        {isEditing && onDelete ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteClick}
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

        {/* Modal de Confirmação de Salvamento com Datas em Destaque */}
        <Dialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-5 rounded-2xl shadow-xl z-[70] overflow-hidden min-w-0">
                <DialogHeader className="shrink-0 flex flex-col items-center text-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-primary-200/15 text-primary-200 flex items-center justify-center shrink-0">
                        <CalendarCheck className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-typography-900 text-center break-words">
                        {isEditing ? "Confirmar Alterações do Evento" : "Confirmar Criação do Evento"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-typography-600 text-center break-words max-w-full">
                        Confira atentamente as datas e impactos antes de confirmar o salvamento.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 py-1 min-w-0">
                    {/* Título do Evento */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-200/60 border border-surface-300 min-w-0">
                        <span className="text-[11px] font-semibold text-typography-500 uppercase tracking-wide shrink-0 pt-0.5">Evento:</span>
                        <span className="text-xs sm:text-sm font-bold text-typography-900 break-words min-w-0 flex-1">{title}</span>
                    </div>

                    {/* Datas em Grande Destaque */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-primary-200/10 border-2 border-primary-200/40 flex flex-col gap-2 min-w-0">
                        <div className="flex items-center justify-between text-xs font-semibold text-primary-200 uppercase tracking-wider">
                            <span>Período Selecionado</span>
                            <span className="bg-primary-200/20 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">
                                {totalDays} {totalDays === 1 ? "dia" : "dias"}
                            </span>
                        </div>

                        {isSingleDay ? (
                            <div className="flex flex-col items-center text-center py-1 px-1 min-w-0">
                                <span className="text-sm sm:text-base font-extrabold text-typography-900 capitalize text-center break-words leading-snug">
                                    {sDateObj.format("dddd, DD [de] MMMM [de] YYYY")}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 pt-1 min-w-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
                                    <div className="flex flex-col p-2 sm:p-2.5 rounded-lg bg-surface-100 border border-primary-200/30 min-w-0">
                                        <span className="text-[10px] font-semibold text-typography-500 uppercase tracking-wider">Início</span>
                                        <span className="text-xs sm:text-sm font-bold text-typography-900 capitalize break-words">
                                            {sDateObj.format("dddd")}
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-primary-200 capitalize break-words">
                                            {sDateObj.format("DD [de] MMMM [de] YYYY")}
                                        </span>
                                    </div>
                                    <div className="flex flex-col p-2 sm:p-2.5 rounded-lg bg-surface-100 border border-primary-200/30 min-w-0">
                                        <span className="text-[10px] font-semibold text-typography-500 uppercase tracking-wider">Término</span>
                                        <span className="text-xs sm:text-sm font-bold text-typography-900 capitalize break-words">
                                            {eDateObj.format("dddd")}
                                        </span>
                                        <span className="text-xs sm:text-sm font-bold text-primary-200 capitalize break-words">
                                            {eDateObj.format("DD [de] MMMM [de] YYYY")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resumo dos Impactos */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-200/40 border border-surface-300 text-xs min-w-0">
                        <span className="font-semibold text-typography-700 text-[11px] uppercase tracking-wide">
                            Impactos Programados:
                        </span>
                        <div className="grid grid-cols-1 gap-1.5 text-[11px] text-typography-700">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="truncate">Reunião de Meio de Semana:</span>
                                <span className={`shrink-0 ${cancelMidweekMeeting ? "font-bold text-red-500" : isCircuitOverseerVisit ? "font-bold text-amber-600 dark:text-amber-400" : "font-semibold text-emerald-600"}`}>
                                    {cancelMidweekMeeting ? "Cancelada" : isCircuitOverseerVisit ? "Visita do SC" : "Mantida"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="truncate">Reunião de Fim de Semana:</span>
                                <span className={`shrink-0 ${cancelWeekendMeeting ? "font-bold text-red-500" : "font-semibold text-emerald-600"}`}>
                                    {cancelWeekendMeeting ? "Cancelada" : "Mantida"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="truncate">Limpeza do Salão:</span>
                                <span className={`shrink-0 ${cancelCleaning ? "font-bold text-amber-600 dark:text-amber-400" : "font-semibold text-emerald-600"}`}>
                                    {cancelCleaning ? "Suspensa" : "Mantida"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="truncate">Partes Mecânicas:</span>
                                <span className={`shrink-0 ${cancelMechanical ? "font-bold text-amber-600 dark:text-amber-400" : "font-semibold text-emerald-600"}`}>
                                    {cancelMechanical ? "Suspensa" : "Mantida"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="truncate">Saídas de Campo:</span>
                                <span className={`shrink-0 ${fieldServiceImpactInfo.color}`}>
                                    {fieldServiceImpactInfo.label}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="truncate">Testemunho Público:</span>
                                <span className={`shrink-0 ${publicWitnessingImpactInfo.color}`}>
                                    {publicWitnessingImpactInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 mt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full pt-2 border-t border-surface-300">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => setConfirmSaveOpen(false)}
                        className="w-full sm:w-auto text-xs text-typography-700 h-9"
                    >
                        Voltar e Corrigir
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={loading}
                        onClick={executeSave}
                        className="w-full sm:w-auto bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm h-9"
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Confirmar e Salvar</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-5 rounded-2xl shadow-xl z-[70] overflow-hidden min-w-0">
                <DialogHeader className="shrink-0 flex flex-col items-center text-center gap-2 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-typography-900 text-center break-words">
                        Excluir Evento Especial
                    </DialogTitle>
                    <DialogDescription className="text-xs text-typography-600 text-center break-words max-w-full">
                        Tem certeza que deseja excluir o evento <strong className="text-typography-900 break-words">"{title || event?.title}"</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 my-1 min-w-0">
                    {/* Data por extenso em destaque */}
                    {deleteStartDate && (
                        <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300 flex flex-col gap-1.5 text-center min-w-0">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-typography-500 uppercase tracking-wider">
                                <CalendarDays className="h-3.5 w-3.5 text-primary-200 shrink-0" />
                                <span>{isDeleteSingleDay ? "Data do Evento" : "Período do Evento"}</span>
                            </div>
                            {isDeleteSingleDay ? (
                                <span className="text-sm sm:text-base font-bold text-typography-900 capitalize break-words">
                                    {sDelObj.format("dddd, DD [de] MMMM [de] YYYY")}
                                </span>
                            ) : (
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center pt-0.5">
                                        <div className="flex flex-col p-2 rounded-lg bg-surface-100 border border-surface-300 min-w-0">
                                            <span className="text-[9px] font-semibold text-typography-500 uppercase">Início</span>
                                            <span className="text-xs font-bold text-typography-900 capitalize leading-tight break-words">
                                                {sDelObj.format("dddd")}
                                            </span>
                                            <span className="text-xs font-bold text-primary-200 capitalize break-words">
                                                {sDelObj.format("DD [de] MMMM [de] YYYY")}
                                            </span>
                                        </div>
                                        <div className="flex flex-col p-2 rounded-lg bg-surface-100 border border-surface-300 min-w-0">
                                            <span className="text-[9px] font-semibold text-typography-500 uppercase">Término</span>
                                            <span className="text-xs font-bold text-typography-900 capitalize leading-tight break-words">
                                                {eDelObj.format("dddd")}
                                            </span>
                                            <span className="text-xs font-bold text-primary-200 capitalize break-words">
                                                {eDelObj.format("DD [de] MMMM [de] YYYY")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-400 flex flex-col gap-1 min-w-0">
                        <span className="font-bold flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 shrink-0" /> Atenção
                        </span>
                        <p className="text-[11px] leading-relaxed break-words">
                            Ao excluir este evento, os cancelamentos de reuniões e programações vinculadas serão revertidos ao estado normal.
                        </p>
                    </div>
                </div>

                <div className="shrink-0 mt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full pt-2 border-t border-surface-300">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={deleting}
                        onClick={() => setConfirmDeleteOpen(false)}
                        className="w-full sm:w-auto text-xs text-typography-700 h-9"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={deleting}
                        onClick={executeDelete}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm h-9"
                    >
                        {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Sim, Excluir</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
};
