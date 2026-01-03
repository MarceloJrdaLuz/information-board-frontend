export default function UpcomingAssignmentsSkeleton() {
  return (
    <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full animate-pulse">
      {/* Título */}
      <div className="h-5 bg-surface-200 rounded w-2/3 mb-4 shimmer" />

      <ul className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <li
            key={i}
            className="flex bg-surface-100 border border-surface-300 border-l-4 border-l-primary-200 rounded-sm overflow-hidden"
          >
            {/* Barra lateral — data */}
            <div className="flex flex-col items-center justify-center w-16 bg-surface-200/40 border-r border-surface-300 py-3">
              <div className="h-5 w-6 bg-surface-200 rounded shimmer" />
              <div className="h-3 w-5 bg-surface-200 rounded mt-1 shimmer" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-3">
              {/* Cabeçalho */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-16 bg-surface-200 rounded shimmer" />
              </div>

              <div className="mt-2 space-y-1 flex items-center gap-2">
                <div className="h-3 bg-surface-200 rounded w-4 shimmer" />
                <div className="h-3 bg-surface-200 rounded w-2/4 shimmer" />
              </div>
            </div>

          </li>
        ))}
      </ul>
    </div>
  )
}
