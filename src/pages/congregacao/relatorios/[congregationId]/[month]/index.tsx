import BreadCrumbs from "@/Components/BreadCrumbs"
import { ConfirmRegisterReports } from "@/Components/ConfirmRegisterReports"
import ContentDashboard from "@/Components/ContentDashboard"
import FilterGroups from "@/Components/FilterGroups"
import FilterPrivileges from "@/Components/FilterPrivileges"
import ListTotals from "@/Components/ListTotals"
import MissingReportsModal from "@/Components/MissingReportsModal"
import ModalRelatorio from "@/Components/ModalRelatorio"
import SkeletonModalReport from "@/Components/ModalRelatorio/skeletonModalReport"
import { Button } from "@/Components/ui/button"
import { crumbsAtom, pageActiveAtom, reportsAtom } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { capitalizeFirstLetter, isAuxPioneerMonth } from "@/functions/isAuxPioneerMonthNow"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import { meses } from "@/functions/meses"
import { normalizeTotalsReports } from "@/functions/normalizeTotalsReports"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { InactiveCandidate } from "@/types/publishers"
import { IMeetingAssistance, IPublisher, IReports, ITotalsReports, ITotalsReportsCreate, IUpdateReport, Privileges, Situation } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import {
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    CheckCheck,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    InfoIcon,
    Plus,
    Search,
    Users,
    X
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import "dayjs/locale/pt-br"

dayjs.extend(customParseFormat)
dayjs.locale("pt-br")

function ReportsMonthPage() {
    const router = useRouter()
    const { month, congregationId } = router.query
    const date = dayjs().date()

    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const { data, isLoading: loadingPublishers } = useAuthorizedFetch<IPublisher[]>(
        `${API_ROUTES.PUBLISHERS}/congregationId/${congregationId}`,
        { allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"] }
    )
    const { data: getAssistance } = useAuthorizedFetch<IMeetingAssistance[]>(
        `/assistance/${congregationId}`,
        { allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"] }
    )
    const { data: getTotals } = useAuthorizedFetch<ITotalsReports[]>(
        `/report/totals/${congregationId}`,
        { allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER"] }
    )

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    const [reports, setReports] = useAtom(reportsAtom)
    const [reportsFiltered, setReportsFiltered] = useState<IReports[]>([])
    const [reportsUpdatePrivileges, setReportsUpdatePrivileges] = useState<IUpdateReport[]>([])
    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])
    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [missingReports, setMissingReports] = useState<IPublisher[] | undefined>()
    const [missingReportsCount, setMissingReportsCount] = useState<number>(0)

    const [activeTab, setActiveTab] = useState<"reports" | "totals">("reports")
    const [searchTerm, setSearchTerm] = useState("")

    const [totalsAuxPioneers, setTotalsAuxPioneers] = useState<ITotalsReports>()
    const [totalsPioneers, setTotalsPioneers] = useState<ITotalsReports>()
    const [totalsSpecialsPioneer, setTotalsSpecialsPioneer] = useState<ITotalsReports>()
    const [totalsPublishers, setTotalsPublishers] = useState<ITotalsReports>()
    const [totalsToRegister, setTotalsToRegister] = useState<ITotalsReportsCreate[]>([])
    const [monthAlreadyRegister, setMonthAlreadyRegister] = useState(false)
    const [totalsRecover, setTotalsRecover] = useState<ITotalsReports[]>()
    const [meetingAssistanceEndWeek, setMeetingAssistanceEndWeek] = useState(0)
    const [groupSelecteds, setGroupSelecteds] = useState<string[]>([])
    const [yearSelected, setYearSelected] = useState("")
    const [monthSelected, setMonthSelected] = useState("")
    const [dateFormat, setDateFormat] = useState<Date>()
    const [inactiveCandidates, setInactiveCandidates] = useState<InactiveCandidate[]>([])

    const monthParam = (month as string) || ""

    useEffect(() => {
        const filterActives = data?.filter((publisher) => publisher.situation === Situation.ATIVO)
        setPublishers(filterActives)
    }, [data])

    useEffect(() => {
        if (getTotals) {
            const filterByMonth = getTotals.filter(
                (total) =>
                    total.month === capitalizeFirstLetter(monthSelected) &&
                    total.year === yearSelected
            )
            setTotalsRecover(filterByMonth)
            filterByMonth.length > 0 && setMonthAlreadyRegister(true)
        }
    }, [getTotals, monthSelected, yearSelected])

    useEffect(() => {
        if (monthParam) {
            setPageActive(monthParam)
            const dividirPalavra = monthParam.split(" ")
            setMonthSelected(dividirPalavra[0])
            setYearSelected(dividirPalavra[1])
            setDateFormat(
                new Date(
                    `${meses.indexOf(`${capitalizeFirstLetter(dividirPalavra[0])}`) + 1}-01-${
                        dividirPalavra[1]
                    }`
                )
            )
        }
    }, [monthParam, setPageActive])

    useEffect(() => {
        if (getAssistance) {
            const filterAssistanceMeetingEndWeek = getAssistance.filter(
                (assistance) =>
                    assistance.month === capitalizeFirstLetter(monthSelected) &&
                    assistance.year === yearSelected
            )
            setMeetingAssistanceEndWeek(filterAssistanceMeetingEndWeek[0]?.endWeekAverage)
        }
    }, [getAssistance, monthSelected, yearSelected])

    useEffect(() => {
        if (!publishers || !reports || !monthSelected || !yearSelected) return

        const currentDate = dayjs(
            `${monthSelected.toLowerCase()} ${yearSelected}`,
            "MMMM YYYY",
            "pt-br"
        )

        const publishersInactive = publishers
            .map((publisher) => {
                const publisherReports = reports.filter((r) => r.publisher.id === publisher.id)

                if (publisherReports.length === 0) {
                    const createdDate = dayjs(publisher.created_at)
                    const monthsSinceCreated = currentDate.diff(createdDate, "month")

                    if (monthsSinceCreated >= 6) {
                        return { publisher, lastReport: undefined }
                    }
                    return null
                }

                const lastReport = publisherReports.reduce((latest, report) => {
                    const reportDate = dayjs(
                        `${report.month.toLowerCase()} ${report.year}`,
                        "MMMM YYYY",
                        "pt-br"
                    )
                    const latestDate = dayjs(
                        `${latest.month.toLowerCase()} ${latest.year}`,
                        "MMMM YYYY",
                        "pt-br"
                    )
                    return reportDate.isAfter(latestDate) ? report : latest
                })

                const lastReportDate = dayjs(
                    `${lastReport.month.toLowerCase()} ${lastReport.year}`,
                    "MMMM YYYY",
                    "pt-br"
                )
                const monthsWithoutReport = currentDate.diff(lastReportDate, "month")

                if (monthsWithoutReport >= 6) {
                    return {
                        publisher,
                        lastReport: {
                            month: lastReport.month,
                            year: lastReport.year
                        }
                    }
                }

                return null
            })
            .filter(Boolean) as InactiveCandidate[]

        setInactiveCandidates(publishersInactive)
    }, [publishers, reports, monthSelected, yearSelected])

    useEffect(() => {
        const someTotals = (reportsList: IReports[]) => {
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

            const filterSpecialPioneer = reportsList.filter(
                (report) =>
                    report.publisher.privileges.includes(Privileges.PIONEIROESPECIAL) ||
                    report.publisher.privileges.includes(Privileges.MISSIONARIOEMCAMPO)
            )

            const filterPioneer = reportsList.filter(
                (report) =>
                    report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) &&
                    isPioneerNow(report.publisher, dateFormat ?? new Date())
            )

            const filterAuxPioneer = reportsList.filter(
                (report) =>
                    (report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) &&
                        isAuxPioneerMonth(
                            report.publisher,
                            `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`
                        )) ||
                    (report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) &&
                        isPioneerNow(report.publisher, dateFormat ?? new Date()))
            )

            const filterPublishers = reportsList.filter(
                (report) =>
                    report.publisher.privileges.some((privilege) => privilege === Privileges.PUBLICADOR) ||
                    (report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) &&
                        !isAuxPioneerMonth(
                            report.publisher,
                            `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`
                        )) ||
                    (report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) &&
                        !isPioneerNow(report.publisher, dateFormat ?? new Date())) ||
                    (report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) &&
                        !isPioneerNow(report.publisher, dateFormat ?? new Date()))
            )

            filterPublishers.forEach((report) => {
                totalsReportsPublishers += 1
                if (report.studies) totalStudiesPublishers += report.studies
            })
            setTotalsPublishers({
                month: monthSelected,
                year: yearSelected,
                totalsFrom: "Publicadores",
                quantity: totalsReportsPublishers,
                studies: totalStudiesPublishers,
                publishersActives: publishers?.length ?? 0
            })

            filterPioneer.forEach((report) => {
                totalHoursPioneer += report.hours
                totalsReportsPioneer += 1
                if (report.studies) totalStudiesPioneer += report.studies
            })
            setTotalsPioneers({
                month: monthSelected,
                year: yearSelected,
                totalsFrom: "Pioneiros regulares",
                quantity: totalsReportsPioneer,
                hours: totalHoursPioneer,
                studies: totalStudiesPioneer,
                publishersActives: publishers?.length ?? 0
            })

            filterAuxPioneer.forEach((report) => {
                totalHoursAuxPioneer += report.hours
                totalsReportsAuxPioneer += 1
                if (report.studies) totalStudiesAuxPioneer += report.studies
            })
            setTotalsAuxPioneers({
                month: monthSelected,
                year: yearSelected,
                totalsFrom: "Pioneiros auxiliares",
                quantity: totalsReportsAuxPioneer,
                hours: totalHoursAuxPioneer,
                studies: totalStudiesAuxPioneer,
                publishersActives: publishers?.length ?? 0
            })

            filterSpecialPioneer.forEach((report) => {
                totalHoursSpecialPioneer += report.hours
                totalsReportsSpecialPioneer += 1
                if (report.studies) totalStudiesSpecialPioneer += report.studies
            })
            setTotalsSpecialsPioneer({
                month: monthSelected,
                year: yearSelected,
                totalsFrom: "Pioneiros especiais e Missionários em campo",
                quantity: totalsReportsSpecialPioneer,
                hours: totalHoursSpecialPioneer,
                studies: totalStudiesSpecialPioneer,
                publishersActives: publishers?.length ?? 0
            })
        }

        if (reports) {
            const reportsFilteredByDate = reports.filter(
                (report) =>
                    report.month.toLowerCase() === monthSelected && report.year === yearSelected
            )

            const updatePrivilegesArray = reportsFilteredByDate.map((report) => ({
                report_id: report.id,
                privileges: report.privileges ? report.privileges : report.publisher?.privileges
            }))

            setReportsUpdatePrivileges(updatePrivilegesArray)
            someTotals(reportsFilteredByDate)

            const filteredReports =
                filterPrivileges.length > 0
                    ? reportsFilteredByDate.filter((report) => {
                          const isAuxPioneerSelected = filterPrivileges.includes(
                              Privileges.PIONEIROAUXILIAR
                          )
                          const isIndefinitePioneerSelected = filterPrivileges.includes(
                              Privileges.AUXILIARINDETERMINADO
                          )
                          const isRegPioneerSelected = filterPrivileges.includes(
                              Privileges.PIONEIROREGULAR
                          )
                          const isServantSelected = filterPrivileges.includes(Privileges.SM)
                          const isElderSelected = filterPrivileges.includes(Privileges.ANCIAO)

                          if (
                              (isAuxPioneerSelected ||
                                  isIndefinitePioneerSelected ||
                                  isRegPioneerSelected) &&
                              !isElderSelected &&
                              !isServantSelected
                          ) {
                              return (
                                  (isAuxPioneerSelected &&
                                      report.publisher.privileges.includes(
                                          Privileges.PIONEIROAUXILIAR
                                      ) &&
                                      isAuxPioneerMonth(
                                          report.publisher,
                                          `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`
                                      )) ||
                                  (isIndefinitePioneerSelected &&
                                      report.publisher.privileges.includes(
                                          Privileges.AUXILIARINDETERMINADO
                                      ) &&
                                      isPioneerNow(report.publisher, dateFormat ?? new Date())) ||
                                  (isRegPioneerSelected &&
                                      report.publisher.privileges.includes(
                                          Privileges.PIONEIROREGULAR
                                      ) &&
                                      isPioneerNow(report.publisher, dateFormat ?? new Date()))
                              )
                          } else if (
                              (isAuxPioneerSelected ||
                                  isIndefinitePioneerSelected ||
                                  isRegPioneerSelected) &&
                              isElderSelected
                          ) {
                              return (
                                  ((isAuxPioneerSelected &&
                                      report.publisher.privileges.includes(
                                          Privileges.PIONEIROAUXILIAR
                                      ) &&
                                      isAuxPioneerMonth(
                                          report.publisher,
                                          `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`
                                      )) ||
                                      (isIndefinitePioneerSelected &&
                                          report.publisher.privileges.includes(
                                              Privileges.AUXILIARINDETERMINADO
                                          ) &&
                                          isPioneerNow(
                                              report.publisher,
                                              dateFormat ?? new Date()
                                          )) ||
                                      (isRegPioneerSelected &&
                                          report.publisher.privileges.includes(
                                              Privileges.PIONEIROREGULAR
                                          ) &&
                                          isPioneerNow(
                                              report.publisher,
                                              dateFormat ?? new Date()
                                          ))) &&
                                  report.publisher.privileges.includes(Privileges.ANCIAO)
                              )
                          } else if (
                              (isAuxPioneerSelected ||
                                  isIndefinitePioneerSelected ||
                                  isRegPioneerSelected) &&
                              isServantSelected
                          ) {
                              return (
                                  ((isAuxPioneerSelected &&
                                      report.publisher.privileges.includes(
                                          Privileges.PIONEIROAUXILIAR
                                      ) &&
                                      isAuxPioneerMonth(
                                          report.publisher,
                                          `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`
                                      )) ||
                                      (isIndefinitePioneerSelected &&
                                          report.publisher.privileges.includes(
                                              Privileges.AUXILIARINDETERMINADO
                                          ) &&
                                          isPioneerNow(
                                              report.publisher,
                                              dateFormat ?? new Date()
                                          )) ||
                                      (isRegPioneerSelected &&
                                          report.publisher.privileges.includes(
                                              Privileges.PIONEIROREGULAR
                                          ) &&
                                          isPioneerNow(
                                              report.publisher,
                                              dateFormat ?? new Date()
                                          ))) &&
                                  report.publisher.privileges.includes(Privileges.SM)
                              )
                          } else {
                              return filterPrivileges.every((privilege) =>
                                  report.publisher.privileges.includes(privilege)
                              )
                          }
                      })
                    : reportsFilteredByDate

            // Group filter
            const groupFiltered =
                groupSelecteds.length === 0
                    ? filteredReports
                    : filteredReports.filter(
                          (report) =>
                              report.publisher.group &&
                              groupSelecteds.includes(report.publisher.group.id)
                      )

            const sortedReports = sortArrayByProperty(groupFiltered, "publisher.fullName")
            setReportsFiltered(sortedReports)
        }
    }, [
        monthSelected,
        yearSelected,
        filterPrivileges,
        groupSelecteds,
        reports,
        dateFormat,
        publishers
    ])

    useEffect(() => {
        const newTotals: ITotalsReportsCreate[] = []
        if (totalsAuxPioneers) newTotals.push(normalizeTotalsReports(totalsAuxPioneers))
        if (totalsPioneers) newTotals.push(normalizeTotalsReports(totalsPioneers))
        if (totalsPublishers) newTotals.push(normalizeTotalsReports(totalsPublishers))
        if (totalsSpecialsPioneer) newTotals.push(normalizeTotalsReports(totalsSpecialsPioneer))
        setTotalsToRegister(newTotals)
    }, [totalsAuxPioneers, totalsPioneers, totalsPublishers, totalsSpecialsPioneer])

    useEffect(() => {
        if (publishers && reports) {
            const missing = publishers.filter((publisher) => {
                const hasSubmittedReport = reports.some(
                    (report) =>
                        report.publisher.id === publisher.id &&
                        report.month.toLowerCase() === monthSelected &&
                        report.year === yearSelected
                )
                const belongsToGroup =
                    groupSelecteds.length === 0
                        ? true
                        : publisher.group && groupSelecteds.includes(publisher.group.id)

                return !hasSubmittedReport && belongsToGroup
            })
            setMissingReports(missing)
            setMissingReportsCount(missing.length)
        }
    }, [monthSelected, yearSelected, publishers, reports, groupSelecteds])

    const getRelatorios = useCallback(async () => {
        if (!congregationId) return
        try {
            const res = await api.get(`/reports/${congregationId}`)
            setReports([...res.data])
        } catch (err) {
            console.error(err)
        }
    }, [congregationId, setReports])

    useEffect(() => {
        getRelatorios()
    }, [getRelatorios])

    const updatePrivilegesReports = async () => {
        await api
            .put("/report", { reports: reportsUpdatePrivileges })
            .then(() => {
                handleSubmitSuccess(messageSuccessSubmit.reportPrivilegesUpdate)
            })
            .catch((err) => {
                console.error(err)
                handleSubmitError(messageErrorsSubmit.default)
            })
    }

    const sendTotalsReports = async () => {
        await api
            .post(`/report/totals/${congregationId}`, { totals: totalsToRegister })
            .then(() => {
                handleSubmitSuccess(messageSuccessSubmit.totalsReportsCreate)
            })
            .catch((err) => {
                console.error(err)
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
        if (congregationId) {
            setCrumbs([
                { label: "Início", link: "/dashboard" },
                { label: "Congregação", link: `/congregacao/${congregationId}` },
                { label: "Relatórios", link: `/congregacao/relatorios/${congregationId}` }
            ])
        }
    }, [setCrumbs, congregationId])

    const searchedReports = useMemo(() => {
        if (!searchTerm.trim()) return reportsFiltered
        const term = searchTerm.toLowerCase()
        return reportsFiltered.filter(
            (r) =>
                r.publisher.fullName.toLowerCase().includes(term) ||
                (r.publisher.nickname && r.publisher.nickname.toLowerCase().includes(term))
        )
    }, [reportsFiltered, searchTerm])

    const totalActivePublishers = publishers?.length || 0
    const totalSubmitted = reportsFiltered.length
    const percentageSubmitted =
        totalActivePublishers > 0 ? Math.round((totalSubmitted / totalActivePublishers) * 100) : 0

    return (
        <ContentDashboard>
            <BreadCrumbs
                crumbs={crumbs}
                pageActive={monthParam ? capitalizeFirstLetter(monthParam) : ""}
            />

            <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 overflow-y-auto thin-scrollbar">
                {/* Header Card */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-100 p-5 sm:p-6 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/congregacao/relatorios/${congregationId}`)}
                            className="h-10 w-10 text-typography-600 hover:bg-surface-200 rounded-xl shrink-0"
                            title="Voltar para todos os meses"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-typography-900 tracking-tight">
                                    {monthParam ? capitalizeFirstLetter(monthParam) : "Relatórios"}
                                </h1>
                                {monthAlreadyRegister && (
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        Registrado
                                    </span>
                                )}
                            </div>
                            <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                Gerenciamento de relatórios e consolidação dos totais mensais.
                            </p>
                        </div>
                    </div>

                    {/* Action buttons on top right */}
                    <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                        {/* Tab Switcher */}
                        <div className="flex bg-surface-200 p-1 rounded-xl border border-surface-300">
                            <button
                                type="button"
                                onClick={() => setActiveTab("reports")}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === "reports"
                                        ? "bg-surface-100 text-primary-200 shadow-xs"
                                        : "text-typography-600 hover:text-typography-900"
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                <span>Publicadores ({reportsFiltered.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("totals")}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                    activeTab === "totals"
                                        ? "bg-surface-100 text-primary-200 shadow-xs"
                                        : "text-typography-600 hover:text-typography-900"
                                }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>Totais</span>
                            </button>
                        </div>

                        <Button
                            onClick={() =>
                                router.push(
                                    `/congregacao/relatorios/${congregationId}/${month}/inserir`
                                )
                            }
                            className="bg-primary-200 hover:bg-primary-150 text-typography-100 font-semibold shadow-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Inserir Relatório</span>
                        </Button>
                    </div>
                </div>

                {/* KPI / Stats Overview Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-typography-500 font-medium truncate">
                                Publicadores Ativos
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-typography-900">
                                {totalActivePublishers}
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-typography-500 font-medium truncate">
                                Relatórios Entregues
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-typography-900 flex items-center gap-1.5">
                                {totalSubmitted}
                                <span className="text-xs font-semibold text-emerald-600">
                                    ({percentageSubmitted}%)
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-typography-500 font-medium truncate">
                                Relatórios em Falta
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-typography-900">
                                {missingReportsCount}
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-typography-500 font-medium truncate">
                                Média de Assistência
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-typography-900">
                                {meetingAssistanceEndWeek || "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Inactive Candidates Alert */}
                {inactiveCandidates.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-300">
                                        Possíveis Publicadores Inativos ({inactiveCandidates.length})
                                    </h4>
                                    <span className="text-xs text-amber-700 dark:text-amber-400 font-medium hidden sm:inline">
                                        6 meses ou mais sem relatar
                                    </span>
                                </div>
                                <p className="text-xs text-amber-800 dark:text-amber-400 mb-3">
                                    Os publicadores listados abaixo estão há pelo menos 6 meses consecutivos sem enviar relatório:
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {inactiveCandidates.map((item) => (
                                        <div
                                            key={item.publisher.id}
                                            className="flex items-center justify-between bg-surface-100 border border-amber-500/20 rounded-xl px-3 py-2 shadow-2xs"
                                        >
                                            <div className="min-w-0 flex-1 pr-2">
                                                <p className="text-xs font-semibold text-typography-900 truncate">
                                                    {item.publisher.nickname || item.publisher.fullName}
                                                </p>
                                                <p className="text-[11px] text-typography-500 truncate">
                                                    Último: {item.lastReport ? `${item.lastReport.month}/${item.lastReport.year}` : "Nunca"}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/congregacao/publicadores/edit/${item.publisher.id}`}
                                                className="text-xs font-semibold text-primary-200 hover:text-primary-150 shrink-0"
                                            >
                                                Ver
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content based on Active Tab */}
                {activeTab === "reports" ? (
                    <div className="space-y-4">
                        {/* Toolbar: Search, Filters, Missing Reports */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-100 p-3.5 sm:p-4 rounded-2xl border border-surface-300 shadow-sm">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nome do publicador..."
                                    className="w-full pl-9 pr-8 py-2 bg-surface-200 border border-surface-300 rounded-xl text-xs sm:text-sm text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/50"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Filters & Missing Reports Modal */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <FilterPrivileges
                                        checkedOptions={filterPrivileges}
                                        handleCheckboxChange={setFilterPrivileges}
                                    />
                                    <FilterGroups
                                        checkedOptions={groupSelecteds}
                                        congregation_id={congregationId as string}
                                        handleCheckboxChange={setGroupSelecteds}
                                    />
                                </div>
                                <MissingReportsModal
                                    missingReportsNumber={missingReportsCount}
                                    missingReports={missingReports}
                                />
                            </div>
                        </div>

                        {/* Reports List */}
                        {loadingPublishers ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <SkeletonModalReport key={i} />
                                ))}
                            </ul>
                        ) : searchedReports.length > 0 ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {searchedReports.map((report) => (
                                    <ModalRelatorio
                                        key={report.id}
                                        publisher={report.publisher}
                                        month={report.month}
                                        year={report.year}
                                        hours={report.hours}
                                        studies={report.studies}
                                        observations={report.observations}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <div className="bg-surface-100 border border-surface-300 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-surface-200 text-typography-400 mx-auto flex items-center justify-center">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-base text-typography-900">
                                    {searchTerm
                                        ? `Nenhum relatório encontrado para "${searchTerm}"`
                                        : "Nenhum relatório registrado este mês"}
                                </h3>
                                <p className="text-xs sm:text-sm text-typography-500 max-w-md mx-auto">
                                    {searchTerm
                                        ? "Tente verificar o nome digitado ou limpar os filtros aplicados."
                                        : "Comece inserindo os relatórios de serviço de campo dos publicadores para este mês."}
                                </p>
                                {searchTerm ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchTerm("")}
                                        className="mt-2 text-xs"
                                    >
                                        Limpar busca
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                `/congregacao/relatorios/${congregationId}/${month}/inserir`
                                            )
                                        }
                                        className="bg-primary-200 hover:bg-primary-150 text-typography-100 font-semibold text-xs sm:text-sm mt-2"
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        Inserir Primeiro Relatório
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Totals View */
                    <div className="space-y-6">
                        {/* Notice Banner */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                                    <InfoIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-xs sm:text-sm text-typography-700 leading-relaxed">
                                    {monthAlreadyRegister ? (
                                        date > 20 ? (
                                            <p>
                                                <strong>Relatório já registrado em Betel:</strong> Como já passou do dia 20, o relatório já foi consolidado. Caso precise fazer alguma alteração extraordinária, faça o ajuste manual e declare as diferenças nos totais do mês seguinte.
                                            </p>
                                        ) : (
                                            <p>
                                                <strong>Relatório registrado:</strong> Como ainda estamos antes do dia 20, você pode atualizar os totais caso novos relatórios tenham chegado. Lembre-se de atualizar também no sistema de Betel.
                                            </p>
                                        )
                                    ) : (
                                        <p>
                                            <strong>Consolidação Mensal:</strong> Revise os totais calculados abaixo antes de enviar para Betel. Quando tudo estiver pronto, clique no botão de registro para confirmar.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-surface-300">
                                <ConfirmRegisterReports
                                    onRegister={() => onSubmit()}
                                    button={
                                        <Button className="bg-primary-200 hover:bg-primary-150 text-typography-100 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2">
                                            <CheckCheck className="w-4 h-4" />
                                            <span>
                                                {!monthAlreadyRegister
                                                    ? "Registrar Relatórios e Totais"
                                                    : "Atualizar Registro de Totais"}
                                            </span>
                                        </Button>
                                    }
                                />
                            </div>
                        </div>

                        {/* General Congregation Indicators Card */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-base text-typography-900 mb-4 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-primary-200" />
                                Resumo Geral da Congregação
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-surface-200/50 rounded-xl border border-surface-300">
                                    <p className="text-xs text-typography-500 font-medium">
                                        Publicadores Ativos
                                    </p>
                                    <p className="text-2xl font-bold text-typography-900 mt-1">
                                        {totalsRecover && totalsRecover.length > 0
                                            ? totalsRecover[0].publishersActives
                                            : publishers?.length || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-surface-200/50 rounded-xl border border-surface-300">
                                    <p className="text-xs text-typography-500 font-medium">
                                        Média de Assistência (Fim de Semana)
                                    </p>
                                    <p className="text-2xl font-bold text-typography-900 mt-1">
                                        {meetingAssistanceEndWeek || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Category Totals Cards */}
                        <div className="space-y-4">
                            {totalsPublishers && (
                                <ListTotals
                                    key={"Totais de Publicadores"}
                                    totals={totalsPublishers}
                                />
                            )}
                            {totalsAuxPioneers && (
                                <ListTotals
                                    key={"Totais de Pioneiros regulares"}
                                    totals={totalsAuxPioneers}
                                />
                            )}
                            {totalsPioneers && (
                                <ListTotals
                                    key={"Totais de pioneiros auxiliares"}
                                    totals={totalsPioneers}
                                />
                            )}
                            {totalsSpecialsPioneer && (
                                <ListTotals
                                    key={"Totais de P.E e M.C"}
                                    totals={totalsSpecialsPioneer}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ContentDashboard>
    )
}

ReportsMonthPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "REPORTS_MANAGER",
    " REPORTS_VIEWER"
])

export default ReportsMonthPage
