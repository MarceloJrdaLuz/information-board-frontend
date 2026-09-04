export default function SkeletonPublishersWithAvatarList() {
    return (
        <li className="flex flex-col border border-surface-300 rounded-2xl shadow-2xs bg-surface-100 w-full overflow-hidden animate-pulse">
            <div className="flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-11 h-11 rounded-full bg-surface-300/70 shrink-0 shimmer" />
                    <div className="space-y-2 flex-1 max-w-sm">
                        <div className="h-4 bg-surface-300/80 rounded-md w-3/4 shimmer" />
                        <div className="flex items-center gap-2">
                            <div className="h-3 bg-surface-300/50 rounded-md w-16 shimmer" />
                            <div className="h-3 bg-surface-300/50 rounded-md w-20 shimmer" />
                        </div>
                    </div>
                </div>
                <div className="w-5 h-5 rounded-md bg-surface-300/60 shrink-0 shimmer" />
            </div>
        </li>
    )
}