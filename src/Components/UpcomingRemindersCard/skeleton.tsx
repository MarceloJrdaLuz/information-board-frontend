export default function UpcomingRemindersSkeleton() {
  return (
    <div className="bg-surface-100 rounded-xl shadow-sm p-4 w-full animate-pulse">
      <div className="h-5 bg-surface-200 rounded w-2/3 mb-4 shimmer" />

      <ul className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <li
            key={i}
            className="flex bg-surface-100 border border-surface-300 border-l-4 border-l-primary-200 rounded-sm overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center w-16 bg-surface-200/40 border-r border-surface-300 py-3">
              <div className="h-5 w-6 bg-surface-200 rounded shimmer" />
              <div className="h-3 w-5 bg-surface-200 rounded mt-1 shimmer" />
            </div>

            <div className="flex-1 p-3">
              <div className="h-4 w-2/3 bg-surface-200 rounded shimmer mb-2" />
              <div className="h-3 w-1/3 bg-surface-200 rounded shimmer" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
