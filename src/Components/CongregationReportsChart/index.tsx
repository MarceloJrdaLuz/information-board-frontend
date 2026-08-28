import { useAuthContext } from "@/context/AuthContext"
import { capitalizeFirstLetter, isAuxPioneerMonth } from "@/functions/isAuxPioneerMonthNow"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import { meses } from "@/functions/meses"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IPublisher, IReports, Privileges, Situation } from "@/types/types"
import * as Popover from "@radix-ui/react-popover"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    Clock,
    Copy,
    TrendingUp,
    Users
} from "lucide-react"
import { useMemo, useState } from "react"
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts"

dayjs.locale("pt-br")

const monthToNumber: Record<string, number> = {
    Janeiro: 0,
    Fevereiro: 1,
    Março: 2,
    Abril: 3,
    Maio: 4,
    Junho: 5,
    Julho: 6,
    Agosto: 7,
    Setembro: 8,
    Outubro: 9,
    Novembro: 10,
    Dezembro: 11
}

export function CongregationReportsChart() {
    const { user, roleContains } = useAuthContext()
    const [copied, setCopied] = useState(false)

    const hasPermission =
        roleContains("ADMIN_CONGREGATION") ||
        roleContains("REPORTS_MANAGER") ||
        roleContains("REPORTS_VIEWER")

    const today = dayjs()
    const currentDayOfMonth = today.date()
    // Até o dia 20 exibe os relatórios em falta do mês anterior
    const showMissingReports = currentDayOfMonth <= 20

    const previousMonthDate = today.subtract(1, "month")
    const missingTargetMonth = capitalizeFirstLetter(previousMonthDate.locale("pt-br").format("MMMM"))
    const missingTargetYear = previousMonthDate.format("YYYY")

    const { data: reports, isLoading: isLoadingReports } = useAuthorizedFetch<IReports[]>(
        hasPermission && user?.congregation?.id ? `/reports/${user.congregation.id}` : "",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER", "REPORTS_VIEWER"]
        }
    )

    const { data: publishers, isLoading: isLoadingPublishers } = useAuthorizedFetch<IPublisher[]>(
        hasPermission && user?.congregation?.id ? `/publishers/congregationId/${user.congregation.id}` : "",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "REPORTS_MANAGER", "REPORTS_VIEWER"]
        }
    )

    // Publicadores com relatório em falta
    const missingPublishers = useMemo(() => {
        if (!showMissingReports || !publishers || !reports) return []
        const active = publishers.filter((p) => p.situation === Situation.ATIVO)
        return active.filter((pub) => {
            const hasSubmitted = reports.some(
                (r) =>
                    r.publisher?.id === pub.id &&
                    r.month?.toLowerCase() === missingTargetMonth.toLowerCase() &&
                    r.year === missingTargetYear
            )
            return !hasSubmitted
        })
    }, [showMissingReports, publishers, reports, missingTargetMonth, missingTargetYear])

    const handleCopyMissing = () => {
        if (missingPublishers.length === 0) return
        const text = missingPublishers.map((p) => p.fullName).join("\n")
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
    }

    // Processamento e Agrupamento dos Relatórios
    const { chartData, lastMonthSummary, sixMonthsStudiesSummary } = useMemo(() => {
        if (!reports || reports.length === 0) {
            return {
                chartData: [],
                lastMonthSummary: null,
                sixMonthsStudiesSummary: { totalStudies: 0, avgStudies: 0 }
            }
        }

        // Agrupar por Ano-Mês
        const grouped: Record<
            string,
            {
                month: string
                year: string
                hours: number
                studies: number
                publishers: Set<string>
                reportsList: IReports[]
            }
        > = {}

        reports.forEach((report) => {
            const mIndex = monthToNumber[report.month] ?? 0
            const key = `${report.year}-${String(mIndex).padStart(2, "0")}`
            if (!grouped[key]) {
                grouped[key] = {
                    month: report.month,
                    year: report.year,
                    hours: 0,
                    studies: 0,
                    publishers: new Set(),
                    reportsList: []
                }
            }

            grouped[key].hours += report.hours || 0
            grouped[key].studies += report.studies || 0
            if (report.publisher?.id) {
                grouped[key].publishers.add(report.publisher.id)
            }
            grouped[key].reportsList.push(report)
        })

        // Lista ordenada cronologicamente
        const sortedMonthKeys = Object.keys(grouped).sort()
        const allMonthsData = sortedMonthKeys.map((key) => {
            const data = grouped[key]
            return {
                sortKey: key,
                name: `${data.month.substring(0, 3)}/${data.year.substring(2)}`,
                month: data.month,
                year: data.year,
                Horas: data.hours,
                Estudos: data.studies,
                Publicadores: data.publishers.size,
                reportsList: data.reportsList
            }
        })

        const last6Months = allMonthsData.slice(-6)

        // Resumo dos estudos dos últimos 6 meses
        const totalStudies6M = last6Months.reduce((acc, curr) => acc + curr.Estudos, 0)
        const avgStudies6M =
            last6Months.length > 0 ? Number((totalStudies6M / last6Months.length).toFixed(1)) : 0

        // Resumo do último mês relatado
        const lastMonthData = allMonthsData[allMonthsData.length - 1]
        let lastMonthStats = null

        if (lastMonthData) {
            const mIndex = meses.indexOf(capitalizeFirstLetter(lastMonthData.month))
            const refDate = new Date(
                Number(lastMonthData.year),
                mIndex !== -1 ? mIndex : 0,
                1
            )
            const mReports = lastMonthData.reportsList

            // Pioneiros Regulares
            const prReports = mReports.filter(
                (r) =>
                    r.publisher?.privileges?.includes(Privileges.PIONEIROREGULAR) &&
                    isPioneerNow(r.publisher, refDate)
            )
            const prCount = prReports.length
            const prHoursTotal = prReports.reduce((acc, r) => acc + (r.hours || 0), 0)
            const prHoursAvg =
                prCount > 0 ? Number((prHoursTotal / prCount).toFixed(1)) : 0

            // Pioneiros Auxiliares no mês
            const auxMonthReports = mReports.filter(
                (r) =>
                    r.publisher?.privileges?.includes(Privileges.PIONEIROAUXILIAR) &&
                    isAuxPioneerMonth(
                        r.publisher,
                        `${capitalizeFirstLetter(lastMonthData.month)}-${lastMonthData.year}`
                    )
            )
            // Pioneiros Auxiliares por tempo indeterminado
            const auxIndefiniteReports = mReports.filter(
                (r) =>
                    r.publisher?.privileges?.includes(Privileges.AUXILIARINDETERMINADO) &&
                    isPioneerNow(r.publisher, refDate)
            )
            const auxMonthCount = auxMonthReports.length
            const auxIndefiniteCount = auxIndefiniteReports.length
            const auxTotalCount = auxMonthCount + auxIndefiniteCount

            // Pioneiros Especiais / Missionários
            const specialReports = mReports.filter(
                (r) =>
                    r.publisher?.privileges?.includes(Privileges.PIONEIROESPECIAL) ||
                    r.publisher?.privileges?.includes(Privileges.MISSIONARIOEMCAMPO)
            )
            const specialCount = specialReports.length

            // Publicadores comuns (que não estão em nenhuma das categorias pioneiras acima)
            const pubReports = mReports.filter((r) => {
                const isPR =
                    r.publisher?.privileges?.includes(Privileges.PIONEIROREGULAR) &&
                    isPioneerNow(r.publisher, refDate)
                const isAux =
                    (r.publisher?.privileges?.includes(Privileges.PIONEIROAUXILIAR) &&
                        isAuxPioneerMonth(
                            r.publisher,
                            `${capitalizeFirstLetter(lastMonthData.month)}-${lastMonthData.year}`
                        )) ||
                    (r.publisher?.privileges?.includes(Privileges.AUXILIARINDETERMINADO) &&
                        isPioneerNow(r.publisher, refDate))
                const isSpecial =
                    r.publisher?.privileges?.includes(Privileges.PIONEIROESPECIAL) ||
                    r.publisher?.privileges?.includes(Privileges.MISSIONARIOEMCAMPO)

                return !isPR && !isAux && !isSpecial
            })
            const pubCount = pubReports.length

            // Estudos do último mês
            const monthStudiesTotal = lastMonthData.Estudos
            const monthStudiesAvg =
                lastMonthData.Publicadores > 0
                    ? Number((monthStudiesTotal / lastMonthData.Publicadores).toFixed(2))
                    : 0

            lastMonthStats = {
                month: lastMonthData.month,
                year: lastMonthData.year,
                totalPublishers: lastMonthData.Publicadores,
                pubCount,
                prCount,
                prHoursTotal,
                prHoursAvg,
                auxMonthCount,
                auxIndefiniteCount,
                auxTotalCount,
                specialCount,
                monthStudiesTotal,
                monthStudiesAvg
            }
        }

        return {
            chartData: last6Months,
            lastMonthSummary: lastMonthStats,
            sixMonthsStudiesSummary: {
                totalStudies: totalStudies6M,
                avgStudies: avgStudies6M
            }
        }
    }, [reports])

    if (!hasPermission) return null

    const isLoading = isLoadingReports || isLoadingPublishers

    return (
        <div className="bg-surface-100 rounded-xl shadow-sm p-5 w-full flex flex-col gap-5 border border-surface-300">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-typography-700">
                        Relatórios de Campo da Congregação
                    </h2>
                    <p className="text-xs text-typography-500">
                        Visão analítica dos últimos meses e acompanhamento da dianteira
                    </p>
                </div>

                {/* Aviso de Relatórios em Falta (visível até o dia 20) */}
                {showMissingReports && !isLoading && (
                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <button
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
                                    missingPublishers.length > 0
                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
                                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                                }`}
                            >
                                <AlertCircle size={15} />
                                <span>
                                    {missingPublishers.length > 0
                                        ? `Faltam ${missingPublishers.length} relatórios (${missingTargetMonth})`
                                        : `Todos os relatórios entregues (${missingTargetMonth})`}
                                </span>
                                <ChevronDown size={14} />
                            </button>
                        </Popover.Trigger>

                        <Popover.Portal>
                            <Popover.Content
                                side="bottom"
                                align="end"
                                sideOffset={6}
                                className="w-80 bg-surface-100 border border-surface-300 rounded-xl shadow-xl p-4 z-50 text-typography-700 animate-in fade-in zoom-in-95 duration-150"
                            >
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-200">
                                    <div className="text-xs font-bold text-typography-800">
                                        Em falta ({missingTargetMonth}/{missingTargetYear})
                                    </div>
                                    {missingPublishers.length > 0 && (
                                        <button
                                            onClick={handleCopyMissing}
                                            className="flex items-center gap-1 text-[11px] text-primary-200 hover:underline"
                                            title="Copiar nomes"
                                        >
                                            {copied ? (
                                                <>
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    <span className="text-emerald-500 font-semibold">Copiado</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    <span>Copiar</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <ul className="max-h-60 overflow-y-auto space-y-1 pr-1 text-xs">
                                    {missingPublishers.length > 0 ? (
                                        missingPublishers.map((pub) => (
                                            <li
                                                key={pub.id}
                                                className="py-1 px-2 rounded-md hover:bg-surface-200/50 flex items-center justify-between"
                                            >
                                                <span>{pub.fullName}</span>
                                                <span className="text-[10px] text-typography-400">
                                                    {pub.group?.name || "Sem grupo"}
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-center py-3 text-emerald-500 font-medium">
                                            🎉 Parabéns! Todos os publicadores ativos entregaram o relatório.
                                        </li>
                                    )}
                                </ul>
                                <Popover.Arrow className="fill-surface-100 stroke-surface-300" />
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                )}
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-typography-400">
                    <Clock className="animate-spin text-primary-200" size={24} />
                    <span className="text-xs">Carregando dados dos relatórios...</span>
                </div>
            ) : (
                <>
                    {/* Cards de Métricas e Categorias */}
                    {lastMonthSummary && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Card 1: Composição de Publicadores */}
                            <div className="bg-surface-200/50 rounded-xl p-3.5 border border-surface-300 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-xs text-typography-500 mb-1">
                                    <span className="font-semibold text-typography-700">
                                        Publicadores ({lastMonthSummary.month})
                                    </span>
                                    <Users size={16} className="text-primary-200" />
                                </div>
                                <div className="text-xl font-bold text-typography-800 mb-2">
                                    {lastMonthSummary.totalPublishers}
                                    <span className="text-xs font-normal text-typography-500 ml-1">
                                        relataram
                                    </span>
                                </div>
                                <div className="text-[11px] text-typography-600 space-y-0.5 border-t border-surface-300/60 pt-2">
                                    <div className="flex justify-between">
                                        <span>Publicadores:</span>
                                        <strong className="text-typography-700">{lastMonthSummary.pubCount}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pioneiros Regulares:</span>
                                        <strong className="text-typography-700">{lastMonthSummary.prCount}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pioneiros Auxiliares:</span>
                                        <strong className="text-typography-700">
                                            {lastMonthSummary.auxTotalCount}{" "}
                                            <span className="text-[10px] text-typography-400">
                                                (mês: {lastMonthSummary.auxMonthCount} | indet.: {lastMonthSummary.auxIndefiniteCount})
                                            </span>
                                        </strong>
                                    </div>
                                    {lastMonthSummary.specialCount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Especiais / Miss.:</span>
                                            <strong className="text-typography-700">
                                                {lastMonthSummary.specialCount}
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card 2: Pioneiros Regulares */}
                            <div className="bg-surface-200/50 rounded-xl p-3.5 border border-surface-300 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-xs text-typography-500 mb-1">
                                    <span className="font-semibold text-typography-700">
                                        Pioneiros Regulares
                                    </span>
                                    <Clock size={16} className="text-amber-500" />
                                </div>
                                <div className="text-xl font-bold text-typography-800 mb-2">
                                    {lastMonthSummary.prHoursTotal}h
                                    <span className="text-xs font-normal text-typography-500 ml-1">
                                        totais
                                    </span>
                                </div>
                                <div className="text-[11px] text-typography-600 space-y-0.5 border-t border-surface-300/60 pt-2">
                                    <div className="flex justify-between">
                                        <span>Total pioneiros:</span>
                                        <strong className="text-typography-700">{lastMonthSummary.prCount}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Média de horas:</span>
                                        <strong className="text-amber-500">{lastMonthSummary.prHoursAvg}h / pioneiro</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Estudos do Último Mês */}
                            <div className="bg-surface-200/50 rounded-xl p-3.5 border border-surface-300 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-xs text-typography-500 mb-1">
                                    <span className="font-semibold text-typography-700">
                                        Estudos ({lastMonthSummary.month})
                                    </span>
                                    <BookOpen size={16} className="text-emerald-500" />
                                </div>
                                <div className="text-xl font-bold text-typography-800 mb-2">
                                    {lastMonthSummary.monthStudiesTotal}
                                    <span className="text-xs font-normal text-typography-500 ml-1">
                                        estudos
                                    </span>
                                </div>
                                <div className="text-[11px] text-typography-600 space-y-0.5 border-t border-surface-300/60 pt-2">
                                    <div className="flex justify-between">
                                        <span>Média no mês:</span>
                                        <strong className="text-emerald-500">
                                            {lastMonthSummary.monthStudiesAvg} por publicador
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Estudos dos Últimos 6 Meses */}
                            <div className="bg-surface-200/50 rounded-xl p-3.5 border border-surface-300 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-xs text-typography-500 mb-1">
                                    <span className="font-semibold text-typography-700">
                                        Estudos (Últimos 6 meses)
                                    </span>
                                    <TrendingUp size={16} className="text-sky-500" />
                                </div>
                                <div className="text-xl font-bold text-typography-800 mb-2">
                                    {sixMonthsStudiesSummary.totalStudies}
                                    <span className="text-xs font-normal text-typography-500 ml-1">
                                        acumulados
                                    </span>
                                </div>
                                <div className="text-[11px] text-typography-600 space-y-0.5 border-t border-surface-300/60 pt-2">
                                    <div className="flex justify-between">
                                        <span>Média mensal:</span>
                                        <strong className="text-sky-500">
                                            {sixMonthsStudiesSummary.avgStudies} estudos/mês
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gráfico dos Últimos 6 Meses */}
                    <div className="w-full h-80 pt-2">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#6B7280", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "10px",
                                            border: "1px solid #E5E7EB",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                            backgroundColor: "#FFFFFF"
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="Horas"
                                        fill="#2dd4bf"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="Estudos"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="Publicadores"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-typography-400 text-sm">
                                Nenhum relatório encontrado para gerar o gráfico.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

