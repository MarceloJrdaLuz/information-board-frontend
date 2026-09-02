import { Button } from "@/Components/ui/button"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { getYearService, obterUltimosMeses } from "@/functions/meses"
import {
    ArrowRight,
    Calendar,
    CalendarDays,
    ChevronRight,
    FileSpreadsheet,
    History,
    Sparkles
} from "lucide-react"
import moment from "moment"
import "moment/locale/pt-br"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"

export interface ListRelatoriosProps {
    congregationId: string
}

export default function ListMonths(props: ListRelatoriosProps) {
    const router = useRouter()
    const congregationId = props.congregationId || (router.query.congregationId as string)

    const [anoServicoAtual, setAnoServicoAtual] = useState<string[]>([])
    const [anoServicoAnterior, setAnoServicoAnterior] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    const currentYearService = useMemo(() => getYearService(), [])
    const currentMonthFormatted = useMemo(() => {
        moment.locale("pt-br")
        return moment().format("MMMM YYYY").toLowerCase()
    }, [])

    useEffect(() => {
        const { anoCorrente, anoAnterior } = obterUltimosMeses()
        setAnoServicoAtual(anoCorrente || [])
        setAnoServicoAnterior(anoAnterior || [])
        setLoading(false)
    }, [])

    const handleSelectMonth = (mes: string) => {
        router.push(`/congregacao/relatorios/${congregationId}/${mes}`)
    }

    return (
        <section className="flex flex-col flex-1 h-full w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 overflow-y-auto thin-scrollbar">
            {/* Header Hero */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-100 p-5 sm:p-6 rounded-2xl border border-surface-300 shadow-sm">
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 bg-primary-200/10 text-primary-200 rounded-xl shrink-0 ring-1 ring-primary-200/20">
                        <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-typography-900 tracking-tight flex items-center gap-2">
                            Relatórios da Congregação
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                            Gerencie e acompanhe os relatórios mensais de serviço de campo dos publicadores.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex items-center gap-2">
                    <Button
                        onClick={() => router.push(`/congregacao/relatorios/${congregationId}/cartao-publicador`)}
                        className="w-full md:w-auto bg-primary-200 hover:bg-primary-150 text-typography-100 font-semibold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Registros e Cartões (S-21)</span>
                        <ArrowRight className="h-4 w-4 opacity-70" />
                    </Button>
                </div>
            </div>

            {/* Quick Cards / Two column sections for Service Years */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ano de Serviço Atual */}
                <div className="flex flex-col bg-surface-100 border border-surface-300 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-surface-300 bg-surface-100/70 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-typography-900">
                                    Ano de Serviço {currentYearService}
                                </h2>
                                <p className="text-xs text-typography-500">
                                    Meses decorridos do ano corrente
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Ano Atual
                        </span>
                    </div>

                    <div className="p-4 sm:p-5 flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-14 bg-surface-200/50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : anoServicoAtual.length === 0 ? (
                            <div className="text-center py-8 text-typography-400 text-sm">
                                Nenhum mês disponível para este período.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {anoServicoAtual.map((mes) => {
                                    const isCurrent = mes.toLowerCase() === currentMonthFormatted
                                    return (
                                        <button
                                            key={mes}
                                            type="button"
                                            onClick={() => handleSelectMonth(mes)}
                                            className={`group relative text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                                                isCurrent
                                                    ? "bg-primary-200/5 border-primary-200/40 shadow-xs hover:border-primary-200 hover:bg-primary-200/10"
                                                    : "bg-surface-100 border-surface-300 hover:border-primary-200 hover:bg-surface-200/60 hover:shadow-sm"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`p-2 rounded-lg transition-colors ${
                                                    isCurrent
                                                        ? "bg-primary-200 text-typography-100"
                                                        : "bg-surface-200 text-typography-600 group-hover:bg-primary-200/15 group-hover:text-primary-200"
                                                }`}>
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div className="truncate">
                                                    <div className="text-sm font-semibold text-typography-900 group-hover:text-primary-200 transition-colors truncate">
                                                        {capitalizeFirstLetter(mes)}
                                                    </div>
                                                    {isCurrent && (
                                                        <div className="text-[11px] font-medium text-primary-200 flex items-center gap-1 mt-0.5">
                                                            <Sparkles className="h-3 w-3" />
                                                            Mês atual
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-typography-400 group-hover:text-primary-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ano de Serviço Anterior */}
                <div className="flex flex-col bg-surface-100 border border-surface-300 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-surface-300 bg-surface-100/70 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-typography-500/10 text-typography-600 rounded-lg">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-typography-900">
                                    Ano de Serviço {currentYearService - 1}
                                </h2>
                                <p className="text-xs text-typography-500">
                                    Histórico dos 12 meses anteriores
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-typography-500/10 text-typography-600 border border-typography-300/30">
                            Histórico
                        </span>
                    </div>

                    <div className="p-4 sm:p-5 flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-14 bg-surface-200/50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : anoServicoAnterior.length === 0 ? (
                            <div className="text-center py-8 text-typography-400 text-sm">
                                Nenhum mês histórico disponível.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {anoServicoAnterior.map((mes) => (
                                    <button
                                        key={mes}
                                        type="button"
                                        onClick={() => handleSelectMonth(mes)}
                                        className="group relative text-left p-3.5 sm:p-4 rounded-xl border border-surface-300 bg-surface-100 hover:border-primary-200 hover:bg-surface-200/60 hover:shadow-sm transition-all duration-200 flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 rounded-lg bg-surface-200 text-typography-600 group-hover:bg-primary-200/15 group-hover:text-primary-200 transition-colors">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-sm font-semibold text-typography-900 group-hover:text-primary-200 transition-colors truncate">
                                                    {capitalizeFirstLetter(mes)}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-typography-400 group-hover:text-primary-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
