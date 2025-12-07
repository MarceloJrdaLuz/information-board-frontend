import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Input from "@/Components/Input"
import { VercelUsageChart } from "@/Components/VercelUsageChart"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

function ControlledUse() {
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    // ---------------------------
    // Datas padrão (1º dia -> hoje)
    // ---------------------------
    function getDefaultDates() {
        const now = new Date()

        const firstDay = new Date(Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            1, 0, 0, 0
        ))

        const today = new Date(Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23, 59, 59, 999
        ))

        return {
            initialInput: firstDay.toISOString().substring(0, 10),
            endInput: today.toISOString().substring(0, 10)
        }
    }

    const { initialInput, endInput } = getDefaultDates()

    // ---------------------------
    // Estados das datas (inputs)
    // ---------------------------
    const [initialDate, setInitialDate] = useState<string>(initialInput)
    const [endDate, setEndDate] = useState<string>(endInput)

    // ---------------------------
    // Monta URL dinâmica
    // ---------------------------
    function buildUrl() {
        const from = `${initialDate}T00:00:00.000Z`
        const to = `${endDate}T23:59:59.999Z`

        return `/usage?from=${from}&to=${to}&type=requests`
    }

    const url = buildUrl()

    // ---------------------------
    // Busca os dados
    // ---------------------------
    const { data: usage, isLoading } = useAuthorizedFetch(url, {
        allowedRoles: ["ADMIN"]
    })

    console.log(usage)

    useEffect(() => {
        setPageActive("Controle de Uso")
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Controle de Uso" />

            <section className="flex flex-wrap w-full h-full p-5">
                <div className="w-full h-full">
                    {/* Filtros */}
                    <div className="flex justify-between bg-surface-100 p-5 gap-4 rounded-2xl shadow-md">
                        <Input
                            className="cursor-pointer"
                            type="date"
                            placeholder="Data Inicial"
                            value={initialDate}
                            onChange={e => setInitialDate(e.target.value)}
                        />

                        <Input
                            className="cursor-pointer"
                            type="date"
                            placeholder="Data Final"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>

                    {/* Gráfico */}
                    {usage && (
                        <VercelUsageChart usage={usage} />
                    )}

                    {isLoading && (
                        <p className="text-center mt-5 text-typography-500">Carregando dados...</p>
                    )}
                </div>
            </section>
        </ContentDashboard>
    )
}

ControlledUse.getLayout = withProtectedLayout(["ADMIN"])

export default ControlledUse
