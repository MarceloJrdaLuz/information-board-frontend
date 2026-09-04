import { Button } from "@/Components/ui/button"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { isAuxPioneerMonthNow } from "@/functions/isAuxPioneerMonthNow"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { usePublisher } from "@/hooks/usePublisher"
import { IPublisher, Privileges, Situation } from "@/types/types"
import { BlobProvider, Document } from "@react-pdf/renderer"
import {
    ArrowRightLeft,
    Award,
    Calendar,
    CalendarOff,
    ChevronDown,
    Droplets,
    FileDown,
    Loader2,
    MapPin,
    Pencil,
    Phone,
    Search,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserCheck,
    Users,
    UserX,
    X,
} from "lucide-react"
import moment from "moment"
import Image from "next/image"
import Router from "next/router"
import { useMemo, useState } from "react"
import { toast } from "react-toastify"
import avatarMale from "../../../public/images/avatar-male.png"
import AvatarFemale from "../AvatarFemale"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import FilterPrivileges from "../FilterPrivileges"
import PublishersListPdf from "../PublisherListPdf"
import SkeletonPublishersWithAvatarList from "./skeletonPublisherWithAvatarList"

type QuickFilterTab = "ACTIVES" | "PIONEERS" | "ELDERS" | "MINISTERIAL_SERVANTS" | "INACTIVES" | "ALL"

interface PdfLinkComponentProps {
    publishers: IPublisher[]
    congregationName?: string
}

function PdfLinkComponent({ publishers, congregationName }: PdfLinkComponentProps) {
    return (
        <BlobProvider
            document={
                <Document>
                    <PublishersListPdf
                        publishers={publishers}
                        congregationName={congregationName}
                    />
                </Document>
            }
        >
            {({ blob, url, loading, error }) => {
                const isDisabled = loading || !!error || !blob

                return (
                    <a
                        href={url || "#"}
                        download={url ? `Publicadores ${congregationName || "congregacao"}.pdf` : undefined}
                        className={isDisabled ? "pointer-events-none opacity-60" : ""}
                    >
                        <Button
                            variant="outline"
                            type="button"
                            className="gap-2 rounded-xl border-surface-300 text-typography-700 hover:text-primary-200 hover:bg-surface-200 font-semibold text-xs h-10 px-3.5 shadow-2xs transition-all cursor-pointer shrink-0"
                            disabled={isDisabled}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-primary-200" />
                                    <span className="hidden sm:inline">Gerando PDF...</span>
                                </>
                            ) : (
                                <>
                                    <FileDown className="w-4 h-4 text-primary-200" />
                                    <span className="hidden sm:inline">Salvar Lista (PDF)</span>
                                    <span className="sm:hidden">PDF</span>
                                </>
                            )}
                        </Button>
                    </a>
                )
            }}
        </BlobProvider>
    )
}

