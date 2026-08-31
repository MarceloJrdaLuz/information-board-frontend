import React, { useEffect, useState, useMemo } from "react";
import ContentDashboard from "@/Components/ContentDashboard";
import BreadCrumbs from "@/Components/BreadCrumbs";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useAtom } from "jotai";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { IPublisherMini } from "@/types/midweek";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import {
    CalendarOff,
    Search,
    Plus,
    Trash2,
    ArrowLeft,
    Calendar,
    User,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    UserCheck,
    Filter
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");
dayjs.extend(isBetween);

export interface IPublisherUnavailability {
    id: string;
    publisher_id: string;
    startDate: string;
    endDate: string;
    reason: string | null;
    created_at: string;
    publisher?: IPublisherMini;
}

function PublisherUnavailabilitiesPage() {
    const router = useRouter();
    const { publisherId: initialPublisherId } = router.query;
    const { user } = useAuthContext();
    const congregationId = user?.congregation?.id;

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const [unavailabilities, setUnavailabilities] = useState<IPublisherUnavailability[]>([]);
    const [publishers, setPublishers] = useState<IPublisherMini[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "past">("active");
    const [selectedPublisherFilter, setSelectedPublisherFilter] = useState<string>("");

    // Modal de Cadastro
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPublisherId, setSelectedPublisherId] = useState("");
    const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().add(7, "day").format("YYYY-MM-DD"));
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Modal de Exclusão
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingLoading, setDeletingLoading] = useState(false);

    useEffect(() => {
        setPageActive("Indisponibilidades");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Publicadores", link: "/congregacao/publicadores" }
        ]);
    }, [setPageActive, setCrumbs]);

    // Se veio query param com publisherId, abre o modal ou filtra por ele
    useEffect(() => {
        if (initialPublisherId && typeof initialPublisherId === "string") {
            setSelectedPublisherId(initialPublisherId);
            setSelectedPublisherFilter(initialPublisherId);
            setIsCreateModalOpen(true);
        }
    }, [initialPublisherId]);

    const fetchData = async () => {
        if (!congregationId) return;
        setLoading(true);
        try {
            const [unavRes, pubRes] = await Promise.all([
                api.get(`/midweek/unavailabilities/congregation/${congregationId}`),
                api.get(`/publishers/congregationId/${congregationId}`)
            ]);
            setUnavailabilities(unavRes.data);
            setPublishers(pubRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar indisponibilidades.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [congregationId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPublisherId) {
            toast.warn("Selecione um publicador.");
            return;
        }
        if (!startDate || !endDate) {
            toast.warn("Informe a data inicial e final.");
            return;
        }
        if (dayjs(endDate).isBefore(dayjs(startDate))) {
            toast.warn("A data final não pode ser anterior à data inicial.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/midweek/unavailabilities", {
                publisher_id: selectedPublisherId,
                startDate,
                endDate,
                reason: reason.trim() || null
            });
            toast.success("Indisponibilidade cadastrada com sucesso!");
            setIsCreateModalOpen(false);
            // Reset
            setSelectedPublisherId("");
            setReason("");
            setStartDate(dayjs().format("YYYY-MM-DD"));
            setEndDate(dayjs().add(7, "day").format("YYYY-MM-DD"));
            fetchData();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao cadastrar indisponibilidade.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setDeletingLoading(true);
        try {
            await api.delete(`/midweek/unavailabilities/${deletingId}`);
            toast.success("Indisponibilidade removida com sucesso!");
            setDeletingId(null);
            fetchData();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            toast.error("Erro ao excluir indisponibilidade.");
        } finally {
            setDeletingLoading(false);
        }
    };

    // Filtros
    const filteredUnavailabilities = useMemo(() => {
        const today = dayjs().format("YYYY-MM-DD");

        return unavailabilities.filter((item) => {
            if (selectedPublisherFilter && item.publisher_id !== selectedPublisherFilter) {
                return false;
            }

            const pubName = item.publisher?.fullName?.toLowerCase() || "";
            const pubNick = item.publisher?.nickname?.toLowerCase() || "";
            const r = item.reason?.toLowerCase() || "";
            const term = searchTerm.toLowerCase();

            const matchesSearch = !term || pubName.includes(term) || pubNick.includes(term) || r.includes(term);
            if (!matchesSearch) return false;

            const isPast = dayjs(item.endDate).isBefore(today, "day");
            const isActiveOrFuture = !isPast;

            if (statusFilter === "active") return isActiveOrFuture;
            if (statusFilter === "past") return isPast;
            return true;
        });
    }, [unavailabilities, searchTerm, statusFilter, selectedPublisherFilter]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Indisponibilidades"} />

            <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-100 p-4 sm:p-5 rounded-xl border border-surface-300 shadow-sm gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/congregacao/publicadores")}
                            className="h-9 w-9 text-typography-700 hover:bg-surface-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-typography-900 flex items-center gap-2">
                                <CalendarOff className="h-5 w-5 text-amber-500" />
                                Indisponibilidades e Ausências de Publicadores
                            </h2>
                            <p className="text-xs text-typography-500 mt-0.5">
                                Registre ausências, viagens e impedimentos de publicadores para consultas e programações de toda a congregação.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm h-9 px-4 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nova Indisponibilidade</span>
                    </Button>
                </div>

                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-100 p-3 rounded-xl border border-surface-300 shadow-sm">
                    {/* Busca */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="h-4 w-4 text-typography-400 absolute left-2.5 top-2.5" />
                            <input
                                type="text"
                                placeholder="Buscar publicador ou motivo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-surface-300 bg-surface-200 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                            />
                        </div>

                        {selectedPublisherFilter && (
                            <button
                                type="button"
                                onClick={() => setSelectedPublisherFilter("")}
                                className="text-xs text-primary-200 hover:underline flex items-center gap-1 shrink-0"
                            >
                                Limpar filtro de pessoa
                            </button>
                        )}
                    </div>

                    {/* Abas de Status */}
                    <div className="flex items-center gap-1 bg-surface-200 p-1 rounded-lg border border-surface-300 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setStatusFilter("active")}
                            className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                                statusFilter === "active"
                                    ? "bg-surface-100 text-typography-900 shadow-sm"
                                    : "text-typography-500 hover:text-typography-900"
                            }`}
                        >
                            Ativas e Futuras
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("all")}
                            className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                                statusFilter === "all"
                                    ? "bg-surface-100 text-typography-900 shadow-sm"
                                    : "text-typography-500 hover:text-typography-900"
                            }`}
                        >
                            Todas ({unavailabilities.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter("past")}
                            className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                                statusFilter === "past"
                                    ? "bg-surface-100 text-typography-900 shadow-sm"
                                    : "text-typography-500 hover:text-typography-900"
                            }`}
                        >
                            Histórico
                        </button>
                    </div>
                </div>

                {/* Lista / Grid de Indisponibilidades */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-typography-500 gap-3 bg-surface-100 rounded-xl border border-surface-300">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-200" />
                        <span className="text-xs">Carregando indisponibilidades...</span>
                    </div>
                ) : filteredUnavailabilities.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-surface-100 rounded-xl border border-surface-300 p-6">
                        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <CalendarOff className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-bold text-typography-900">
                            Nenhuma indisponibilidade encontrada
                        </h4>
                        <p className="text-xs text-typography-500 max-w-sm">
                            {searchTerm
                                ? "Tente alterar os termos da busca."
                                : "Nenhum publicador possui período de ausência registrado com o filtro selecionado."}
                        </p>
                        {!searchTerm && (
                            <Button
                                size="sm"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-2 bg-primary-200 hover:opacity-90 text-white font-semibold text-xs"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Cadastrar Primeira Ausência
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUnavailabilities.map((item) => {
                            const today = dayjs();
                            const start = dayjs(item.startDate);
                            const end = dayjs(item.endDate);

                            const isCurrent = today.isBetween(start, end, "day", "[]");
                            const isFuture = start.isAfter(today, "day");
                            const daysCount = end.diff(start, "day") + 1;

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-surface-100 rounded-xl border p-4 flex flex-col justify-between shadow-xs transition-all ${
                                        isCurrent
                                            ? "border-amber-400/60 ring-1 ring-amber-400/20 bg-amber-500/5"
                                            : isFuture
                                                ? "border-blue-300/60 bg-blue-500/5"
                                                : "border-surface-300 opacity-70"
                                    }`}
                                >
                                    <div className="flex flex-col gap-2.5">
                                        {/* Status e Ação */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                    isCurrent
                                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                                        : isFuture
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                                            : "bg-surface-200 text-typography-500"
                                                }`}
                                            >
                                                {isCurrent && <Clock className="h-3 w-3 animate-pulse" />}
                                                {isCurrent ? "Ausente Agora" : isFuture ? "Ausência Futura" : "Encerrada"}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeletingId(item.id)}
                                                className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                                title="Excluir Indisponibilidade"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {/* Nome do Publicador */}
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col truncate">
                                                <span className="font-bold text-xs text-typography-900 truncate">
                                                    {item.publisher?.fullName || "Publicador"}
                                                </span>
                                                <span className="text-[10px] text-typography-500">
                                                    {item.publisher?.nickname ? `Conhecido como: ${item.publisher.nickname}` : "Sem apelido"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Período */}
                                        <div className="bg-surface-200/60 p-2 rounded-lg border border-surface-300/60 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-typography-800 font-medium">
                                                <Calendar className="h-3.5 w-3.5 text-primary-200" />
                                                <span>
                                                    {dayjs(item.startDate).format("DD/MM/YYYY")} até {dayjs(item.endDate).format("DD/MM/YYYY")}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-typography-500 font-semibold bg-surface-100 px-1.5 py-0.5 rounded border border-surface-300">
                                                {daysCount} {daysCount === 1 ? "dia" : "dias"}
                                            </span>
                                        </div>

                                        {/* Motivo */}
                                        {item.reason ? (
                                            <div className="text-xs text-typography-600 bg-surface-200/30 p-2 rounded-lg border border-dashed border-surface-300">
                                                <span className="font-semibold text-typography-700">Motivo: </span>
                                                {item.reason}
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-typography-400 italic">
                                                Nenhum motivo específico informado.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Criação */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md bg-surface-100 border border-surface-300 p-5">
                    <DialogHeader className="pb-3 border-b border-surface-300">
                        <DialogTitle className="text-base font-bold text-typography-900 flex items-center gap-2">
                            <CalendarOff className="h-5 w-5 text-amber-500" />
                            Nova Indisponibilidade / Ausência
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-3">
                        {/* Selecionar Publicador */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-typography-800">
                                Publicador <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedPublisherId}
                                onChange={(e) => setSelectedPublisherId(e.target.value)}
                                required
                                className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-surface-200 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                            >
                                <option value="">Selecione o publicador...</option>
                                {publishers.map((pub) => (
                                    <option key={pub.id} value={pub.id}>
                                        {pub.fullName} {pub.nickname ? `(${pub.nickname})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Datas (Início e Fim) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-typography-800">
                                    Data Inicial <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-surface-200 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-typography-800">
                                    Data Final <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-surface-200 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                />
                            </div>
                        </div>

                        {/* Motivo */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-typography-800">
                                Motivo / Observação <span className="text-typography-400 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Viagem, Férias, Trabalho, Saúde..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-surface-200 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                            />
                        </div>

                        <DialogFooter className="pt-3 border-t border-surface-300 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-xs border-surface-300 hover:bg-surface-200"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={submitting}
                                className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center gap-1.5"
                            >
                                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                <span>Cadastrar</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog open={Boolean(deletingId)} onOpenChange={() => setDeletingId(null)}>
                <DialogContent className="max-w-sm bg-surface-100 border border-surface-300 p-5">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-base font-bold text-typography-900 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Excluir Indisponibilidade
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-xs text-typography-600 mt-2">
                        Tem certeza de que deseja remover este registro de indisponibilidade? O publicador voltará a estar disponível para designações nesse período.
                    </p>

                    <DialogFooter className="pt-4 border-t border-surface-300 gap-2 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingId(null)}
                            className="text-xs border-surface-300 hover:bg-surface-200"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={deletingLoading}
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs flex items-center gap-1.5"
                        >
                            {deletingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            <span>Confirmar Exclusão</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentDashboard>
    );
}

PublisherUnavailabilitiesPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "PUBLISHERS_MANAGER",
    "PUBLISHERS_VIEWER",
    "MIDWEEK_MANAGER",
    "TALK_MANAGER",
    "FIELD_SERVICE_MANAGER",
    "PUBLIC_WITNESS_MANAGER"
]);

export default PublisherUnavailabilitiesPage;
