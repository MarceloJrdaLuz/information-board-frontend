export default function UpcomingAssignmentsSkeleton() {
  return (
    <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full max-w-sm animate-pulse">
      {/* Título */}
      <div className="h-5 bg-surface-200 rounded w-2/3 mb-4 shimmer" />

      {/* Itens simulados */}
      <ul className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <li
            key={i}
            className="border border-surface-200 rounded-lg p-3"
          >
            {/* Linha superior — data */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3.5 w-3.5 rounded-full bg-surface-200 shimmer" />
              <div className="h-3.5 bg-surface-200 rounded w-2/3 shimmer" />
            </div>

            {/* Linhas internas simulando texto */}
            <div className="space-y-1.5">
              <div className="h-3 bg-surface-200 rounded w-3/4 shimmer" />
              <div className="h-3 bg-surface-200 rounded w-2/5 shimmer" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
