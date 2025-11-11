export default function SkeletonTerritoriesList() {
  return (
    <li
      className="
        w-full sm:w-[95%] md:w-[48%] rounded-2xl shadow-sm border border-surface-300 
        bg-surface-100/70 animate-pulse overflow-hidden
      "
    >
      {/* Cabeçalho */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-40 bg-surface-300 rounded shimmer"></div>
          <div className="h-4 w-28 bg-surface-300 rounded shimmer"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-5 w-4 bg-surface-300 rounded-full shimmer"></div>
          <div className="h-5 w-4 bg-surface-300 rounded-full shimmer"></div>
          <div className="h-5 w-4 bg-surface-300 rounded-full shimmer"></div>
        </div>
      </div>

      {/* Corpo
      <div className="px-6 pb-6 space-y-4">
        <div className="w-full h-56 bg-surface-200 rounded-lg shimmer"></div>

        <div className="space-y-2">
          <div className="h-3 w-60 bg-surface-300 rounded shimmer"></div>
          <div className="h-3 w-40 bg-surface-300 rounded shimmer"></div>
        </div>

        <div className="flex gap-3 pt-2">
          <div className="h-8 w-24 bg-surface-300 rounded-md shimmer"></div>
          <div className="h-8 w-24 bg-surface-300 rounded-md shimmer"></div>
        </div>
      </div> */}
    </li>
  );
}
