import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { deleteFamilyAtom } from "@/atoms/familyAtoms";
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
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { IFamily } from "@/types/family";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom, useSetAtom } from "jotai";
import {
    HeartHandshake,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2,
    User,
    UserCheck,
    Users,
} from "lucide-react";
import Router from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

function FamiliesPage() {
    const { congregation } = useCongregationContext();
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const setDeleteFamily = useSetAtom(deleteFamilyAtom);

    const [searchTerm, setSearchTerm] = useState("");
    const [deleteFamilyId, setDeleteFamilyId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const url = congregation
        ? `${API_ROUTES.FAMILIES}/congregation/${congregation.id}`
        : "";
    const { data: families, mutate, isLoading } = useAuthorizedFetch<IFamily[]>(url, {
        allowedRoles: ["ADMIN_CONGREGATION", "FAMILY_MANAGER"],
    });

    useEffect(() => {
        setPageActive("Famílias");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Famílias", link: "/congregacao/familias" },
        ]);
    }, [setPageActive, setCrumbs]);

    const filteredFamilies = useMemo(() => {
        if (!families) return [];
        if (!searchTerm.trim()) return families;
        const term = searchTerm.toLowerCase();
        return families.filter(
            (f) =>
                f.name.toLowerCase().includes(term) ||
                (f.responsible &&
                    (f.responsible.fullName.toLowerCase().includes(term) ||
                        f.responsible.nickname?.toLowerCase().includes(term))) ||
                f.members?.some(
                    (m) =>
                        m.fullName.toLowerCase().includes(term) ||
                        m.nickname?.toLowerCase().includes(term)
                )
        );
    }, [families, searchTerm]);

    const stats = useMemo(() => {
        if (!families) return { total: 0, totalMembers: 0 };
        const totalMembers = families.reduce((acc, f) => {
            const head = f.responsible ? 1 : 0;
            const otherMembers = (f.members || []).filter(
                (m) => m.id !== f.responsible_publisher_id
            ).length;
            return acc + head + otherMembers;
        }, 0);

        return {
            total: families.length,
            totalMembers,
        };
    }, [families]);

    async function handleDelete(familyId: string) {
        setIsDeleting(true);
        try {
            await setDeleteFamily(familyId);
            toast.success("Família excluída com sucesso!");
            setDeleteFamilyId(null);
            await mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir família.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Famílias" />

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
                                    Famílias da Congregação
                                </h1>
                                <p className="text-sm text-typography-500">
                                    Gestão dos núcleos familiares, chefes de família e membros associados.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => Router.push("/congregacao/familias/add")}
                            className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nova Família</span>
                        </Button>
                    </div>
                </div>

                {/* Barra de Métricas e Busca */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-700">
                            <Layers className="w-4 h-4 text-primary-200" />
                            <span>{stats.total} famílias cadastradas</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Users className="w-4 h-4" />
                            <span>{stats.totalMembers} pessoas vinculadas</span>
                        </div>
                    </div>

                    {/* Barra de busca */}
                    <div className="relative min-w-[260px]">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-typography-400" />
                        <input
                            type="text"
                            placeholder="Buscar por família, responsável ou membro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-sm"
                        />
                    </div>
                </div>

                {/* Grid de Cards de Famílias */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                        <p className="text-sm text-typography-500">
                            Carregando famílias...
                        </p>
                    </div>
                ) : !families || families.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                        <GroupIcon className="w-12 h-12 text-typography-400 mb-3" />
                        <h3 className="text-base font-semibold text-typography-700">
                            Nenhuma família cadastrada
                        </h3>
                        <p className="text-sm text-typography-500 mt-1 max-w-md">
                            Cadastre os grupos familiares para organizar as visitas de pastoreio e relatórios.
                        </p>
                        <Button
                            onClick={() => Router.push("/congregacao/familias/add")}
                            className="mt-6 gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Cadastrar Primeira Família</span>
                        </Button>
                    </div>
                ) : filteredFamilies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-surface-100 rounded-2xl border border-surface-300 text-center">
                        <p className="text-sm text-typography-500">
                            Nenhuma família encontrada com o termo "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredFamilies.map((family) => {
                            const otherMembers = (family.members || []).filter(
                                (m) => m.id !== family.responsible_publisher_id
                            );
                            const totalCount = (family.responsible ? 1 : 0) + otherMembers.length;

                            return (
                                <div
                                    key={family.id}
                                    className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <div className="space-y-4">
                                        {/* Header do Card */}
                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-surface-300">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-10 h-10 rounded-xl bg-primary-200/10 text-primary-200  flex items-center justify-center font-bold text-sm shrink-0">
                                                    {family.name.charAt(0).toUpperCase()}
                                                </div>
                                                <h3 className="font-bold text-base text-typography-800 line-clamp-1">
                                                    Família {family.name}
                                                </h3>
                                            </div>

                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-100 text-typography-600 border border-surface-300 shrink-0">
                                                {totalCount} {totalCount === 1 ? "membro" : "membros"}
                                            </span>
                                        </div>

                                        {/* Chefe de Família / Responsável */}
                                        <div className="space-y-2">
                                            <div className="p-3 rounded-xl bg-primary-200/5 dark:bg-primary-200/10 border border-primary-200/20">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary-200 uppercase tracking-wide mb-1">
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    <span>Chefe de Família:</span>
                                                </div>
                                                <p className="text-sm font-semibold text-typography-800 truncate">
                                                    {family.responsible?.nickname ||
                                                        family.responsible?.fullName ||
                                                        "—"}
                                                </p>
                                            </div>

                                            {/* Outros Membros */}
                                            {otherMembers.length > 0 && (
                                                <div className="space-y-1.5 pt-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-500">
                                                        <Users className="w-3.5 h-3.5" />
                                                        <span>Outros membros:</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                                                        {otherMembers.map((m) => (
                                                            <span
                                                                key={m.id}
                                                                className="px-2.5 py-1 rounded-lg text-xs bg-surface-100 text-typography-700 border border-surface-300 font-medium"
                                                            >
                                                                {m.nickname?.trim() || m.fullName?.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-surface-300">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                Router.push(
                                                    `/congregacao/familias/edit/${family.id}`
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
                                            onClick={() => setDeleteFamilyId(family.id)}
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 rounded-xl h-8 px-2.5"
                                            title="Excluir família"
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
                open={!!deleteFamilyId}
                onOpenChange={(open) => !open && setDeleteFamilyId(null)}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Excluir Família?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja remover esta família? Os publicadores continuarão cadastrados na congregação individualmente.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteFamilyId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteFamilyId && handleDelete(deleteFamilyId)}
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

FamiliesPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "FAMILY_MANAGER"]);

export default FamiliesPage;
