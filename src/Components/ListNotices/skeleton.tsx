import React from "react"

export default function SkeletonListNotices() {
  return (
    <ul className="flex flex-col gap-4 w-full items-center mt-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="
            w-full md:w-10/12
            bg-surface-100 rounded-xl shadow-sm
            border border-surface-200/50
            overflow-hidden animate-pulse
          "
        >
          <div className="flex flex-col p-5 gap-4">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="h-5 w-40 bg-surface-300 rounded shimmer"></div>
                <div className="h-3 w-28 bg-surface-300 rounded shimmer"></div>
              </div>

              <div className="flex gap-2 mt-3 sm:mt-0">
                <div className="h-8 w-20 bg-surface-300 rounded shimmer"></div>
                <div className="h-8 w-20 bg-surface-300 rounded shimmer"></div>
              </div>
            </div>

            {/* Corpo */}
            <div className="flex flex-col gap-2 bg-surface-200/30 rounded-lg p-4">
              <div className="h-3 w-11/12 bg-surface-300 rounded shimmer"></div>
              <div className="h-3 w-10/12 bg-surface-300 rounded shimmer"></div>
              <div className="h-3 w-8/12 bg-surface-300 rounded shimmer"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
