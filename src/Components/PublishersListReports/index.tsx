import { reportsAtom, successFormSend } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { capitalizeFirstLetter, isAuxPioneerMonthNow } from "@/functions/isAuxPioneerMonthNow"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { IPublisher, Privileges, Situation } from "@/types/types"
import { useAtom, useAtomValue } from "jotai"
import {
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    FileSpreadsheet,
    Search,
    Users,
    X
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import avatarMale from '../../../public/images/avatar-male.png'
import AvatarFemale from "../AvatarFemale"
import CheckboxBoolean from "../CheckboxBoolean"
import FilterPrivileges from "../FilterPrivileges"
import FormReportManually from "../Forms/FormReportManually"
import SkeletonPublishersWithAvatarList from "../PublishersList/skeletonPublisherWithAvatarList"
import { API_ROUTES } from "@/constants/apiRoutes"

export default function PublisherListReports() {
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const router = useRouter()
    const { month, congregationId } = router.query
    const monthParam = month as string

    const fetchConfig = congregationUser ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}` : ""
    const { data, mutate } = useFetch<IPublisher[]>(fetchConfig)

    const [reports, setReports] = useAtom(reportsAtom)
    const dataSuccess = useAtomValue(successFormSend)

    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisher | null>(null)
    const [filterPublishers, setFilterPublishers] = useState<IPublisher[]>()
    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    const [inactivesShow, setInactivesShow] = useState(false)
    const [publishersOthers, setPublishersOthers] = useState<IPublisher[]>()
    const [arrowClicked, setArrowClicked] = useState(false)

    const [yearSelected, setYearSelected] = useState('')
    const [monthSelected, setMonthSelected] = useState('')

    const handleShowDetails = (publisher: IPublisher) => {
        if (selectedPublisher && selectedPublisher.id === publisher.id) {
            setArrowClicked(!arrowClicked)
        } else {
            setSelectedPublisher(publisher)
            setArrowClicked(true)
        }
    }

    useEffect(() => {
        if (monthParam) {
            const splitWord = monthParam.split(" ")
            setMonthSelected(splitWord[0] || "")
            setYearSelected(splitWord[1] || "")
        }
    }, [monthParam])

    // Sincroniza os relatórios com a API para garantir que o status de "Lançado / Pendente" esteja sempre atualizado
    const fetchReports = useCallback(async () => {
        const congId = (congregationUser?.id || congregationId) as string
        if (!congId) return
        try {
            const res = await api.get(`/reports/${congId}`)
            if (res?.data) {
                setReports(res.data)
            }
        } catch (err) {
            console.error("Erro ao sincronizar relatórios:", err)
        }
    }, [congregationUser?.id, congregationId, setReports])

    useEffect(() => {
        fetchReports()
    }, [fetchReports])

    // Recarrega relatórios quando uma criação/exclusão tem sucesso
    useEffect(() => {
        if (dataSuccess) {
            fetchReports()
        }
    }, [dataSuccess, fetchReports])

    useEffect(() => {
        if (data) {
            const filterActives = data?.filter(publisher => publisher.situation === Situation.ATIVO)
            const filterOthers = data?.filter(publisher => (publisher.situation === Situation.INATIVO || publisher.situation === Situation.REMOVIDO || publisher.situation === Situation.DESASSOCIADO))
            const sortActives = sortArrayByProperty(filterActives, "fullName")
            const sortOthersSituation = sortArrayByProperty(filterOthers, "fullName")
            setPublishers(sortActives)
            setPublishersOthers(sortOthersSituation)
        }
    }, [data])

    useEffect(() => {
        mutate()
    }, [router.asPath, mutate])

    const handleCheckboxChange = (filter: string[]) => {
        setFilterPrivileges(filter)
    }

    useEffect(() => {
        if (inactivesShow) {
            setFilterPublishers(publishersOthers)
            return
        }
        const filterPublishersToPrivileges = filterPrivileges.length > 0 ?
            publishers?.filter(publisher => {
                return (publisher.situation === Situation.ATIVO &&
                    filterPrivileges.every(privilege => {
                        if (privilege === Privileges.PIONEIROAUXILIAR) {
                            return publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonthNow(publisher)
                        } else if (privilege === Privileges.PIONEIROREGULAR) {
                            return publisher.privileges.includes(Privileges.PIONEIROREGULAR) && isPioneerNow(publisher, new Date())
                        } else if (privilege === Privileges.AUXILIARINDETERMINADO) {
                            return publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && isPioneerNow(publisher, new Date())
                        } else {
                            return publisher.privileges.includes(privilege)
                        }
                    })
                )
            }) : publishers?.filter(publisher => publisher.situation === Situation.ATIVO)
        setFilterPublishers(filterPublishersToPrivileges)
    }, [filterPrivileges, publishers, inactivesShow, publishersOthers])

    // Busca e filtragem por texto
    const displayedPublishers = useMemo(() => {
        if (!filterPublishers) return []
        if (!searchTerm.trim()) return filterPublishers
        const term = searchTerm.toLowerCase().trim()
        return filterPublishers.filter(p =>
            p.fullName.toLowerCase().includes(term) ||
            p.nickname?.toLowerCase().includes(term) ||
            p.group?.name?.toLowerCase().includes(term)
        )
    }, [filterPublishers, searchTerm])

    // Métricas para o mês selecionado
    const stats = useMemo(() => {
        if (!filterPublishers) return { total: 0, reported: 0, pending: 0 }
        let reported = 0
        filterPublishers.forEach(p => {
            const hasReport = reports.some(r =>
                r.publisher.id === p.id &&
                r.month.toLowerCase() === monthSelected.toLowerCase() &&
                r.year === yearSelected
            )
            if (hasReport) reported++
        })
        return {
            total: filterPublishers.length,
            reported,
            pending: filterPublishers.length - reported
        }
    }, [filterPublishers, reports, monthSelected, yearSelected])

    const getPublisherReport = useCallback((publisherId: string) => {
        return reports.find(r =>
            r.publisher.id === publisherId &&
            r.month.toLowerCase() === monthSelected.toLowerCase() &&
            r.year === yearSelected
        )
    }, [reports, monthSelected, yearSelected])

    const skeletonPublishersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center gap-3">
                {skeletonPublishersList.map((_, i) => (<SkeletonPublishersWithAvatarList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <div className="w-full flex flex-col items-center px-3 sm:px-6 py-4 max-w-6xl mx-auto">
            {/* Header Card */}
            <div className="w-full bg-surface-100 border border-surface-300 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-typography-800 tracking-tight">
                                Inserir Relatório Manual
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-600 mt-0.5">
                                Selecione um publicador para lançar, revisar ou excluir o relatório mensal.
                            </p>
                        </div>
                    </div>

                    {monthParam && (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-200 border border-surface-300 text-typography-700 text-xs sm:text-sm font-semibold self-start md:self-auto shrink-0 shadow-xs">
                            <Calendar className="w-4 h-4 text-primary-200" />
                            <span>Mês: {capitalizeFirstLetter(monthParam)}</span>
                        </div>
                    )}
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5 pt-4 border-t border-surface-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface-200/50 border border-surface-300">
                        <span className="text-xs font-medium text-typography-600">Total</span>
                        <span className="text-base sm:text-lg font-bold text-typography-800">{stats.total}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Lançados</span>
                        <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">{stats.reported}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Pendentes</span>
                        <span className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-400">{stats.pending}</span>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="w-full bg-surface-100 border border-surface-300 rounded-2xl p-4 mb-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Input de Busca */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-500" />
                        <input
                            type="text"
                            placeholder="Buscar publicador por nome ou apelido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-sm bg-surface-200/60 border border-surface-300 rounded-xl text-typography-800 placeholder:text-typography-500 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-typography-500 hover:text-typography-800 rounded-lg"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filtros */}
                    <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
                        <CheckboxBoolean
                            handleCheckboxChange={(check) => setInactivesShow(check)}
                            checked={inactivesShow}
                            label="Inativos"
                        />
                        <FilterPrivileges
                            checkedOptions={filterPrivileges}
                            handleCheckboxChange={filter => handleCheckboxChange(filter)}
                        />
                        <span className="text-xs font-semibold text-primary-200 pl-1">
                            {displayedPublishers.length} {displayedPublishers.length === 1 ? "publicador" : "publicadores"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Lista de Publicadores */}
            <div className="w-full">
                {filterPublishers ? (
                    displayedPublishers.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                            {displayedPublishers.map((publisher) => {
                                const isOpen = arrowClicked && selectedPublisher?.id === publisher.id
                                const currentReport = getPublisherReport(publisher.id)

                                return (
                                    <div
                                        key={publisher.id}
                                        className={`w-full bg-surface-100 border rounded-2xl transition-all duration-200 shadow-xs overflow-hidden ${
                                            isOpen
                                                ? "border-primary-200 ring-2 ring-primary-200/20 shadow-sm"
                                                : "border-surface-300 hover:border-primary-200/60 hover:bg-surface-200/30"
                                        }`}
                                    >
                                        {/* Cabeçalho do Card (Trigger) */}
                                        <div
                                            onClick={() => handleShowDetails(publisher)}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 cursor-pointer gap-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Avatar */}
                                                <div className="relative shrink-0">
                                                    {publisher.gender === "Masculino" ? (
                                                        <Image
                                                            alt="Avatar masculino"
                                                            src={avatarMale}
                                                            className="w-10 h-10 rounded-full bg-primary-100/30 ring-1 ring-surface-300"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary-100/30 ring-1 ring-surface-300 flex items-center justify-center">
                                                            <AvatarFemale className="w-8 h-8 rounded-full text-primary-200" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Nome e Badges */}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm sm:text-base text-typography-800 truncate">
                                                            {publisher.fullName}
                                                        </span>
                                                        {publisher.nickname && (
                                                            <span className="text-xs text-typography-500">
                                                                ({publisher.nickname})
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                        {publisher.group?.name && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-200 text-typography-600 border border-surface-300">
                                                                {publisher.group.name}
                                                            </span>
                                                        )}
                                                        {publisher.privileges?.map((priv) => (
                                                            <span
                                                                key={priv}
                                                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary-200/10 text-primary-200 border border-primary-200/20"
                                                            >
                                                                {priv}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status do Relatório e Chevron */}
                                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-300/60">
                                                {currentReport ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span>
                                                            Lançado
                                                            {currentReport.hours > 0 ? ` • ${currentReport.hours}h` : ''}
                                                            {currentReport.studies ? ` • ${currentReport.studies} est.` : ''}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Pendente</span>
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    aria-label="Expandir formulário"
                                                    className={`w-8 h-8 rounded-xl flex items-center justify-center bg-surface-200/80 text-typography-600 hover:text-typography-800 transition-transform duration-200 ${
                                                        isOpen ? "rotate-180 text-primary-200 bg-primary-200/10" : ""
                                                    }`}
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Acordeão do Formulário */}
                                        {isOpen && (
                                            <div className="border-t border-surface-300/80 bg-surface-200/30 p-2 sm:p-5 transition-all">
                                                <FormReportManually
                                                    publisher={publisher}
                                                    report={currentReport ?? null}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center p-12 bg-surface-100 border border-surface-300 rounded-2xl text-center">
                            <Users className="w-12 h-12 text-typography-400 mb-3" />
                            <h3 className="text-base font-semibold text-typography-800">
                                Nenhum publicador encontrado
                            </h3>
                            <p className="text-xs sm:text-sm text-typography-500 mt-1 max-w-sm">
                                {searchTerm
                                    ? `Não foram encontrados publicadores correspondentes a "${searchTerm}".`
                                    : "Não há publicadores cadastrados para os filtros selecionados."}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 px-4 py-1.5 text-xs font-semibold text-primary-200 hover:underline"
                                >
                                    Limpar busca
                                </button>
                            )}
                        </div>
                    )
                ) : (
                    renderSkeleton()
                )}
            </div>
        </div>
    )
}
