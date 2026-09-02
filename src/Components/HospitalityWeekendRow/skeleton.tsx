export default function WeekendScheduleSkeleton() {
  return (
    <section className="flex flex-col w-full min-h-full gap-6 animate-pulse">
      {/* 1. Hero Card Skeleton */}
      <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-surface-300 rounded" />
          <div className="h-7 w-72 bg-surface-300 rounded-lg" />
          <div className="h-4 w-96 bg-surface-300 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
          <div className="h-14 bg-surface-200 rounded-xl" />
          <div className="h-14 bg-surface-200 rounded-xl" />
          <div className="h-14 bg-surface-200 rounded-xl" />
        </div>
      </div>

      {/* 2. Navigation Toolbar Skeleton */}
      <div className="bg-surface-100 border border-surface-300 rounded-xl p-3 shadow-md flex justify-between items-center">
        <div className="h-9 w-48 bg-surface-200 rounded-xl" />
        <div className="h-9 w-32 bg-surface-200 rounded-xl" />
      </div>

      {/* 3. Weekend Cards Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm space-y-4"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-surface-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-surface-300 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-surface-300 rounded" />
                  <div className="h-3 w-16 bg-surface-300 rounded" />
                </div>
              </div>
              <div className="h-6 w-24 bg-surface-200 rounded-full" />
            </div>

            {/* Event Buttons */}
            <div className="h-10 bg-surface-200 rounded-xl" />

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-36 bg-surface-200/50 rounded-xl border border-surface-300" />
              <div className="h-36 bg-surface-200/50 rounded-xl border border-surface-300" />
              <div className="h-36 bg-surface-200/50 rounded-xl border border-surface-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
