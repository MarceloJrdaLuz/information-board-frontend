
export default function SkeletonGroupsList() {
    return (
        <li
          className="bg-surface-100 rounded-2xl border border-surface-200 shadow-sm flex flex-col m-2"
        >
          {/* Conteúdo principal */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            <div className="h-5 w-2/3 bg-surface-200 rounded" /> {/* título */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="h-3 w-1/2 bg-surface-200 rounded" />
              <div className="h-3 w-2/3 bg-surface-200 rounded" />
              <div className="h-3 w-1/3 bg-surface-200 rounded" />
              <div className="h-3 w-1/4 bg-surface-200 rounded" />
              <div className="h-3 w-1/5 bg-surface-200 rounded" />
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 px-5 py-3 border-t border-surface-200 bg-surface-100 rounded-b-2xl">
            <div className="h-8 w-16 bg-surface-200 rounded" />
            <div className="h-8 w-16 bg-surface-200 rounded" />
          </div>
        </li>
  )
}