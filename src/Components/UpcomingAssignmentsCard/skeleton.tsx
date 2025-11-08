export function UpcomingAssignmentsCardSkeleton() {
  return (
    <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full animate-pulse">
      <div className="h-4 w-40 bg-surface-300 rounded mb-3" />

      <ul className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="border border-surface-300 rounded-lg p-2.5 flex flex-col gap-2"
          >
            {/* Data */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-surface-300 rounded" />
              <div className="h-3 w-32 bg-surface-300 rounded" />
            </div>

            {/* Linha 1 */}
            <div className="h-3 w-40 bg-surface-300 rounded" />

            {/* Linha 2 */}
            <div className="h-3 w-28 bg-surface-300 rounded" />

            {/* Linha 3 (ex: localização ou status) */}
            <div className="h-3 w-24 bg-surface-300 rounded" />
          </li>
        ))}
      </ul>
    </div>
  )
}
