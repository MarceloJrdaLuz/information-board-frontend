import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import ReportTable from "@/Components/ReportTable"
import { ReportTableSkeleton } from "@/Components/ReportTable/skeleton"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getMonthsByYear, getYearService } from "@/functions/meses"
import { useFetch } from "@/hooks/useFetch"
import { IReports } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { Calendar, FileSpreadsheet } from "lucide-react"
import { useEffect, useState } from "react"

function MyReportsPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [serviceYear] = useState(getYearService().toString())
    const [serviceYearSelected, setServiceYearSelected] = useState(serviceYear)
    const yearOptions = [
        serviceYear,
        (Number(serviceYear) - 1).toString(),
        (Number(serviceYear) - 2).toString()
    ]

    const { data: getReports, isLoading } = useFetch<IReports[]>("/myReports")

    useEffect(() => {
        setPageActive("Meus relatórios")
        setCrumbs([
            { label: "Início", link: "/dashboard" }
        ])
    }, [setPageActive, setCrumbs])

    const monthsWithYear = getMonthsByYear(serviceYearSelected)

    const reportsFilter = monthsWithYear.months
        .map(monthYear => {
            const [month, year] = monthYear.split(" ")
            return getReports?.find(
                r => r.month === month && r.year === year
            )
        })
        .filter((r): r is IReports => r !== undefined)

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Meus Relatórios"} />
            <section className="flex flex-col flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 overflow-y-auto thin-scrollbar">
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-100 p-5 sm:p-6 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="p-3 bg-primary-200/10 text-primary-200 rounded-xl shrink-0 ring-1 ring-primary-200/20">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-900 tracking-tight flex items-center gap-2">
                                Meus Relatórios de Serviço
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                Histórico e consolidação das suas atividades no ministério de campo.
                            </p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2">
                        <Dropdown
                            textSize="md"
                            notBorderFocus
                            selectedItem={serviceYearSelected}
                            handleClick={(select) => setServiceYearSelected(select)}
                            textVisible
                            title="Ano de Serviço"
                            options={yearOptions}
                        />
                    </div>
                </div>

                {/* Report Table / Skeleton */}
                <div>
                    {isLoading ? (
                        <ReportTableSkeleton />
                    ) : (
                        <ReportTable reports={reportsFilter} />
                    )}
                </div>
            </section>
        </ContentDashboard>
    )
}

MyReportsPage.getLayout = withProtectedLayout()

export default MyReportsPage