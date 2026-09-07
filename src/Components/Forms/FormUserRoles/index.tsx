import Button from "@/Components/Button"
import ModalHelp from "@/Components/ModalHelp"
import { useAuthContext } from "@/context/AuthContext"
import { useCongregationContext } from "@/context/CongregationContext"
import { getInitials } from "@/functions/getInitials"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { usePermissionsAndRoles } from "@/hooks/usePermissionsAndRoles"
import { api } from "@/services/api"
import { RolesType, UserTypes } from "@/types/types"
import {
    AlertCircle,
    Check,
    CheckCircle2,
    HelpCircle,
    RotateCcw,
    Search,
    User,
    UserCheck,
    Users,
    X
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

const ROLE_METADATA: Record<string, { label: string; category: string; description?: string }> = {
    ADMIN: {
        label: "Administrador Geral",
        category: "Sistema",
        description: "Acesso total irrestrito a todas as congregações, configurações e módulos do sistema.",
    },
    ADMIN_CONGREGATION: {
        label: "Administrador da Congregação",
        category: "Administração",
        description: "Gerencia publicadores, aprova acessos, configura reuniões e atribui funções locais.",
    },
    NOTICES_MANAGER: {
        label: "Gerenciador de Anúncios",
        category: "Mural & Conteúdo",
        description: "Cria, edita e remove anúncios e comunicados oficiais do quadro da congregação.",
    },
    PUBLISHERS_MANAGER: {
        label: "Gerenciador de Publicadores",
        category: "Secretaria",
        description: "Cadastra, edita e transfere fichas e dados de publicadores da congregação.",
    },
    PUBLISHERS_VIEWER: {
        label: "Visualizador de Publicadores",
        category: "Secretaria",
        description: "Consulta fichas e dados de contato de publicadores sem permissão para edição.",
    },
    TALK_MANAGER: {
        label: "Gerenciador de Discursos",
        category: "Reuniões",
        description: "Coordena arranjos de oradores visitantes, discursos públicos e hospitalidade.",
    },
    CLEANING_MANAGER: {
        label: "Gerenciador de Limpeza",
        category: "Operacional",
        description: "Organiza grupos, escalas e programações de limpeza do Salão do Reino.",
    },
    FIELD_SERVICE_MANAGER: {
        label: "Gerenciador de Campo",
        category: "Pregação",
        description: "Organiza programações, saídas e arranjos do serviço de campo da congregação.",
    },
    ARRANGEMENTS_MANAGER: {
        label: "Gerenciador de Arranjos",
        category: "Reuniões",
        description: "Gerencia escalas de indicadores, áudio e vídeo e designações mensais.",
    },
    FINANCE_MANAGER: {
        label: "Gerenciador de Finanças",
        category: "Administração",
        description: "Acessa e gerencia contas, comprovantes e relatórios de contas da congregação.",
    },
}

export default function FormUserRoles() {
    const { roleContains } = useAuthContext()
    const isAdmin = roleContains("ADMIN")
    const { congregation } = useCongregationContext()
    const congregationId = congregation?.id
    const { userRoles } = usePermissionsAndRoles()

    const [allRoles, setAllRoles] = useState<RolesType[]>([])
    const [users, setUsers] = useState<UserTypes[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [loadingRoles, setLoadingRoles] = useState(true)
    const [saving, setSaving] = useState(false)

    const [searchUser, setSearchUser] = useState("")
    const [selectedUser, setSelectedUser] = useState<UserTypes | null>(null)

    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
    const [initialRoleIds, setInitialRoleIds] = useState<string[]>([])
    const [roleFilter, setRoleFilter] = useState("")
    const [modalHelpShow, setModalHelpShow] = useState(false)

    // Buscar lista de usuários (mantendo a lista completa em memória)
    useEffect(() => {
        if (!congregationId && !isAdmin) return

        let isMounted = true
        setLoadingUsers(true)

        const fetchUsers = async () => {
            try {
                const endpoint = !isAdmin ? `/users/${congregationId}` : "/users"
                const res = await api.get<UserTypes[]>(endpoint)
                if (isMounted) {
                    const sorted = sortArrayByProperty(res.data || [], "fullName")
                    setUsers(sorted)
                }
            } catch (err) {
                console.error("Erro ao carregar usuários:", err)
                toast.error("Não foi possível carregar a lista de usuários.")
            } finally {
                if (isMounted) setLoadingUsers(false)
            }
        }

        fetchUsers()

        return () => {
            isMounted = false
        }
    }, [congregationId, isAdmin])

    // Buscar lista de papéis/roles disponíveis
    useEffect(() => {
        let isMounted = true
        setLoadingRoles(true)

        const fetchRoles = async () => {
            try {
                const res = await api.get<RolesType[]>("/roles")
                if (isMounted) {
                    const sorted = sortArrayByProperty(res.data || [], "name")
                    setAllRoles(sorted)
                }
            } catch (err) {
                console.error("Erro ao carregar funções:", err)
                toast.error("Não foi possível carregar as funções disponíveis.")
            } finally {
                if (isMounted) setLoadingRoles(false)
            }
        }

        fetchRoles()

        return () => {
            isMounted = false
        }
    }, [])

    // Quando seleciona um usuário, inicializa suas funções
    const handleSelectUser = (user: UserTypes) => {
        setSelectedUser(user)
        const userRoleIds = (user.roles || []).map((r) => String(r.id))
        setSelectedRoleIds(userRoleIds)
        setInitialRoleIds(userRoleIds)
    }

    const handleClearUser = () => {
        setSelectedUser(null)
        setSelectedRoleIds([])
        setInitialRoleIds([])
    }

    // Alternar uma função (toggle)
    const handleToggleRole = (roleId: string, isSuperAdminRole: boolean) => {
        if (isSuperAdminRole && !isAdmin) {
            toast.warning("Apenas o Administrador Geral pode atribuir a função ADMIN.")
            return
        }

        setSelectedRoleIds((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
        )
    }

    // Ações rápidas
    const handleSelectAllAllowed = () => {
        const allowedIds = allRoles
            .filter((role) => !(role.name === "ADMIN" && !isAdmin))
            .map((r) => String(r.id))
        setSelectedRoleIds(allowedIds)
    }

    const handleClearRoles = () => {
        setSelectedRoleIds([])
    }

    const handleResetRoles = () => {
        setSelectedRoleIds([...initialRoleIds])
    }

    // Submissão
    const handleSaveRoles = async () => {
        if (!selectedUser) {
            toast.warning("Selecione um usuário para salvar as funções.")
            return
        }

        setSaving(true)
        try {
            await toast.promise(userRoles(selectedUser.id, selectedRoleIds), {
                pending: "Atualizando funções do usuário...",
                success: "Funções atualizadas com sucesso!",
                error: "Erro ao atualizar funções.",
            })

            // Atualiza localmente o usuário na lista em memória para refletir imediatamente
            const updatedRoles = allRoles.filter((r) => selectedRoleIds.includes(String(r.id)))
            setUsers((prev) =>
                prev.map((u) => (u.id === selectedUser.id ? { ...u, roles: updatedRoles } : u))
            )
            setSelectedUser((prev) => (prev ? { ...prev, roles: updatedRoles } : null))
            setInitialRoleIds([...selectedRoleIds])
        } catch (err) {
            console.error("Erro ao salvar funções:", err)
        } finally {
            setSaving(false)
        }
    }

    // Filtro de usuários
    const filteredUsers = useMemo(() => {
        const query = searchUser.trim().toLowerCase()
        if (!query) return users
        return users.filter(
            (u) =>
                u.fullName?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.roles?.some((r) => r.name?.toLowerCase().includes(query))
        )
    }, [users, searchUser])

    // Filtro de funções
    const filteredRoles = useMemo(() => {
        const query = roleFilter.trim().toLowerCase()
        if (!query) return allRoles
        return allRoles.filter((role) => {
            const meta = ROLE_METADATA[role.name]
            const labelMatch = meta?.label?.toLowerCase().includes(query)
            const nameMatch = role.name?.toLowerCase().includes(query)
            const descMatch = (meta?.description || role.description || "")
                .toLowerCase()
                .includes(query)
            const catMatch = meta?.category?.toLowerCase().includes(query)
            return labelMatch || nameMatch || descMatch || catMatch
        })
    }, [allRoles, roleFilter])

    const hasChanges = useMemo(() => {
        if (selectedRoleIds.length !== initialRoleIds.length) return true
        return selectedRoleIds.some((id) => !initialRoleIds.includes(id))
    }, [selectedRoleIds, initialRoleIds])

    return (
        <div className="w-full flex flex-col gap-6">
            {modalHelpShow && (
                <ModalHelp
                    open={modalHelpShow}
                    setOpen={setModalHelpShow}
                    title="Como atribuir e gerenciar funções"
                    text={`
1. Seleção de Usuário:
   Procure na lista à esquerda o usuário desejado pelo nome ou e-mail. Ao selecioná-lo, o painel à direita carregará automaticamente suas permissões atuais.

2. Atribuição de Funções:
   Basta clicar sobre o cartão da função para ativá-la ou desativá-la. As funções com borda destacada e marcação verde são as que o usuário terá atribuídas.

3. Segurança:
   A função ADMIN (Administrador Geral) só pode ser concedida ou removida por outro Administrador Geral do sistema.

Funções disponíveis no sistema:
${allRoles
    .map(
        (role) =>
            `• ${ROLE_METADATA[role.name]?.label || role.name} (${role.name}): ${
                ROLE_METADATA[role.name]?.description || role.description || "Permissão do sistema."
            }`
    )
    .join("\n")}
`}
                />
            )}

            {/* Dica / Barra de ajuda superior */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-typography-800">
                            Atribuição Rápida de Funções e Privilégios
                        </h2>
                        <p className="text-xs text-typography-500">
                            Escolha um usuário à esquerda e configure os privilégios dele marcando os cartões de função à direita.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setModalHelpShow(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-200 bg-primary-200/10 hover:bg-primary-200/20 rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                    <HelpCircle size={15} />
                    <span>Guia de Funções</span>
                </button>
            </div>

            {/* Grid Principal de 2 Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA 1: Seleção e Perfil do Usuário (5 colunas) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Card de Busca e Seleção de Usuários */}
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-200/15 text-primary-200 font-bold text-xs flex items-center justify-center">
                                    1
                                </span>
                                <h3 className="text-sm font-bold text-typography-800">
                                    Selecionar Usuário
                                </h3>
                            </div>
                            <span className="text-[11px] font-medium text-typography-500">
                                {users.length} {users.length === 1 ? "usuário" : "usuários"}
                            </span>
                        </div>

                        {/* Campo de Busca Rápida */}
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-typography-400"
                            />
                            <input
                                type="text"
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                placeholder="Buscar por nome ou e-mail..."
                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface-200/60 border border-surface-300 rounded-xl text-typography-800 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition"
                            />
                            {searchUser && (
                                <button
                                    type="button"
                                    onClick={() => setSearchUser("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-600 p-1"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Lista de Usuários com Scroll */}
                        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto thin-scrollbar pr-1">
                            {loadingUsers ? (
                                <div className="flex flex-col gap-2 py-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="h-14 rounded-xl shimmer border border-surface-300"
                                        />
                                    ))}
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="py-8 text-center flex flex-col items-center justify-center text-typography-400 gap-2">
                                    <User size={24} className="opacity-40" />
                                    <p className="text-xs font-medium">Nenhum usuário encontrado</p>
                                </div>
                            ) : (
                                filteredUsers.map((u) => {
                                    const isSelected = selectedUser?.id === u.id
                                    const rolesCount = u.roles?.length || 0

                                    return (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => handleSelectUser(u)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-primary-200/10 border-primary-200 shadow-xs"
                                                    : "bg-surface-100 hover:bg-surface-200/70 border-surface-200 hover:border-surface-300"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Iniciais ou Avatar */}
                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        isSelected
                                                            ? "bg-primary-200 text-white"
                                                            : "bg-surface-200 text-typography-700"
                                                    }`}
                                                >
                                                    {getInitials(u.fullName || u.email)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs sm:text-sm font-bold text-typography-800 truncate">
                                                        {u.fullName || "Sem nome cadastrado"}
                                                    </span>
                                                    <span className="text-[11px] text-typography-500 truncate">
                                                        {u.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <span
                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                        rolesCount > 0
                                                            ? "bg-primary-200/15 text-primary-200"
                                                            : "bg-surface-200 text-typography-400"
                                                    }`}
                                                >
                                                    {rolesCount} {rolesCount === 1 ? "função" : "funções"}
                                                </span>
                                                {isSelected && (
                                                    <CheckCircle2
                                                        size={16}
                                                        className="text-primary-200"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Card de Usuário Selecionado */}
                    {selectedUser && (
                        <div className="bg-surface-100 border border-primary-200/40 rounded-2xl p-5 shadow-sm flex flex-col gap-4 bg-gradient-to-br from-primary-200/5 via-transparent to-transparent">
                            <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary-200 flex items-center gap-1.5">
                                    <UserCheck size={15} />
                                    <span>Usuário em Edição</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClearUser}
                                    className="text-xs text-typography-500 hover:text-red-500 transition flex items-center gap-1 cursor-pointer"
                                    title="Desmarcar usuário"
                                >
                                    <X size={14} />
                                    <span>Desmarcar</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-full bg-primary-200 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                                    {getInitials(selectedUser.fullName || selectedUser.email)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="text-sm sm:text-base font-bold text-typography-900 truncate">
                                        {selectedUser.fullName || "Sem nome"}
                                    </h4>
                                    <span className="text-xs text-typography-500 truncate">
                                        {selectedUser.email}
                                    </span>
                                    {selectedUser.congregation?.name && (
                                        <span className="text-[11px] text-primary-200 font-medium mt-0.5">
                                            Congregação {selectedUser.congregation.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Resumo das Funções Atuais */}
                            <div className="bg-surface-200/50 rounded-xl p-3 flex flex-col gap-1.5 border border-surface-300/60">
                                <span className="text-[11px] font-semibold text-typography-500">
                                    Funções atualmente gravadas:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedUser.roles && selectedUser.roles.length > 0 ? (
                                        selectedUser.roles.map((r) => (
                                            <span
                                                key={r.id}
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-100 border border-surface-300 text-typography-700"
                                            >
                                                {ROLE_METADATA[r.name]?.label || r.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-typography-400 italic">
                                            Nenhuma função atribuída anteriormente.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* COLUNA 2: Gerenciador de Funções (7 colunas) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                        {/* Cabeçalho do Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-200 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-200/15 text-primary-200 font-bold text-xs flex items-center justify-center">
                                    2
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-typography-800">
                                        Gerenciar Papéis & Privilégios
                                    </h3>
                                    <p className="text-xs text-typography-500">
                                        {selectedUser
                                            ? `Defina os papéis de ${selectedUser.fullName || selectedUser.email}`
                                            : "Selecione um usuário para habilitar a atribuição"}
                                    </p>
                                </div>
                            </div>

                            {/* Contador de Funções Selecionadas */}
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-200/10 text-primary-200 border border-primary-200/20">
                                    {selectedRoleIds.length} de {allRoles.length} selecionadas
                                </span>
                            </div>
                        </div>

                        {/* Se nenhum usuário selecionado: Estado Vazio Guiado */}
                        {!selectedUser ? (
                            <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-surface-200 text-typography-400 flex items-center justify-center">
                                    <UserCheck size={28} />
                                </div>
                                <h4 className="text-base font-bold text-typography-700">
                                    Nenhum Usuário Selecionado
                                </h4>
                                <p className="text-xs sm:text-sm text-typography-400 max-w-sm">
                                    Clique em um usuário na lista à esquerda para carregar suas funções atuais e fazer alterações.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Barra de Filtro e Ações Rápidas */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                    {/* Busca de Funções */}
                                    <div className="relative flex-1">
                                        <Search
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-typography-400"
                                        />
                                        <input
                                            type="text"
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            placeholder="Filtrar funções..."
                                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-200/50 border border-surface-300 rounded-xl text-typography-800 placeholder:text-typography-400 focus:outline-none focus:ring-1 focus:ring-primary-200"
                                        />
                                    </div>

                                    {/* Botões de Ações Rápidas */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleSelectAllAllowed}
                                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-typography-700 transition cursor-pointer"
                                            title="Selecionar todas as funções permitidas"
                                        >
                                            Marcar todas
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClearRoles}
                                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-typography-700 transition cursor-pointer"
                                            title="Desmarcar todas as funções"
                                        >
                                            Limpar
                                        </button>
                                        {hasChanges && (
                                            <button
                                                type="button"
                                                onClick={handleResetRoles}
                                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition flex items-center gap-1 cursor-pointer"
                                                title="Reverter para o estado inicial"
                                            >
                                                <RotateCcw size={13} />
                                                <span>Restaurar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Grade de Cartões de Funções */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto thin-scrollbar pr-1">
                                    {loadingRoles ? (
                                        [1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="h-28 rounded-xl shimmer border border-surface-300"
                                            />
                                        ))
                                    ) : filteredRoles.length === 0 ? (
                                        <div className="col-span-full py-8 text-center text-xs text-typography-400">
                                            Nenhuma função encontrada para o filtro "{roleFilter}".
                                        </div>
                                    ) : (
                                        filteredRoles.map((role) => {
                                            const roleId = String(role.id)
                                            const isSelected = selectedRoleIds.includes(roleId)
                                            const isSuperAdminRole = role.name === "ADMIN"
                                            const isDisabled = isSuperAdminRole && !isAdmin
                                            const metadata = ROLE_METADATA[role.name] || {
                                                label: role.name,
                                                category: "Geral",
                                                description: role.description || "Permissão de acesso.",
                                            }

                                            return (
                                                <div
                                                    key={role.id}
                                                    onClick={() => {
                                                        if (!isDisabled) {
                                                            handleToggleRole(roleId, isSuperAdminRole)
                                                        }
                                                    }}
                                                    className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                                                        isDisabled
                                                            ? "opacity-50 cursor-not-allowed bg-surface-200/40 border-surface-300"
                                                            : isSelected
                                                            ? "bg-primary-200/5 border-primary-200 shadow-xs hover:bg-primary-200/10"
                                                            : "bg-surface-100 hover:bg-surface-200/60 border-surface-300 hover:border-surface-400"
                                                    }`}
                                                >
                                                    <div className="flex flex-col gap-2">
                                                        {/* Topo do Cartão: Categoria + Checkbox */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-surface-200 text-typography-600">
                                                                {metadata.category}
                                                            </span>

                                                            {/* Checkbox estilizado */}
                                                            <div
                                                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                                                    isSelected
                                                                        ? "bg-primary-200 text-white"
                                                                        : "border border-surface-400 group-hover:border-primary-200/70"
                                                                }`}
                                                            >
                                                                {isSelected && <Check size={13} strokeWidth={3} />}
                                                            </div>
                                                        </div>

                                                        {/* Título Amigável */}
                                                        <div className="flex flex-col mt-1">
                                                            <h4 className="text-xs sm:text-sm font-bold text-typography-800 leading-tight">
                                                                {metadata.label}
                                                            </h4>
                                                            <span className="text-[10px] font-mono text-primary-200 font-semibold mt-0.5">
                                                                {role.name}
                                                            </span>
                                                        </div>

                                                        {/* Descrição Didática */}
                                                        <p className="text-[11px] text-typography-500 leading-relaxed mt-1">
                                                            {metadata.description}
                                                        </p>
                                                    </div>

                                                    {/* Aviso para ADMIN quando o usuário logado não for superadmin */}
                                                    {isDisabled && (
                                                        <div className="mt-2.5 pt-2 border-t border-surface-300/80 flex items-center gap-1.5 text-[10px] text-amber-600 font-medium">
                                                            <AlertCircle size={12} className="shrink-0" />
                                                            <span>Requer privilégio de Administrador Geral.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                {/* Barra Inferior de Ações e Submissão */}
                                <div className="mt-4 pt-4 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-typography-500">
                                        {hasChanges ? (
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                                                <AlertCircle size={14} />
                                                <span>Existem alterações não salvas</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-emerald-600">
                                                <CheckCircle2 size={14} />
                                                <span>Funções em sincronia</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Button
                                            type="button"
                                            outline
                                            onClick={handleClearUser}
                                            className="w-1/2 sm:w-auto text-xs py-2.5 px-4"
                                        >
                                            Cancelar
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={handleSaveRoles}
                                            disabled={saving || !selectedUser}
                                            className="w-1/2 sm:w-auto text-xs py-2.5 px-6 font-bold shadow-sm"
                                        >
                                            {saving ? "Salvando..." : "Salvar Funções"}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
