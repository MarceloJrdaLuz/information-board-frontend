import React from "react"

export default function SkeletonListNotices() {
    return (
        <div className="flex flex-col gap-4 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="w-full bg-surface-100 rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-300 relative overflow-hidden flex flex-col gap-4"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-surface-300"></div>

                    {/* Topo */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-1">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-20 rounded-full bg-surface-300 shimmer"></div>
                                <div className="h-5 w-28 rounded-full bg-surface-300 shimmer"></div>
                            </div>
                            <div className="h-6 w-48 sm:w-72 rounded-lg bg-surface-300 shimmer mt-1"></div>
                            <div className="h-3 w-32 rounded bg-surface-300 shimmer"></div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="h-8 w-20 rounded-xl bg-surface-300 shimmer"></div>
                            <div className="h-8 w-16 rounded-xl bg-surface-300 shimmer"></div>
                            <div className="h-8 w-16 rounded-xl bg-surface-300 shimmer"></div>
                        </div>
                    </div>

                    {/* Corpo */}
                    <div className="h-20 w-full rounded-xl bg-surface-200/50 p-4 shimmer border border-surface-300/40"></div>
                </div>
            ))}
        </div>
    )
}
