export default function ProfileCardSkeleton() {
  return (
    <div className="bg-surface-100 rounded-lg p-3 w-full mx-auto text-center shadow-sm animate-pulse">
      <div className="relative flex justify-center items-center bg-surface-200 rounded-full w-28 h-28 mx-auto">
        <div className="rounded-full bg-surface-300 w-full h-full" />

        {/* Ícone de câmera simulado */}
        <div className="absolute bottom-1 right-1 bg-surface-300 p-1.5 rounded-full shadow-sm w-6 h-6" />
      </div>

      <div className="pt-2 px-2">
        <div className="h-4 bg-surface-300 rounded w-3/4 mx-auto mb-2" />
        <div className="h-3 bg-surface-300 rounded w-1/2 mx-auto" />
      </div>
    </div>
  )
}
