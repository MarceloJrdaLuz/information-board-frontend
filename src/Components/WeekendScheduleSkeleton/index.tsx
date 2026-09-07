export default function WeekendScheduleSkeleton() {
  return (
    <div className="flex flex-col w-full h-full gap-6 animate-pulse">
      {/* 1. Header Toolbar Skeleton */}
      <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-surface-200 shimmer rounded-md" />
            <div className="h-8 w-60 bg-surface-200 shimmer rounded-lg" />
            <div className="h-4 w-80 bg-surface-200 shimmer rounded-md" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-10 w-44 bg-surface-200 shimmer rounded-xl" />
            <div className="h-10 w-28 bg-surface-200 shimmer rounded-xl" />
            <div className="h-10 w-28 bg-surface-200 shimmer rounded-xl" />
            <div className="h-10 w-32 bg-surface-200 shimmer rounded-xl" />
          </div>
        </div>

        {/* Metric Badges Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-surface-300">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-surface-200/60 shimmer rounded-xl" />
          ))}
        </div>
      </div>

      {/* 2. Weekend Card Skeletons */}
      <div className="flex flex-col gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-100 border border-surface-300 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="h-1.5 w-full bg-surface-200 shimmer" />
            <div className="p-4 md:p-5 flex flex-col gap-5">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-surface-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-surface-200 shimmer rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-surface-200 shimmer rounded" />
                    <div className="h-5 w-44 bg-surface-200 shimmer rounded-md" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-24 bg-surface-200 shimmer rounded-full" />
                  <div className="h-7 w-28 bg-surface-200 shimmer rounded-lg" />
                </div>
              </div>

              {/* Section 1: Chairman */}
              <div className="h-24 bg-surface-200/40 shimmer rounded-xl border border-surface-300/60" />

              {/* Section 2: Speaker & Talk */}
              <div className="h-32 bg-surface-200/40 shimmer rounded-xl border border-surface-300/60" />

              {/* Section 3: Watchtower */}
              <div className="h-24 bg-surface-200/40 shimmer rounded-xl border border-surface-300/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
