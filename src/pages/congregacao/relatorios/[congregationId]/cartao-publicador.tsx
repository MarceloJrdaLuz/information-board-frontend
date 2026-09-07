import { crumbsAtom, pageActiveAtom, selectedPublishersToS21Atom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import FilterGroups from "@/Components/FilterGroups"
import FilterPrivileges from "@/Components/FilterPrivileges"
import ModalHelp from "@/Components/ModalHelp"
import PublishersToGenerateS21 from "@/Components/PublishersToGenerateS21"
import SkeletonPublishersList from "@/Components/PublishersToGenerateS21/skeletonPublishersList"
import ReportTable from "@/Components/ReportTable"
import { Button } from "@/Components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog"
import { API_ROUTES } from "@/constants/apiRoutes"
import { getMonthsByYear, getYearService } from "@/functions/meses"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { IMonthsWithYear, IPublisher, IReports, ITotalsReports, Situation, TotalsFrom } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import {
    Calendar,
    Check,
    CheckCheck,
    CheckSquare,
    Eye,
    FileDown,
    FileSpreadsheet,
    HelpCircle,
    Layers,
    RotateCcw,
    Search,
    Users,
    X,
} from "lucide-react"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { PdfLinkComponent } from "../../../../Components/PublishersToGenerateS21/PDFLinkComponent"
function PublisherCardPage() {
    const router = useRouter()
    const { congregationId } = router.query
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [selectedPublishersToS21, setSelectedPublishersToS21] = useAtom(selectedPublishersToS21Atom)
    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [filterPublishers, setfilterPublishers] = useState<IPublisher[]>()
    const [reports, setReports] = useState<IReports[]>()
    const [reportsFiltered, setReportsFiltered] = useState<IReports[]>([])
    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])
    const [modalHelpShow, setModalHelpShow] = useState(false)
    const [yearService, setYearService] = useState(getYearService().toString())
    const [yearServiceSelected, setYearServiceSelected] = useState(getYearService().toString())
    const [groupSelecteds, setGroupSelecteds] = useState<string[]>([])
    const [pdfGenerating, setPdfGenerating] = useState(false)
    const [monthsServiceYears, setMonthsServiceYears] = useState<IMonthsWithYear[]>([])
    const [totals, setTotals] = useState(false)
    const [totalsFrom, setTotalsFrom] = useState('')
    const [reportsTotalsFrom, setReportsTotalsFrom] = useState<ITotalsReports[]>()
    const [reportsTotalsFromFilter, setReportsTotalsFromFilter] = useState<ITotalsReports[]>()
    const [isInitialRender, setIsInitialRender] = useState(true)
    const [modalReportsOpen, setModalReportsOpen] = useState(false);
    const [publishersToView, setPublishersToView] = useState<IPublisher[]>([])
    const [modalYearSelected, setModalYearSelected] = useState(yearServiceSelected);

    const fetchConfig = congregationId ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationId}` : ""
    const { data } = useAuthorizedFetch<IPublisher[]>(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"]
    })

    const fetchTotalsConfig = congregationId ? `/report/totals/${congregationId}` : ""
    const { data: getTotals } = useAuthorizedFetch<ITotalsReports[]>(fetchTotalsConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"]
    })

    useEffect(() => {
        setPageActive("Criar Cartão de Publicador")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Relatórios", link: `/congregacao/relatorios/${congregationId}` }
        ])
    }, [setPageActive, setCrumbs, congregationId])

    useEffect(() => {
        setSelectedPublishersToS21([]);
    }, [congregationId, setSelectedPublishersToS21]);

    let skeletonPublishersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonPublishersList.map((a, i) => (<SkeletonPublishersList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    const sortedData = useMemo(() => {
        if (data) {
            const filterActives = data.filter(publisher => publisher.situation === Situation.ATIVO)
            return sortArrayByProperty(filterActives, "fullName")
        }
        return []
    }, [data])

    useEffect(() => {
        if (sortedData) {
            setPublishers(sortedData)
            // setfilterPublishers(sortedData)
            // sortedData?.map(publisher => setSelectedPublishersToS21(prev => [...prev, publisher.id]))
        }
    }, [sortedData, setPublishers, setfilterPublishers, setSelectedPublishersToS21])

    useEffect(() => {
        if (getTotals) {
            setReportsTotalsFrom(getTotals)
        }
    }, [getTotals])

    useEffect(() => {
        if (!publishers) return;

        const filteredPublishers = publishers.filter(publisher => {
            const belongsToSelectedGroups = groupSelecteds.length === 0 ||
                (publisher.group && groupSelecteds.includes(publisher.group.id));

            const hasSelectedPrivileges = filterPrivileges.length === 0 ||
                filterPrivileges.some(privilege => publisher.privileges.includes(privilege));

            return belongsToSelectedGroups && hasSelectedPrivileges;
        });

        // Depois da primeira renderização, desativa a flag
        if (isInitialRender) setIsInitialRender(false);

    }, [filterPrivileges, groupSelecteds, publishers, setSelectedPublishersToS21, isInitialRender]);

    useEffect(() => {
        if (publishers && selectedPublishersToS21) {
            const filter = publishers?.filter(publisher =>
                selectedPublishersToS21.includes(publisher.id)
            )
            setfilterPublishers(filter)
        }
    }, [publishers, selectedPublishersToS21])

    const getRelatorios = useCallback(async () => {
        if (congregationId) {
            await api.get(`/reports/${congregationId}`).then(res => {
                const { data } = res
                setReports([...data])
            }).catch(err => console.log(err))
        }
    }, [congregationId])

    useEffect(() => {
        getRelatorios()
    }, [getRelatorios])

    useEffect(() => {
        if (filterPublishers && reports) {
            const reportsFilteredByPublisher = reports.filter(report => {
                return filterPublishers.some(publisher => {
                    return report.publisher.id === publisher.id
                })
            })
            if (reportsFilteredByPublisher) {
                setReportsFiltered(reportsFilteredByPublisher)
            }
        }
    }, [reports, filterPublishers, yearServiceSelected])

    // Filtrar por privilégios
    const handleCheckboxChange = (filter: string[]) => {
        setFilterPrivileges(filter);

        // Atualiza os selecionados apenas com base no que o usuário marcou
        const filtered = publishers?.filter(publisher =>
            filter.some(priv => publisher.privileges.includes(priv))
        );
        setSelectedPublishersToS21(filtered?.map(p => p.id) || []);
    };

    // Filtrar por grupos
    const handleCheckboxGroupsChange = (groups: string[]) => {
        setGroupSelecteds(groups);

        const filtered = publishers?.filter(publisher =>
            groups.includes(publisher.group?.id || '')
        );
        setSelectedPublishersToS21(filtered?.map(p => p.id) || []);
    };

    const handleCheckboxTotalsChange = (check: boolean) => {
        setPdfGenerating(false)
        setTotals(check)
        !check && setTotalsFrom('')
    }

    useEffect(() => {
        const previousServiceYear = (Number(yearServiceSelected) - 1).toString()
        const { months } = getMonthsByYear(yearServiceSelected)
        const { months: monthsPreviousServiceYear } = getMonthsByYear(previousServiceYear)
        const monthsPreviousServiceYearObject: IMonthsWithYear = {
            year: (Number(yearServiceSelected) - 1).toString(),
            months: monthsPreviousServiceYear,
            totalHours: 0
        }
        const monthsServiceYearObject: IMonthsWithYear = {
            year: yearServiceSelected,
            months,
            totalHours: 0
        }
        setMonthsServiceYears([monthsServiceYearObject, monthsPreviousServiceYearObject])
    }, [yearServiceSelected])

    useEffect(() => {
        const filter = reportsTotalsFrom?.filter(report => report.privileges?.includes(totalsFrom))
        setReportsTotalsFromFilter(filter)
    }, [totalsFrom, reportsTotalsFrom])

    const [searchTerm, setSearchTerm] = useState("")

    const displayedPublishers = useMemo(() => {
        if (!publishers) return []
        if (!searchTerm.trim()) return publishers
        const term = searchTerm.toLowerCase().trim()
        return publishers.filter(p =>
            p.fullName.toLowerCase().includes(term) ||
            p.nickname?.toLowerCase().includes(term) ||
            p.group?.name?.toLowerCase().includes(term) ||
            p.group?.number?.toString().includes(term)
        )
    }, [publishers, searchTerm])

    const handleSelectAll = () => {
        setPdfGenerating(false)
        if (displayedPublishers && displayedPublishers.length > 0) {
            setSelectedPublishersToS21(displayedPublishers.map(p => p.id))
        }
    }

    const handleClearSelection = () => {
        setPdfGenerating(false)
        setSelectedPublishersToS21([])
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Criar Cartão de Publicador"} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full pb-36">
                {/* Cabeçalho Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-typography-800">
                                    Cartão de Publicador (S-21)
                                </h1>
                                <p className="text-sm text-typography-500">
                                    Emissão e controle dos registros anuais de atividade de campo da congregação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalHelpShow(true)}
                            className="gap-2 rounded-xl text-xs font-semibold h-10 px-4 border-surface-300 hover:bg-surface-200 text-typography-700 cursor-pointer"
                        >
                            <HelpCircle className="w-4 h-4 text-primary-200" />
                            <span>Instruções (S-21)</span>
                        </Button>
                    </div>
                </div>

                {/* Modal de Ajuda */}
                {modalHelpShow && (
                    <ModalHelp
                        open={modalHelpShow}
                        setOpen={setModalHelpShow}
                        title="Como gerar os registros de publicadores (S-21)"
                        text={`Na lista abaixo aparecem todos os publicadores da congregação por ordem alfabética. Por padrão nenhum deles vem selecionado.

