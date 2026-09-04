import React from "react";

export default function SkeletonTerritoriesList() {
  return (
    <div className="bg-surface-100 rounded-2xl border border-surface-300 p-5 shadow-sm space-y-4 animate-pulse">
      {/* Header chips */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-6 w-28 bg-surface-200 shimmer rounded-xl" />
        <div className="h-6 w-24 bg-surface-200 shimmer rounded-full" />
      </div>

      {/* Title & Desc */}
      <div className="space-y-1.5 pt-1">
        <div className="h-5 w-48 bg-surface-200 shimmer rounded-md" />
        <div className="h-4 w-full bg-surface-200 shimmer rounded-md" />
      </div>

      {/* Image Preview Area */}
      <div className="w-full h-44 bg-surface-200 shimmer rounded-xl" />

      {/* Meta info */}
      <div className="space-y-1.5 pt-1">
        <div className="h-4 w-44 bg-surface-200 shimmer rounded-md" />
        <div className="h-4 w-36 bg-surface-200 shimmer rounded-md" />
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-300">
        <div className="h-8 w-24 bg-surface-200 shimmer rounded-xl" />
        <div className="h-8 w-20 bg-surface-200 shimmer rounded-xl" />
        <div className="h-8 w-8 bg-surface-200 shimmer rounded-xl" />
      </div>
    </div>
  );
}
