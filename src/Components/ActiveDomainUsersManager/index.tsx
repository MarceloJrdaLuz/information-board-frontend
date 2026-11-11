import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { useAuthContext } from "@/context/AuthContext";
import { getInitials } from "@/functions/getInitials";
import { api } from "@/services/api";
import { ICongregation } from "@/types/types";
import {
    AlertCircle,
    Building2,
    Hash,
    KeyRound,
    Loader2,
    Mail,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
    User,
    UserCheck,
    UserMinus,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import RevokeAccessModal from "../RevokeAccessModal";

interface IDomainUser {
    id: string;
    email: string;
    fullName: string | null;
    code: string;
    publisher: {
        id: string;
        fullName: string;
        situation?: string;
    } | null;
    roles: {
        id: string;
        name: string;
        description?: string;
    }[];
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    ADMIN: { label: "Super Admin", color: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20" },
    ADMIN_CONGREGATION: { label: "Admin Congregação", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20" },
    CLEANING_MANAGER: { label: "Limpeza", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" },
    FIELD_SERVICE_MANAGER: { label: "Campo", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" },
    PUBLIC_WITNESS_MANAGER: { label: "Testemunho Público", color: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/20" },
    MIDWEEK_MANAGER: { label: "Meio de Semana", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" },
    TALK_MANAGER: { label: "Discursos / Oradores", color: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20" },
    PUBLISHERS_MANAGER: { label: "Gerenciar Publicadores", color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20" },
    PUBLISHERS_VIEWER: { label: "Ver Publicadores", color: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20" },
    NOTICES_MANAGER: { label: "Anúncios", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20" },
};

export default function ActiveDomainUsersManager() {
    const { user: currentUser } = useAuthContext();
    const [congregations, setCongregations] = useState<ICongregation[]>([]);
    const [selectedCongregationId, setSelectedCongregationId] = useState<string>(
        currentUser?.congregation?.id || ""
    );
    const [users, setUsers] = useState<IDomainUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [userToRevoke, setUserToRevoke] = useState<IDomainUser | null>(null);

    const isSuperAdmin = currentUser?.roles?.some((r) => r.name === "ADMIN");

    // Super Admin: carregar congregações
    useEffect(() => {
        if (isSuperAdmin) {
            api.get<ICongregation[]>("/congregations")
                .then((res) => {
                    const list = res.data || [];
                    setCongregations(list);
                    if (!selectedCongregationId && list.length > 0) {
                        setSelectedCongregationId(list[0].id);
                    }
                })
                .catch((err) => console.error("Erro ao carregar congregações:", err));
        } else if (currentUser?.congregation?.id) {
            setSelectedCongregationId(currentUser.congregation.id);
        }
    }, [isSuperAdmin, currentUser?.congregation?.id, selectedCongregationId]);

    const loadUsers = useCallback(async () => {
        if (!selectedCongregationId) return;

        setLoading(true);
        try {
            const res = await api.get<IDomainUser[]>(`/users/${selectedCongregationId}`);
            setUsers(res.data || []);
        } catch (err: any) {
            console.error("Erro ao carregar usuários:", err);
            // Se for 404 (nenhum usuário), limpa
            if (err?.response?.status === 404) {
                setUsers([]);
            } else {
                toast.error("Erro ao carregar lista de usuários da congregação.");
            }
        } finally {
            setLoading(false);
        }
    }, [selectedCongregationId]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return users;

        return users.filter((u) => {
            const nameMatch = (u.fullName || "").toLowerCase().includes(term);
            const emailMatch = (u.email || "").toLowerCase().includes(term);
            const codeMatch = (u.code || "").toLowerCase().includes(term);
            const pubMatch = (u.publisher?.fullName || "").toLowerCase().includes(term);
            return nameMatch || emailMatch || codeMatch || pubMatch;
        });
    }, [users, searchTerm]);

    const currentCongregationName = useMemo(() => {
        if (isSuperAdmin) {
            return congregations.find((c) => c.id === selectedCongregationId)?.name || "";
        }
        return currentUser?.congregation?.name || "";
    }, [isSuperAdmin, congregations, selectedCongregationId, currentUser?.congregation?.name]);

    const handleConfirmRevoke = async () => {
        if (!userToRevoke || !selectedCongregationId) return;

        try {
            await api.delete(`/users/${userToRevoke.id}/congregation/${selectedCongregationId}`);
            toast.success(`Acesso de ${userToRevoke.fullName || userToRevoke.email} revogado com sucesso!`);
            loadUsers();
        } catch (err: any) {
            const message = err?.response?.data?.message || "Erro ao revogar acesso do usuário.";
            toast.error(message);
        }
    };

    return (
        <div className="w-full flex flex-col gap-5 animate-fade-in">
            {/* Seletor para Super Admin */}
            {isSuperAdmin && (
                <div className="w-full p-4 bg-surface-100 rounded-2xl border border-surface-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-typography-700">
                        <Building2 className="w-5 h-5 text-primary-200" />
                        <span className="text-xs sm:text-sm font-semibold">Congregação selecionada:</span>
                    </div>
                    <Select
                        value={selectedCongregationId}
                        onValueChange={(val) => setSelectedCongregationId(val)}
                    >
                        <SelectTrigger className="w-full sm:w-80">
                            <SelectValue placeholder="Selecione uma congregação" />
                        </SelectTrigger>
                        <SelectContent>
                            {congregations.map((cong) => (
                                <SelectItem key={cong.id} value={cong.id}>
                                    {cong.name} ({cong.city})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Toolbar: Busca e Atualizar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, e-mail, código ou publicador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-surface-100 border border-surface-300 placeholder:text-typography-400 text-typography-900 focus:outline-none focus:border-primary-200 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-typography-500 font-medium">
                        Total: <strong className="text-typography-800">{filteredUsers.length}</strong> {filteredUsers.length === 1 ? "usuário" : "usuários"}
                    </span>
                    <button
                        type="button"
                        onClick={loadUsers}
                        disabled={loading}
                        className="p-2 rounded-xl text-typography-500 hover:text-typography-900 hover:bg-surface-200 border border-surface-300 transition-colors cursor-pointer"
                        title="Recarregar lista"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Estado de Carregamento */}
            {loading && (
                <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-typography-400">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-200" />
                    <span className="text-xs sm:text-sm font-medium">Carregando usuários do domínio...</span>
                </div>
            )}

            {/* Lista Vazia */}
            {!loading && filteredUsers.length === 0 && (
                <div className="w-full py-14 flex flex-col items-center justify-center gap-3 text-center p-6 bg-surface-100 rounded-2xl border border-surface-300">
                    <Users className="w-12 h-12 text-typography-300 stroke-[1.5]" />
                    <h3 className="text-sm sm:text-base font-bold text-typography-800">
                        Nenhum usuário encontrado
                    </h3>
                    <p className="text-xs text-typography-500 max-w-sm">
                        {searchTerm
                            ? "Nenhum usuário corresponde aos termos pesquisados."
                            : "Não há contas de usuários com acesso vinculado a esta congregação no momento."}
                    </p>
                </div>
            )}

            {/* Grid de Usuários */}
            {!loading && filteredUsers.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-1">
                    {filteredUsers.map((u) => {
                        const isSelf = currentUser?.id === u.id;
                        const displayName = u.fullName || u.email;
                        const initials = getInitials(displayName);

                        return (
                            <div
                                key={u.id}
                                className={`w-full p-4 sm:p-4.5 rounded-2xl bg-surface-100 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-surface-400 ${
                                    isSelf ? "border-primary-500/30 bg-primary-500/[0.02]" : "border-surface-300"
                                }`}
                            >
                                {/* Info do Usuário */}
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-300 font-bold flex items-center justify-center text-xs shrink-0 border border-primary-500/20">
                                        {initials}
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-xs sm:text-sm font-bold text-typography-900 leading-tight">
                                                {displayName}
                                            </h4>
                                            {isSelf && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/15 text-primary-300 border border-primary-500/30">
                                                    Você
                                                </span>
                                            )}
                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-typography-400 bg-surface-200/80 border border-surface-300">
                                                #{u.code}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-typography-500">
                                            <span className="inline-flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span>{u.email}</span>
                                            </span>

                                            {u.publisher ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    <span>Publicador: {u.publisher.fullName}</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>Sem publicador vinculado</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Roles / Funções */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                            {u.roles && u.roles.length > 0 ? (
                                                u.roles.map((r) => {
                                                    const meta = ROLE_LABELS[r.name] || {
                                                        label: r.name,
                                                        color: "bg-surface-200 text-typography-600 border-surface-300",
                                                    };
                                                    return (
                                                        <span
                                                            key={r.id}
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${meta.color}`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-[11px] text-typography-400 italic">
                                                    Nenhuma função atribuída
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Botão de Revogar Acesso */}
                                <div className="self-end sm:self-center shrink-0">
                                    <button
                                        type="button"
                                        disabled={isSelf}
                                        onClick={() => setUserToRevoke(u)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                            isSelf
                                                ? "opacity-30 cursor-not-allowed text-typography-400 bg-surface-200/50"
                                                : "text-rose-600 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/25 hover:border-rose-600 shadow-2xs"
                                        }`}
                                        title={isSelf ? "Você não pode revogar seu próprio acesso" : "Revogar acesso deste usuário à congregação"}
                                    >
                                        <UserMinus className="w-3.5 h-3.5" />
                                        <span>Revogar Acesso</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Confirmação */}
            <RevokeAccessModal
                isOpen={!!userToRevoke}
                userName={userToRevoke?.fullName || userToRevoke?.email || ""}
                userEmail={userToRevoke?.email}
                congregationName={currentCongregationName}
                onClose={() => setUserToRevoke(null)}
                onConfirm={handleConfirmRevoke}
            />
        </div>
    );
}
