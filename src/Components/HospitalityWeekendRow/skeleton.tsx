export default function WeekendScheduleSkeleton() {
  return (
    <section className="flex flex-wrap w-full h-full  animate-pulse">
      <div className="w-full p-4 space-y-4">
        {/* Header fixo com filtros e botões de navegação */}
        <div className="sticky top-0 bg-surface-100 border-b shadow-sm z-10 p-4 rounded-xl flex flex-col gap-3">
          {/* Filtros */}

          <div className="flex justify-between items-center gap-2">
            <div className="h-8 w-28 bg-surface-200 shimmer rounded-md" />
            <div className="h-8 w-28 bg-surface-200 shimmer rounded-md" />
          </div>

          {/* Botão salvar todas */}
          <div className="w-full h-10 bg-surface-200 shimmer rounded-md" />
        </div>

        {/* Lista de sábados (cards) */}
        <div className="space-y-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-100 border rounded-xl shadow-sm p-4 space-y-3"
            >
              {/* Data */}
              <div className="h-6 w-32 bg-surface-200 shimmer rounded-md" />
              {/* Switch evento especial */}
              <div className="flex gap-2">
                  <div className="h-6 w-5 bg-surface-200 shimmer rounded-md" />
                  <div className="h-6 w-40 bg-surface-200 shimmer rounded-md" />
              </div>
              <div className="flex gap-2">
                  <div className="h-6 w-5 bg-surface-200 shimmer rounded-md" />
                  <div className="h-6 w-40 bg-surface-200 shimmer rounded-md" />
              </div>
              <div className="flex gap-2">
                  <div className="h-6 w-5 bg-surface-200 shimmer rounded-md" />
                  <div className="h-6 w-40 bg-surface-200 shimmer rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
