import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { deleteFieldServiceAtom } from "@/atoms/fieldServiceAtoms";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import PrechingHomeIcon from "@/Components/Icons/PreachingHomeIcon";
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
import {
    FIELD_SERVICE_TYPE_LABEL,
    ITemplateFieldService,
    Weekday,
    WEEKDAY_LABEL,
} from "@/types/fieldService";
import { formatHour } from "@/utils/formatTime";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom, useSetAtom } from "jotai";
import {
    CalendarDays,
    Clock,
    Layers,
    Loader2,
    MapPin,
    Pencil,
    Plus,
    Trash2,
    UserCheck,
    Users,
} from "lucide-react";
import Router from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

export default function FieldServiceTemplatesPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const { congregation } = useCongregationContext();
    const deleteFieldService = useSetAtom(deleteFieldServiceAtom);

    const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: templates, mutate, isLoading } = useAuthorizedFetch<ITemplateFieldService[]>(
        congregation
            ? `${API_ROUTES.FIELD_SERVICE_TEMPLATES}/congregation/${congregation.id}`
            : "",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
        }
    );

    useEffect(() => {
        setPageActive("Saídas de Campo");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Saídas de Campo", link: "/congregacao/saidas-campo" },
        ]);
    }, [setPageActive, setCrumbs]);

    const stats = useMemo(() => {
        if (!templates) return { total: 0, rotation: 0, fixed: 0 };
        return {
            total: templates.length,
            rotation: templates.filter((t) => t.type === "ROTATION").length,
            fixed: templates.filter((t) => t.type === "FIXED").length,
        };
    }, [templates]);

    async function handleDelete(template_id: string) {
        setIsDeleting(true);
        try {
            await deleteFieldService(template_id);
            toast.success("Saída de campo excluída com sucesso!");
            setDeleteTemplateId(null);
            await mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir saída de campo.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Saídas de Campo" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Cabeçalho Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 ">
                                <PrechingHomeIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-typography-800">
                                    Saídas de Campo
                                </h1>
                                <p className="text-sm text-typography-500">
                                    Configuração das saídas regulares da congregação (horários, locais e dirigentes).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => Router.push("/congregacao/saidas-campo/add")}
                            className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nova Saída</span>
                        </Button>
                    </div>
                </div>

                {/* Barra de Métricas */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-700">
                        <Layers className="w-4 h-4 text-primary-200" />
                        <span>{stats.total} saídas cadastradas</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-primary-200">
                        <Users className="w-4 h-4" />
                        <span>{stats.rotation} em Rodízio</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <UserCheck className="w-4 h-4" />
                        <span>{stats.fixed} com Dirigente Fixo</span>
                    </div>
                </div>

                {/* Lista / Grid de Cards de Saídas de Campo */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                        <p className="text-sm text-typography-500">
                            Carregando saídas de campo...
                        </p>
                    </div>
                ) : !templates || templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                        <PrechingHomeIcon className="w-12 h-12 text-typography-400 mb-3" />
                        <h3 className="text-base font-semibold text-typography-700">
                            Nenhuma saída de campo cadastrada
                        </h3>
                        <p className="text-sm text-typography-500 mt-1 max-w-md">
                            Cadastre os horários e locais regulares de saída de campo para começar a gerar as programações.
                        </p>
                        <Button
                            onClick={() => Router.push("/congregacao/saidas-campo/add")}
                            className="mt-6 gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Cadastrar Primeira Saída</span>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {templates.map((template) => {
                            const isRotation = template.type === "ROTATION";
                            const membersCount = template.rotation_members?.length || 0;

                            return (
                                <div
                                    key={template.id}
                                    className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <div className="space-y-4">
                                        {/* Header do Card: Dia da Semana e Tag de Tipo */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-xl bg-primary-200/10 text-primary-200 ">
                                                    <CalendarDays className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-typography-800">
                                                        {WEEKDAY_LABEL[template.weekday as Weekday]}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-typography-500 mt-0.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{formatHour(template.time)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    isRotation
                                                        ? "bg-primary-200/10 text-primary-200 border border-primary-200/20"
                                                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                                }`}
                                            >
                                                {FIELD_SERVICE_TYPE_LABEL[template.type]}
                                            </span>
                                        </div>

                                        {/* Detalhes: Local e Dirigente / Rodízio */}
                                        <div className="space-y-2.5 pt-2 border-t border-surface-300 text-xs">
                                            <div className="flex items-start gap-2 text-typography-700">
                                                <MapPin className="w-4 h-4 text-typography-400 shrink-0 mt-0.5" />
                                                <span className="font-medium line-clamp-2">
                                                    {template.location}
                                                </span>
                                            </div>

                                            {isRotation ? (
                                                <div className="flex items-center gap-2 text-primary-200 font-semibold bg-primary-200/5 dark:bg-primary-200/10 p-2 rounded-xl">
                                                    <Users className="w-4 h-4 shrink-0" />
                                                    <span>{membersCount} dirigentes no rodízio</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl">
                                                    <UserCheck className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">
                                                        Dirigente:{" "}
                                                        {template.leader?.nickname ||
                                                            template.leader?.fullName ||
                                                            "—"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ações Rápidas */}
                                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-surface-300">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                Router.push(
                                                    `/congregacao/saidas-campo/edit/${template.id}`
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
                                            onClick={() => setDeleteTemplateId(template.id)}
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 rounded-xl h-8 px-2.5"
                                            title="Excluir saída de campo"
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

            {/* Modal de Confirmação de Exclusão */}
            <Dialog
                open={!!deleteTemplateId}
                onOpenChange={(open) => !open && setDeleteTemplateId(null)}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Excluir Saída de Campo?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja excluir este modelo de saída de campo? Esta ação removerá as configurações vinculadas.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTemplateId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTemplateId && handleDelete(deleteTemplateId)}
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

FieldServiceTemplatesPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "FIELD_SERVICE_MANAGER",
]);
