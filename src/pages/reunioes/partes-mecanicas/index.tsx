import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { MechanicalAutoAssignModal } from "@/Components/Mechanical/MechanicalAutoAssignModal";
import { MechanicalConfigModal } from "@/Components/Mechanical/MechanicalConfigModal";
import { MechanicalPdfExportModal } from "@/Components/Mechanical/MechanicalPdfExportModal";
import { MechanicalQualificationsModal } from "@/Components/Mechanical/MechanicalQualificationsModal";
import { MechanicalSlotSelector } from "@/Components/Mechanical/MechanicalSlotSelector";
import { Button } from "@/Components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
    IMechanicalAssignment,
    IMechanicalConfig,
    IMechanicalMonthResponse,
    MechanicalRole
} from "@/types/mechanical";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useAtom } from "jotai";
import {
    Calendar,
    CalendarCheck2,
    CalendarX2,
    ChevronLeft,
    ChevronRight,
    FileDown,
    Landmark,
    Loader2,
    Mic,
    Radio,
    Settings2,
    UserCheck,
    Users,
    Volume2,
    Wand2
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

dayjs.locale("pt-br");

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function MechanicalSchedulePage() {
    const { user } = useAuthContext();
    const congregationId = user?.congregation?.id;
    const congregationName = user?.congregation?.name;

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const now = new Date();
    const [year, setYear] = useState<number>(now.getFullYear());
    const [month, setMonth] = useState<number>(now.getMonth() + 1);

    const [data, setData] = useState<IMechanicalMonthResponse | null>(null);
    const [config, setConfig] = useState<IMechanicalConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [autoAssigning, setAutoAssigning] = useState(false);

    // Modais
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isQualModalOpen, setIsQualModalOpen] = useState(false);
    const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
    const [isExportPdfModalOpen, setIsExportPdfModalOpen] = useState(false);

    useEffect(() => {
        setPageActive("Partes Mecânicas");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Reuniões", link: "/reunioes/partes-mecanicas" }
        ]);
    }, [setPageActive, setCrumbs]);

    const fetchData = async () => {
        if (!congregationId) return;
        setLoading(true);
        try {
            const [schedulesRes, configRes] = await Promise.all([
                api.get(`/congregations/${congregationId}/mechanical-schedules`, {
                    params: { year, month }
                }),
                api.get(`/congregations/${congregationId}/mechanical-config`)
            ]);
            setData(schedulesRes.data);
            setConfig(configRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados mecânicos:", error);
            toast.error("Erro ao carregar programação de partes mecânicas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [congregationId, year, month]);

    const handlePreviousMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(prev => prev - 1);
        } else {
            setMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(prev => prev + 1);
        } else {
            setMonth(prev => prev + 1);
        }
    };

    const handleCurrentMonth = () => {
        const currentDate = new Date();
        setYear(currentDate.getFullYear());
        setMonth(currentDate.getMonth() + 1);
    };

    const handleSaveConfig = async (newConfigData: Partial<IMechanicalConfig>) => {
        if (!congregationId) return;
        setSavingConfig(true);
        try {
            const res = await api.put(
                `/congregations/${congregationId}/mechanical-config`,
                newConfigData
            );
            setConfig(res.data);
            toast.success("Configuração salva com sucesso!");
            // Recarrega dados
            fetchData();
        } catch (error) {
            console.error("Erro ao salvar configuração:", error);
            toast.error("Erro ao salvar configuração.");
        } finally {
            setSavingConfig(false);
        }
    };

    const handleAutoAssign = async (options: { forceReassignManual: boolean }) => {
        if (!congregationId) return;
        setAutoAssigning(true);
        try {
            await api.post(`/congregations/${congregationId}/mechanical-schedules/generate`, {
                year,
                month,
                forceReassignManual: options.forceReassignManual
            });
            toast.success("Programação gerada com sucesso!");
            fetchData();
        } catch (error) {
            console.error("Erro no auto-preenchimento:", error);
            toast.error("Erro ao gerar programação automática.");
        } finally {
            setAutoAssigning(false);
        }
    };

    const handleToggleWeekMeeting = async (weekStartDate: string, hasNoMeeting: boolean) => {
        if (!congregationId) return;

        let eventTitle: string | null = null;
        if (hasNoMeeting) {
            const reason = window.prompt(
                "Informe o motivo ou nome do evento para esta semana (ex: Assembleia, Congresso, Manutenção, etc.):"
            );
            if (reason === null) return;
            eventTitle = reason.trim() || null;
        }

        try {
            await api.post(`/congregations/${congregationId}/mechanical-schedules/toggle-week`, {
                weekStartDate,
                hasNoMeeting,
                eventTitle
            });
            toast.success(
                hasNoMeeting
                    ? "Semana marcada como sem reunião/partes mecânicas."
                    : "Designações ativadas para esta semana!"
            );
            fetchData();
        } catch (error) {
            console.error("Erro ao alternar status da semana:", error);
            toast.error("Erro ao alterar status da semana.");
        }
    };

    const handleAssignmentUpdated = (updatedAssignment: IMechanicalAssignment) => {
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                weeks: prev.weeks.map(w => ({
                    ...w,
                    schedules: w.schedules.map(s => ({
                        ...s,
                        assignments: s.assignments.map(a =>
                            a.id === updatedAssignment.id ? updatedAssignment : a
                        )
                    }))
                }))
            };
        });
    };

    const monthFormatted = useMemo(() => {
        return `${MONTH_NAMES[month - 1]} de ${year}`;
    }, [month, year]);

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-4 w-full p-4 md:p-6 max-w-7xl mx-auto">
                <BreadCrumbs crumbs={crumbs} pageActive="Partes Mecânicas" />

                {/* Top Header Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 md:p-5 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-primary-200">
                                <Radio className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-typography-900">
                                    Partes Mecânicas da Reunião
                                </h1>
                                <p className="text-xs text-typography-500">
                                    Indicadores, Som, Mídias, Microfones Volantes e Pedestal organizados por semana.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Botão Configurações */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsConfigModalOpen(true)}
                            className="gap-1.5 text-xs text-typography-700 hover:text-primary-200"
                        >
                            <Settings2 className="h-3.5 w-3.5" />
                            Configurações
                        </Button>

                        {/* Botão Qualificações */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsQualModalOpen(true)}
                            className="gap-1.5 text-xs text-typography-700 hover:text-primary-200"
                        >
                            <UserCheck className="h-3.5 w-3.5" />
                            Irmãos Habilitados
                        </Button>

                        {/* Botão Auto-Preenchimento */}
                        <Button
                            type="button"
                            onClick={() => setIsAutoAssignModalOpen(true)}
                            disabled={loading || autoAssigning}
                            className="bg-primary-200 text-white hover:bg-primary-300 gap-1.5 text-xs font-semibold shadow-sm"
                        >
                            {autoAssigning ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Wand2 className="h-3.5 w-3.5" />
                            )}
                            Auto-Preencher
                        </Button>

                        {/* Exportar PDF */}
                        {data && data.weeks.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsExportPdfModalOpen(true)}
                                className="gap-1.5 text-xs text-typography-700 hover:text-primary-200"
                            >
                                <FileDown className="h-3.5 w-3.5" />
                                Exportar PDF
                            </Button>
                        )}
                    </div>
                </div>

                {/* Navegação de Mês */}
                <div className="flex items-center justify-between bg-surface-100 rounded-xl p-2 border border-typography-200/50">
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousMonth}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleNextMonth}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCurrentMonth}
                            className="text-xs text-typography-600 h-8"
                        >
                            Mês Atual
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 font-bold text-base text-typography-900 pr-2">
                        <Calendar className="h-4 w-4 text-primary-200" />
                        <span>{monthFormatted}</span>
                    </div>
                </div>

                {/* Lista Semanal */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-typography-400 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-200" />
                        <span className="text-sm font-medium">Carregando programação mecânica...</span>
                    </div>
                ) : !data || data.weeks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-surface-100 rounded-2xl border border-surface-300 text-center p-6">
                        <Radio className="h-10 w-10 text-typography-300 mb-3" />
                        <h3 className="text-base font-bold text-typography-800">
                            Nenhuma programação encontrada para este mês
                        </h3>
                        <p className="text-xs text-typography-500 max-w-md mt-1 mb-4">
                            Clique em <strong>Auto-Preencher</strong> para gerar a escala automaticamente respeitando o histórico e rodízio justo dos irmãos.
                        </p>
                        <Button
                            type="button"
                            onClick={() => setIsAutoAssignModalOpen(true)}
                            className="bg-primary-200 text-white hover:bg-primary-300 gap-2 text-xs"
                        >
                            <Wand2 className="h-4 w-4" />
                            Preencher Agora
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {data.weeks.map((week, weekIdx) => {
                            const midweekSched = week.schedules.find(s => s.meetingType === "MIDWEEK");
                            const weekendSched = week.schedules.find(s => s.meetingType === "WEEKEND");

                            return (
                                <div
                                    key={week.weekStartDate}
                                    className="bg-surface-100 border border-surface-300 rounded-2xl overflow-hidden shadow-xs"
                                >
                                    {/* Cabeçalho da Semana */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-surface-200/70 border-b border-typography-200/60">
                                        <div className="flex items-center gap-2 font-bold text-sm text-typography-900">
                                            <span className={`w-2 h-2 rounded-full ${week.hasNoMeeting ? "bg-amber-500" : "bg-primary-200"}`} />
                                            <span>{week.formattedWeek}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {week.hasNoMeeting ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleWeekMeeting(week.weekStartDate, false)}
                                                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 h-7 font-medium"
                                                >
                                                    <CalendarCheck2 className="w-3.5 h-3.5" />
                                                    <span>Ativar Semana</span>
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleWeekMeeting(week.weekStartDate, true)}
                                                    className="text-xs text-typography-400 hover:text-red-600 hover:bg-red-50 gap-1 h-7"
                                                    title="Marcar semana como sem reunião / remover partes mecânicas"
                                                >
                                                    <CalendarX2 className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Sem Reunião</span>
                                                </Button>
                                            )}
                                            <span className="text-[11px] font-semibold text-typography-500 uppercase tracking-wider pl-1.5 border-l border-typography-300/40">
                                                Semana {weekIdx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Se a semana não tiver reuniões no Salão (Evento Especial, Assembleia, ou desativada manualmente) */}
                                    {week.hasNoMeeting ? (
                                        <div className="p-8 flex flex-col items-center justify-center text-center bg-surface-100/40 rounded-b-2xl space-y-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                                                <Landmark className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1 max-w-md">
                                                <h4 className="text-sm font-bold text-typography-900">
                                                    🏛️ {week.eventTitle || "Evento Especial — Não haverá reunião no Salão do Reino"}
                                                </h4>
                                                <p className="text-xs text-typography-500">
                                                    As partes mecânicas estão desativadas para esta semana. Nenhum irmão foi ou será designado automaticamente.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleWeekMeeting(week.weekStartDate, false)}
                                                className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 mt-2"
                                            >
                                                Ativar Designações nesta Semana
                                            </Button>
                                        </div>
                                    ) : config?.sameTeamWholeWeek ? (
                                        /* Se configurado para o mesmo grupo na semana toda, exibe cartão unificado */
                                        <div className="p-4 sm:p-5 flex flex-col">
                                            {midweekSched || weekendSched ? (
                                                <WholeWeekDutiesCard
                                                    midweekSchedule={midweekSched}
                                                    weekendSchedule={weekendSched}
                                                    congregationId={congregationId!}
                                                    combineSoundAndMedia={config?.combineSoundAndMedia ?? false}
                                                    onAssignmentUpdated={handleAssignmentUpdated}
                                                    onRefresh={fetchData}
                                                />
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center py-8 text-xs text-typography-400">
                                                    Nenhuma reunião cadastrada nesta semana
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Grid com Meio de Semana e Fim de Semana separados */
                                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-typography-200/60">
                                            {/* Reunião de Meio de Semana */}
                                            <div className="p-4 sm:p-5 flex flex-col">
                                                {midweekSched ? (
                                                    <MeetingDutiesCard
                                                        schedule={midweekSched}
                                                        congregationId={congregationId!}
                                                        combineSoundAndMedia={config?.combineSoundAndMedia ?? false}
                                                        onAssignmentUpdated={handleAssignmentUpdated}
                                                    />
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center py-8 text-xs text-typography-400">
                                                        Sem reunião de meio de semana cadastrada
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reunião de Fim de Semana */}
                                            <div className="p-4 sm:p-5 flex flex-col">
                                                {weekendSched ? (
                                                    <MeetingDutiesCard
                                                        schedule={weekendSched}
                                                        congregationId={congregationId!}
                                                        combineSoundAndMedia={config?.combineSoundAndMedia ?? false}
                                                        onAssignmentUpdated={handleAssignmentUpdated}
                                                    />
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center py-8 text-xs text-typography-400">
                                                        Sem reunião de fim de semana cadastrada
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modais */}
            <MechanicalConfigModal
                open={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                config={config}
                onSave={handleSaveConfig}
                loading={savingConfig}
            />

            <MechanicalQualificationsModal
                open={isQualModalOpen}
                onClose={() => setIsQualModalOpen(false)}
                congregationId={congregationId || ""}
            />

            <MechanicalAutoAssignModal
                open={isAutoAssignModalOpen}
                onClose={() => setIsAutoAssignModalOpen(false)}
                onConfirm={handleAutoAssign}
                loading={autoAssigning}
                monthFormatted={monthFormatted}
            />

            <MechanicalPdfExportModal
                open={isExportPdfModalOpen}
                onClose={() => setIsExportPdfModalOpen(false)}
                congregationId={congregationId || ""}
                congregationName={congregationName}
                initialYear={year}
                initialMonth={month}
                config={config}
            />
        </ContentDashboard>
    );
}

interface WholeWeekDutiesCardProps {
    midweekSchedule: any;
    weekendSchedule: any;
    congregationId: string;
    combineSoundAndMedia: boolean;
    onAssignmentUpdated: (assignment: IMechanicalAssignment) => void;
    onRefresh: () => void;
}

const WholeWeekDutiesCard: React.FC<WholeWeekDutiesCardProps> = ({
    midweekSchedule,
    weekendSchedule,
    congregationId,
    combineSoundAndMedia,
    onAssignmentUpdated,
    onRefresh
}) => {
    const activeSchedule = midweekSchedule || weekendSchedule;
    if (!activeSchedule) return null;

    const midweekDateFormatted = midweekSchedule ? dayjs(midweekSchedule.date).format("dddd, DD [de] MMMM") : null;
    const weekendDateFormatted = weekendSchedule ? dayjs(weekendSchedule.date).format("dddd, DD [de] MMMM") : null;

    const attendants = activeSchedule.assignments.filter((a: any) => a.role === MechanicalRole.ATTENDANT);
    const soundAndMedia = activeSchedule.assignments.filter((a: any) => a.role === MechanicalRole.SOUND_AND_MEDIA);
    const sound = activeSchedule.assignments.filter((a: any) => a.role === MechanicalRole.SOUND);
    const media = activeSchedule.assignments.filter((a: any) => a.role === MechanicalRole.MEDIA);
    const rovingMics = activeSchedule.assignments.filter((a: any) => a.role === MechanicalRole.ROVING_MIC);
    const stageMics = activeSchedule.assignments.filter((a: any) => a.role === MechanicalRole.STAGE_MIC);

    const handleSlotUpdated = (assign: IMechanicalAssignment) => {
        onAssignmentUpdated(assign);
        onRefresh();
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header da Semana Toda */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-typography-200/50">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-200" />
                    <div>
                        <h4 className="font-bold text-sm text-typography-900 capitalize">
                            {midweekDateFormatted} {weekendDateFormatted ? `• ${weekendDateFormatted}` : ""}
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Escala Única da Semana (Válida para Meio de Semana e Fim de Semana)
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid de Funções */}
            <div className="space-y-3.5">
                {/* Indicadores */}
                {attendants.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Users className="h-3.5 w-3.5 text-primary-200" />
                            <span>Indicador(es) ({attendants.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {attendants.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Indicador {idx + 1}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={activeSchedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={handleSlotUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Som & Mídias */}
                {(soundAndMedia.length > 0 || sound.length > 0 || media.length > 0) && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Volume2 className="h-3.5 w-3.5 text-primary-200" />
                            <span>{combineSoundAndMedia ? "Som & Mídias (Unificado)" : "Áudio e Mídias"}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {soundAndMedia.map((assign: IMechanicalAssignment) => (
                                <div key={assign.id} className="sm:col-span-2">
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Operador de Som e Mídias
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={activeSchedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={handleSlotUpdated}
                                    />
                                </div>
                            ))}

                            {sound.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Som {sound.length > 1 ? idx + 1 : ""}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={activeSchedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={handleSlotUpdated}
                                    />
                                </div>
                            ))}

                            {media.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Mídias {media.length > 1 ? idx + 1 : ""}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={activeSchedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={handleSlotUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Microfones Volantes */}
                {rovingMics.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Mic className="h-3.5 w-3.5 text-primary-200" />
                            <span>Microfones Volantes ({rovingMics.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {rovingMics.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Volante {idx + 1}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={activeSchedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={handleSlotUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pedestal */}
                {stageMics.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Radio className="h-3.5 w-3.5 text-primary-200" />
                            <span>Pedestal ({stageMics.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {stageMics.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Pedestal {stageMics.length > 1 ? idx + 1 : ""}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={activeSchedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={handleSlotUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface MeetingDutiesCardProps {
    schedule: any;
    congregationId: string;
    combineSoundAndMedia: boolean;
    onAssignmentUpdated: (assignment: IMechanicalAssignment) => void;
}

const MeetingDutiesCard: React.FC<MeetingDutiesCardProps> = ({
    schedule,
    congregationId,
    combineSoundAndMedia,
    onAssignmentUpdated
}) => {
    const isMidweek = schedule.meetingType === "MIDWEEK";
    const meetingDateFormatted = dayjs(schedule.date).format("dddd, DD [de] MMMM");

    const attendants = schedule.assignments.filter((a: any) => a.role === MechanicalRole.ATTENDANT);
    const soundAndMedia = schedule.assignments.filter((a: any) => a.role === MechanicalRole.SOUND_AND_MEDIA);
    const sound = schedule.assignments.filter((a: any) => a.role === MechanicalRole.SOUND);
    const media = schedule.assignments.filter((a: any) => a.role === MechanicalRole.MEDIA);
    const rovingMics = schedule.assignments.filter((a: any) => a.role === MechanicalRole.ROVING_MIC);
    const stageMics = schedule.assignments.filter((a: any) => a.role === MechanicalRole.STAGE_MIC);

    return (
        <div className="flex flex-col gap-4">
            {/* Header da Reunião */}
            <div className="flex items-center justify-between pb-3 border-b border-typography-200/50">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            isMidweek ? "bg-amber-500" : "bg-blue-600"
                        }`}
                    />
                    <div>
                        <h4 className="font-bold text-sm text-typography-900 capitalize">
                            {meetingDateFormatted}
                        </h4>
                        <span className="text-[11px] font-medium text-typography-500 uppercase tracking-wider">
                            {isMidweek ? "Meio de Semana" : "Fim de Semana"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid de Funções */}
            <div className="space-y-3.5">
                {/* Indicadores */}
                {attendants.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Users className="h-3.5 w-3.5 text-primary-200" />
                            <span>Indicador(es) ({attendants.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {attendants.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Indicador {idx + 1}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={schedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={onAssignmentUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Som & Mídias */}
                {(soundAndMedia.length > 0 || sound.length > 0 || media.length > 0) && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Volume2 className="h-3.5 w-3.5 text-primary-200" />
                            <span>{combineSoundAndMedia ? "Som & Mídias (Unificado)" : "Áudio e Mídias"}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {soundAndMedia.map((assign: IMechanicalAssignment) => (
                                <div key={assign.id} className="sm:col-span-2">
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Operador de Som e Mídias
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={schedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={onAssignmentUpdated}
                                    />
                                </div>
                            ))}

                            {sound.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Som {sound.length > 1 ? idx + 1 : ""}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={schedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={onAssignmentUpdated}
                                    />
                                </div>
                            ))}

                            {media.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Mídias {media.length > 1 ? idx + 1 : ""}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={schedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={onAssignmentUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Microfones Volantes */}
                {rovingMics.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Mic className="h-3.5 w-3.5 text-primary-200" />
                            <span>Microfones Volantes ({rovingMics.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rovingMics.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Volante {idx + 1}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={schedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={onAssignmentUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pedestal */}
                {stageMics.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700">
                            <Radio className="h-3.5 w-3.5 text-primary-200" />
                            <span>Pedestal ({stageMics.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {stageMics.map((assign: IMechanicalAssignment, idx: number) => (
                                <div key={assign.id}>
                                    <span className="text-[10px] text-typography-400 font-medium block mb-0.5">
                                        Pedestal {stageMics.length > 1 ? idx + 1 : ""}
                                    </span>
                                    <MechanicalSlotSelector
                                        assignment={assign}
                                        scheduleId={schedule.id}
                                        congregationId={congregationId}
                                        onAssignmentUpdated={onAssignmentUpdated}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

MechanicalSchedulePage.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION"]);

export default MechanicalSchedulePage;

