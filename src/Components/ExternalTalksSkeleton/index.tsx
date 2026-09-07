export default function ExternalTalksSkeleton() {
  return (
    <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto animate-pulse">
      {/* Hero & Metrics Skeleton */}
      <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-36 bg-surface-200 rounded-md" />
          <div className="h-7 w-52 bg-surface-200 rounded-lg" />
          <div className="h-4 w-72 bg-surface-200 rounded-md" />
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-surface-300">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
              <div className="h-9 w-9 bg-surface-200 rounded-lg" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 w-16 bg-surface-200 rounded" />
                <div className="h-4 w-20 bg-surface-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Toolbar Skeleton */}
      <div className="flex items-center justify-between gap-3 bg-surface-100 border border-surface-300 rounded-xl p-3 shadow-sm">
        <div className="h-9 w-48 bg-surface-200 rounded-xl" />
        <div className="h-9 w-32 bg-surface-200 rounded-xl" />
      </div>

      {/* Weekend Cards Skeleton */}
      <div className="flex flex-col gap-5 pb-24">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-300 bg-surface-100 p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-surface-200 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-24 bg-surface-200 rounded" />
                  <div className="h-5 w-44 bg-surface-200 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-surface-200 rounded-full" />
            </div>

            {/* List item */}
            <div className="h-24 w-full bg-surface-200/60 rounded-xl border border-surface-300" />
          </div>
        ))}
      </div>
    </section>
  )
}
