import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { deleteCleaningGroupAtom } from "@/atoms/cleaningGroupsAtoms";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import GroupIcon from "@/Components/Icons/GroupIcon";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { sortArrayByProperty } from "@/functions/sortObjects";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { ICleaningGroup } from "@/types/cleaning";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom, useSetAtom } from "jotai";
import {
    Layers,
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2,
    User,
    Users,
} from "lucide-react";
import Router from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

function CleaningGroupsPage() {
    const { congregation } = useCongregationContext();
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const deleteCleaningGroup = useSetAtom(deleteCleaningGroupAtom);

    const [searchTerm, setSearchTerm] = useState("");
    const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const url = congregation
        ? `${API_ROUTES.CLEANING_GROUPS}/congregation/${congregation.id}`
        : "";
    const { data, mutate, isLoading } = useAuthorizedFetch<ICleaningGroup[]>(url, {
        allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
    });

    useEffect(() => {
        setPageActive("Grupos de Limpeza");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Grupos de Limpeza", link: "/congregacao/grupos-limpeza" },
        ]);
    }, [setPageActive, setCrumbs]);

    const sortedGroups = useMemo(() => {
        if (!data) return [];
        return sortArrayByProperty(data, "name");
    }, [data]);

    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) return sortedGroups;
        const term = searchTerm.toLowerCase();
        return sortedGroups.filter(
            (g) =>
                g.name.toLowerCase().includes(term) ||
                g.publishers?.some(
                    (p) =>
                        p.fullName.toLowerCase().includes(term) ||
                        p.nickname?.toLowerCase().includes(term)
                )
        );
    }, [sortedGroups, searchTerm]);

    const totalMembers = useMemo(() => {
        return sortedGroups.reduce(
            (acc, curr) => acc + (curr.publishers?.length || 0),
            0
        );
    }, [sortedGroups]);

    async function handleDelete(groupId: string) {
        setIsDeleting(true);
        try {
            await deleteCleaningGroup(groupId);
            toast.success("Grupo de limpeza excluído com sucesso!");
            setDeleteGroupId(null);
            await mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir grupo de limpeza.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Grupos de Limpeza" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Cabeçalho Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 ">
                                <GroupIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-typography-800">
                                    Grupos de Limpeza
                                </h1>
                                <p className="text-sm text-typography-500">
                                    Organização dos grupos de publicadores responsáveis pela manutenção do Salão.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => Router.push("/congregacao/grupos-limpeza/add")}
                            className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Novo Grupo</span>
                        </Button>
                    </div>
                </div>

                {/* Barra de Métricas e Busca */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-700">
                            <Layers className="w-4 h-4 text-primary-200" />
                            <span>{sortedGroups.length} grupos cadastrados</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Users className="w-4 h-4" />
                            <span>{totalMembers} publicadores vinculados</span>
                        </div>
                    </div>

                    {/* Barra de busca */}
                    <div className="relative min-w-[260px]">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-typography-400" />
                        <input
                            type="text"
                            placeholder="Buscar grupo ou membro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-sm"
                        />
                    </div>
                </div>

                {/* Grid de Cards dos Grupos de Limpeza */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                        <p className="text-sm text-typography-500">
                            Carregando grupos de limpeza...
                        </p>
                    </div>
                ) : sortedGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                        <GroupIcon className="w-12 h-12 text-typography-400 mb-3" />
                        <h3 className="text-base font-semibold text-typography-700">
                            Nenhum grupo de limpeza cadastrado
                        </h3>
                        <p className="text-sm text-typography-500 mt-1 max-w-md">
                            Crie os grupos para distribuir a escala e as semanas de limpeza.
                        </p>
                        <Button
                            onClick={() => Router.push("/congregacao/grupos-limpeza/add")}
                            className="mt-6 gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Criar Primeiro Grupo</span>
                        </Button>
                    </div>
                ) : filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-surface-100 rounded-2xl border border-surface-300 text-center">
                        <p className="text-sm text-typography-500">
                            Nenhum grupo encontrado com o termo "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredGroups.map((group) => {
                            const memberCount = group.publishers?.length || 0;

                            return (
                                <div
                                    key={group.id}
                                    className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <div className="space-y-4">
                                        {/* Header do Card */}
                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-surface-300">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-xl bg-primary-200/10 text-primary-200  flex items-center justify-center font-bold text-sm">
                                                    {group.name.charAt(0).toUpperCase()}
                                                </div>
                                                <h3 className="font-bold text-base text-typography-800 line-clamp-1">
                                                    {group.name}
                                                </h3>
                                            </div>

                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-100 text-typography-600 border border-surface-300">
                                                {memberCount} {memberCount === 1 ? "membro" : "membros"}
                                            </span>
                                        </div>

                                        {/* Lista de Membros */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-500">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Publicadores:</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                                {group.publishers && group.publishers.length > 0 ? (
                                                    group.publishers.map((pub) => (
                                                        <span
                                                            key={pub.id}
                                                            className="px-2.5 py-1 rounded-lg text-xs bg-surface-100 text-typography-700 border border-surface-300 font-medium"
                                                        >
                                                            {pub.nickname?.trim() || pub.fullName?.trim()}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-typography-400 italic">
                                                        Nenhum membro vinculado ao grupo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-surface-300">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                Router.push(
                                                    `/congregacao/grupos-limpeza/edit/${group.id}`
                                                )
                                            }
                                            className="gap-1.5 text-xs font-medium rounded-xl h-8 px-3"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span>Editar</span>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDeleteGroupId(group.id)}
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 rounded-xl h-8 px-2.5"
                                            title="Excluir grupo de limpeza"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Exclusão */}
            <Dialog
                open={!!deleteGroupId}
                onOpenChange={(open) => !open && setDeleteGroupId(null)}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Excluir Grupo de Limpeza?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja remover este grupo de limpeza? As escalas futuras vinculadas poderão ser afetadas.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteGroupId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteGroupId && handleDelete(deleteGroupId)}
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

CleaningGroupsPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "CLEANING_MANAGER",
]);

export default CleaningGroupsPage;
