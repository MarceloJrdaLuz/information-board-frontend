import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import { ConfirmRegisterReports } from "@/Components/ConfirmRegisterReports"
import ContentDashboard from "@/Components/ContentDashboard"
import FilterGroups from "@/Components/FilterGroups"
import FilterPrivileges from "@/Components/FilterPrivileges"
import ListTotals from "@/Components/ListTotals"
import MissingReportsModal from "@/Components/MissingReportsModal"
import ModalRelatorio from "@/Components/ModalRelatorio"
import SkeletonModalReport from "@/Components/ModalRelatorio/skeletonModalReport"
import { crumbsAtom, pageActiveAtom, reportsAtom } from "@/atoms/atom"
import { capitalizeFirstLetter, isAuxPioneerMonth } from "@/functions/isAuxPioneerMonthNow"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import { meses } from "@/functions/meses"
import { normalizeTotalsReports } from "@/functions/normalizeTotalsReports"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IMeetingAssistance, IPublisher, IReports, ITotalsReports, ITotalsReportsCreate, IUpdateReport, Privileges, Situation } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { EyeIcon, EyeOffIcon, InfoIcon } from "lucide-react"
import moment from "moment"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { v4 } from "uuid"

function ReportsMonthPage() {

    const router = useRouter()
    const { month, congregationId } = router.query
    const date = moment().date()

    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const { data } = useAuthorizedFetch<IPublisher[]>(`/publishers/congregationId/${congregationId}`, {
        allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"]
    })
    const { data: getAssistance } = useAuthorizedFetch<IMeetingAssistance[]>(`/assistance/${congregationId}`, {
        allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"]
    })
    const { data: getTotals } = useAuthorizedFetch<ITotalsReports[]>(`/report/totals/${congregationId}`, {
        allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"]
    })

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const [reports, setReports] = useAtom(reportsAtom)
    const [reportsFiltered, setReportsFiltered] = useState<IReports[]>([])
    const [reportsUpdatePrivileges, setReportsUpdatePrivileges] = useState<IUpdateReport[]>([])

    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])

    const [publishers, setPublishers] = useState<IPublisher[]>()

    const [missingReports, setMissingReports] = useState<IPublisher[] | undefined>()

    const [missingReportsCount, setMissingReportsCount] = useState<number>(0)

    const [totalsModalShow, setTotalsModalShow] = useState(false)

    const [totalsAuxPioneers, setTotalsAuxPioneers] = useState<ITotalsReports>()
    const [totalsPioneers, setTotalsPioneers] = useState<ITotalsReports>()
    const [totalsSpecialsPioneer, setTotalsSpecialsPioneer] = useState<ITotalsReports>()
    const [totalsPublishers, setTotalsPublishers] = useState<ITotalsReports>()
    const [totalsToRegister, setTotalsToRegister] = useState<ITotalsReportsCreate[]>([])
    const [monthAlreadyRegister, setMonthAlreadyRegister] = useState(false)
    const [totalsRecover, setTotalsRecover] = useState<ITotalsReports[]>()
    const [meetingAssistanceEndWeek, setMeetingAssistanceEndWeek] = useState(0)
    const [groupSelecteds, setGroupSelecteds] = useState<string[]>([])
    const [yearSelected, setYearSelected] = useState('')
    const [monthSelected, setMonthSelected] = useState('')
    const [dateFormat, setDateFormat] = useState<Date>()

    const monthParam = month as string

    useEffect(() => {
        const filterActives = data?.filter(publisher => publisher.situation === Situation.ATIVO)
        setPublishers(filterActives)
    }, [data])

    useEffect(() => {
        if (getTotals) {
            const filterByMonth = getTotals.filter(total => (total.month === capitalizeFirstLetter(monthSelected) && total.year === yearSelected))
            setTotalsRecover(filterByMonth)
            filterByMonth.length > 0 && setMonthAlreadyRegister(true)
        }
    }, [getTotals, monthSelected, yearSelected])

    useEffect(() => {
        if (monthParam) {
            setPageActive(monthParam)
            let dividirPalavra = monthParam.split(" ")
            setMonthSelected(dividirPalavra[0])
            setYearSelected(dividirPalavra[1])
            setDateFormat(new Date(`${meses.indexOf(`${capitalizeFirstLetter(dividirPalavra[0])}`) + 1}-01-${dividirPalavra[1]}`))
        }
    }, [monthParam, setPageActive])

    useEffect(() => {
        if (getAssistance) {
            const filterAssistanceMeetingEndWeek = getAssistance.filter(assistance => assistance.month === capitalizeFirstLetter(monthSelected) && assistance.year === yearSelected)
            setMeetingAssistanceEndWeek(filterAssistanceMeetingEndWeek[0]?.endWeekAverage)
        }
    }, [getAssistance, monthSelected, yearSelected])

    useEffect(() => {
        const someTotals = (reports: IReports[]) => {
            let totalStudiesPublishers = 0
            let totalsReportsPublishers = 0

            let totalHoursPioneer = 0
            let totalStudiesPioneer = 0
            let totalsReportsPioneer = 0

            let totalHoursAuxPioneer = 0
            let totalStudiesAuxPioneer = 0
            let totalsReportsAuxPioneer = 0

            let totalHoursSpecialPioneer = 0
            let totalStudiesSpecialPioneer = 0
            let totalsReportsSpecialPioneer = 0

            const filterSpecialPioneer = reports.filter(report => {
                return ((report.publisher.privileges.includes(Privileges.PIONEIROESPECIAL) || report.publisher.privileges.includes(Privileges.MISSIONARIOEMCAMPO)))
            })

            const filterPioneer = reports.filter(report => {
                return (report.publisher.privileges.includes(Privileges.PIONEIROREGULAR)) && isPioneerNow(report.publisher, dateFormat ?? new Date())
            })

            const filterAuxPioneer = reports.filter(report => {
                return ((report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) || (report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && isPioneerNow(report.publisher, dateFormat ?? new Date())))
            })

            const filterPublishers = reports.filter(report => {
                return (
                    report.publisher.privileges.some(privilege => privilege === Privileges.PUBLICADOR) ||
                    (report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) &&
                        !isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) ||
                    (report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && !isPioneerNow(report.publisher, dateFormat ?? new Date())) ||
                    (report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) && !isPioneerNow(report.publisher, dateFormat ?? new Date()))
                )
            })

            filterPublishers.map(report => {
                totalsReportsPublishers += 1
                if (report.studies) {
                    totalStudiesPublishers += report.studies
                }
                setTotalsPublishers({
                    month: monthSelected,
                    year: yearSelected,
                    totalsFrom: "Publicadores",
                    quantity: totalsReportsPublishers,
                    studies: totalStudiesPublishers,
                    publishersActives: publishers?.length ?? 0
                })
            })

            filterPioneer.map(report => {
                totalHoursPioneer += report.hours
                totalsReportsPioneer += 1
                if (report.studies) {
                    totalStudiesPioneer += report.studies
                }
                setTotalsPioneers({
                    month: monthSelected,
                    year: yearSelected,
                    totalsFrom: "Pioneiros regulares",
                    quantity: totalsReportsPioneer,
                    hours: totalHoursPioneer,
                    studies: totalStudiesPioneer,
                    publishersActives: publishers?.length ?? 0
                })
            })


            filterAuxPioneer.map(report => {
                totalHoursAuxPioneer += report.hours
                totalsReportsAuxPioneer += 1
                if (report.studies) {
                    totalStudiesAuxPioneer += report.studies
                }
                setTotalsAuxPioneers({
                    month: monthSelected,
                    year: yearSelected,
                    totalsFrom: "Pioneiros auxiliares",
                    quantity: totalsReportsAuxPioneer,
                    hours: totalHoursAuxPioneer,
                    studies: totalStudiesAuxPioneer,
                    publishersActives: publishers?.length ?? 0
                })
            })

            filterSpecialPioneer.map(report => {
                totalHoursSpecialPioneer += report.hours
                totalsReportsSpecialPioneer += 1
                if (report.studies) {
                    totalStudiesSpecialPioneer += report.studies
                }
                setTotalsSpecialsPioneer({
                    month: monthSelected,
                    year: yearSelected,
                    totalsFrom: "Pioneiros especiais e Missionários em campo",
                    quantity: totalsReportsSpecialPioneer,
                    hours: totalHoursSpecialPioneer,
                    studies: totalStudiesSpecialPioneer,
                    publishersActives: publishers?.length ?? 0
                })
            })
        }

        if (reports) {
            // Filter reports based on month and year
            const reportsFilteredByDate = reports.filter(report => (
                report.month.toLocaleLowerCase() === monthSelected && report.year === yearSelected
            ))

            const updatePrivilegesArray = reportsFilteredByDate.map(report => ({
                report_id: report.id,
                privileges: report.privileges ? report.privileges : report.publisher?.privileges
            }))

            setReportsUpdatePrivileges(updatePrivilegesArray)

            someTotals(reportsFilteredByDate)

            // Filter the filtered reports based on privileges
            const filteredReports = filterPrivileges.length > 0
                ? reportsFilteredByDate.filter(report => {
                    const isAuxPioneerSelected = filterPrivileges.includes(Privileges.PIONEIROAUXILIAR)
                    const isIndefinitePioneerSelected = filterPrivileges.includes(Privileges.AUXILIARINDETERMINADO)
                    const isRegPioneerSelected = filterPrivileges.includes(Privileges.PIONEIROREGULAR)
                    const isServantSelected = filterPrivileges.includes(Privileges.SM)
                    const isElderSelected = filterPrivileges.includes(Privileges.ANCIAO)

                    if ((isAuxPioneerSelected || isIndefinitePioneerSelected || isRegPioneerSelected) && !isElderSelected && !isServantSelected) {
                        return (
                            (isAuxPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) ||
                            (isIndefinitePioneerSelected && report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && isPioneerNow(report.publisher, dateFormat ?? new Date())) ||
                            (isRegPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) && isPioneerNow(report.publisher, dateFormat ?? new Date()))
                        )
                    } else if ((isAuxPioneerSelected || isIndefinitePioneerSelected || isRegPioneerSelected) && isElderSelected) {
                        return (
                            (isAuxPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) ||
                            (isIndefinitePioneerSelected && report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && isPioneerNow(report.publisher, dateFormat ?? new Date())) ||
                            (isRegPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) && isPioneerNow(report.publisher, dateFormat ?? new Date()))
                        ) && report.publisher.privileges.includes(Privileges.ANCIAO)
                    } else if ((isAuxPioneerSelected || isIndefinitePioneerSelected || isRegPioneerSelected) && isServantSelected) {
                        return (
                            (isAuxPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) ||
                            (isIndefinitePioneerSelected && report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && isPioneerNow(report.publisher, dateFormat ?? new Date())) ||
                            (isRegPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) && isPioneerNow(report.publisher, dateFormat ?? new Date()))
                        ) && report.publisher.privileges.includes(Privileges.SM)
                    } else {
                        return filterPrivileges.every(privilege => report.publisher.privileges.includes(privilege))
                    }
                })
                : reportsFilteredByDate

            const sortedReports = sortArrayByProperty(filteredReports, "publisher.fullName")

            setReportsFiltered(sortedReports)
        }

    }, [monthSelected, yearSelected, filterPrivileges, reports, dateFormat, publishers])

    useEffect(() => {
        if (totalsAuxPioneers) {
            setTotalsToRegister(prev => [...prev, normalizeTotalsReports(totalsAuxPioneers)])
        }
        if (totalsPioneers) {
            setTotalsToRegister(prev => [...prev, normalizeTotalsReports(totalsPioneers)])
        }
        if (totalsPublishers) {
            setTotalsToRegister(prev => [...prev, normalizeTotalsReports(totalsPublishers)])
        }
        if (totalsSpecialsPioneer) {
            setTotalsToRegister(prev => [...prev, normalizeTotalsReports(totalsSpecialsPioneer)])
        }
    }, [totalsAuxPioneers, totalsPioneers, totalsPublishers, totalsSpecialsPioneer])

    useEffect(() => {
        if (publishers && reports) {
            const missingReports = publishers.filter(publisher => {
                const hasSubmittedReport = reports.some(
                    report =>
                        report.publisher.id === publisher.id &&
                        report.month.toLowerCase() === monthSelected &&
                        report.year === yearSelected
                )

                // Grupo selecionado
                const belongsToGroup =
                    groupSelecteds.length === 0 // nenhum grupo selecionado → todos
                        ? true
                        : publisher.group && groupSelecteds.includes(publisher.group.id)

                return !hasSubmittedReport && belongsToGroup
            })
            setMissingReports(missingReports)

        }
    }, [monthSelected, yearSelected, publishers, reports, groupSelecteds])

    useEffect(() => {
        if (missingReports) {
            const missingReportsCount = missingReports.length
            setMissingReportsCount(missingReportsCount)
        }
    }, [missingReports])


    const getRelatorios = useCallback(async () => {
        await api.get(`/reports/${congregationId}`).then(res => {
            const { data } = res
            setReports([...data])
        }).catch(err => console.log(err))
    }, [congregationId, setReports])

    useEffect(() => {
        getRelatorios()
    }, [getRelatorios])

    const updatePrivilegesReports = async () => {
        await api.put('/report', {
            reports: reportsUpdatePrivileges
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.reportPrivilegesUpdate)
        }).catch(err => {
            console.log(err)
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    const sendTotalsReports = async () => {
        await api.post(`/report/totals/${congregationId}`, {
            totals: totalsToRegister
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.totalsReportsCreate)
        }).catch(err => {
            console.log(err)
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    const onSubmit = () => {
        if (!monthAlreadyRegister) {
            toast.promise(updatePrivilegesReports, {
                pending: "Registrando relatórios..."
            })
        }
        toast.promise(sendTotalsReports, {
            pending: "Registrando totais..."
        })
    }

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Todos os meses', link: `/congregacao/relatorios/${congregationId}` }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs, setPageActive, monthSelected, congregationId])

    const handleCheckboxChange = (filter: string[]) => {
        setFilterPrivileges(filter)
    }

    let skeletonReportsList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonReportsList.map((a, i) => (<SkeletonModalReport key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={monthParam ? `Relatórios de ${monthParam}` : ""} />
            <>
                <section className="flex flex-col flex-wrap w-full">
                    <div className="w-full h-full px-5">
                        <h2 className="flex flex-1  justify-center font-semibold py-5 text-center text-typography-800">
                            {monthParam ? monthParam.toLocaleUpperCase() : ""}
                        </h2>
                        <div className="flex flex-1 justify-between mb-4">
                            <FilterPrivileges checkedOptions={filterPrivileges} handleCheckboxChange={(filters) => handleCheckboxChange(filters)} />
                            <FilterGroups checkedOptions={groupSelecteds} congregation_id={congregationId as string} handleCheckboxChange={setGroupSelecteds} />
                            <span className="flex sm:text-base md:text-lg lg:text-xl  justify-center items-center gap-2 font-bold text-primary-200 hover:text-primary-150 cursor-pointer" onClick={() => setTotalsModalShow(!totalsModalShow)}>
                                Totais
                                {!totalsModalShow ? <EyeIcon className="p-0.5 sm:p-0" /> : <EyeOffIcon className="p-0.5 sm:p-0" />}
                            </span>
                        </div>
                        <MissingReportsModal missingReportsNumber={missingReportsCount} missingReports={missingReports} />
                        {totalsModalShow ? (
                            <ul>
                                {<div className="px-5 py-0">
                                    {monthAlreadyRegister &&
                                        <div className="flex text-typography-800 border-l-4 border-[1px] border-primary-200 mb-4 mx-0 p-2 ">
                                            <span className="h-full pr-1">
                                                <InfoIcon className="p-0.5 text-primary-200 " />
                                            </span>
                                            {
                                                date > 20 ?
                                                    <span>Este relatório já foi registrado. Como já passamos do dia 20, o relatório já deve ter sido registrado em Betel. Caso precise fazer alguma alteração, insira manualmente o relatório alterado. No mês seguinte nos totais do relatório enviado para Betel acrescente as diferenças.
                                                    </span>
                                                    :
                                                    <span>Este relatório já foi registrado. Como ainda não é dia 20, o relatório enviado para Betel ainda pode ser alterado mesmo que já foi enviado. Nesse caso após as alterações, atualize o registro aqui e também o registro enviado para Betel.
                                                    </span>
                                            }
                                        </div>
                                    }
                                    <ConfirmRegisterReports
                                        onRegister={() => onSubmit()}
                                        button={<Button
                                            outline
                                            className="text-red-400 w-30"
                                        >
                                            {!monthAlreadyRegister ? "Registrar" : "Atualizar"}
                                        </Button>}
                                    />
                                </div>
                                }
                                <div className="p-4 my-5 w-11/12 m-auto bg-surface-100">
                                    <li className="text-typography-700">Publicadores ativos</li>
                                    <li className="mb-4 text-typography-900">{totalsRecover && totalsRecover.length > 0 ? totalsRecover[0].publishersActives : publishers?.length}</li>
                                    <li className="text-typography-700">Média de assistência da reunião do fim de semana</li>
                                    <li className="mb-4 text-typography-900">{meetingAssistanceEndWeek}</li>
                                </div>
                                {totalsPublishers && <ListTotals key={"Totais de Publicadores"} totals={totalsPublishers} />}
                                {totalsAuxPioneers && <ListTotals key={"Totais de Pioneiros regulares"} totals={totalsAuxPioneers} />}
                                {totalsPioneers && <ListTotals key={"Totais de pioneiros auxiliares"} totals={totalsPioneers} />}
                                {totalsSpecialsPioneer && <ListTotals key={"Totais de P.E e M.C"} totals={totalsSpecialsPioneer} />}
                            </ul>
                        ) : reportsFiltered?.length > 0 ? (
                            <ul className="flex flex-wrap justify-evenly relative">
                                <div className="flex w-full justify-center items-center mt-4">
                                    <Button className="text-typography-200" onClick={() => router.push(`/congregacao/relatorios/${congregationId}/${month}/inserir`)}>
                                        Inserir manualmente
                                    </Button>
                                </div>
                                {reportsFiltered.length > 0 && reportsFiltered?.map(report =>
                                    <ModalRelatorio
                                        key={v4()}
                                        publisher={report.publisher}
                                        month={report.month}
                                        year={report.year}
                                        hours={
                                            report.hours
                                        }
                                        studies={report.studies}
                                        observations={report.observations}
                                    />)}
                            </ul>
                        ) : missingReportsCount ? (
                            <>
                                <>
                                    <div className="flex text-typography-800 border-l-4 border-[1px] border-primary-200 my-4 mx-0 p-2 ">
                                        <span className="h-full pr-1">
                                            <InfoIcon className="p-0.5 text-primary-200" />
                                        </span>
                                        <span>Nenhum relatório registrado esse mês</span>
                                    </div>
                                </>
                                <div className="flex w-full justify-center items-center mt-4">
                                    <Button className="text-typography-200" onClick={() => router.push(`/congregacao/relatorios/${congregationId}/${month}/inserir`)}>
                                        Inserir manualmente
                                    </Button>
                                </div>
                            </>
                        ) : (
                            renderSkeleton()
                        )}
                    </div>

                </section>
            </>
        </ContentDashboard>
    )
}

ReportsMonthPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "REPORTS_MANAGER", " REPORTS_VIEWER"])

export default ReportsMonthPage