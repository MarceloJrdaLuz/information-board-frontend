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
import { Eye, HelpCircle } from "lucide-react"
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
        setPageActive("Registros")
    }, [setPageActive])

    useEffect(() => {
        setSelectedPublishersToS21([]);
    }, [congregationId, setSelectedPublishersToS21]);


    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Relatórios', link: `/congregacao/relatorios/${congregationId}` }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs, setPageActive, congregationId])

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

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Criar Cartão de Publicador"} />
            <section className="flex flex-col items-center p-5 pb-36 w-full">
                <div className="flex justify-between w-full mt-5 ">
                    <h2 className="text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold mb-4">Registro de publicadores</h2>
                    <HelpCircle onClick={() => setModalHelpShow(!modalHelpShow)} className="text-primary-200  hover:text-primary-150 cursor-pointer" />
                </div>
                {publishers && (
                    <div className="w-full md:w-9/12">
                        <div>
                            {modalHelpShow &&
                                <ModalHelp
                                    open={modalHelpShow}
                                    setOpen={setModalHelpShow}
                                    title="Como gerar os registros de publicadores (S-21)"
                                    text={
                                        `  
    Na lista abaixo aparece todos os publicadores da congregação por ordem alfabética. Por padrão nenhum deles vem selecionado.
                                            
    No botao de filtro você escolher para filtrar pelos privilégios. Ex: selecionando "Ancião" e "Servo", ele selecionará apenas os registros de anciãos e servos. Você também pode escolher um privilégio, e ainda acrescentar manualmente mais alguns publicadores clicando no nome deles na lista. Caso queira incluir todos os registros para gerar um Pdf com todos, no botão de filtros escolha a opção "Todos". Dessa forma todos os privilégios vão ser selecionados.

    Há também o filtro de grupo. Você pode filtrar apenas publicadores de um ou mais grupos, e ainda pode usar o filtro de privilégios em conjunto, para selecionar por exemplo apenas os anciãos do Grupo 1.
    
    Sempre que você muda os publicadores selecionados e deseja criar o Pdf basta clicar no botão na parte superior "Preparar registros", quando o Pdf estiver preparado bastar clicar no botão "Gerar S-21". Lembrando que quando mais de um publicador está selecionado é necessário usar esse botão. Caso queira criar um registro para cada publicador individualmente, você seleciona ele na lista e vai aparecer ao lado ou abaixo do seu nome um botão "Preparar registro" ao clicar nele ele vai aparecer o botão "Gerar S-21" desse registro individual. 
    
    Por padrão quando há mais de um publicador na selecão o Pdf ira com o nome padrão de "Registro de publicadores", e se for apenas um publicador selecionado o nome padrão será o nome completo do publicador selecionado.
    `} />}
                        </div>
                        <div className="flex justify-between items-center w-full mb-4">
                            <div className="flex flex-col">
                                <Dropdown onClick={() => setPdfGenerating(false)} textSize="md" notBorderFocus selectedItem={yearServiceSelected} handleClick={(select) => setYearServiceSelected(select)} textVisible title="Ano de Serviço" options={[yearService, (Number(yearService) - 1).toString(), (Number(yearService) - 2).toString()]} />
                            </div>
                            <div className="flex h-1/2 justify-center items-center gap-1">
                                <FilterGroups onClick={() => setPdfGenerating(false)} checkedOptions={groupSelecteds} congregation_id={congregationId as string} handleCheckboxChange={(groups) => handleCheckboxGroupsChange(groups)} />

                                <FilterPrivileges includeOptionAll onClick={() => setPdfGenerating(false)} checkedOptions={filterPrivileges} handleCheckboxChange={(filters) => handleCheckboxChange(filters)} />
                            </div>
                        </div>
                        {publishers.length > 0 ? (
                            <>
                                <div className="flex justify-between">
                                    <CheckboxBoolean handleCheckboxChange={(check) => handleCheckboxTotalsChange(check)} checked={totals} label="Totais" />
                                    {!totals && <span className="flex justify-end text-primary-200 text-sm md:text-base font-semibold">{`Registros selecionados: ${!totals ? filterPublishers?.length : reportsTotalsFromFilter?.length}`}</span>}
                                </div>
                                {!totals ?
                                    publishers?.map(publisher => (
                                        <div key={publisher.id} className="flex items-center justify-between">
                                            <PublishersToGenerateS21 onClick={() => setPdfGenerating(false)} key={publisher.id} publisher={publisher} />
                                        </div>
                                    )) : (
                                        <ul>
                                            {Object.values(TotalsFrom).map(ob => (
                                                <li
                                                    key={ob}
                                                    onClick={() => {
                                                        setPdfGenerating(false),
                                                            setTotalsFrom(ob)
                                                    }}
                                                    className={`flex justify-between flex-wrap  my-1 w-full list-none cursor-pointer ${totalsFrom?.includes(ob) ? "bg-gradient-to-br from-primary-100 to-primary-150" : "bg-surface-100 hover:bg-surface-100/50"} `}
                                                >
                                                    <div className={`flex flex-col p-4 text-typography-800`}>
                                                        <span>{ob}</span>
                                                    </div>

                                                </li>

                                            ))}
                                        </ul>
                                    )}
                            </>
                        ) : (
                            renderSkeleton()
                        )}
                    </div>
                )}

                {/* Botão Visualizar */}
                {filterPublishers && filterPublishers.length > 0 && (
                    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 
                  bg-surface-100 border border-surface-300 
                  rounded-xl shadow-lg px-4 py-2 
                  flex items-center gap-4">

                        <span className="text-sm text-typography-700 font-medium">
                            {totals
                                ? `${reportsTotalsFromFilter?.length ?? 0} totais selecionados`
                                : `${filterPublishers.length} publicador(es) selecionado(s)`
                            }
                        </span>

                        <button
                            onClick={() => {
                                setPublishersToView(filterPublishers);
                                setModalReportsOpen(true);
                            }}
                            className="text-primary-200 hover:text-primary-150"
                            title="Visualizar"
                        >
                            <Eye className="w-5 h-5" />
                        </button>

                        <PdfLinkComponent
                            pdfData={{
                                publishers: !totals ? filterPublishers : undefined,
                                reportsFiltered: !totals ? reportsFiltered : undefined,
                                monthsServiceYears,
                                totals,
                                reportsTotalsFromFilter: totals ? reportsTotalsFromFilter : undefined
                            }}
                        />
                    </div>
                )}


            </section>
            {/* ---------- MODAL DE RELATÓRIOS ---------- */}
            <Dialog open={modalReportsOpen} onOpenChange={setModalReportsOpen}>
                <DialogContent className="max-w-4xl w-full bg-surface-100 max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader>
                        <DialogTitle className="text-typography-700">Visualizar relatórios</DialogTitle>
                    </DialogHeader>
                    <Dropdown
                        textSize="md"
                        notBorderFocus
                        selectedItem={modalYearSelected}
                        handleClick={(year) => setModalYearSelected(year)}
                        textVisible
                        title="Ano de Serviço"
                        options={[yearServiceSelected, (Number(yearServiceSelected) - 1).toString(), (Number(yearServiceSelected) - 2).toString()]}
                    />

                    <div className="flex flex-col gap-6 mt-4">
                        {publishersToView?.map(publisher => {
                            const monthsWithYear = getMonthsByYear(modalYearSelected)

                            const reportsFilter = monthsWithYear.months
                                .map(monthYear => {
                                    const [month, year] = monthYear.split(" ");
                                    return reportsFiltered?.find(
                                        r => r.month === month && r.year === year
                                    );
                                })
                                .filter((r): r is IReports => r !== undefined)

                            return (
                                <div className="flex flex-col gap-6 mt-4">
                                    <div key={publisher.id}>
                                        <h3 className="text-lg font-semibold text-primary-200 mb-2">{publisher.fullName}</h3>
                                        <ReportTable
                                            key={publisher.id}
                                            reports={reportsFilter}
                                        />
                                    </div>

                                </div>
                            )
                        })}
                    </div>

                    <DialogFooter>
                        <Button className="bg-primary-200 hover:bg-primary-200/80" onClick={() => setModalReportsOpen(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </ContentDashboard>
    )
}

PublisherCardPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "REPORTS_MANAGER"])

export default PublisherCardPage