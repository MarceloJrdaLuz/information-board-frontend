import { IReports } from "@/types/types"

interface ReportTableProps {
  reports: IReports[] | undefined
}

export default function ReportTable({ reports }: ReportTableProps) {
  const totalHours = reports?.reduce((acc, report) => acc + (report.hours ?? 0), 0) ?? 0
  const isPioneiroRegular = reports?.some(r => r.privileges?.includes("Pioneiro Regular")) ?? false
  const expectedPerMonth = isPioneiroRegular ? 50 : 0
  const totalExpected = isPioneiroRegular ? (reports?.length ?? 0) * expectedPerMonth : 0

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tabela (desktop) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse rounded-xl shadow-md overflow-hidden">
          <thead className="bg-gradient-to-r from-primary-100 to-primary-150 text-typography-900">
            <tr>
              <th className="p-3 text-left font-semibold">Mês</th>
              <th className="p-3 text-left font-semibold">Horas</th>
              <th className="p-3 text-left font-semibold">Estudos</th>
              <th className="p-3 text-left font-semibold">Observações</th>
            </tr>
          </thead>
          <tbody>
            {reports?.map((report) => (
              <tr
                key={report.id}
                className="border-b odd:bg-surface-100 even:bg-surface-100/30 text-typography-800 hover:bg-primary-100/10 transition-colors duration-200"
              >
                <td className="p-3">{`${report.month} ${report.year}`}</td>
                <td className="p-3 font-medium">{report.hours}</td>
                <td className="p-3">{report.studies ?? "-"}</td>
                <td className="p-3 italic text-typography-700">{report.observations ?? "-"}</td>
              </tr>
            ))}

            {/* Linha total */}
            <tr className="bg-primary-100 font-semibold text-typography-900">
              <td className="p-3">Total</td>
              <td className="p-3 flex">
                {isPioneiroRegular ? (
                  <div className="flex justify-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-typography-700">Atual</span>
                      <span className="font-bold">{totalHours}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-typography-700">Esperado</span>
                      <span className="font-bold">{totalExpected}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-typography-800">{totalHours}</span>
                )}
              </td>
              <td className="p-3">-</td>
              <td className="p-3">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden w-full flex flex-col gap-4 mt-4">
        {reports?.map((report) => (
          <div
            key={report.id}
            className="bg-surface-100 shadow-md rounded-2xl p-4 border border-typography-200 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary-200 text-lg">{`${report.month} ${report.year}`}</span>
              <span className="text-typography-800 font-bold">{report.hours}h</span>
            </div>
            <div className="mt-2 text-typography-700">
              <p><span className="font-semibold">Estudos:</span> {report.studies ?? "-"}</p>
              {report.observations && (
                <p className="mt-1 italic text-typography-600">{report.observations}</p>
              )}
            </div>
          </div>
        ))}

        {/* Card total */}
        <div className="bg-gradient-to-r from-primary-100 to-primary-150 shadow-md rounded-2xl p-4 border border-primary-200 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-typography-900">Total</span>
            {isPioneiroRegular ? (
              <div className="flex gap-6 text-typography-900">
                <div className="flex flex-col items-center">
                  <span className="text-sm">Atual</span>
                  <span className="font-bold">{totalHours}h</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm">Esperado</span>
                  <span className="font-bold">{totalExpected}h</span>
                </div>
              </div>
            ) : (
              <span className="font-bold text-typography-900">{totalHours}h</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
