export default function ProfileCardSkeleton() {
  return (
    <div className="bg-surface-100 rounded-lg p-3 w-full max-w-xs mx-auto text-center shadow-sm animate-pulse">
      {/* Avatar redondo */}
      <div className="relative flex justify-center items-center mx-auto mb-3">
        <div className="bg-surface-200 rounded-full w-28 h-28 shimmer" />
      </div>

      {/* Nome e email */}
      <div className="space-y-2 mt-2">
        <div className="h-4 bg-surface-200 rounded w-3/4 mx-auto shimmer" />
        <div className="h-3 bg-surface-200 rounded w-1/2 mx-auto shimmer" />
      </div>
    </div>
  )
}
