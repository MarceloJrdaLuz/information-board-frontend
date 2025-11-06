import { IReports } from "@/types/types"

interface ReportTableProps {
  reports: IReports[] | undefined
}

export default function ReportTable({ reports }: ReportTableProps) {
  // Soma total das horas
  const totalHours = reports?.reduce((acc, report) => acc + (report.hours ?? 0), 0) ?? 0

  // Verifica se a pessoa é Pioneiro Regular
  const isPioneiroRegular = reports?.some(r => r.privileges?.includes("Pioneiro Regular")) ?? false

  // Só calcula esperado se for Pioneiro Regular
  const expectedPerMonth = isPioneiroRegular ? 50 : 0
  const totalExpected = isPioneiroRegular ? (reports?.length ?? 0) * expectedPerMonth : 0

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tabela (visível em telas médias pra cima) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead className="bg-primary-100 text-typography-700">
            <tr>
              <th className="p-3 text-left">Mês</th>
              <th className="p-3 text-left">Horas</th>
              <th className="p-3 text-left">Estudos</th>
              <th className="p-3 text-left">Observações</th>
            </tr>
          </thead>
          <tbody>
            {reports?.map((report) => (
              <tr
                key={report.id}
                className="border-b odd:bg-surface-100 text-typography-800  even:bg-surface-200 hover:bg-primary-100 cursor-pointer transition-colors"
              >
                <td className="p-3">{`${report.month} ${report.year}`}</td>
                <td className="p-3">{report.hours}</td>
                <td className="p-3">{report.studies ?? "-"}</td>
                <td className="p-3">{report.observations ?? "-"}</td>
              </tr>
            ))}

            {/* Linha com total */}
            <tr className="bg-primary-100 font-semibold">
              <td className="p-3">Total</td>
              <td className="p-3 flex">
                {isPioneiroRegular ? (
                  <div className="flex justify-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-typography-800">Atual</span>
                      <span className="font-bold">{totalHours}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-typography-800">Esperado</span>
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

      {/* Cards (somente em mobile) */}
      <div className="md:hidden w-full flex flex-col gap-4">
        {reports?.map((report) => (
          <div
            key={report.id}
            className="bg-surface-100 shadow-md rounded-xl p-4 border border-typography-200"
          >
            <div className="flex justify-between">
              <span className="font-semibold text-primary-200 text-lg">{`${report.month} ${report.year}`}</span>
              <span className="text-typography-700 font-bold">{report.hours}h</span>
            </div>
            <p className="text-base text-typography-700 mt-2">
              <span className="font-semibold text-base">Estudos:</span>{" "}
              {report.studies ?? "-"}
            </p>
            {report.observations && (
              <p className="text-base text-typography-600 mt-1 italic">
                {report.observations}
              </p>
            )}
          </div>
        ))}

        {/* Card com total */}
        <div className="bg-primary-50 shadow-md rounded-xl p-4 border border-primary-200 mb-4">
          <div className="flex justify-between items-center gap-3">
            <span className="font-semibold text-primary-200">Total</span>
            {isPioneiroRegular ? (
              <div className="flex gap-8 text-typography-800">
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
              <span className="font-bold text-typography-700">{totalHours}h</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
