export function ReportTableSkeleton() {
  // mês atual (1–12)
  const currentMonth = new Date().getMonth() + 1

  // calcula quantos meses desde setembro
  const monthsSinceSeptember = currentMonth >= 9
    ? currentMonth - 8 // ex: novembro (11) → 3 meses (set, out, nov)
    : currentMonth + 4 // ex: fevereiro (2) → 6 meses (set → fev)

  const skeletonRows = Array(monthsSinceSeptember - 1).fill(0)

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tabela para desktop */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead className="bg-surface-200">
            <tr>
              <th className="p-3 text-left shimmer h-6 w-24 rounded"></th>
              <th className="p-3 text-left shimmer h-6 w-16 rounded"></th>
              <th className="p-3 text-left shimmer h-6 w-16 rounded"></th>
              <th className="p-3 text-left shimmer h-6 w-28 rounded"></th>
            </tr>
          </thead>
          <tbody>
            {skeletonRows.map((_, i) => (
              <tr key={i} className="border-b odd:bg-surface-100 even:bg-surface-200">
                <td className="p-3">
                  <div className="h-4 w-24 bg-surface-200 rounded shimmer"></div>
                </td>
                <td className="p-3">
                  <div className="h-4 w-12 bg-surface-200 rounded shimmer"></div>
                </td>
                <td className="p-3">
                  <div className="h-4 w-12 bg-surface-200 rounded shimmer"></div>
                </td>
                <td className="p-3">
                  <div className="h-4 w-32 bg-surface-200 rounded shimmer"></div>
                </td>
              </tr>
            ))}
            <tr className="bg-surface-100">
              <td className="p-3">
                <div className="h-4 w-16 bg-surface-200 rounded shimmer"></div>
              </td>
              <td colSpan={3} className="p-3">
                <div className="h-4 w-1/3 bg-surface-200 rounded shimmer"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden w-full flex flex-col gap-4 mt-4">
        {skeletonRows.map((_, i) => (
          <div key={i} className="bg-surface-100 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <div className="h-6 w-24 bg-surface-200 rounded shimmer"></div>
              <div className="h-6 w-12 bg-surface-200 rounded shimmer"></div>
            </div>
            <div className="h-6 w-1/2 bg-surface-200 rounded mb-2 shimmer"></div>
          </div>
        ))}
        <div className="bg-surface-300 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <div className="h-6 w-24 bg-surface-100 rounded shimmer"></div>
            <div className="h-6 w-12 bg-surface-100 rounded shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
