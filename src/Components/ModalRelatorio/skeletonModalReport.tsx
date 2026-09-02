export default function SkeletonModalReport() {
    return (
        <li className="flex flex-col bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm min-h-[220px] justify-between animate-pulse">
            <div>
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-surface-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-200 rounded-md w-3/4" />
                        <div className="h-3 bg-surface-200 rounded-md w-1/2" />
                    </div>
                </div>
                <div className="h-7 bg-surface-200 rounded-lg w-full mb-3" />
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="h-14 bg-surface-200 rounded-xl" />
                    <div className="h-14 bg-surface-200 rounded-xl" />
                </div>
            </div>
            <div className="h-8 bg-surface-200 rounded-xl w-full" />
        </li>
    )
}