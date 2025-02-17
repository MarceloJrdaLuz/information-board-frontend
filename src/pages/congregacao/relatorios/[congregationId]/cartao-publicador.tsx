import { crumbsAtom, pageActiveAtom, selectedPublishersToS21Atom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import CardTotals from "@/Components/CardTotals"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import FilterGroups from "@/Components/FilterGroups"
import FilterPrivileges from "@/Components/FilterPrivileges"
import PdfIcon from "@/Components/Icons/PdfIcon"
import Layout from "@/Components/Layout"
import ModalHelp from "@/Components/ModalHelp"
import S21 from "@/Components/PublisherCard"
import PublishersToGenerateS21 from "@/Components/PublishersToGenerateS21"
import SkeletonPublishersList from "@/Components/PublishersToGenerateS21/skeletonPublishersList"
import { IMonthsWithYear, IPublisher, IReports, ITotalsReports, Privileges, Situation, TotalsFrom } from "@/entities/types"
import { getMonthsByYear, getYearService } from "@/functions/meses"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { Document, PDFDownloadLink } from '@react-pdf/renderer'
import { useAtom } from "jotai"
import { HelpCircle } from "lucide-react"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useCallback, useEffect, useMemo, useState } from "react"


export default function PublisherCard() {
    const router = useRouter()
    const { congregationId } = router.query
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const fetchConfig = congregationId ? `/publishers/congregationId/${congregationId}` : ""
    const { data } = useFetch<IPublisher[]>(fetchConfig)

    const fetchTotalsConfig = congregationId ? `/report/totals/${congregationId}` : ""
    const { data: getTotals } = useFetch<ITotalsReports[]>(fetchTotalsConfig)

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

    useEffect(() => {
        setPageActive("Registros")
    }, [setPageActive])

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
        if (publishers) {
            const filteredPublishers = publishers.filter(publisher => {

                const belongsToSelectedGroups = groupSelecteds.length === 0 ||
                    (publisher.group && !groupSelecteds.includes(publisher.group.id))
                filterPrivileges.some(privilege => {
                    return publisher.privileges.includes(privilege)
                })
                const hasSelectedPrivileges =
                    filterPrivileges.some(privilege => publisher.privileges.includes(privilege))

                return belongsToSelectedGroups && hasSelectedPrivileges
            })

            if (filteredPublishers) {
                const publishersIds: string[] = []
                filteredPublishers.map(publisher => publishersIds.push(publisher.id))
                setSelectedPublishersToS21(publishersIds)
            }
        }
    }, [filterPrivileges, groupSelecteds, publishers, setSelectedPublishersToS21])

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

    const handleCheckboxChange = (filter: string[]) => {
        if (filter.includes(Privileges.PIONEIROAUXILIAR)) {
            setFilterPrivileges([...filter, Privileges.AUXILIARINDETERMINADO])
        } else if (filter.includes('Todos')) {
            setFilterPrivileges([...Object.values(Privileges), ...filter])
        } else {
            setFilterPrivileges(filter)
        }
    }

    const handleCheckboxGroupsChange = (filter: string[]) => {
        setGroupSelecteds(filter)
    }

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

    const PdfLinkComponent = () => (
        <PDFDownloadLink
            document={
                <Document>
                    {!totals && filterPublishers && filterPublishers.length > 0 ?
                        filterPublishers.map((publisher, index) => {
                            const reports = reportsFiltered.filter(report => report.publisher.id === publisher.id)
                            return (
                                (
                                    <S21
                                        key={index}
                                        publisher={publisher}
                                        reports={reports}
                                        monthsWithYear={monthsServiceYears}
                                    />
                                )
                            )
                        }) : reportsTotalsFromFilter && (
                            (
                                <CardTotals
                                    months={monthsServiceYears}
                                    reports={reportsTotalsFromFilter ?? []}
                                />
                            ))
                    }
                </Document>
            }
            fileName={filterPublishers && filterPublishers?.length === 1 ? `${filterPublishers[0].fullName}.pdf` : "Registros de publicadores.pdf"}
        >
            {({ blob, url, loading, error }) =>
                loading ? "" :
                    <Button className="my-3 bg-white font-semibold text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                        Salvar S-21
                        <PdfIcon />

                    </Button>
            }
        </PDFDownloadLink>
    )

    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-col justify-center items-center p-5">
                    <div className="flex justify-between w-full mt-5 ">
                        <h2 className="text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold mb-4">Registro de publicadores</h2>
                        <HelpCircle onClick={() => setModalHelpShow(!modalHelpShow)} className="text-primary-200 cursor-pointer" />
                    </div>
                    {publishers && (
                        <div className="w-full md:w-9/12">
                            <div>
                                {modalHelpShow &&
                                    <ModalHelp
                                        onClick={() => setModalHelpShow(false)}
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
                                    <Dropdown onClick={() => setPdfGenerating(false)} textSize="md" textAlign="left" notBorderFocus selectedItem={yearServiceSelected} handleClick={(select) => setYearServiceSelected(select)} textVisible title="Ano de Serviço" options={[yearService, (Number(yearService) - 1).toString(), (Number(yearService) - 2).toString()]} />
                                    {(!totals && pdfGenerating && filterPublishers && filterPublishers.length > 1) || (totals && pdfGenerating && reportsTotalsFromFilter && reportsTotalsFromFilter.length > 1) ?
                                        <PdfLinkComponent />
                                        :
                                        (filterPublishers && filterPublishers?.length > 1 || (reportsTotalsFromFilter && reportsTotalsFromFilter?.length > 0)) && (
                                            <Button className="my-3 bg-white font-semibold text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80" onClick={() => setPdfGenerating(true)}>
                                                Preparar registros
                                            </Button>)
                                    }
                                </div>
                                <div className="flex gap-1">
                                    <FilterGroups onClick={() => setPdfGenerating(false)} checkedOptions={groupSelecteds} congregation_id={congregationId as string} handleCheckboxChange={(groups) => handleCheckboxGroupsChange(groups)} />

                                    <FilterPrivileges includeOptionAll onClick={() => setPdfGenerating(false)} checkedOptions={filterPrivileges} handleCheckboxChange={(filters) => handleCheckboxChange(filters)} />
                                </div>
                            </div>
                            {publishers.length > 0 ? (
                                <>
                                    <div className="flex justify-between">
                                        <CheckboxBoolean handleCheckboxChange={(check) => handleCheckboxTotalsChange(check)} checked={totals} label="Totais" />
                                        <span className="flex justify-end text-primary-200 text-sm md:text-base font-semibold">{`Registros selecionados: ${!totals ? filterPublishers?.length : reportsTotalsFromFilter?.length}`}</span>
                                    </div>
                                    {!totals ? publishers?.map(publisher => (
                                        <PublishersToGenerateS21 onClick={() => setPdfGenerating(false)} key={publisher.id} publisher={publisher} >
                                            {filterPublishers && filterPublishers?.length < 2 && filterPublishers?.some(publisherFilter => publisherFilter.id === publisher.id) &&
                                                <div>
                                                    {pdfGenerating ? (
                                                        <Button className="my-3 mx-2 bg-white font-semibold text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80" onClick={() => setPdfGenerating(true)}>
                                                            Preparar registro
                                                        </Button>
                                                    ) : (
                                                        <div className="px-2">
                                                            <PdfLinkComponent />
                                                        </div>
                                                    )}

                                                </div>
                                            }
                                        </PublishersToGenerateS21>
                                    )) : (
                                        <ul>
                                            {Object.values(TotalsFrom).map(ob => (
                                                <li
                                                    key={ob}
                                                    onClick={() => {
                                                        setPdfGenerating(false),
                                                            setTotalsFrom(ob)
                                                    }}
                                                    className={`flex justify-between flex-wrap  my-1 w-full list-none cursor-pointer ${totalsFrom?.includes(ob) ? "bg-gradient-to-br from-primary-50 to-primary-100" : "bg-white"} `}
                                                >
                                                    <div className={`flex flex-col p-4 text-gray-700`}>
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
                </section>
            </ContentDashboard>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('REPORTS_MANAGER')) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}