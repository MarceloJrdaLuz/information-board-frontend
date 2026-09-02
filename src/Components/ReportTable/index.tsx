import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { IReports } from "@/types/types"
import {
    BookOpen,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare,
    TrendingUp
} from "lucide-react"

interface ReportTableProps {
  reports: IReports[] | undefined
}

export default function ReportTable({ reports }: ReportTableProps) {
  const reportsList = reports || []
  const reportedMonthsCount = reportsList.length

  const totalHours = reportsList.reduce((acc, report) => acc + (report.hours ?? 0), 0)
  const totalStudies = reportsList.reduce((acc, report) => acc + (report.studies ?? 0), 0)

  const isPioneiroRegular = reportsList.some((r) =>
    r.privileges?.some((p) => p.toLowerCase().includes("pioneiro regular")) ||
    r.publisher?.privileges?.some((p) => p.toLowerCase().includes("pioneiro regular"))
  )

  const isPioneiroAuxiliar = reportsList.some((r) =>
    r.privileges?.some((p) => p.toLowerCase().includes("pioneiro auxiliar")) ||
    r.publisher?.privileges?.some((p) => p.toLowerCase().includes("pioneiro auxiliar"))
  )

  const expectedPerMonth = isPioneiroRegular ? 50 : isPioneiroAuxiliar ? 30 : 0
  const totalExpected = expectedPerMonth * reportedMonthsCount
  const diffHours = totalHours - totalExpected

  const avgHours = reportedMonthsCount > 0 ? (totalHours / reportedMonthsCount).toFixed(1) : "0"

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Hours */}
        <div className="p-3.5 bg-surface-100 border border-surface-300 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-typography-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-200" />
              Total de Horas
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-typography-900">
              {totalHours}h
            </span>
            {expectedPerMonth > 0 && totalExpected > 0 && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                  diffHours >= 0
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                {diffHours >= 0 ? `+${diffHours}h` : `${diffHours}h`}
              </span>
            )}
          </div>
        </div>

        {/* Total Studies */}
        <div className="p-3.5 bg-surface-100 border border-surface-300 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-typography-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary-200" />
              Estudos Bíblicos
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-typography-900">
              {totalStudies}
            </span>
          </div>
        </div>

        {/* Monthly Average */}
        <div className="p-3.5 bg-surface-100 border border-surface-300 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-typography-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary-200" />
              Média Mensal
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-typography-900">
              {avgHours}h
            </span>
            <span className="text-[11px] text-typography-400 font-normal">/ mês</span>
          </div>
        </div>

        {/* Reported Months */}
        <div className="p-3.5 bg-surface-100 border border-surface-300 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-typography-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-primary-200" />
              Meses Relatados
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-typography-900">
              {reportedMonthsCount}
            </span>
            <span className="text-[11px] text-typography-400 font-normal">meses</span>
          </div>
        </div>
      </div>

      {reportsList.length === 0 ? (
        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-8 text-center space-y-2">
          <FileText className="w-8 h-8 text-typography-400 mx-auto" />
          <p className="font-semibold text-sm text-typography-800">
            Nenhum relatório encontrado
          </p>
          <p className="text-xs text-typography-500">
            Não há registros de relatórios para o período selecionado.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block w-full bg-surface-100 border border-surface-300 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-300 bg-surface-200/60 text-typography-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Mês</th>
                  <th className="py-3 px-4">Participação</th>
                  <th className="py-3 px-4">Horas</th>
                  <th className="py-3 px-4">Estudos</th>
                  <th className="py-3 px-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/70 text-sm">
                {reportsList.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-surface-200/50 transition-colors text-typography-900"
                  >
                    <td className="py-3 px-4 font-semibold text-typography-900 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-surface-200 text-typography-600">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span>{`${capitalizeFirstLetter(report.month)} ${report.year}`}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Sim
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-typography-900">
                      {report.hours > 0 ? `${report.hours}h` : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium text-typography-800">
                      {typeof report.studies === "number" ? report.studies : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-typography-500 italic max-w-xs truncate">
                      {report.observations && report.observations.trim().length > 0
                        ? report.observations
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-surface-300 bg-surface-200/70 font-bold text-typography-900">
                  <td className="py-3.5 px-4 text-sm font-bold">Total do Período</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-typography-600">
                    {reportedMonthsCount} meses
                  </td>
                  <td className="py-3.5 px-4 text-sm font-extrabold text-primary-200 flex items-center gap-2">
                    <span>{totalHours}h</span>
                    {expectedPerMonth > 0 && totalExpected > 0 && (
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                          diffHours >= 0
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        (Meta: {totalExpected}h | {diffHours >= 0 ? `+${diffHours}h` : `${diffHours}h`})
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-sm font-bold text-typography-900">
                    {totalStudies}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-normal text-typography-500">
                    Média: {avgHours}h / mês
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {reportsList.map((report) => (
              <div
                key={report.id}
                className="bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-surface-300 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-200" />
                    <span className="font-bold text-sm text-typography-900">
                      {`${capitalizeFirstLetter(report.month)} ${report.year}`}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    Sim
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-surface-200/50 rounded-xl">
                    <span className="text-[11px] text-typography-500 font-medium block">Horas</span>
                    <span className="text-base font-bold text-typography-900">
                      {report.hours > 0 ? `${report.hours}h` : "—"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-200/50 rounded-xl">
                    <span className="text-[11px] text-typography-500 font-medium block">Estudos</span>
                    <span className="text-base font-bold text-typography-900">
                      {typeof report.studies === "number" ? report.studies : "—"}
                    </span>
                  </div>
                </div>

                {report.observations && report.observations.trim().length > 0 && (
                  <div className="p-2.5 bg-surface-200/40 rounded-xl text-xs text-typography-600 flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-typography-400 shrink-0 mt-0.5" />
                    <p className="italic">{report.observations}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
