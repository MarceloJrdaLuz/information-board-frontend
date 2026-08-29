import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IPublisher, Situation } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckSquare,
    Search,
    Square,
    UserCheck,
    UserMinus,
    UserPlus,
    Users,
    X
} from "lucide-react"
import Image from "next/image"
import Router, { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import avatarFemale from "../../../../../public/images/avatar-female.png"
import avatarMale from "../../../../../public/images/avatar-male.png"

function AddPublishersToGroups() {
    const { group_id, group_number } = useRouter().query
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    // Estados de seleção
    const [selectedToRemove, setSelectedToRemove] = useState<string[]>([])
    const [selectedToAdd, setSelectedToAdd] = useState<string[]>([])

    // Filtros de busca
    const [searchCurrent, setSearchCurrent] = useState("")
    const [searchAvailable, setSearchAvailable] = useState("")
    const [availableTab, setAvailableTab] = useState<"no-group" | "other-groups">("no-group")

    // Aba ativa no celular (mobile tabs)
    const [mobileTab, setMobileTab] = useState<"current" | "available">("current")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchConfigPublishers = congregationUser
        ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}`
        : ""
    const { data: getPublishers, mutate } = useAuthorizedFetch<IPublisher[]>(fetchConfigPublishers, {
        allowedRoles: ["ADMIN_CONGREGATION", "GROUPS_MANAGER"]
    })

    // Publicadores do grupo atual
    const currentGroupPublishers = useMemo(() => {
        if (!getPublishers) return []
        const list = getPublishers.filter((p) => p.group && p.group.id === group_id)
        return sortArrayByProperty(list, "fullName")
    }, [getPublishers, group_id])

    // Contagem de ativos e inativos no grupo atual
    const currentInactivesCount = useMemo(() => {
        return currentGroupPublishers.filter(
            (p) => p.situation === Situation.INATIVO
        ).length
    }, [currentGroupPublishers])

    const currentActivesCount = currentGroupPublishers.length - currentInactivesCount

    // Publicadores sem grupo
    const publishersWithoutGroup = useMemo(() => {
        if (!getPublishers) return []
        const list = getPublishers.filter((p) => !p.group)
        return sortArrayByProperty(list, "fullName")
    }, [getPublishers])

    // Publicadores de outros grupos
    const publishersOtherGroups = useMemo(() => {
        if (!getPublishers) return []
        const list = getPublishers.filter((p) => p.group && p.group.id !== group_id)
        return sortArrayByProperty(list, "fullName")
    }, [getPublishers, group_id])

    // Publicadores disponíveis filtrados por busca e aba
    const filteredAvailablePublishers = useMemo(() => {
        const baseList = availableTab === "no-group" ? publishersWithoutGroup : publishersOtherGroups
        if (!searchAvailable.trim()) return baseList
        const term = searchAvailable.toLowerCase()
        return baseList.filter(
            (p) =>
                p.fullName.toLowerCase().includes(term) ||
                (p.nickname && p.nickname.toLowerCase().includes(term))
        )
    }, [availableTab, publishersWithoutGroup, publishersOtherGroups, searchAvailable])

    // Publicadores atuais filtrados por busca
    const filteredCurrentPublishers = useMemo(() => {
        if (!searchCurrent.trim()) return currentGroupPublishers
        const term = searchCurrent.toLowerCase()
        return currentGroupPublishers.filter(
            (p) =>
                p.fullName.toLowerCase().includes(term) ||
                (p.nickname && p.nickname.toLowerCase().includes(term))
        )
    }, [currentGroupPublishers, searchCurrent])

    // Helper para renderizar badge de situação (Inativo, Desassociado, etc.)
    const renderSituationBadge = (situation: Situation) => {
        if (situation === Situation.INATIVO) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    <span>Inativo</span>
                </span>
            )
        }
        if (situation === Situation.DESASSOCIADO) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 shrink-0">
                    <span>Desassociado</span>
                </span>
            )
        }
        if (situation === Situation.REMOVIDO) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-300 text-typography-600 shrink-0">
                    <span>Removido</span>
                </span>
            )
        }
        return null
    }

    // Ações de Adicionar
    const handleAddPublishers = async (publisherIds: string[]) => {
        if (publisherIds.length === 0 || isSubmitting) return
        try {
            setIsSubmitting(true)
            await api.post(`/group/${group_id}/add-publishers`, {
                publishers_ids: publisherIds
            })
            mutate()
            setSelectedToAdd([])
            handleSubmitSuccess(messageSuccessSubmit.publisherAddGroup)
        } catch {
            handleSubmitError(messageErrorsSubmit.default)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Ações de Remover
    const handleRemovePublishers = async (publisherIds: string[]) => {
        if (publisherIds.length === 0 || isSubmitting) return
        try {
            setIsSubmitting(true)
            await api.delete(`/group/${group_id}/remove-publishers`, {
                data: { publishers_ids: publisherIds }
            })
            mutate()
            setSelectedToRemove([])
            handleSubmitSuccess(messageSuccessSubmit.publisherRemoveGroup)
        } catch (err: any) {
            const message = err?.response?.data?.message
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    // Toggle seleção para remoção
    const toggleSelectToRemove = (id: string) => {
        setSelectedToRemove((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    // Toggle seleção para adição
    const toggleSelectToAdd = (id: string) => {
        setSelectedToAdd((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    // Selecionar todos os membros atuais visíveis
    const handleSelectAllCurrent = () => {
        if (selectedToRemove.length === filteredCurrentPublishers.length) {
            setSelectedToRemove([])
        } else {
            setSelectedToRemove(filteredCurrentPublishers.map((p) => p.id))
        }
    }

    // Selecionar todos os disponíveis visíveis
    const handleSelectAllAvailable = () => {
        if (selectedToAdd.length === filteredAvailablePublishers.length) {
            setSelectedToAdd([])
        } else {
            setSelectedToAdd(filteredAvailablePublishers.map((p) => p.id))
        }
    }

    useEffect(() => {
        setCrumbs((prev) => [
            ...prev,
            { label: "Grupos", link: "/congregacao/grupos-campo" }
        ])
        return () => {
            setCrumbs((prev) => prev.slice(0, -1))
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive("Editar grupo")
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={`Grupo ${group_number ?? ""}`} />
            <section className="flex flex-col w-full h-full p-4 sm:p-6 md:p-8">
                {/* Header Superior da Página */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-300">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => Router.push("/congregacao/grupos-campo")}
                            className="p-2 rounded-xl bg-surface-100 hover:bg-surface-300 border border-surface-300 text-typography-700 transition active:scale-95"
                            title="Voltar para a lista de grupos"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-typography-800 tracking-tight">
                                    {group_number ? `Grupo ${group_number}` : "Gerenciar Grupo"}
                                </h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-200/10 text-primary-200">
                                        {currentActivesCount} {currentActivesCount === 1 ? "ativo" : "ativos"}
                                    </span>
                                    {currentInactivesCount > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{currentInactivesCount} {currentInactivesCount === 1 ? "inativo" : "inativos"}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                Adicione ou transfira publicadores para este grupo de campo
                            </p>
                        </div>
                    </div>

                    {/* Ação de Mudar Dirigente */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                Router.push({
                                    pathname: `/congregacao/grupos-campo/${group_id}/mudar-dirigente`,
                                    query: { group_number: `${group_number}` }
                                })
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-100 border border-surface-300 text-typography-700 hover:text-primary-200 hover:border-primary-200 text-xs sm:text-sm font-semibold transition active:scale-95 shadow-sm"
                            title="Alterar dirigente deste grupo"
                        >
                            <UserCheck className="w-4 h-4 text-primary-200" />
                            <span>Mudar Dirigente</span>
                        </button>
                    </div>
                </div>

                {/* Abas para Telas Pequenas (Mobile Tabs) */}
                <div className="flex lg:hidden mt-4 p-1 bg-surface-200 rounded-xl border border-surface-300">
                    <button
                        onClick={() => setMobileTab("current")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            mobileTab === "current"
                                ? "bg-surface-100 text-primary-200 shadow-sm"
                                : "text-typography-500 hover:text-typography-800"
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Membros ({currentGroupPublishers.length})</span>
                    </button>

                    <button
                        onClick={() => setMobileTab("available")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            mobileTab === "available"
                                ? "bg-surface-100 text-primary-200 shadow-sm"
                                : "text-typography-500 hover:text-typography-800"
                        }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Adicionar ({publishersWithoutGroup.length + publishersOtherGroups.length})</span>
                    </button>
                </div>

                {/* Grid Duplo (Mobile alternado por aba / Desktop lado a lado) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-28">
                    {/* ================= COLUNA 1: MEMBROS ATUAIS DO GRUPO ================= */}
                    <div
                        className={`flex flex-col bg-surface-100 rounded-2xl border border-surface-300 shadow-sm overflow-hidden ${
                            mobileTab !== "current" ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        {/* Header da Coluna 1 */}
                        <div className="p-4 sm:p-5 border-b border-surface-300 bg-surface-200/40 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-primary-200/10 text-primary-200">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm sm:text-base text-typography-800">
                                            Membros Atuais
                                        </h3>
                                        <span className="text-xs text-typography-500">
                                            {currentActivesCount} ativos
                                            {currentInactivesCount > 0 && ` • ${currentInactivesCount} inativos`}
                                        </span>
                                    </div>
                                </div>

                                {selectedToRemove.length > 0 && (
                                    <button
                                        onClick={() => handleRemovePublishers(selectedToRemove)}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs shadow-sm transition active:scale-95 animate-fadeIn"
                                    >
                                        <UserMinus className="w-3.5 h-3.5" />
                                        <span>Remover ({selectedToRemove.length})</span>
                                    </button>
                                )}
                            </div>

                            {/* Campo de Busca de Membros */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar membro no grupo..."
                                    value={searchCurrent}
                                    onChange={(e) => setSearchCurrent(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface-100 border border-surface-300 rounded-xl text-typography-800 placeholder:text-typography-400 focus:outline-none focus:border-primary-200 transition"
                                />
                                {searchCurrent && (
                                    <button
                                        onClick={() => setSearchCurrent("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Barra de Selecionar Todos */}
                            {filteredCurrentPublishers.length > 0 && (
                                <div className="flex items-center justify-between text-xs text-typography-500 pt-1">
                                    <button
                                        onClick={handleSelectAllCurrent}
                                        className="inline-flex items-center gap-1.5 font-semibold text-primary-200 hover:underline"
                                    >
                                        {selectedToRemove.length === filteredCurrentPublishers.length ? (
                                            <>
                                                <CheckSquare className="w-4 h-4" />
                                                <span>Desmarcar todos</span>
                                            </>
                                        ) : (
                                            <>
                                                <Square className="w-4 h-4" />
                                                <span>Selecionar todos ({filteredCurrentPublishers.length})</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Lista de Membros Atuais */}
                        <div className="flex-1 overflow-y-auto max-h-[500px] p-2 divide-y divide-surface-200">
                            {filteredCurrentPublishers.length > 0 ? (
                                filteredCurrentPublishers.map((publisher) => {
                                    const isSelected = selectedToRemove.includes(publisher.id)
                                    const avatarDefault =
                                        publisher.gender === "Feminino" ? avatarFemale : avatarMale
                                    const avatarUrl = publisher.user?.profile?.avatar_url || avatarDefault

                                    return (
                                        <div
                                            key={publisher.id}
                                            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition ${
                                                isSelected
                                                    ? "bg-red-500/10 border border-red-500/20"
                                                    : "hover:bg-surface-200/60"
                                            }`}
                                        >
                                            {/* Informações e Checkbox */}
                                            <div
                                                onClick={() => toggleSelectToRemove(publisher.id)}
                                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="w-4 h-4 rounded text-red-500 accent-red-500 cursor-pointer shrink-0"
                                                />
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-200">
                                                    <Image
                                                        src={avatarUrl}
                                                        alt={publisher.fullName}
                                                        fill
                                                        className="object-cover object-center"
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs sm:text-sm font-semibold text-typography-800 truncate">
                                                            {publisher.fullName}
                                                        </span>
                                                        {renderSituationBadge(publisher.situation)}
                                                    </div>
                                                    {publisher.nickname && (
                                                        <span className="text-[11px] text-typography-400 truncate">
                                                            ({publisher.nickname})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Botão de Remoção Rápida */}
                                            <button
                                                onClick={() => handleRemovePublishers([publisher.id])}
                                                disabled={isSubmitting}
                                                className="p-1.5 rounded-lg text-typography-400 hover:text-red-500 hover:bg-red-500/10 transition active:scale-95 shrink-0 ml-2"
                                                title="Remover do grupo"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="py-12 text-center text-typography-400 text-xs sm:text-sm">
                                    {searchCurrent
                                        ? "Nenhum membro encontrado com este nome."
                                        : "Este grupo está vazio no momento!"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================= COLUNA 2: ADICIONAR PUBLICADORES ================= */}
                    <div
                        className={`flex flex-col bg-surface-100 rounded-2xl border border-surface-300 shadow-sm overflow-hidden ${
                            mobileTab !== "available" ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        {/* Header da Coluna 2 */}
                        <div className="p-4 sm:p-5 border-b border-surface-300 bg-surface-200/40 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-primary-200/10 text-primary-200">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm sm:text-base text-typography-800">
                                            Adicionar ao Grupo
                                        </h3>
                                        <span className="text-xs text-typography-500">
                                            {publishersWithoutGroup.length} sem grupo •{" "}
                                            {publishersOtherGroups.length} em outros grupos
                                        </span>
                                    </div>
                                </div>

                                {selectedToAdd.length > 0 && (
                                    <button
                                        onClick={() => handleAddPublishers(selectedToAdd)}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs shadow-sm transition active:scale-95 animate-fadeIn"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Adicionar ({selectedToAdd.length})</span>
                                    </button>
                                )}
                            </div>

                            {/* Sub-Abas: Sem Grupo vs Outros Grupos */}
                            <div className="flex p-1 bg-surface-200 rounded-xl border border-surface-300/80">
                                <button
                                    onClick={() => {
                                        setAvailableTab("no-group")
                                        setSelectedToAdd([])
                                    }}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                        availableTab === "no-group"
                                            ? "bg-surface-100 text-primary-200 shadow-sm"
                                            : "text-typography-500 hover:text-typography-800"
                                    }`}
                                >
                                    <span>Sem Grupo ({publishersWithoutGroup.length})</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setAvailableTab("other-groups")
                                        setSelectedToAdd([])
                                    }}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                        availableTab === "other-groups"
                                            ? "bg-surface-100 text-primary-200 shadow-sm"
                                            : "text-typography-500 hover:text-typography-800"
                                    }`}
                                >
                                    <span>Outros Grupos ({publishersOtherGroups.length})</span>
                                </button>
                            </div>

                            {/* Campo de Busca de Publicadores Disponíveis */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar publicador para adicionar..."
                                    value={searchAvailable}
                                    onChange={(e) => setSearchAvailable(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface-100 border border-surface-300 rounded-xl text-typography-800 placeholder:text-typography-400 focus:outline-none focus:border-primary-200 transition"
                                />
                                {searchAvailable && (
                                    <button
                                        onClick={() => setSearchAvailable("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Barra de Selecionar Todos */}
                            {filteredAvailablePublishers.length > 0 && (
                                <div className="flex items-center justify-between text-xs text-typography-500 pt-1">
                                    <button
                                        onClick={handleSelectAllAvailable}
                                        className="inline-flex items-center gap-1.5 font-semibold text-primary-200 hover:underline"
                                    >
                                        {selectedToAdd.length === filteredAvailablePublishers.length ? (
                                            <>
                                                <CheckSquare className="w-4 h-4" />
                                                <span>Desmarcar todos</span>
                                            </>
                                        ) : (
                                            <>
                                                <Square className="w-4 h-4" />
                                                <span>Selecionar todos ({filteredAvailablePublishers.length})</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Lista de Publicadores Disponíveis */}
                        <div className="flex-1 overflow-y-auto max-h-[500px] p-2 divide-y divide-surface-200">
                            {filteredAvailablePublishers.length > 0 ? (
                                filteredAvailablePublishers.map((publisher) => {
                                    const isSelected = selectedToAdd.includes(publisher.id)
                                    const avatarDefault =
                                        publisher.gender === "Feminino" ? avatarFemale : avatarMale
                                    const avatarUrl = publisher.user?.profile?.avatar_url || avatarDefault

                                    return (
                                        <div
                                            key={publisher.id}
                                            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition ${
                                                isSelected
                                                    ? "bg-primary-200/10 border border-primary-200/30"
                                                    : "hover:bg-surface-200/60"
                                            }`}
                                        >
                                            {/* Informações e Checkbox */}
                                            <div
                                                onClick={() => toggleSelectToAdd(publisher.id)}
                                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="w-4 h-4 rounded text-primary-200 accent-primary-200 cursor-pointer shrink-0"
                                                />
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-200">
                                                    <Image
                                                        src={avatarUrl}
                                                        alt={publisher.fullName}
                                                        fill
                                                        className="object-cover object-center"
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs sm:text-sm font-semibold text-typography-800 truncate">
                                                            {publisher.fullName}
                                                        </span>
                                                        {renderSituationBadge(publisher.situation)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-typography-500">
                                                        {publisher.group ? (
                                                            <span className="text-amber-600 dark:text-amber-400 font-medium truncate">
                                                                Pertence ao Grupo {publisher.group.number}
                                                            </span>
                                                        ) : (
                                                            <span className="text-typography-400">Sem grupo</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botão de Adição Rápida */}
                                            <button
                                                onClick={() => handleAddPublishers([publisher.id])}
                                                disabled={isSubmitting}
                                                className="p-1.5 rounded-lg text-typography-400 hover:text-primary-200 hover:bg-primary-200/10 transition active:scale-95 shrink-0 ml-2"
                                                title="Adicionar a este grupo"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="py-12 text-center text-typography-400 text-xs sm:text-sm">
                                    {searchAvailable
                                        ? "Nenhum publicador encontrado com este nome."
                                        : availableTab === "no-group"
                                        ? "Todos os publicadores já estão em algum grupo!"
                                        : "Nenhum publicador em outros grupos."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </ContentDashboard>
    )
}

AddPublishersToGroups.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "GROUPS_MANAGER"])

export default AddPublishersToGroups