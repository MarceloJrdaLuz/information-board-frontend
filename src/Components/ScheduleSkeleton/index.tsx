export function SchedulesSkeleton() {
  return (
    <div className="p-4 w-full space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="animate-pulse bg-typography-300 h-28 rounded-xl w-full md:w-3/4 mx-auto"></div>
      ))}
    </div>
  )
}
