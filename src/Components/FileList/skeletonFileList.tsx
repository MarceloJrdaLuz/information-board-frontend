export default function SkeletonFileList() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-surface-100 border border-surface-300 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3.5 w-full">
                <div className="w-11 h-11 rounded-xl bg-surface-200 shimmer shrink-0" />
                <div className="flex flex-col gap-2 w-full max-w-xs">
                    <div className="h-4 bg-surface-200 shimmer rounded w-3/4" />
                    <div className="h-3 bg-surface-200 shimmer rounded w-1/3" />
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 shrink-0">
                <div className="h-8 w-24 bg-surface-200 shimmer rounded-xl" />
                <div className="h-8 w-8 bg-surface-200 shimmer rounded-xl" />
            </div>
        </div>
    )
}
