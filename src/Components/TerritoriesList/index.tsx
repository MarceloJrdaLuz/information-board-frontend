import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { useAuthContext } from "@/context/AuthContext";
import { useTerritoryContext } from "@/context/TerritoryContext";
import { shortenName } from "@/functions/reduzirNome";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { ITerritory } from "@/types/territory";
import {
    Calendar,
    CheckCircle2,
    Clock,
    History,
    Image as ImageIcon,
    Layers,
    Loader2,
    MapPin,
    Maximize2,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    X,
} from "lucide-react";
import dayjs from "dayjs";
import Router from "next/router";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import FullScreenImage from "../FullScreenImage";
import SkeletonTerritoriesList from "./skeletonTerritoriesList";

type FilterType = "ALL" | "ASSIGNED" | "AVAILABLE" | "WITH_IMAGE";

export default function TerritoriesList() {
    const { user, roleContains } = useAuthContext();
    const { deleteTerritory, territoriesHistory } = useTerritoryContext();
    const congregationId = user?.congregation?.id;

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
    const [deleteTerritoryId, setDeleteTerritoryId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isManagerOrAdmin =
        roleContains("TERRITORIES_MANAGER") || roleContains("ADMIN_CONGREGATION");

    const fetchUrl = congregationId ? `/territories/${congregationId}` : "";
    const {
        data: territories,
        mutate,
        isLoading,
    } = useAuthorizedFetch<ITerritory[]>(fetchUrl, {
        allowedRoles: ["ADMIN_CONGREGATION", "TERRITORIES_MANAGER", "TERRITORIES_VIEWER"],
    });

    // Mapeamento de territórios com status ativo e última conclusão
    const territoriesWithMeta = useMemo(() => {
        if (!territories) return [];

        return territories.map((territory) => {
            const relevantHistories =
                territoriesHistory?.filter((h) => h.territory.id === territory.id) ?? [];

            // Histórico ativo (designado e ainda não concluído)
            const activeHistory = relevantHistories.find(
                (h) => h.completion_date === null || h.completion_date === undefined
            );

            // Histórico concluído mais recente
            const completedHistories = relevantHistories.filter((h) => !!h.completion_date);
            completedHistories.sort(
                (a, b) =>
                    new Date(b.completion_date!).getTime() -
                    new Date(a.completion_date!).getTime()
            );
            const lastCompletion = completedHistories[0];

            return {
                ...territory,
                activeHistory,
                lastCompletionDate: lastCompletion?.completion_date
                    ? dayjs(lastCompletion.completion_date).format("DD/MM/YYYY")
                    : null,
            };
        });
    }, [territories, territoriesHistory]);

    // Estatísticas
    const stats = useMemo(() => {
        const total = territoriesWithMeta.length;
        const assigned = territoriesWithMeta.filter((t) => !!t.activeHistory).length;
        const available = total - assigned;
        const withImage = territoriesWithMeta.filter((t) => !!t.image_url).length;

        return { total, assigned, available, withImage };
    }, [territoriesWithMeta]);

    // Filtragem e Busca
    const filteredTerritories = useMemo(() => {
        let result = [...territoriesWithMeta];

        // Filtro por categoria
        if (activeFilter === "ASSIGNED") {
            result = result.filter((t) => !!t.activeHistory);
        } else if (activeFilter === "AVAILABLE") {
            result = result.filter((t) => !t.activeHistory);
        } else if (activeFilter === "WITH_IMAGE") {
            result = result.filter((t) => !!t.image_url);
        }

        // Filtro por texto
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter((t) => {
                const numberMatch = t.number.toString().includes(term);
                const nameMatch = t.name.toLowerCase().includes(term);
                const descMatch = t.description?.toLowerCase().includes(term);
                const caretakerMatch = t.activeHistory?.caretaker.toLowerCase().includes(term);

                return numberMatch || nameMatch || descMatch || caretakerMatch;
            });
        }

        // Ordenar sempre por número crescente
        result.sort((a, b) => a.number - b.number);

        return result;
    }, [territoriesWithMeta, activeFilter, searchTerm]);

    // Exclusão com confirmação
    async function handleDelete(territoryId: string) {
        setIsDeleting(true);
        try {
            await deleteTerritory({ territory_id: territoryId });
            setDeleteTerritoryId(null);
            await mutate();
        } catch (err) {
            console.error("Erro ao excluir território:", err);
            toast.error("Erro ao excluir território.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Barra de Métricas */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-700">
                    <Layers className="w-4 h-4 text-primary-200" />
                    <span>{stats.total} territórios</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                    <span>{stats.assigned} em andamento</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-600">
                    <CheckCircle2 className="w-4 h-4 text-primary-200" />
                    <span>{stats.available} disponíveis</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-600">
                    <ImageIcon className="w-4 h-4 text-primary-200" />
                    <span>{stats.withImage} com mapa</span>
                </div>
            </div>

            {/* Linha de Busca e Filtros */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Abas / Pílulas de filtro */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-200 rounded-xl border border-surface-300">
                    <button
                        type="button"
                        onClick={() => setActiveFilter("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeFilter === "ALL"
                                ? "bg-surface-100 text-typography-800 shadow-xs"
                                : "text-typography-500 hover:text-typography-800"
                        }`}
                    >
                        Todos ({stats.total})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveFilter("ASSIGNED")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            activeFilter === "ASSIGNED"
                                ? "bg-surface-100 text-emerald-600 dark:text-emerald-400 shadow-xs"
                                : "text-typography-500 hover:text-typography-800"
                        }`}
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Designados ({stats.assigned})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveFilter("AVAILABLE")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            activeFilter === "AVAILABLE"
                                ? "bg-surface-100 text-typography-800 shadow-xs"
                                : "text-typography-500 hover:text-typography-800"
                        }`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-200" />
                        <span>Disponíveis ({stats.available})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveFilter("WITH_IMAGE")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            activeFilter === "WITH_IMAGE"
                                ? "bg-surface-100 text-typography-800 shadow-xs"
                                : "text-typography-500 hover:text-typography-800"
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-primary-200" />
                        <span>Com Mapa ({stats.withImage})</span>
                    </button>
                </div>

                {/* Campo de Busca */}
                <div className="relative min-w-[280px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-typography-400" />
                    <input
                        type="text"
                        placeholder="Buscar por número, nome ou dirigente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2.5 top-2.5 text-typography-400 hover:text-typography-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid de Cards ou Skeletons ou Empty States */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonTerritoriesList key={i} />
                    ))}
                </div>
            ) : !territories || territories.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                    <MapPin className="w-12 h-12 text-typography-300 mb-3" />
                    <h3 className="text-base font-semibold text-typography-700">
                        Nenhum território cadastrado
                    </h3>
                    <p className="text-sm text-typography-500 mt-1 max-w-md">
                        Comece adicionando os mapas e divisões de territórios da sua congregação.
                    </p>
                    {isManagerOrAdmin && (
                        <Button
                            onClick={() => Router.push("/congregacao/territorios/add")}
                            className="mt-6 gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl font-semibold shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Cadastrar Primeiro Território</span>
                        </Button>
                    )}
                </div>
            ) : filteredTerritories.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300 text-center">
                    <Search className="w-10 h-10 text-typography-300 mb-3" />
                    <h3 className="text-base font-semibold text-typography-700">
                        Nenhum território encontrado
                    </h3>
                    <p className="text-sm text-typography-500 mt-1">
                        Tente ajustar os termos da busca ou mudar os filtros selecionados.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm("");
                            setActiveFilter("ALL");
                        }}
                        className="mt-4 text-xs font-semibold rounded-xl"
                    >
                        Limpar Filtros
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTerritories.map((territory) => {
                        const isAssigned = !!territory.activeHistory;

                        return (
                            <div
                                key={territory.id}
                                className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                <div className="space-y-3.5">
                                    {/* Header do Card: Número do Território e Badge de Status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20 shadow-2xs">
                                            Território #{territory.number}
                                        </span>

                                        {isAssigned ? (
                                            <span
                                                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 max-w-[190px] truncate"
                                                title={`Designado para ${territory.activeHistory?.caretaker}`}
                                            >
                                                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {shortenName(territory.activeHistory?.caretaker || "")}
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-200 text-typography-600 border border-surface-300 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-200" />
                                                <span>Disponível</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Título e Descrição */}
                                    <div>
                                        <h3 className="font-bold text-base text-typography-800 line-clamp-1">
                                            {territory.name}
                                        </h3>
                                        <p className="text-xs text-typography-500 line-clamp-2 mt-0.5 min-h-[32px]">
                                            {territory.description || "Sem observações adicionais."}
                                        </p>
                                    </div>

                                    {/* Imagem do Mapa */}
                                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-200 border border-surface-300 group">
                                        {territory.image_url ? (
                                            <>
                                                <FullScreenImage
                                                    alt={`Mapa do território ${territory.name}`}
                                                    src={territory.image_url}
                                                />
                                                <div className="pointer-events-none absolute inset-x-0 bottom-0 py-1.5 px-3 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[11px] text-white font-medium flex items-center gap-1">
                                                        <Maximize2 className="w-3 h-3" /> Clique para ampliar
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full h-full text-center p-4">
                                                <MapPin className="w-8 h-8 text-typography-400/50 mb-1" />
                                                <span className="text-xs font-medium text-typography-600">
                                                    Sem mapa cadastrado
                                                </span>
                                                <span className="text-[11px] text-typography-400">
                                                    Clique em editar para anexar
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metadados: Última conclusão e detalhes da designação atual */}
                                    <div className="pt-2 border-t border-surface-300 space-y-1.5 text-xs">
                                        {/* Status de Conclusão */}
                                        <div className="flex items-center gap-1.5 text-typography-600">
                                            <Clock className="w-3.5 h-3.5 text-typography-400 shrink-0" />
                                            <span>
                                                Última conclusão:{" "}
                                                <strong className="text-typography-800">
                                                    {territory.lastCompletionDate || "Território novo / Em aberto"}
                                                </strong>
                                            </span>
                                        </div>

                                        {/* Data de Designação Atual (se houver) */}
                                        {isAssigned && territory.activeHistory?.assignment_date && (
                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                <span>
                                                    Designado em:{" "}
                                                    {dayjs(territory.activeHistory.assignment_date).format(
                                                        "DD/MM/YYYY"
                                                    )}
                                                    {territory.activeHistory.work_type && (
                                                        <span className="ml-1 text-[11px] font-normal text-typography-500">
                                                            ({territory.activeHistory.work_type})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Barra de Ações Inferior */}
                                <div className="flex items-center justify-between gap-2 pt-3.5 mt-4 border-t border-surface-300">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            Router.push(
                                                `/congregacao/territorios/historico/${territory.id}`
                                            )
                                        }
                                        className="gap-1.5 text-xs font-medium rounded-xl h-8 px-3 border-surface-300 hover:bg-surface-200"
                                        title="Visualizar histórico de designações"
                                    >
                                        <History className="w-3.5 h-3.5 text-primary-200" />
                                        <span>Histórico</span>
                                    </Button>

                                    {isManagerOrAdmin && (
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    Router.push(
                                                        `/congregacao/territorios/edit/${territory.id}`
                                                    )
                                                }
                                                className="gap-1.5 text-xs font-medium rounded-xl h-8 px-3 border-surface-300 hover:bg-surface-200"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span>Editar</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeleteTerritoryId(territory.id)}
                                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 rounded-xl h-8 px-2.5"
                                                title="Excluir território"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            <Dialog
                open={!!deleteTerritoryId}
                onOpenChange={(open) => !open && setDeleteTerritoryId(null)}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Excluir Território?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja excluir este território? Todas as informações de histórico vinculadas a ele também serão excluídas permanentemente.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTerritoryId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTerritoryId && handleDelete(deleteTerritoryId)}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Sim, Excluir</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
