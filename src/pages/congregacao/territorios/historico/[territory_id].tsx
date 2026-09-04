import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useAuthContext } from "@/context/AuthContext";
import { useTerritoryContext } from "@/context/TerritoryContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import TerritoriesProviderLayout from "@/layouts/providers/territories/_layout";
import {
    CreateTerritoryHistoryArgs,
    IFieldConductors,
    ITerritoryHistory,
    UpdateTerritoryHistoryArgs,
} from "@/types/territory";
import { WORKTYPESTERRITORY } from "@/types/types";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useAtom } from "jotai";
import {
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    History,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    User
} from "lucide-react";
import Router, { useRouter } from "next/router";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

function EditHistoryTerritoryPage() {
    const router = useRouter();
    const { territory_id } = router.query;
    const territoryIdStr = typeof territory_id === "string" ? territory_id : "";

    const {
        createTerritoryHistory,
        updateTerritoryHistory,
        deleteTerritoryHistory,
        territories,
    } = useTerritoryContext();
    const { roleContains } = useAuthContext();
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const canManage =
        roleContains("ADMIN_CONGREGATION") || roleContains("TERRITORIES_MANAGER");

    // Histórico do território
    const {
        data: getHistory,
        mutate,
        isLoading,
    } = useAuthorizedFetch<ITerritoryHistory[]>(
        territoryIdStr ? `${API_ROUTES.TERRITORYHISTORY}/${territoryIdStr}` : "",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"],
        }
    );

    // Lista de dirigentes para o formulário
    const { data: conductorsData } = useAuthorizedFetch<IFieldConductors[]>(
        "/form-data?form=territoryHistory",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"],
        }
    );

    const conductorsList = useMemo(() => {
        if (!conductorsData) return [];
        return [...conductorsData].sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
        );
    }, [conductorsData]);

    // Dados do Território
    const territory = useMemo(() => {
        return (
            getHistory?.[0]?.territory ||
            territories?.find((t) => t.id === territoryIdStr) ||
            null
        );
    }, [getHistory, territories, territoryIdStr]);

    // Separação entre designação ativa e histórico concluído
    const activeHistory = useMemo(() => {
        if (!getHistory) return null;
        return (
            getHistory.find(
                (h) => h.completion_date === null || h.completion_date === undefined
            ) || null
        );
    }, [getHistory]);

    const completedHistories = useMemo(() => {
        if (!getHistory) return [];
        return getHistory
            .filter((h) => !!h.completion_date)
            .sort(
                (a, b) =>
                    new Date(b.completion_date!).getTime() -
                    new Date(a.completion_date!).getTime()
            );
    }, [getHistory]);

    // Breadcrumbs e título da página
    useEffect(() => {
        setPageActive("Histórico");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Territórios", link: "/congregacao/territorios" },
            {
                label: territory
                    ? `Território #${territory.number}`
                    : "Histórico do Território",
                link: `/congregacao/territorios/historico/${territoryIdStr}`,
            },
        ]);
    }, [setPageActive, setCrumbs, territory, territoryIdStr]);
    }, [setPageActive, setCrumbs]);

    // ==========================================
    // Estados dos Modais
    // ==========================================

    // Modal de Criação / Edição
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingHistory, setEditingHistory] = useState<ITerritoryHistory | null>(
        null
    );
    const [formCaretaker, setFormCaretaker] = useState("");
    const [formManualConductor, setFormManualConductor] = useState(false);
    const [formAssignmentDate, setFormAssignmentDate] = useState("");
    const [formCompletionDate, setFormCompletionDate] = useState("");
    const [formWorkType, setFormWorkType] = useState<string>("Padrão");
    const [formCustomWorkType, setFormCustomWorkType] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Modal de Conclusão Rápida (para a designação ativa)
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [completeDate, setCompleteDate] = useState(
        dayjs().format("YYYY-MM-DD")
    );
    const [isCompleting, setIsCompleting] = useState(false);

    // Modal de Exclusão
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Abre modal para criar nova designação
    function handleOpenCreate() {
        setEditingHistory(null);
        setFormCaretaker("");
        setFormManualConductor(false);
        setFormAssignmentDate(dayjs().format("YYYY-MM-DD"));
        setFormCompletionDate("");
        setFormWorkType("Padrão");
        setFormCustomWorkType("");
        setFormModalOpen(true);
    }

    // Abre modal para editar designação existente
    function handleOpenEdit(history: ITerritoryHistory) {
        setEditingHistory(history);
        setFormCaretaker(history.caretaker || "");

        // Verifica se o dirigente está na lista de condutores
        const isInList = conductorsList.some(
            (c) => c.nickname === history.caretaker || c.fullName === history.caretaker
        );
        setFormManualConductor(!isInList && !!history.caretaker);

        setFormAssignmentDate(
            history.assignment_date
                ? dayjs(history.assignment_date).format("YYYY-MM-DD")
                : ""
        );
        setFormCompletionDate(
            history.completion_date
                ? dayjs(history.completion_date).format("YYYY-MM-DD")
                : ""
        );

        const isStandardType = Object.values(WORKTYPESTERRITORY).includes(
            history.work_type as WORKTYPESTERRITORY
        );
        if (isStandardType) {
            setFormWorkType(history.work_type);
            setFormCustomWorkType("");
        } else if (history.work_type) {
            setFormWorkType("Outra");
            setFormCustomWorkType(history.work_type);
        } else {
            setFormWorkType("Padrão");
            setFormCustomWorkType("");
        }

        setFormModalOpen(true);
    }

    // Salvar Criação ou Edição
    async function handleSaveForm(e: React.FormEvent) {
        e.preventDefault();

        if (!formCaretaker.trim()) {
            toast.warning("Selecione ou digite o nome do dirigente.");
            return;
        }

        if (!formAssignmentDate) {
            toast.warning("Informe a data de designação.");
            return;
        }

        if (formCompletionDate && formCompletionDate < formAssignmentDate) {
            toast.warning("A data de conclusão não pode ser anterior à de designação.");
            return;
        }

        const finalWorkType =
            formWorkType === "Outra" ? formCustomWorkType.trim() || "Outra" : formWorkType;

        setIsSaving(true);
        try {
            if (editingHistory) {
                const payload: UpdateTerritoryHistoryArgs = {
                    territoryHistory_id: editingHistory.id,
                    caretaker: formCaretaker.trim(),
                    assignment_date: formAssignmentDate,
                    completion_date: formCompletionDate || null,
                    work_type: finalWorkType,
                };
                await updateTerritoryHistory(payload);
                toast.success("Histórico atualizado com sucesso!");
            } else {
                const payload: CreateTerritoryHistoryArgs = {
                    territory_id: territoryIdStr,
                    caretaker: formCaretaker.trim(),
                    assignment_date: formAssignmentDate,
                    completion_date: formCompletionDate || null,
                    work_type: finalWorkType,
                };
                await createTerritoryHistory(payload);
                toast.success("Nova designação criada com sucesso!");
            }

            setFormModalOpen(false);
            await mutate();
        } catch (err) {
            console.error("Erro ao salvar histórico:", err);
            toast.error("Erro ao salvar histórico do território.");
        } finally {
            setIsSaving(false);
        }
    }

    // Concluir designação ativa rapidamente
    async function handleCompleteActive() {
        if (!activeHistory) return;
        if (!completeDate) {
            toast.warning("Informe a data de conclusão.");
            return;
        }

        const assignDateStr = activeHistory.assignment_date
            ? dayjs(activeHistory.assignment_date).format("YYYY-MM-DD")
            : "";

        if (assignDateStr && completeDate < assignDateStr) {
            toast.warning("A data de conclusão não pode ser anterior à data de designação.");
            return;
        }

        setIsCompleting(true);
        try {
            await updateTerritoryHistory({
                territoryHistory_id: activeHistory.id,
                caretaker: activeHistory.caretaker,
                assignment_date: activeHistory.assignment_date,
                completion_date: completeDate,
                work_type: activeHistory.work_type,
            });
            toast.success("Território concluído com sucesso!");
            setCompleteModalOpen(false);
            await mutate();
        } catch (err) {
            console.error("Erro ao concluir território:", err);
            toast.error("Erro ao concluir território.");
        } finally {
            setIsCompleting(false);
        }
    }

    // Excluir registro
    async function handleDelete(historyId: string) {
        setIsDeleting(true);
        try {
            await deleteTerritoryHistory({ territoryHistory_id: historyId });
            toast.success("Registro excluído com sucesso!");
            setDeleteModalId(null);
            await mutate();
        } catch (err) {
            console.error("Erro ao excluir histórico:", err);
            toast.error("Erro ao excluir registro.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <ContentDashboard>
            <BreadCrumbs
                crumbs={crumbs}
                pageActive={
                    territory
                        ? `Território #${territory.number}`
                        : "Histórico do Território"
                }
            />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Header Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => Router.push("/congregacao/territorios")}
                                className="h-8 w-8 p-0 rounded-xl border-surface-300 hover:bg-surface-200 text-typography-700"
                                title="Voltar aos territórios"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>

                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20">
                                Território #{territory?.number || "..."}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-typography-800">
                                {territory?.name || "Histórico do Território"}
                            </h1>
                            <p className="text-sm text-typography-500">
                                {territory?.description ||
                                    "Linha do tempo e registros de designações e conclusões deste mapa."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {canManage && (
                            <Button
                                onClick={handleOpenCreate}
                                className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm h-10 px-4"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nova Designação</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Métricas e Estatísticas do Território */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Status Atual */}
                    <div className="p-4 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-typography-500">
                            Status Atual
                        </span>
                        <div className="mt-2 flex items-center gap-2">
                            {activeHistory ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Em Andamento</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-200 text-typography-600 border border-surface-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-200" />
                                    <span>Disponível</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Total de Designações */}
                    <div className="p-4 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-typography-500">
                            Total de Designações
                        </span>
                        <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-typography-800">
                                {getHistory?.length || 0}
                            </span>
                            <span className="text-xs text-typography-400">vezes</span>
                        </div>
                    </div>

                    {/* Total de Conclusões */}
                    <div className="p-4 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-typography-500">
                            Conclusões Realizadas
                        </span>
                        <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-typography-800">
                                {completedHistories.length}
                            </span>
                            <span className="text-xs text-typography-400">concluídas</span>
                        </div>
                    </div>

                    {/* Última Conclusão */}
                    <div className="p-4 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-typography-500">
                            Última Conclusão
                        </span>
                        <div className="mt-2">
                            <span className="text-sm font-bold text-typography-800">
                                {completedHistories[0]?.completion_date
                                    ? dayjs(completedHistories[0].completion_date).format(
                                          "DD/MM/YYYY"
                                      )
                                    : "Nunca concluído"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card de Designação Ativa (em andamento) */}
                {activeHistory && (
                    <div className="flex flex-col gap-4 p-5 sm:p-6 bg-surface-100 rounded-2xl border border-emerald-500/30 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                        Designação Ativa em Aberto
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-typography-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary-200" />
                                    <span>{activeHistory.caretaker}</span>
                                </h3>
                            </div>

                            {canManage && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            setCompleteDate(dayjs().format("YYYY-MM-DD"));
                                            setCompleteModalOpen(true);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 shadow-sm"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>Concluir Território</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenEdit(activeHistory)}
                                        className="h-9 px-3 rounded-xl border-surface-300 text-xs font-medium hover:bg-surface-200"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        <span>Editar</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteModalId(activeHistory.id)}
                                        className="h-9 px-3 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium"
                                        title="Excluir designação"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Detalhes da designação ativa */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-surface-300 text-xs text-typography-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-typography-400 shrink-0" />
                                <span>
                                    Designado em:{" "}
                                    <strong className="text-typography-800">
                                        {activeHistory.assignment_date
                                            ? dayjs(activeHistory.assignment_date).format(
                                                  "DD/MM/YYYY"
                                              )
                                            : "—"}
                                    </strong>
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-typography-400 shrink-0" />
                                <span>
                                    Tempo decorrido:{" "}
                                    <strong className="text-emerald-600 dark:text-emerald-400">
                                        {activeHistory.assignment_date
                                            ? `${dayjs().diff(
                                                  dayjs(activeHistory.assignment_date),
                                                  "day"
                                              )} dias`
                                            : "—"}
                                    </strong>
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-typography-400 shrink-0" />
                                <span>
                                    Modalidade:{" "}
                                    <strong className="text-typography-800">
                                        {activeHistory.work_type || "Padrão"}
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista / Timeline de Conclusões Passadas */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary-200" />
                            <h2 className="text-lg font-bold text-typography-800">
                                Histórico de Conclusões ({completedHistories.length})
                            </h2>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="p-5 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm animate-pulse space-y-3"
                                >
                                    <div className="h-5 w-48 bg-surface-200 shimmer rounded-md" />
                                    <div className="h-4 w-72 bg-surface-200 shimmer rounded-md" />
                                </div>
                            ))}
                        </div>
                    ) : completedHistories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                            <Clock className="w-10 h-10 text-typography-300 mb-2" />
                            <h4 className="text-sm font-semibold text-typography-700">
                                Nenhuma conclusão anterior registrada
                            </h4>
                            <p className="text-xs text-typography-500 mt-1 max-w-sm">
                                As designações concluídas e arquivadas deste território aparecerão aqui em ordem cronológica.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {completedHistories.map((history) => {
                                const diffDays =
                                    history.assignment_date && history.completion_date
                                        ? dayjs(history.completion_date).diff(
                                              dayjs(history.assignment_date),
                                              "day"
                                          )
                                        : null;

                                return (
                                    <div
                                        key={history.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm hover:shadow-md transition-all duration-150"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center font-bold text-xs">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm sm:text-base text-typography-800">
                                                        {history.caretaker}
                                                    </h4>
                                                    <span className="text-[11px] font-semibold text-typography-500 bg-surface-200 px-2 py-0.5 rounded-md border border-surface-300">
                                                        {history.work_type || "Padrão"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-typography-600 pt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-typography-400" />
                                                    <span>
                                                        Designado:{" "}
                                                        <strong>
                                                            {history.assignment_date
                                                                ? dayjs(
                                                                      history.assignment_date
                                                                  ).format("DD/MM/YYYY")
                                                                : "—"}
                                                        </strong>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    <span>
                                                        Concluído:{" "}
                                                        <strong className="text-typography-800">
                                                            {history.completion_date
                                                                ? dayjs(
                                                                      history.completion_date
                                                                  ).format("DD/MM/YYYY")
                                                                : "—"}
                                                        </strong>
                                                    </span>
                                                </div>

                                                {diffDays !== null && (
                                                    <span className="text-[11px] text-typography-500 italic">
                                                        ({diffDays} dias para concluir)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {canManage && (
                                            <div className="flex items-center justify-end gap-2 shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(history)}
                                                    className="h-8 px-3 rounded-xl border-surface-300 text-xs font-medium hover:bg-surface-200 gap-1.5"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    <span>Editar</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDeleteModalId(history.id)}
                                                    className="h-8 px-2.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium"
                                                    title="Excluir este registro"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* Modal de Criação / Edição de Histórico     */}
            {/* ========================================== */}
            <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-typography-800">
                            {editingHistory ? (
                                <>
                                    <Pencil className="w-5 h-5 text-primary-200" />
                                    <span>Editar Histórico</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 text-primary-200" />
                                    <span>Nova Designação de Território</span>
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {editingHistory
                                ? "Atualize as informações desta designação ou conclusão de território."
                                : "Designar este território para um publicador ou dirigente de campo."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveForm} className="space-y-4 mt-2">
                        {/* Dirigente */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-typography-700">
                                    Dirigente / Publicador *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormManualConductor(!formManualConductor)}
                                    className="text-xs text-primary-200 hover:underline font-medium"
                                >
                                    {formManualConductor
                                        ? "Selecionar da lista"
                                        : "Digitar manualmente"}
                                </button>
                            </div>

                            {formManualConductor ? (
                                <input
                                    type="text"
                                    placeholder="Nome completo ou abreviado..."
                                    value={formCaretaker}
                                    onChange={(e) => setFormCaretaker(e.target.value)}
                                    required
                                    className="w-full h-11 px-3.5 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                                />
                            ) : (
                                <select
                                    value={formCaretaker}
                                    onChange={(e) => setFormCaretaker(e.target.value)}
                                    required
                                    className="w-full h-11 px-3.5 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                                >
                                    <option value="">Selecione um dirigente...</option>
                                    {conductorsList.map((conductor) => {
                                        const name =
                                            conductor.nickname?.trim() || conductor.fullName;
                                        return (
                                            <option key={conductor.id} value={name}>
                                                {conductor.fullName}{" "}
                                                {conductor.nickname
                                                    ? `(${conductor.nickname})`
                                                    : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        {/* Linha com Datas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-typography-700">
                                    Data da Designação *
                                </label>
                                <input
                                    type="date"
                                    value={formAssignmentDate}
                                    onChange={(e) => setFormAssignmentDate(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Data da Conclusão
                                    </label>
                                    <span className="text-[10px] text-typography-400">
                                        (Opcional)
                                    </span>
                                </div>
                                <input
                                    type="date"
                                    value={formCompletionDate}
                                    min={formAssignmentDate || undefined}
                                    onChange={(e) => setFormCompletionDate(e.target.value)}
                                    className="w-full h-11 px-3 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Tipo de Trabalho / Cobertura */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-typography-700">
                                Tipo de Cobertura
                            </label>
                            <select
                                value={formWorkType}
                                onChange={(e) => setFormWorkType(e.target.value)}
                                className="w-full h-11 px-3.5 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                            >
                                {Object.values(WORKTYPESTERRITORY).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            {formWorkType === "Outra" && (
                                <input
                                    type="text"
                                    placeholder="Especifique o tipo de trabalho..."
                                    value={formCustomWorkType}
                                    onChange={(e) => setFormCustomWorkType(e.target.value)}
                                    className="w-full h-11 px-3.5 mt-2 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                                />
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormModalOpen(false)}
                                disabled={isSaving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary-200 hover:bg-primary-300 text-white gap-2 font-semibold shadow-sm"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>
                                    {editingHistory ? "Salvar Alterações" : "Criar Designação"}
                                </span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ========================================== */}
            {/* Modal de Conclusão Rápida de Território    */}
            {/* ========================================== */}
            <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-emerald-600 dark:text-emerald-400">
                            <Check className="w-5 h-5" />
                            <span>Concluir Território #{territory?.number}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Confirmar a finalização e devolução deste território pelo dirigente{" "}
                            <strong>{activeHistory?.caretaker}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <label className="text-xs font-semibold text-typography-700 block">
                            Data de Conclusão *
                        </label>
                        <input
                            type="date"
                            value={completeDate}
                            min={
                                activeHistory?.assignment_date
                                    ? dayjs(activeHistory.assignment_date).format("YYYY-MM-DD")
                                    : undefined
                            }
                            onChange={(e) => setCompleteDate(e.target.value)}
                            required
                            className="w-full h-11 px-3 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setCompleteModalOpen(false)}
                            disabled={isCompleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCompleteActive}
                            disabled={isCompleting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-sm"
                        >
                            {isCompleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Confirmar Conclusão</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ========================================== */}
            {/* Modal de Confirmação de Exclusão           */}
            {/* ========================================== */}
            <Dialog
                open={!!deleteModalId}
                onOpenChange={(open) => !open && setDeleteModalId(null)}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Excluir Registro de Histórico?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja excluir este registro de designação? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModalId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteModalId && handleDelete(deleteModalId)}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Sim, Excluir</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentDashboard>
    );
}

EditHistoryTerritoryPage.getLayout = (page: ReactElement) =>
    withProtectedLayout(["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"])(
        <TerritoriesProviderLayout>{page}</TerritoriesProviderLayout>
    );

export default EditHistoryTerritoryPage;
