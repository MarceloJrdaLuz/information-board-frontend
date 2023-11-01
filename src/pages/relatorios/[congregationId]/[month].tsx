import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FIlterPriviles from "@/Components/FilterPrivileges"
import Layout from "@/Components/Layout"
import ListTotals from "@/Components/ListTotals"
import MissingReportsModal from "@/Components/MissingReportsModal"
import ModalRelatorio from "@/Components/ModalRelatorio"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { IPublisher, IReports, ITotalsReports, Privileges } from "@/entities/types"
import { capitalizeFirstLetter, isAuxPioneerMonth } from "@/functions/isAuxPioneerMonthNow"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useCallback, useEffect, useState } from "react"
import { v4 } from "uuid"

export default function RelatorioMes() {

    const router = useRouter()
    const { month, congregationId } = router.query

    const { data } = useFetch<IPublisher[]>(`/publishers/congregationId/${congregationId}`)

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const [reports, setReports] = useState<IReports[]>()
    const [reportsFiltered, setReportsFiltered] = useState<IReports[]>([])

    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])

    const [publishers, setPublishers] = useState<IPublisher[]>()

    const [missingReports, setMissingReports] = useState<IPublisher[] | undefined>()

    const [missingReportsCount, setMissingReportsCount] = useState<number>(0)

    const [totalsModalShow, setTotalsModalShow] = useState(false)

    const [totalsAuxPioneers, setTotalsAuxPioneers] = useState<ITotalsReports>()
    const [totalsPioneers, setTotalsPioneers] = useState<ITotalsReports>()
    const [totalsPublishers, setTotalsPublishers] = useState<ITotalsReports>()

    const [yearSelected, setYearSelected] = useState('')
    const [monthSelected, setMonthSelected] = useState('')

    const monthParam = month as string

    useEffect(() => {
        setPublishers(data)
    }, [data])

    useEffect(() => {
        setPageActive(monthParam)
        let dividirPalavra = monthParam.split(" ")
        setMonthSelected(dividirPalavra[0])
        setYearSelected(dividirPalavra[1])
    }, [monthParam, setPageActive])

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

            const filterPublishers = reports.filter(report =>
            (
                !report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) &&
                !report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) &&
                !report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) &&
                !report.publisher.privileges.includes(Privileges.PIONEIROESPECIAL)
            ))
            const filterPioneer = reports.filter(report => (report.publisher.privileges.includes(Privileges.PIONEIROREGULAR)))
            const filterAuxPioneer = reports.filter(report => ((report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) || report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO))))


            filterPublishers.map(report => {
                totalsReportsPublishers += 1
                if (report.studies) {
                    totalStudiesPublishers += report.studies
                }
                setTotalsPublishers({
                    month: monthSelected,
                    year: yearSelected,
                    totalsFrom: "Publicadores",
                    totalsReports: totalsReportsPublishers,
                    studies: totalStudiesPublishers
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
                    totalsReports: totalsReportsPioneer,
                    hours: totalHoursPioneer,
                    studies: totalStudiesPioneer
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
                    totalsFrom: "Pioneiros auxiliares, Pioneiros auxiliares indeterminados",
                    totalsReports: totalsReportsAuxPioneer,
                    hours: totalHoursAuxPioneer,
                    studies: totalStudiesAuxPioneer
                })
            })
        }

        if (reports) {
            // Filter reports based on month and year
            const reportsFilteredByDate = reports.filter(report => (
                report.month.toLocaleLowerCase() === monthSelected && report.year === yearSelected
            ))

            someTotals(reportsFilteredByDate)

            // Filter the filtered reports based on privileges
            const filteredReports = filterPrivileges.length > 0
                ? reportsFilteredByDate.filter(report => {
                    const isPioneerSelected = filterPrivileges.includes(Privileges.PIONEIROAUXILIAR);
                    const isIndefinitePioneerSelected = filterPrivileges.includes(Privileges.AUXILIARINDETERMINADO);
                    const isServantSelected = filterPrivileges.includes(Privileges.SM);
                    const isElderSelected = filterPrivileges.includes(Privileges.ANCIAO);

                    if ((isPioneerSelected || isIndefinitePioneerSelected) && !isElderSelected && !isServantSelected) {
                        return (
                            (isPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) ||
                            (isIndefinitePioneerSelected && report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO))
                        )
                    } else if ((isPioneerSelected || isIndefinitePioneerSelected) && isElderSelected) {
                        return (
                            (isPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) ||
                            (isIndefinitePioneerSelected && report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO))
                        ) && report.publisher.privileges.includes(Privileges.ANCIAO);
                    } else if ((isPioneerSelected || isIndefinitePioneerSelected) && isServantSelected) {
                        return (
                            (isPioneerSelected && report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonth(report.publisher, `${capitalizeFirstLetter(monthSelected)}-${yearSelected}`)) ||
                            (isIndefinitePioneerSelected && report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO))
                        ) && report.publisher.privileges.includes(Privileges.SM);
                    } else {
                        return filterPrivileges.every(privilege => report.publisher.privileges.includes(privilege));
                    }
                })
                : reportsFilteredByDate;

            const sortedReports = sortArrayByProperty(filteredReports, "publisher.fullName")

            setReportsFiltered(sortedReports)
        }
    }, [monthSelected, yearSelected, filterPrivileges, reports])

    useEffect(() => {
        if (publishers && reports) {
            const missingReports = publishers.filter(publisher => {
                const relatorioEnviado = reports.some(
                    report =>
                        report.publisher.id === publisher.id &&
                        report.month.toLowerCase() === monthSelected &&
                        report.year === yearSelected
                )
                return !relatorioEnviado
            })

            setMissingReports(missingReports)
        }
    }, [monthSelected, yearSelected, publishers, reports])

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
    }, [congregationId])

    useEffect(() => {
        getRelatorios()
    }, [getRelatorios])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Todos os meses', link: `/relatorios/${congregationId}` }]
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
        if (filter.includes(Privileges.PIONEIROAUXILIAR)) {
            setFilterPrivileges([...filter, Privileges.AUXILIARINDETERMINADO])
        } else {
            setFilterPrivileges(filter)
        }


    }

    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <>
                    <section className="flex flex-col flex-wrap w-full">
                        <h2 className="flex flex-1  justify-center font-semibold py-5 text-center">{`${monthParam.toLocaleUpperCase()}`}</h2>
                        <div className="flex flex-1 justify-between mb-4 mx-4">
                            <FIlterPriviles checkedOptions={filterPrivileges} handleCheckboxChange={(filters) => handleCheckboxChange(filters)} />
                            <span className="flex justify-center items-center gap-2 font-bold text-primary-200 cursor-pointer" onClick={() => setTotalsModalShow(!totalsModalShow)}>
                                Totais
                                {!totalsModalShow ? <EyeIcon /> : <EyeOffIcon />}
                            </span>
                            <MissingReportsModal missingReportsNumber={missingReportsCount} missingReports={missingReports} />
                        </div>
                        {totalsModalShow ? (
                            <ul >
                                {totalsPublishers && <ListTotals key={"Totais de Publicadores"} totals={totalsPublishers} />}
                                {totalsAuxPioneers && <ListTotals key={"Totais de Pioneiros regulares"} totals={totalsAuxPioneers} />}
                                {totalsPioneers && <ListTotals key={"Totais de pioneiros auxiliares"} totals={totalsPioneers} />}
                            </ul>
                        ) : reportsFiltered?.length > 0 ? (
                            <ul className="flex flex-wrap justify-evenly relative">
                                {reportsFiltered?.map(report =>
                                    <ModalRelatorio
                                        key={v4()}
                                        publisher={report.publisher}
                                        month={report.month}
                                        year={report.year}
                                        hours={
                                            report.publisher.privileges.includes(Privileges.PIONEIROREGULAR) ||
                                                report.publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) ||
                                                report.publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) ? report.hours : "Sim"

                                        }
                                        studies={report.studies}
                                        observations={report.observations}
                                    />)}
                            </ul>
                        ) : (
                            <div className="m-auto mt-4">Nenhum relatório registrado nesse mês</div>
                        )}

                    </section>
                </>
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION')) {
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