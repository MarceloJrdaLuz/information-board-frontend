export function ReportTableSkeleton() {
  const skeletonRows = Array(6).fill(0)

  return (
    <div className="w-full flex flex-col space-y-4 animate-pulse">
      {/* Skeleton KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 bg-surface-100 border border-surface-300 rounded-2xl shadow-xs space-y-2"
          >
            <div className="h-3.5 bg-surface-200 rounded-md w-24" />
            <div className="h-7 bg-surface-200 rounded-lg w-16" />
          </div>
        ))}
      </div>

      {/* Skeleton Desktop Table */}
      <div className="hidden md:block w-full bg-surface-100 border border-surface-300 rounded-2xl shadow-sm overflow-hidden p-4 space-y-3">
        <div className="h-8 bg-surface-200 rounded-xl w-full" />
        {skeletonRows.map((_, i) => (
          <div key={i} className="h-10 bg-surface-200/60 rounded-xl w-full" />
        ))}
      </div>

      {/* Skeleton Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-100 border border-surface-300 rounded-2xl p-4 space-y-3"
          >
            <div className="h-5 bg-surface-200 rounded-md w-1/3" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 bg-surface-200 rounded-xl" />
              <div className="h-14 bg-surface-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
