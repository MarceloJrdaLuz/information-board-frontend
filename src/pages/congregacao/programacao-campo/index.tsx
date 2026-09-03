import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import {
    createFieldServiceScheduleAtom,
    deleteFieldServiceScheduleAtom,
    generateFieldServiceAtom,
    updateFieldServiceScheduleAtom,
} from "@/atoms/fieldServiceAtoms";
import { GenerateFieldService } from "@/atoms/fieldServiceAtoms/types";
import BreadCrumbs from "@/Components/BreadCrumbs";
import Calendar from "@/Components/Calendar";
import ContentDashboard from "@/Components/ContentDashboard";
import { FieldServiceExceptionsCard } from "@/Components/FieldServiceExceptionCard";
import { FieldServicePdfDownload } from "@/Components/FieldServiceSchedulePdf/PdfLinkComponent";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import * as Popover from "@radix-ui/react-popover";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { formatRelativeTime } from "@/functions/buildHistoryOptions";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { api } from "@/services/api";
import {
    IFieldServiceSchedule,
    IFieldServiceTemplate,
    Weekday,
    WEEKDAY_LABEL,
} from "@/types/fieldService";
import { formatHour } from "@/utils/formatTime";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useAtom, useSetAtom } from "jotai";
import {
    AlertTriangle,
    CalendarCheck2,
    CalendarDays,
    CalendarOff,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileDown,
    Layers,
    Loader2,
    MapPin,
    Plus,
    Search,
    Sparkles,
    Trash2,
    UserCheck,
    Users,
    Wand2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

dayjs.locale("pt-br");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export interface IPublisherUnavailability {
    id: string;
    publisher_id: string;
    startDate: string;
    endDate: string;
    reason: string | null;
}

function FieldServiceSchedulePage() {
    const { congregation } = useCongregationContext();
    const congregationId = congregation?.id;

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    // Mês ativo
    const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs().startOf("month"));

    // Template selecionado
    const [selectedTemplate, setSelectedTemplate] = useState<IFieldServiceTemplate | null>(null);

    // Indisponibilidades carregadas da congregação
    const [unavailabilities, setUnavailabilities] = useState<IPublisherUnavailability[]>([]);
    const [loadingUnavailabilities, setLoadingUnavailabilities] = useState(false);

    // Modais
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isExceptionsModalOpen, setIsExceptionsModalOpen] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);

    // Estados de formulário de Geração
    const [genStartDate, setGenStartDate] = useState<string | null>(
        currentMonth.startOf("month").format("YYYY-MM-DD")
    );
    const [genEndDate, setGenEndDate] = useState<string | null>(
        currentMonth.endOf("month").format("YYYY-MM-DD")
    );
    const [genMode, setGenMode] = useState<"append" | "reconcile">("append");
    const [generating, setGenerating] = useState(false);

    // Estados de formulário de Criação Avulsa
    const [newDate, setNewDate] = useState<string | null>(
        currentMonth.format("YYYY-MM-DD")
    );
    const [newLeaderId, setNewLeaderId] = useState<string>("");
    const [creatingSchedule, setCreatingSchedule] = useState(false);

    // Átomos de ação
    const generateFieldService = useSetAtom(generateFieldServiceAtom);
    const updateSchedule = useSetAtom(updateFieldServiceScheduleAtom);
    const deleteSchedule = useSetAtom(deleteFieldServiceScheduleAtom);
    const createSchedule = useSetAtom(createFieldServiceScheduleAtom);

    // Breadcrumbs e título da página
    useEffect(() => {
        setPageActive("Programação do Campo");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Programação do Campo", link: "/congregacao/programacao-campo" },
        ]);
    }, [setPageActive, setCrumbs]);

    // Atualiza datas padrão do modal de geração ao mudar o mês
    useEffect(() => {
        setGenStartDate(currentMonth.startOf("month").format("YYYY-MM-DD"));
        setGenEndDate(currentMonth.endOf("month").format("YYYY-MM-DD"));
        setNewDate(currentMonth.format("YYYY-MM-DD"));
    }, [currentMonth]);

    /* ==============================================
     * 1. Buscar Templates de Saída de Campo
     * ============================================== */
    const { data: templatesData, isLoading: loadingTemplates } = useAuthorizedFetch<
        IFieldServiceTemplate[]
    >(
        congregationId
            ? `${API_ROUTES.FIELD_SERVICE_TEMPLATES}/congregation/${congregationId}`
            : "",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
        }
    );

    const rotationTemplates = useMemo(
        () => templatesData?.filter((t) => t.type === "ROTATION") ?? [],
        [templatesData]
    );

    // Auto-selecionar primeiro template disponível se nenhum estiver selecionado
    useEffect(() => {
        if (rotationTemplates.length > 0 && !selectedTemplate) {
            setSelectedTemplate(rotationTemplates[0]);
        }
    }, [rotationTemplates, selectedTemplate]);

    /* ==============================================
     * 2. Buscar Indisponibilidades da Congregação
     * ============================================== */
    const fetchUnavailabilities = async () => {
        if (!congregationId) return;
        setLoadingUnavailabilities(true);
        try {
            const res = await api.get(
                `/midweek/unavailabilities/congregation/${congregationId}`
            );
            setUnavailabilities(res.data || []);
        } catch (err) {
            console.error("Erro ao carregar indisponibilidades:", err);
        } finally {
            setLoadingUnavailabilities(false);
        }
    };

    useEffect(() => {
        fetchUnavailabilities();
    }, [congregationId]);

    /* ==============================================
     * 3. Buscar Agendamentos do Template Selecionado
     * ============================================== */
    const {
        data: allSchedules,
        mutate: mutateSchedules,
        isLoading: loadingSchedules,
    } = useAuthorizedFetch<IFieldServiceSchedule[]>(
        selectedTemplate
            ? `${API_ROUTES.FIELD_SERVICE_TEMPLATES}/${selectedTemplate.id}/schedules`
            : "",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
        }
    );

    // Filtrar agendamentos do mês ativo
    const currentMonthSchedules = useMemo(() => {
        if (!allSchedules) return [];
        return allSchedules
            .filter((s) => dayjs(s.date).isSame(currentMonth, "month"))
            .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1));
    }, [allSchedules, currentMonth]);

    /* ==============================================
     * 4. Navegação de Meses
     * ============================================== */
    const handlePrevMonth = () => {
        setCurrentMonth((prev) => prev.subtract(1, "month"));
    };

    const handleNextMonth = () => {
        setCurrentMonth((prev) => prev.add(1, "month"));
    };

    const handleCurrentMonth = () => {
        setCurrentMonth(dayjs().startOf("month"));
    };

    /* ==============================================
     * 5. Ação: Gerar Programação
     * ============================================== */
    const handleGenerateSchedules = async () => {
        if (!selectedTemplate || !genStartDate || !genEndDate) {
            toast.warning("Selecione a saída e o período desejado.");
            return;
        }

        setGenerating(true);
        try {
            const payload: GenerateFieldService = {
                startDate: genStartDate,
                endDate: genEndDate,
                mode: genMode,
            };

            await generateFieldService(selectedTemplate.id, payload);
            toast.success("Programação gerada com sucesso!");
            setIsGenerateModalOpen(false);
            await mutateSchedules();
        } catch (err: any) {
            console.error(err);
            toast.error(
                err?.response?.data?.message || "Erro ao gerar a programação de campo."
            );
        } finally {
            setGenerating(false);
        }
    };

    /* ==============================================
     * 6. Ação: Alterar Dirigente de um Dia
     * ============================================== */
    const handleUpdateLeader = async (scheduleId: string, leaderId: string) => {
        try {
            await updateSchedule(scheduleId, { leader_id: leaderId });
            toast.success("Dirigente atualizado com sucesso!");
            await mutateSchedules();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar o dirigente.");
        }
    };

    /* ==============================================
     * 7. Ação: Excluir Saída de um Dia
     * ============================================== */
    const handleDeleteSchedule = async (scheduleId: string) => {
        try {
            await deleteSchedule(scheduleId);
            toast.success("Saída de campo removida!");
            setDeleteScheduleId(null);
            await mutateSchedules();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir saída de campo.");
        }
    };

    /* ==============================================
     * 8. Ação: Criar Saída Avulsa
     * ============================================== */
    const handleCreateAvulsa = async () => {
        if (!selectedTemplate || !newDate || !newLeaderId) {
            toast.warning("Selecione a data e o dirigente para a nova saída.");
            return;
        }

        setCreatingSchedule(true);
        try {
            await createSchedule(selectedTemplate.id, {
                date: newDate,
                leader_id: newLeaderId,
            });
            toast.success("Saída avulsa adicionada com sucesso!");
            setIsAddModalOpen(false);
            setNewLeaderId("");
            await mutateSchedules();
        } catch (err: any) {
            console.error(err);
            toast.error(
                err?.response?.data?.message || "Erro ao adicionar saída avulsa."
            );
        } finally {
            setCreatingSchedule(false);
        }
    };

    /* ==============================================
     * 9. Estatísticas do Mês
     * ============================================== */
    const stats = useMemo(() => {
        const total = currentMonthSchedules.length;
        let conflictCount = 0;

        currentMonthSchedules.forEach((s) => {
            const isUnavail = unavailabilities.some(
                (u) =>
                    u.publisher_id === s.leader?.id &&
                    dayjs(s.date).isSameOrAfter(u.startDate, "day") &&
                    dayjs(s.date).isSameOrBefore(u.endDate, "day")
            );
            if (isUnavail) conflictCount++;
        });

        return {
            total,
            conflictCount,
        };
    }, [currentMonthSchedules, unavailabilities]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Programação do Campo" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* =========================================================
                 * CABEÇALHO & SELEÇÃO DE SAÍDA (RODÍZIO)
                 * ========================================================= */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-typography-200 dark:border-zinc-800 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Layers className="w-6 h-6 text-primary-200" />
                            <h1 className="text-2xl font-bold text-typography-800 dark:text-zinc-100">
                                Programação do Campo
                            </h1>
                        </div>
                        <p className="text-sm text-typography-500 dark:text-zinc-400">
                            Distribuição inteligente de dirigentes por antiguidade e gestão manual por data.
                        </p>
                    </div>

                    {/* Seletor de Template de Saída */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-typography-600 dark:text-zinc-300">
                            Saída:
                        </span>
                        <div className="min-w-[280px]">
                            <select
                                className="w-full h-11 px-3 py-2 bg-surface-100 dark:bg-zinc-800 border border-typography-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-typography-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                value={selectedTemplate?.id || ""}
                                onChange={(e) => {
                                    const t = rotationTemplates.find(
                                        (temp) => temp.id === e.target.value
                                    );
                                    if (t) setSelectedTemplate(t);
                                }}
                            >
                                {rotationTemplates.length === 0 ? (
                                    <option value="">Nenhuma saída de rodízio cadastrada</option>
                                ) : (
                                    rotationTemplates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {WEEKDAY_LABEL[t.weekday as Weekday]} · {formatHour(t.time)} · {t.location}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                 * CHIPS INFORMATIVOS DO TEMPLATE SELECIONADO
                 * ========================================================= */}
                {selectedTemplate && (
                    <div className="flex flex-wrap items-center gap-3 p-4 bg-primary-200/5 dark:bg-primary-200/10 border border-primary-200/20 rounded-xl">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-primary-200/30 text-xs font-semibold text-primary-200">
                            <CalendarDays className="w-4 h-4" />
                            <span>{WEEKDAY_LABEL[selectedTemplate.weekday as Weekday]}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-typography-200 dark:border-zinc-700 text-xs font-medium text-typography-700 dark:text-zinc-300">
                            <Clock className="w-4 h-4 text-typography-400" />
                            <span>{formatHour(selectedTemplate.time)}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-typography-200 dark:border-zinc-700 text-xs font-medium text-typography-700 dark:text-zinc-300">
                            <MapPin className="w-4 h-4 text-typography-400" />
                            <span className="truncate max-w-[200px]">{selectedTemplate.location}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-typography-200 dark:border-zinc-700 text-xs font-medium text-typography-700 dark:text-zinc-300">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <span>
                                {selectedTemplate.rotation_members?.length || 0} dirigentes no rodízio
                            </span>
                        </div>
                    </div>
                )}

                {/* =========================================================
                 * NAVEGADOR DE MÊS, ESTATÍSTICAS E AÇÕES RÁPIDAS
                 * ========================================================= */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-typography-200 dark:border-zinc-800 shadow-sm">
                    {/* Navegador de Mês */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="h-10 w-10 rounded-xl"
                            title="Mês anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <div className="px-4 py-2 min-w-[200px] text-center font-bold text-lg text-typography-800 dark:text-zinc-100 bg-surface-100 dark:bg-zinc-800/60 rounded-xl border border-typography-200 dark:border-zinc-700">
                            {currentMonth.format("MMMM [de] YYYY").replace(/^\w/, (c) => c.toUpperCase())}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-10 w-10 rounded-xl"
                            title="Próximo mês"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCurrentMonth}
                            className="text-xs text-primary-200 hover:text-primary-300 font-medium"
                        >
                            Mês Atual
                        </Button>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-zinc-800 text-xs text-typography-600 dark:text-zinc-300 font-medium">
                            <CalendarCheck2 className="w-4 h-4 text-primary-200" />
                            <span>{stats.total} saídas programadas</span>
                        </div>

                        {stats.conflictCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 font-semibold animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{stats.conflictCount} com indisponibilidade</span>
                            </div>
                        )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="gap-2 bg-primary-200 hover:bg-primary-300 text-white shadow-sm"
                            disabled={!selectedTemplate}
                        >
                            <Wand2 className="w-4 h-4" />
                            <span>Gerar Programação</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setIsAddModalOpen(true)}
                            className="gap-2"
                            disabled={!selectedTemplate}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nova Saída</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setIsExceptionsModalOpen(true)}
                            className="gap-2"
                        >
                            <CalendarOff className="w-4 h-4 text-rose-500" />
                            <span>Exceções</span>
                        </Button>

                        {congregationId && (
                            <Button
                                variant="outline"
                                onClick={() => setIsPdfModalOpen(true)}
                                className="gap-2"
                            >
                                <FileDown className="w-4 h-4 text-emerald-600" />
                                <span>Exportar PDF</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* =========================================================
                 * GRID / LISTA DE CARDS DE SAÍDAS DO MÊS
                 * ========================================================= */}
                {loadingSchedules || loadingTemplates ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 rounded-2xl border border-typography-200 dark:border-zinc-800">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                        <p className="text-sm text-typography-500 dark:text-zinc-400">
                            Carregando saídas de campo...
                        </p>
                    </div>
                ) : !selectedTemplate ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 rounded-2xl border border-typography-200 dark:border-zinc-800 text-center">
                        <Layers className="w-12 h-12 text-typography-300 dark:text-zinc-600 mb-3" />
                        <h3 className="text-base font-semibold text-typography-700 dark:text-zinc-200">
                            Nenhuma saída selecionada
                        </h3>
                        <p className="text-sm text-typography-500 dark:text-zinc-400 mt-1 max-w-md">
                            Cadastre saídas de campo do tipo rodízio para gerenciar as escalas.
                        </p>
                    </div>
                ) : currentMonthSchedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-typography-300 dark:border-zinc-700 text-center">
                        <CalendarOff className="w-12 h-12 text-typography-300 dark:text-zinc-600 mb-3" />
                        <h3 className="text-base font-semibold text-typography-700 dark:text-zinc-200">
                            Nenhuma saída agendada para {currentMonth.format("MMMM [de] YYYY")}
                        </h3>
                        <p className="text-sm text-typography-500 dark:text-zinc-400 mt-1 max-w-md">
                            Gere a programação automaticamente pelo botão acima ou adicione uma data avulsa.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <Button
                                onClick={() => setIsGenerateModalOpen(true)}
                                className="gap-2 bg-primary-200 hover:bg-primary-300 text-white"
                            >
                                <Wand2 className="w-4 h-4" />
                                <span>Gerar Programação</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsAddModalOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Adicionar Saída</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {currentMonthSchedules.map((schedule) => (
                            <FieldServiceScheduleCard
                                key={schedule.id}
                                schedule={schedule}
                                allSchedules={allSchedules || []}
                                rotationMembers={selectedTemplate.rotation_members || []}
                                unavailabilities={unavailabilities}
                                onUpdateLeader={(leaderId) =>
                                    handleUpdateLeader(schedule.id, leaderId)
                                }
                                onDelete={() => setDeleteScheduleId(schedule.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* =========================================================
             * MODAL: GERAR PROGRAMAÇÃO INTELIGENTE
             * ========================================================= */}
            <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="w-5 h-5 text-primary-200" />
                            <span>Gerar Programação de Campo</span>
                        </DialogTitle>
                        <DialogDescription>
                            O algoritmo inteligente distribui as saídas priorizando irmãos há mais tempo sem dirigir e pula automaticamente os que estiverem indisponíveis.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="p-3 bg-surface-100 dark:bg-zinc-800/70 rounded-xl text-xs space-y-1.5 text-typography-600 dark:text-zinc-300 border border-typography-200 dark:border-zinc-700">
                            <p className="font-semibold text-typography-800 dark:text-zinc-200">
                                🎯 Regras da Distribuição Justa:
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Ordenação por antiguidade (quem está há mais tempo sem dirigir).</li>
                                <li>Consulta às ausências registradas dos publicadores.</li>
                                <li>Se alguém estiver ausente, passa para o próximo sem perder a vez no rodízio.</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Calendar
                                label="Data Inicial"
                                selectedDate={genStartDate}
                                handleDateChange={setGenStartDate}
                                full
                            />
                            <Calendar
                                label="Data Final"
                                selectedDate={genEndDate}
                                handleDateChange={setGenEndDate}
                                minDate={genStartDate}
                                full
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-typography-700 dark:text-zinc-300">
                                Modo de Geração:
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setGenMode("append")}
                                    className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                                        genMode === "append"
                                            ? "border-primary-200 bg-primary-200/10 text-primary-300 font-semibold"
                                            : "border-typography-200 dark:border-zinc-700 hover:bg-surface-100 dark:hover:bg-zinc-800 text-typography-600 dark:text-zinc-400"
                                    }`}
                                >
                                    <div className="font-semibold mb-0.5">Manter existentes</div>
                                    <span className="text-[11px] opacity-80">
                                        Preserva alterações já feitas e cria apenas novos dias.
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setGenMode("reconcile")}
                                    className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                                        genMode === "reconcile"
                                            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-semibold"
                                            : "border-typography-200 dark:border-zinc-700 hover:bg-surface-100 dark:hover:bg-zinc-800 text-typography-600 dark:text-zinc-400"
                                    }`}
                                >
                                    <div className="font-semibold mb-0.5">Substituir existentes</div>
                                    <span className="text-[11px] opacity-80">
                                        Recria todos os dias do período do zero.
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsGenerateModalOpen(false)}
                            disabled={generating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleGenerateSchedules}
                            disabled={generating}
                            className="bg-primary-200 hover:bg-primary-300 text-white gap-2"
                        >
                            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{generating ? "Gerando..." : "Gerar Programação"}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* =========================================================
             * MODAL: ADICIONAR SAÍDA AVULSA
             * ========================================================= */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Plus className="w-5 h-5 text-primary-200" />
                            <span>Nova Saída Avulsa</span>
                        </DialogTitle>
                        <DialogDescription>
                            Adicione uma saída de campo em uma data específica com um dirigente escolhido.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <Calendar
                            label="Data da Saída"
                            selectedDate={newDate}
                            handleDateChange={setNewDate}
                            full
                        />

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-typography-700 dark:text-zinc-300">
                                Dirigente:
                            </label>
                            <select
                                className="w-full h-11 px-3 py-2 bg-surface-100 dark:bg-zinc-800 border border-typography-300 dark:border-zinc-700 rounded-xl text-sm text-typography-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                value={newLeaderId}
                                onChange={(e) => setNewLeaderId(e.target.value)}
                            >
                                <option value="">Selecione um dirigente...</option>
                                {selectedTemplate?.rotation_members?.map((m) => (
                                    <option key={m.publisher.id} value={m.publisher.id}>
                                        {m.publisher.nickname || m.publisher.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddModalOpen(false)}
                            disabled={creatingSchedule}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateAvulsa}
                            disabled={creatingSchedule || !newLeaderId || !newDate}
                            className="bg-primary-200 hover:bg-primary-300 text-white gap-2"
                        >
                            {creatingSchedule && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{creatingSchedule ? "Salvando..." : "Salvar Saída"}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* =========================================================
             * MODAL: GESTÃO DE EXCEÇÕES / DATAS SEM SAÍDA
             * ========================================================= */}
            <Dialog open={isExceptionsModalOpen} onOpenChange={setIsExceptionsModalOpen}>
                <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <CalendarOff className="w-5 h-5 text-rose-500" />
                            <span>Datas sem Saída de Campo (Exceções)</span>
                        </DialogTitle>
                        <DialogDescription>
                            Datas cadastradas aqui não terão saídas geradas (ex: Congressos, Assembleias ou Feriados).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <FieldServiceExceptionsCard />
                    </div>
                </DialogContent>
            </Dialog>

            {/* =========================================================
             * MODAL: EXPORTAR PDF
             * ========================================================= */}
            {congregationId && (
                <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <FileDown className="w-5 h-5 text-emerald-600" />
                                <span>Exportar Programação em PDF</span>
                            </DialogTitle>
                            <DialogDescription>
                                Escolha o período e a escala para gerar o arquivo para impressão.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                            <FieldServicePdfDownload congregationId={congregationId} />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* =========================================================
             * MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
             * ========================================================= */}
            <Dialog
                open={!!deleteScheduleId}
                onOpenChange={(open) => !open && setDeleteScheduleId(null)}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Excluir Saída de Campo?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja excluir a saída de campo desta data? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteScheduleId(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteScheduleId && handleDeleteSchedule(deleteScheduleId)
                            }
                        >
                            Sim, Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentDashboard>
    );
}

/* =========================================================================
 * COMPONENTE: CARD INDIVIDUAL DE SAÍDA DE CAMPO
 * ========================================================================= */
interface FieldServiceScheduleCardProps {
    schedule: IFieldServiceSchedule;
    allSchedules: IFieldServiceSchedule[];
    rotationMembers: any[];
    unavailabilities: IPublisherUnavailability[];
    onUpdateLeader: (leaderId: string) => void;
    onDelete: () => void;
}

function FieldServiceScheduleCard({
    schedule,
    allSchedules,
    rotationMembers,
    unavailabilities,
    onUpdateLeader,
    onDelete,
}: FieldServiceScheduleCardProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const scheduleDate = dayjs(schedule.date);
    const dayNumber = scheduleDate.format("DD");
    const monthShort = scheduleDate.format("MMM").toUpperCase();

    // Checa se o dirigente atual está indisponível na data desta saída
    const currentLeaderUnavailability = useMemo(() => {
        if (!schedule.leader?.id) return null;
        return unavailabilities.find(
            (u) =>
                u.publisher_id === schedule.leader.id &&
                scheduleDate.isSameOrAfter(dayjs(u.startDate), "day") &&
                scheduleDate.isSameOrBefore(dayjs(u.endDate), "day")
        );
    }, [schedule.leader, scheduleDate, unavailabilities]);

    // Opções de dirigentes com cálculo de tempo desde a última saída e tags de ausência
    const candidateOptions = useMemo(() => {
        // Mapear histórico de saídas anteriores a esta data
        const historyMap = new Map<string, string>();
        allSchedules.forEach((s) => {
            if (!s.leader?.id) return;
            const d = dayjs(s.date);
            if (d.isBefore(scheduleDate, "day")) {
                const prev = historyMap.get(s.leader.id);
                if (!prev || d.isAfter(dayjs(prev))) {
                    historyMap.set(s.leader.id, s.date);
                }
            }
        });

        const list = rotationMembers.map((m) => {
            const pub = m.publisher;
            const lastDate = historyMap.get(pub.id);
            const relativeInfo = formatRelativeTime(lastDate, schedule.date);

            const unavail = unavailabilities.find(
                (u) =>
                    u.publisher_id === pub.id &&
                    scheduleDate.isSameOrAfter(dayjs(u.startDate), "day") &&
                    scheduleDate.isSameOrBefore(dayjs(u.endDate), "day")
            );

            return {
                id: pub.id,
                name: pub.nickname || pub.fullName,
                order: m.order,
                lastDate,
                relativeText: relativeInfo.relativeText,
                formattedDate: relativeInfo.formattedDate,
                isUnavailable: !!unavail,
                unavailabilityReason: unavail?.reason || null,
            };
        });

        // Ordenar: Disponíveis primeiro (por tempo sem dirigir / ordem), Indisponíveis no final
        return list.sort((a, b) => {
            if (a.isUnavailable !== b.isUnavailable) {
                return a.isUnavailable ? 1 : -1;
            }
            if (!a.lastDate && b.lastDate) return -1;
            if (a.lastDate && !b.lastDate) return 1;
            if (a.lastDate && b.lastDate) {
                const diff = dayjs(a.lastDate).valueOf() - dayjs(b.lastDate).valueOf();
                if (diff !== 0) return diff;
            }
            return a.order - b.order;
        });
    }, [rotationMembers, allSchedules, schedule.date, scheduleDate, unavailabilities]);

    const filteredCandidates = candidateOptions.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className={`flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-200 shadow-sm hover:shadow-md ${
                currentLeaderUnavailability
                    ? "border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10"
                    : "border-typography-200 dark:border-zinc-800"
            }`}
        >
            <div>
                {/* Header do Card: Data e Ação de Exclusão */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-typography-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary-200/10 text-primary-200 dark:bg-primary-200/20 rounded-xl font-bold border border-primary-200/20 shrink-0">
                            <span className="text-base leading-none">{dayNumber}</span>
                            <span className="text-[10px] tracking-wider uppercase">{monthShort}</span>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-primary-200 uppercase tracking-wide">
                                {scheduleDate.format("dddd")}
                            </span>
                            <h4 className="text-sm font-bold text-typography-800 dark:text-zinc-100 line-clamp-1">
                                {scheduleDate.format("DD [de] MMMM")}
                            </h4>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onDelete}
                        className="p-1.5 text-typography-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Excluir saída deste dia"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Alerta Visual de Indisponibilidade do Dirigente Escalado */}
                {currentLeaderUnavailability && (
                    <div className="my-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold">Ausência registrada:</span>{" "}
                            {currentLeaderUnavailability.reason || "Indisponível no período"}
                        </div>
                    </div>
                )}

                {/* Seleção do Dirigente com Dropdown Inteligente */}
                <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-typography-500 dark:text-zinc-400">
                            Dirigente designado:
                        </label>
                    </div>

                    <Popover.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <Popover.Trigger asChild>
                            <button
                                type="button"
                                className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border text-left transition-all ${
                                    currentLeaderUnavailability
                                        ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
                                        : "border-typography-300 dark:border-zinc-700 bg-surface-100 dark:bg-zinc-800 text-typography-800 dark:text-zinc-100 hover:border-primary-200"
                                }`}
                            >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                            currentLeaderUnavailability
                                                ? "bg-amber-200 text-amber-900"
                                                : "bg-primary-200/20 text-primary-200"
                                        }`}
                                    >
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-semibold truncate">
                                            {schedule.leader?.nickname ||
                                                schedule.leader?.fullName ||
                                                "Sem dirigente"}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-typography-400 shrink-0" />
                            </button>
                        </Popover.Trigger>

                        <Popover.Portal>
                            <Popover.Content
                                className="z-50 w-[300px] p-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-typography-200 dark:border-zinc-800 text-xs animate-in fade-in-80"
                                sideOffset={5}
                                align="start"
                            >
                                {/* Barra de busca */}
                                <div className="relative mb-2">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-typography-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar dirigente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 bg-surface-100 dark:bg-zinc-800 border border-typography-200 dark:border-zinc-700 rounded-lg text-xs text-typography-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                    />
                                </div>

                                {/* Lista de Opções */}
                                <div className="max-h-[220px] overflow-y-auto space-y-1">
                                    {filteredCandidates.map((candidate) => {
                                        const isSelected = candidate.id === schedule.leader?.id;

                                        return (
                                            <button
                                                key={candidate.id}
                                                type="button"
                                                onClick={() => {
                                                    onUpdateLeader(candidate.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                                                    isSelected
                                                        ? "bg-primary-200/10 text-primary-200 font-semibold"
                                                        : "hover:bg-surface-100 dark:hover:bg-zinc-800 text-typography-700 dark:text-zinc-300"
                                                }`}
                                            >
                                                <div className="space-y-0.5 overflow-hidden pr-2">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-semibold text-xs truncate">
                                                            {candidate.name}
                                                        </span>
                                                        {candidate.isUnavailable && (
                                                            <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded text-[10px] font-semibold">
                                                                ⚠️ Indisponível
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-[10px] text-typography-400 dark:text-zinc-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3 inline" />
                                                        <span>
                                                            {candidate.relativeText}{" "}
                                                            {candidate.formattedDate && `(${candidate.formattedDate})`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-primary-200 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                </div>
            </div>
        </div>
    );
}

FieldServiceSchedulePage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "FIELD_SERVICE_MANAGER",
]);

export default FieldServiceSchedulePage;
