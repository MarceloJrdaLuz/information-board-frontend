import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { deleteEmergencyContactAtom } from "@/atoms/emergencyContactAtoms";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import EmergencyContactIcon from "@/Components/Icons/PhoneContactIcon";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { IEmergencyContact } from "@/types/types";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom, useSetAtom } from "jotai";
import {
    CheckCircle2,
    Layers,
    Loader2,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    UserCheck,
    XCircle,
} from "lucide-react";
import Router from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

function EmergencyContactsPage() {
    const { congregation } = useCongregationContext();
    const congregation_id = congregation?.id;
    const deleteEmergencyContact = useSetAtom(deleteEmergencyContactAtom);

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const [searchTerm, setSearchTerm] = useState("");
    const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchConfig = congregation_id ? `/emergencyContacts/${congregation_id}` : "";
    const { data: emergencyContacts, mutate, isLoading } = useAuthorizedFetch<
        IEmergencyContact[]
    >(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"],
    });

    useEffect(() => {
        setPageActive("Contatos de emergência");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Contatos de emergência", link: "/congregacao/contatos-emergencia" },
        ]);
    }, [setPageActive, setCrumbs]);

    const filteredContacts = useMemo(() => {
        if (!emergencyContacts) return [];
        if (!searchTerm.trim()) return emergencyContacts;
        const term = searchTerm.toLowerCase();
        return emergencyContacts.filter(
            (c) =>
                c.name.toLowerCase().includes(term) ||
                (c.phone && c.phone.toLowerCase().includes(term))
        );
    }, [emergencyContacts, searchTerm]);

    const stats = useMemo(() => {
        if (!emergencyContacts) return { total: 0, tj: 0, nonTj: 0 };
        return {
            total: emergencyContacts.length,
            tj: emergencyContacts.filter((c) => c.isTj).length,
            nonTj: emergencyContacts.filter((c) => !c.isTj).length,
        };
    }, [emergencyContacts]);

    async function handleDelete(contactId: string) {
        setIsDeleting(true);
        try {
            await deleteEmergencyContact(contactId);
            toast.success("Contato de emergência excluído com sucesso!");
            setDeleteContactId(null);
            await mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir contato de emergência.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Contatos de Emergência"} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Cabeçalho Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 ">
                                <EmergencyContactIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-typography-800">
                                    Contatos de Emergência
                                </h1>
                                <p className="text-sm text-typography-500">
                                    Lista de contatos e telefones de emergência para assistência e cuidado da congregação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() =>
                                Router.push("/congregacao/contatos-emergencia/add")
                            }
                            className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Novo Contato</span>
                        </Button>
                    </div>
                </div>

                {/* Barra de Métricas e Busca */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-700">
                            <Layers className="w-4 h-4 text-primary-200" />
                            <span>{stats.total} contatos cadastrados</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <UserCheck className="w-4 h-4" />
                            <span>{stats.tj} Testemunhas de Jeová</span>
                        </div>
                    </div>

                    {/* Barra de busca */}
                    <div className="relative min-w-[260px]">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-typography-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface-100 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-sm"
                        />
                    </div>
                </div>

                {/* Grid de Cards de Contatos */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                        <p className="text-sm text-typography-500">
                            Carregando contatos de emergência...
                        </p>
                    </div>
                ) : !emergencyContacts || emergencyContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                        <EmergencyContactIcon className="w-12 h-12 text-typography-400 mb-3" />
                        <h3 className="text-base font-semibold text-typography-700">
                            Nenhum contato de emergência cadastrado
                        </h3>
                        <p className="text-sm text-typography-500 mt-1 max-w-md">
                            Cadastre contatos de parentes e responsáveis para apoio em situações de necessidade.
                        </p>
                        <Button
                            onClick={() =>
                                Router.push("/congregacao/contatos-emergencia/add")
                            }
                            className="mt-6 gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Cadastrar Primeiro Contato</span>
                        </Button>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-surface-100 rounded-2xl border border-surface-300 text-center">
                        <p className="text-sm text-typography-500">
                            Nenhum contato encontrado com o termo "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <div className="space-y-4">
                                    {/* Header do Card: Nome e Tag TJ */}
                                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-surface-300">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-full bg-primary-200/10 text-primary-200  flex items-center justify-center font-bold text-sm shrink-0">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-base text-typography-800 truncate">
                                                    {contact.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${
                                                contact.isTj
                                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                                    : "bg-surface-100 text-typography-600 border border-surface-300"
                                            }`}
                                        >
                                            {contact.isTj ? (
                                                <>
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>TJ</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 text-typography-400" />
                                                    <span>Não-TJ</span>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {/* Telefone Clicável */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-typography-700">
                                            <div className="p-1.5 rounded-lg bg-surface-100 text-primary-200 border border-surface-300">
                                                <Phone className="w-3.5 h-3.5" />
                                            </div>
                                            {contact.phone ? (
                                                <a
                                                    href={`tel:${contact.phone}`}
                                                    className="font-semibold text-sm text-primary-200 hover:underline tracking-wide"
                                                >
                                                    {contact.phone}
                                                </a>
                                            ) : (
                                                <span className="text-typography-400 italic text-xs">
                                                    Sem telefone cadastrado
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
                                                `/congregacao/contatos-emergencia/edit/${contact.id}`
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
                                        onClick={() => setDeleteContactId(contact.id)}
                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 rounded-xl h-8 px-2.5"
                                        title="Excluir contato"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Exclusão */}
            <Dialog
                open={!!deleteContactId}
                onOpenChange={(open) => !open && setDeleteContactId(null)}
            >
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Excluir Contato de Emergência?</span>
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja excluir este contato de emergência? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteContactId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteContactId && handleDelete(deleteContactId)}
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

EmergencyContactsPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "PUBLISHERS_MANAGER",
]);

export default EmergencyContactsPage;
