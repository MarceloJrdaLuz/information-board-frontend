import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import ReportTable from "@/Components/ReportTable"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getMonthsByYear, getYearService } from "@/functions/meses"
import { useFetch } from "@/hooks/useFetch"
import { IReports } from "@/types/types"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

export default function MyReports() {
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [serviceYear,] = useState(getYearService().toString())
    const [serviceYearSelected, setServiceYearSelected] = useState(serviceYear)
    const yearOptions = [
        serviceYear,
        (Number(serviceYear) - 1).toString(),
        (Number(serviceYear) - 2).toString()
    ]

    const { data: getReports } = useFetch<IReports[]>("/myReports")

    useEffect(() => {
        setPageActive('Meus relatórios')
    }, [setPageActive])

    const monthsWithYear = getMonthsByYear(serviceYearSelected)

    const reportsFilter = monthsWithYear.months
        .map(monthYear => {
            const [month, year] = monthYear.split(" ");
            return getReports?.find(
                r => r.month === month && r.year === year
            );
        })
        .filter((r): r is IReports => r !== undefined)
    return (
        <ProtectedRoute>
            <Layout pageActive="meus-relatorios">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex flex-wrap w-full h-full p-5 ">
                        <div className="w-full h-full">
                            <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Relatórios</h1>
                            <Dropdown textSize="md" textAlign="left" notBorderFocus selectedItem={serviceYearSelected} handleClick={(select) => setServiceYearSelected(select)} textVisible title="Ano de Serviço" options={yearOptions} />
                            <ReportTable reports={reportsFilter} />
                        </div>
                    </section>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>

    )
}