No botão de filtro você pode escolher para filtrar pelos privilégios (Ex: selecionando "Ancião" e "Servo", ele selecionará apenas os registros correspondentes). Você também pode escolher um privilégio e acrescentar manualmente mais alguns publicadores clicando no nome deles na lista.

Há também o filtro de grupo. Você pode filtrar apenas publicadores de um ou mais grupos, e usar o filtro de privilégios em conjunto.

Quando os registros desejados estiverem selecionados, utilize a barra flutuante inferior para visualizar na tela ou baixar o PDF oficial S-21 pronto para impressão.`}
                    />
                )}

                {/* Barra de Métricas */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-700">
                        <Users className="w-4 h-4 text-primary-200" />
                        <span>{publishers?.length || 0} publicadores ativos</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckSquare className="w-4 h-4" />
                        <span>
                            {totals
                                ? `Totais: ${totalsFrom || "Nenhum selecionado"}`
                                : `${filterPublishers?.length || 0} selecionado(s) para PDF`}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl border border-surface-300 text-xs font-semibold text-typography-600">
                        <Calendar className="w-4 h-4 text-primary-200" />
                        <span>Ano de Serviço: {yearServiceSelected}</span>
                    </div>
                </div>

                {/* Painel de Controles, Filtros e Busca */}
                <div className="flex flex-col gap-4 p-5 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    {/* Linha 1: Alternador de Modo (Publicadores vs Totais) & Ano de Serviço */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center p-1 bg-surface-200 rounded-xl border border-surface-300 w-fit">
                            <button
                                type="button"
                                onClick={() => handleCheckboxTotalsChange(false)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                    !totals
                                        ? "bg-surface-100 text-typography-800 shadow-xs"
                                        : "text-typography-500 hover:text-typography-800"
                                }`}
                            >
                                <Users className="w-3.5 h-3.5 text-primary-200" />
                                <span>Publicadores Individuais ({filterPublishers?.length || 0})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCheckboxTotalsChange(true)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                    totals
                                        ? "bg-surface-100 text-typography-800 shadow-xs"
                                        : "text-typography-500 hover:text-typography-800"
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5 text-primary-200" />
                                <span>Totais da Congregação</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <Dropdown
                                onClick={() => setPdfGenerating(false)}
                                textSize="md"
                                notBorderFocus
                                selectedItem={yearServiceSelected}
                                handleClick={(select) => setYearServiceSelected(select)}
                                textVisible
                                title="Ano de Serviço"
                                options={[yearService, (Number(yearService) - 1).toString(), (Number(yearService) - 2).toString()]}
                            />
                        </div>
                    </div>

                    {/* Linha 2: Busca por nome e Filtros Avançados (quando em modo individual) */}
                    {!totals && (
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-surface-300">
                            {/* Campo de Busca */}
                            <div className="relative flex-1 min-w-[260px] max-w-md">
                                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-typography-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, apelido ou grupo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-9 py-2.5 bg-surface-200/50 border border-surface-300 rounded-xl text-xs text-typography-800 placeholder-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-xs"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-3 text-typography-400 hover:text-typography-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filtros e Ações Rápidas de Seleção */}
                            <div className="flex flex-wrap items-center gap-2">
                                <FilterGroups
                                    onClick={() => setPdfGenerating(false)}
                                    checkedOptions={groupSelecteds}
                                    congregation_id={congregationId as string}
                                    handleCheckboxChange={(groups) => handleCheckboxGroupsChange(groups)}
                                />

                                <FilterPrivileges
                                    includeOptionAll
                                    onClick={() => setPdfGenerating(false)}
                                    checkedOptions={filterPrivileges}
                                    handleCheckboxChange={(filters) => handleCheckboxChange(filters)}
                                />

                                <div className="h-6 w-px bg-surface-300 hidden sm:block mx-1" />

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-700 cursor-pointer"
                                    title="Selecionar todos os publicadores visíveis"
                                >
                                    <CheckCheck className="w-3.5 h-3.5 text-primary-200" />
                                    <span>Todos</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearSelection}
                                    className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-700 cursor-pointer"
                                    title="Limpar seleção atual"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-typography-400" />
                                    <span>Limpar</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo Principal: Lista de Publicadores ou Seleção de Totais */}
                {publishers ? (
                    !totals ? (
                        <div className="flex flex-col gap-2">
                            {displayedPublishers.length > 0 ? (
                                displayedPublishers.map(publisher => (
                                    <PublishersToGenerateS21
                                        key={publisher.id}
                                        publisher={publisher}
                                        onClick={() => setPdfGenerating(false)}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-14 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                                    <Search className="w-10 h-10 text-typography-400 mb-2" />
                                    <p className="text-base font-bold text-typography-800">
                                        Nenhum publicador encontrado
                                    </p>
                                    <p className="text-xs text-typography-500 mt-1 max-w-sm">
                                        Não encontramos registros com o filtro ou termo pesquisado. Tente limpar os filtros.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.values(TotalsFrom).map(ob => {
                                const isSelected = totalsFrom?.includes(ob);
                                return (
                                    <div
                                        key={ob}
                                        onClick={() => {
                                            setPdfGenerating(false);
                                            setTotalsFrom(ob);
                                        }}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-primary-200/10 border-primary-200 text-primary-300 ring-1 ring-primary-200/30 font-semibold shadow-xs"
                                                : "bg-surface-100 border-surface-300 hover:bg-surface-200/50 hover:border-primary-200/40 text-typography-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary-200 bg-primary-200" : "border-surface-300"}`}>
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <span className="text-sm">{ob}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    renderSkeleton()
                )}

                {/* Barra Flutuante de Ação (Dock Inferior) */}
                {(
                    (!totals && (filterPublishers?.length ?? 0) > 0) ||
                    (totals && (reportsTotalsFromFilter?.length ?? 0) > 0)
                ) && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-2xl shadow-xl px-5 py-3 flex items-center justify-between gap-4 sm:gap-6 w-[92%] sm:w-auto max-w-lg transition-all animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                                <CheckSquare className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-typography-800">
                                    {totals
                                        ? `Total: ${totalsFrom || "Nenhum"}`
                                        : `${filterPublishers?.length ?? 0} selecionado(s)`}
                                </span>
                                <span className="text-[10px] text-typography-500">
                                    Ano {yearServiceSelected}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {!totals && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setPublishersToView(filterPublishers ?? []);
                                        setModalReportsOpen(true);
                                    }}
                                    className="gap-1.5 h-9 rounded-xl text-xs font-semibold border-surface-300 hover:bg-surface-200 cursor-pointer"
                                    title="Visualizar relatórios na tela"
                                >
                                    <Eye className="w-4 h-4 text-primary-200" />
                                    <span className="hidden sm:inline">Visualizar</span>
                                </Button>
                            )}

                            <PdfLinkComponent
                                pdfData={{
                                    publishers: !totals ? filterPublishers : undefined,
                                    reportsFiltered: !totals ? reportsFiltered : undefined,
                                    monthsServiceYears,
                                    totals,
                                    reportsTotalsFromFilter: totals ? reportsTotalsFromFilter : undefined
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-200 hover:bg-primary-300 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <FileDown className="w-4 h-4" />
                                <span>Gerar S-21</span>
                            </PdfLinkComponent>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------- MODAL DE RELATÓRIOS ---------- */}
            <Dialog open={modalReportsOpen} onOpenChange={setModalReportsOpen}>
                <DialogContent className="max-w-4xl w-full bg-surface-100 border border-surface-300 max-h-[90vh] overflow-y-auto p-6 sm:rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg text-typography-800">
                            <FileSpreadsheet className="w-5 h-5 text-primary-200" />
                            <span>Visualizar Registros de Publicador</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-surface-300">
                        <span className="text-xs text-typography-500">
                            Exibindo relatórios de {publishersToView?.length || 0} publicador(es) selecionado(s)
                        </span>
                        <Dropdown
                            textSize="md"
                            notBorderFocus
                            selectedItem={modalYearSelected}
                            handleClick={(year) => setModalYearSelected(year)}
                            textVisible
                            title="Ano de Serviço"
                            options={[yearServiceSelected, (Number(yearServiceSelected) - 1).toString(), (Number(yearServiceSelected) - 2).toString()]}
                        />
                    </div>

                    <div className="flex flex-col gap-6 py-2">
                        {publishersToView?.map(publisher => {
                            const monthsWithYear = getMonthsByYear(modalYearSelected)

                            const reportsFilter = monthsWithYear.months
                                .map(monthYear => {
                                    const [month, year] = monthYear.split(" ");
                                    return reportsFiltered?.find(
                                        r =>
                                            r.publisher.id === publisher.id &&
                                            r.month === month &&
                                            r.year === year
                                    )
                                })
                                .filter((r): r is IReports => r !== undefined)

                            return (
                                <div key={publisher.id} className="p-4 bg-surface-200/50 rounded-2xl border border-surface-300">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <h3 className="text-base font-bold text-typography-800">{publisher.fullName}</h3>
                                        {publisher.group && (
                                            <span className="text-xs text-typography-500 font-medium">
                                                {publisher.group.name || `Grupo ${publisher.group.number}`}
                                            </span>
                                        )}
                                    </div>

                                    <ReportTable reports={reportsFilter} />
                                </div>
                            )
                        })}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-xl border-surface-300 hover:bg-surface-200 cursor-pointer"
                            onClick={() => setModalReportsOpen(false)}
                        >
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentDashboard>
    )
}

PublisherCardPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "REPORTS_MANAGER"])

export default PublisherCardPage