export default function PublisherList() {
    const { user, roleContains } = useAuthContext()
    const { deletePublisher } = usePublisher()
    const congregationUser = user?.congregation

    const fetchConfig = congregationUser
        ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}`
        : ""
    const { data, mutate, isLoading } = useFetch<IPublisher[]>(fetchConfig)

    const [selectedPublishers, setSelectedPublishers] = useState<Set<string>>(new Set())
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState<QuickFilterTab>("ACTIVES")
    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])

    const canManage =
        roleContains("ADMIN_CONGREGATION") || roleContains("PUBLISHERS_MANAGER")
    const canMidweek = roleContains("MIDWEEK_MANAGER")
    const isAdminCongregation = roleContains("ADMIN_CONGREGATION")

    // Estatísticas calculadas
    const stats = useMemo(() => {
        if (!data) {
            return {
                total: 0,
                actives: 0,
                pioneers: 0,
                elders: 0,
                servants: 0,
                inactives: 0,
            }
        }

        const total = data.length
        const actives = data.filter((p) => p.situation === Situation.ATIVO).length
        const pioneers = data.filter(
            (p) =>
                p.situation === Situation.ATIVO &&
                (p.privileges.includes(Privileges.PIONEIROESPECIAL) ||
                    p.privileges.includes(Privileges.MISSIONARIOEMCAMPO) ||
                    ((p.privileges.includes(Privileges.PIONEIROREGULAR) ||
                        p.privileges.includes(Privileges.AUXILIARINDETERMINADO)) &&
                        isPioneerNow(p, new Date())))
        ).length
        const elders = data.filter(
            (p) => p.situation === Situation.ATIVO && p.privileges.includes(Privileges.ANCIAO)
        ).length
        const servants = data.filter(
            (p) =>
                p.situation === Situation.ATIVO &&
                p.privileges.includes(Privileges.SM)
        ).length
        const inactives = data.filter((p) => p.situation !== Situation.ATIVO).length

        return { total, actives, pioneers, elders, servants, inactives }
    }, [data])

    // Filtragem avançada e busca em tempo real
    const filteredPublishers = useMemo(() => {
        if (!data) return []

        let result = [...data]

        // 1. Filtro por Abas Rápidas
        if (activeTab === "ACTIVES") {
            result = result.filter((p) => p.situation === Situation.ATIVO)
        } else if (activeTab === "PIONEERS") {
            result = result.filter(
                (p) =>
                    p.situation === Situation.ATIVO &&
                    (p.privileges.includes(Privileges.PIONEIROESPECIAL) ||
                        p.privileges.includes(Privileges.MISSIONARIOEMCAMPO) ||
                        ((p.privileges.includes(Privileges.PIONEIROREGULAR) ||
                            p.privileges.includes(Privileges.AUXILIARINDETERMINADO)) &&
                            isPioneerNow(p, new Date())))
            )
        } else if (activeTab === "ELDERS") {
            result = result.filter(
                (p) => p.situation === Situation.ATIVO && p.privileges.includes(Privileges.ANCIAO)
            )
        } else if (activeTab === "MINISTERIAL_SERVANTS") {
            result = result.filter(
                (p) =>
                    p.situation === Situation.ATIVO &&
                    p.privileges.includes(Privileges.SM)
            )
        } else if (activeTab === "INACTIVES") {
            result = result.filter((p) => p.situation !== Situation.ATIVO)
        }

        // 2. Filtro de privilégios adicionais (Popover)
        if (filterPrivileges.length > 0) {
            result = result.filter((p) =>
                filterPrivileges.every((privilege) => {
                    if (privilege === Privileges.PIONEIROAUXILIAR) {
                        return (
                            p.privileges.includes(Privileges.PIONEIROAUXILIAR) &&
                            isAuxPioneerMonthNow(p)
                        )
                    } else if (
                        privilege === Privileges.PIONEIROREGULAR ||
                        privilege === Privileges.AUXILIARINDETERMINADO
                    ) {
                        return (
                            p.privileges.includes(privilege) &&
                            isPioneerNow(p, new Date())
                        )
                    } else {
                        return p.privileges.includes(privilege)
                    }
                })
            )
        }

        // 3. Busca por texto (nome, apelido, telefone, endereço, grupo) ignorando acentos
        if (searchTerm.trim()) {
            const normalize = (str?: string) =>
                (str ?? "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()

            const term = normalize(searchTerm.trim())
            result = result.filter((p) => {
                const nameMatch = normalize(p.fullName).includes(term)
                const nickMatch = normalize(p.nickname).includes(term)
                const phoneMatch = (p.phone ?? "").toLowerCase().includes(term)
                const addressMatch = normalize(p.address).includes(term)
                const groupMatch = normalize(p.group?.name).includes(term)

                return nameMatch || nickMatch || phoneMatch || addressMatch || groupMatch
            })
        }

        // Ordena por nome completo
        return sortArrayByProperty(result, "fullName")
    }, [data, activeTab, filterPrivileges, searchTerm])

    const handleToggleDetails = (id: string) => {
        const next = new Set(selectedPublishers)
        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        setSelectedPublishers(next)
    }

    async function onDelete(publisher_id: string) {
        await toast
            .promise(deletePublisher(publisher_id), {
                pending: "Excluindo publicador...",
                success: "Publicador excluído com sucesso!",
                error: "Erro ao excluir publicador.",
            })
            .then(() => {
                mutate()
                const next = new Set(selectedPublishers)
                next.delete(publisher_id)
                setSelectedPublishers(next)
            })
            .catch((err) => {
                console.error(err)
            })
    }

    const resetFilters = () => {
        setSearchTerm("")
        setActiveTab("ACTIVES")
        setFilterPrivileges([])
    }

    return (
        <div className="flex flex-col gap-6 w-full pb-16">
            {/* Cards de Métricas / Estatísticas Rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* Total */}
                <button
                    type="button"
                    onClick={() => setActiveTab("ALL")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === "ALL"
                            ? "bg-primary-200/10 border-primary-200 shadow-xs ring-1 ring-primary-200"
                            : "bg-surface-100 border-surface-300 hover:border-primary-200/40"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-typography-500">
                            Total
                        </span>
                        <div className="p-1.5 rounded-lg bg-primary-200/10 text-primary-200">
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-typography-800">
                        {stats.total}
                    </div>
                    <span className="text-[11px] text-typography-400">no cadastro</span>
                </button>

                {/* Ativos */}
                <button
                    type="button"
                    onClick={() => setActiveTab("ACTIVES")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === "ACTIVES"
                            ? "bg-emerald-500/10 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
                            : "bg-surface-100 border-surface-300 hover:border-emerald-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-typography-500">
                            Ativos
                        </span>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-typography-800">
                        {stats.actives}
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        regulares
                    </span>
                </button>

                {/* Pioneiros */}
                <button
                    type="button"
                    onClick={() => setActiveTab("PIONEERS")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === "PIONEERS"
                            ? "bg-amber-500/10 border-amber-500 shadow-xs ring-1 ring-amber-500"
                            : "bg-surface-100 border-surface-300 hover:border-amber-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-typography-500">
                            Pioneiros
                        </span>
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Award size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-typography-800">
                        {stats.pioneers}
                    </div>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        regulares
                    </span>
                </button>

                {/* Anciãos */}
                <button
                    type="button"
                    onClick={() => setActiveTab("ELDERS")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === "ELDERS"
                            ? "bg-blue-500/10 border-blue-500 shadow-xs ring-1 ring-blue-500"
                            : "bg-surface-100 border-surface-300 hover:border-blue-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-typography-500">
                            Anciãos
                        </span>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-typography-800">
                        {stats.elders}
                    </div>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        designados
                    </span>
                </button>

                {/* Servos */}
                <button
                    type="button"
                    onClick={() => setActiveTab("MINISTERIAL_SERVANTS")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === "MINISTERIAL_SERVANTS"
                            ? "bg-purple-500/10 border-purple-500 shadow-xs ring-1 ring-purple-500"
                            : "bg-surface-100 border-surface-300 hover:border-purple-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-typography-500">
                            Servos
                        </span>
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-typography-800">
                        {stats.servants}
                    </div>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                        ministeriais
                    </span>
                </button>

                {/* Inativos */}
                <button
                    type="button"
                    onClick={() => setActiveTab("INACTIVES")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === "INACTIVES"
                            ? "bg-zinc-500/10 border-zinc-500 shadow-xs ring-1 ring-zinc-500"
                            : "bg-surface-100 border-surface-300 hover:border-zinc-500/40"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-typography-500">
                            Inativos
                        </span>
                        <div className="p-1.5 rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
                            <UserX size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-extrabold text-typography-800">
                        {stats.inactives}
                    </div>
                    <span className="text-[11px] text-zinc-500 font-medium">
                        ou outros
                    </span>
                </button>
            </div>

            {/* Barra de Ferramentas: Busca, Filtros Rápidos, Popover e Exportar PDF */}
            <div className="p-4 bg-surface-100 rounded-2xl border border-surface-300 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Campo de Busca */}
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome, apelido, telefone, grupo..."
                            className="w-full h-10 pl-9 pr-8 bg-surface-200/50 border border-surface-300 rounded-xl text-xs sm:text-sm text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700 p-0.5 cursor-pointer"
                                title="Limpar busca"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Ações da Toolbar: Popover de Privilégios & PDF Link */}
                    <div className="flex items-center gap-2.5 justify-end">
                        <FilterPrivileges
                            checkedOptions={filterPrivileges}
                            handleCheckboxChange={(filter) => setFilterPrivileges(filter)}
                        />

                        {data && (
                            <PdfLinkComponent
                                publishers={filteredPublishers}
                                congregationName={user?.congregation?.name}
                            />
                        )}
                    </div>
                </div>

                {/* Abas Rápidas (Pills) & Contador */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-surface-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab("ACTIVES")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === "ACTIVES"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                            }`}
                        >
                            Ativos ({stats.actives})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("PIONEERS")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === "PIONEERS"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                            }`}
                        >
                            Pioneiros ({stats.pioneers})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("ELDERS")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === "ELDERS"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                            }`}
                        >
                            Anciãos ({stats.elders})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("MINISTERIAL_SERVANTS")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === "MINISTERIAL_SERVANTS"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                            }`}
                        >
                            Servos ({stats.servants})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("INACTIVES")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === "INACTIVES"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                            }`}
                        >
                            Inativos ({stats.inactives})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("ALL")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === "ALL"
                                    ? "bg-primary-200 text-white border-primary-200 shadow-2xs"
                                    : "bg-surface-200/60 text-typography-600 border-surface-300 hover:bg-surface-200"
                            }`}
                        >
                            Todos ({stats.total})
                        </button>
                    </div>

                    <div className="text-xs font-semibold text-typography-500 self-end sm:self-auto">
                        Exibindo <span className="text-primary-200 font-bold">{filteredPublishers.length}</span>{" "}
                        {filteredPublishers.length === 1 ? "publicador" : "publicadores"}
                    </div>
                </div>
            </div>

            {/* Lista de Publicadores */}
            {isLoading ? (
                <ul className="grid grid-cols-1 gap-3 w-full">
                    {Array(6)
                        .fill(0)
                        .map((_, i) => (
                            <SkeletonPublishersWithAvatarList key={i + "skeleton"} />
                        ))}
                </ul>
            ) : filteredPublishers.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3 w-full">
                    {filteredPublishers.map((publisher) => {
                        const isSelected = selectedPublishers.has(publisher.id)

                        return (
                            <li
                                key={publisher.id}
                                className={`bg-surface-100 border rounded-2xl shadow-2xs transition-all duration-200 overflow-hidden ${
                                    isSelected
                                        ? "border-primary-200/50 ring-1 ring-primary-200/20 shadow-xs"
                                        : "border-surface-300 hover:border-primary-200/30"
                                }`}
                            >
                                {/* Cabeçalho do Card (Clique para expandir) */}
                                <div
                                    onClick={() => handleToggleDetails(publisher.id)}
                                    className="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer select-none gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {/* Avatar */}
                                        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-surface-300 flex items-center justify-center bg-primary-100/30">
                                            {publisher.gender === "Masculino" ? (
                                                <Image
                                                    alt={publisher.fullName}
                                                    src={avatarMale}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <AvatarFemale className="w-full h-full text-primary-200 bg-primary-100/20" />
                                            )}
                                        </div>

                                        {/* Informações Básicas e Badges */}
                                        <div className="flex flex-col min-w-0 gap-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-typography-800 text-sm sm:text-base truncate">
                                                    {publisher.fullName}
                                                </span>
                                                {publisher.nickname && (
                                                    <span className="text-[11px] font-medium text-typography-500 bg-surface-200/70 px-2 py-0.5 rounded-md">
                                                        "{publisher.nickname}"
                                                    </span>
                                                )}
                                            </div>

                                            {/* Privilégios e Badges */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {/* Grupo de campo */}
                                                {publisher.group?.name && (
                                                    <span className="inline-flex items-center gap-1 bg-surface-200/80 text-typography-600 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-surface-300">
                                                        <Users size={11} className="text-typography-400" />
                                                        {publisher.group.name}
                                                    </span>
                                                )}

                                                {/* Privilégios */}
                                                {publisher.privileges.map((privilege) => {
                                                    if (privilege === Privileges.ANCIAO) {
                                                        return (
                                                            <span
                                                                key={publisher.id + privilege}
                                                                className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-blue-500/20"
                                                            >
                                                                <ShieldCheck size={11} />
                                                                Ancião
                                                            </span>
                                                        )
                                                    }
                                                    if (privilege === Privileges.SM) {
                                                        return (
                                                            <span
                                                                key={publisher.id + privilege}
                                                                className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-purple-500/20"
                                                            >
                                                                <ShieldCheck size={11} />
                                                                Servo Ministerial
                                                            </span>
                                                        )
                                                    }
                                                    if (
                                                        (privilege === Privileges.PIONEIROREGULAR ||
                                                            privilege === Privileges.AUXILIARINDETERMINADO) &&
                                                        isPioneerNow(publisher, new Date())
                                                    ) {
                                                        return (
                                                            <span
                                                                key={publisher.id + privilege}
                                                                className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/20"
                                                            >
                                                                <Award size={11} />
                                                                {privilege === Privileges.PIONEIROREGULAR
                                                                    ? "Pioneiro Regular"
                                                                    : "Auxiliar Contínuo"}
                                                            </span>
                                                        )
                                                    }
                                                    if (
                                                        privilege === Privileges.PIONEIROAUXILIAR &&
                                                        isAuxPioneerMonthNow(publisher)
                                                    ) {
                                                        return (
                                                            <span
                                                                key={publisher.id + privilege}
                                                                className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/20"
                                                            >
                                                                <Award size={11} />
                                                                Pioneiro Auxiliar
                                                            </span>
                                                        )
                                                    }
                                                    return null
                                                })}

                                                {/* Situação se não for Ativo */}
                                                {publisher.situation !== Situation.ATIVO && (
                                                    <span className="inline-flex items-center bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-red-500/20">
                                                        {publisher.situation}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botão Indicador Chevron */}
                                    <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                            isSelected
                                                ? "bg-primary-200/10 text-primary-200 rotate-180"
                                                : "text-typography-400 hover:bg-surface-200"
                                        }`}
                                    >
                                        <ChevronDown size={18} />
                                    </div>
                                </div>

                                {/* Corpo Expandido: Detalhes do Publicador */}
                                {isSelected && (
                                    <div className="border-t border-surface-200 p-4 sm:p-6 bg-surface-200/30 space-y-4">
                                        {/* Grade de Informações em Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {/* Esperança */}
                                            <div className="p-3.5 bg-surface-100 rounded-xl border border-surface-300/80 shadow-2xs flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                                                    <Sparkles size={16} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-bold text-typography-400 uppercase tracking-wider">
                                                        Esperança
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-semibold text-typography-700 truncate">
                                                        {publisher.hope || "Outras ovelhas"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Data de Batismo */}
                                            <div className="p-3.5 bg-surface-100 rounded-xl border border-surface-300/80 shadow-2xs flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
                                                    <Droplets size={16} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-bold text-typography-400 uppercase tracking-wider">
                                                        Batismo
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-semibold text-typography-700 truncate">
                                                        {publisher.dateImmersed
                                                            ? moment(publisher.dateImmersed).format("DD/MM/YYYY")
                                                            : "Não informado"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Data de Nascimento */}
                                            <div className="p-3.5 bg-surface-100 rounded-xl border border-surface-300/80 shadow-2xs flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                                                    <Calendar size={16} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-bold text-typography-400 uppercase tracking-wider">
                                                        Nascimento
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-semibold text-typography-700 truncate">
                                                        {publisher.birthDate
                                                            ? `${moment(publisher.birthDate).format("DD/MM/YYYY")} (${moment().diff(moment(publisher.birthDate), "years")} anos)`
                                                            : "Não informado"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Telefone */}
                                            <div className="p-3.5 bg-surface-100 rounded-xl border border-surface-300/80 shadow-2xs flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                                                    <Phone size={16} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-bold text-typography-400 uppercase tracking-wider">
                                                        Telefone
                                                    </span>
                                                    {publisher.phone ? (
                                                        <a
                                                            href={`tel:${publisher.phone}`}
                                                            className="text-xs sm:text-sm font-semibold text-primary-200 hover:underline truncate"
                                                        >
                                                            {publisher.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs sm:text-sm font-semibold text-typography-400">
                                                            Não informado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Endereço */}
                                            <div className="p-3.5 bg-surface-100 rounded-xl border border-surface-300/80 shadow-2xs flex items-center gap-3 sm:col-span-2">
                                                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                                                    <MapPin size={16} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[11px] font-bold text-typography-400 uppercase tracking-wider">
                                                        Endereço
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-semibold text-typography-700 truncate">
                                                        {publisher.address || "Não informado"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contato de Emergência */}
                                        <div className="p-4 bg-surface-100 rounded-xl border border-surface-300/80 shadow-2xs space-y-2.5">
                                            <div className="flex items-center gap-2 text-typography-800">
                                                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                                                    <ShieldAlert size={15} />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                                    Contato de Emergência
                                                </span>
                                            </div>

                                            {publisher.emergencyContact ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-typography-400 uppercase font-bold">
                                                            Nome
                                                        </span>
                                                        <span className="font-semibold text-typography-700">
                                                            {publisher.emergencyContact.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-typography-400 uppercase font-bold">
                                                            Telefone
                                                        </span>
                                                        <a
                                                            href={`tel:${publisher.emergencyContact.phone}`}
                                                            className="font-semibold text-primary-200 hover:underline"
                                                        >
                                                            {publisher.emergencyContact.phone}
                                                        </a>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-typography-400 uppercase font-bold">
                                                            Parentesco
                                                        </span>
                                                        <span className="font-semibold text-typography-700">
                                                            {publisher.emergencyContact.relationship}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-typography-400 uppercase font-bold">
                                                            É Testemunha de Jeová?
                                                        </span>
                                                        <span className="font-semibold text-typography-700">
                                                            {publisher.emergencyContact.isTj ? "Sim" : "Não"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-typography-400 italic">
                                                    Nenhum contato de emergência cadastrado.
                                                </p>
                                            )}
                                        </div>

                                        {/* Barra de Ações & Data de Atualização */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-surface-200">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {canManage && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() =>
                                                            Router.push(`/congregacao/publicadores/edit/${publisher.id}`)
                                                        }
                                                        className="rounded-xl gap-1.5 text-xs font-semibold border-surface-300 hover:text-primary-200 hover:bg-surface-200 h-9 px-3.5 cursor-pointer shadow-2xs"
                                                    >
                                                        <Pencil size={14} />
                                                        <span>Editar</span>
                                                    </Button>
                                                )}

                                                {(canManage || canMidweek) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() =>
                                                            Router.push(
                                                                `/congregacao/publicadores/indisponibilidades?publisherId=${publisher.id}`
                                                            )
                                                        }
                                                        className="rounded-xl gap-1.5 text-xs font-semibold border-surface-300 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 h-9 px-3.5 cursor-pointer shadow-2xs"
                                                    >
                                                        <CalendarOff size={14} />
                                                        <span>Indisponibilidade</span>
                                                    </Button>
                                                )}

                                                {isAdminCongregation && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() =>
                                                            Router.push(`/congregacao/publicadores/transferir/${publisher.id}`)
                                                        }
                                                        className="rounded-xl gap-1.5 text-xs font-semibold border-surface-300 hover:text-primary-200 hover:bg-surface-200 h-9 px-3.5 cursor-pointer shadow-2xs"
                                                    >
                                                        <ArrowRightLeft size={14} />
                                                        <span>Transferir</span>
                                                    </Button>
                                                )}

                                                {canManage && (
                                                    <ConfirmDeleteModal
                                                        title="Excluir publicador"
                                                        message={`Tem certeza que deseja excluir ${publisher.fullName}? Essa ação removerá o publicador e seus registros permanentemente.`}
                                                        onDelete={() => onDelete(`${publisher.id}`)}
                                                        button={
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                type="button"
                                                                className="rounded-xl gap-1.5 text-xs font-semibold border-surface-300 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-9 px-3.5 cursor-pointer shadow-2xs"
                                                            >
                                                                <Trash2 size={14} />
                                                                <span>Excluir</span>
                                                            </Button>
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <span className="text-[11px] font-medium text-typography-400 self-end sm:self-auto">
                                                Atualizado em:{" "}
                                                {moment(publisher.updated_at).format("DD/MM/YYYY [às] HH:mm")}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            ) : (
                /* Estado Vazio (Empty State) */
                <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-100 rounded-2xl border border-surface-300 shadow-xs">
                    <div className="p-3.5 rounded-2xl bg-surface-200/80 text-typography-400 mb-3">
                        <Users size={32} />
                    </div>
                    <h3 className="text-base font-bold text-typography-800">
                        Nenhum publicador encontrado
                    </h3>
                    <p className="text-xs text-typography-500 max-w-sm mt-1">
                        Não localizamos publicadores para os filtros aplicados ou termo de busca
                        digitado.
                    </p>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 rounded-xl text-xs font-semibold border-surface-300 hover:text-primary-200 h-9 px-4 cursor-pointer shadow-2xs"
                    >
                        Limpar filtros e busca
                    </Button>
                </div>
            )}
        </div>
    )
}
