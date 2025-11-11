
export default function SkeletonAuxiliaryCongregationsList() {
  return (
    <li
      className="bg-surface-100 rounded-2xl border border-typography-200 shadow-sm flex flex-col m-2 min-w-[200px]"
    >
      {/* Conteúdo principal */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="h-5 w-2/3 bg-surface-200 shimmer rounded" /> {/* título */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex gap-1">
            <div className="h-4 w-5 bg-surface-200 shimmer rounded" />
            <div className="h-4 w-1/2 bg-surface-200 shimmer rounded" />
          </div>
          <div className="flex gap-1">
            <div className="h-4 w-5 bg-surface-200 shimmer rounded" />
            <div className="h-4 w-1/6 bg-surface-200 shimmer rounded" />
          </div>
          <div className="flex gap-1">
            <div className="h-4 w-5 bg-surface-200 shimmer rounded" />
            <div className="h-4 w-1/3 bg-surface-200 shimmer rounded" />
          </div>
          <div className="flex gap-1">
            <div className="h-4 w-5 bg-surface-200 shimmer rounded" />
            <div className="h-4 w-1/4 bg-surface-200 shimmer rounded" />
          </div>
          <div className="flex gap-1">
            <div className="h-4 w-5 bg-surface-200 shimmer rounded" />
            <div className="h-4 w-1/6 bg-surface-200 shimmer rounded" />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2 px-5 py-3 border-t border-typography-200 bg-surface-100 rounded-b-2xl">
        <div className="h-8 w-24 bg-surface-200 shimmer rounded" />
        <div className="h-8 w-24 bg-surface-200 shimmer rounded" />
      </div>
    </li>
  )
}