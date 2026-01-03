export default function ArrangementMonthScheduleSkeleton() {
  return (
    <section className="flex flex-col w-full h-full animate-pulse p-5 gap-4">

      {/* Breadcrumb */}
      <div className="h-4 w-48 bg-surface-200 shimmer rounded-md" />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="h-6 w-56 bg-surface-200 shimmer rounded-md" />
        <div className="h-4 w-72 bg-surface-200 shimmer rounded-md" />
      </div>

      {/* Navegação de mês (sticky) */}
      <div className="sticky top-0 z-20 bg-surface-100 border rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex justify-between gap-4">
          <div className="h-10 w-28 bg-surface-200 shimmer rounded-lg" />
          <div className="h-10 w-28 bg-surface-200 shimmer rounded-lg" />
        </div>

        <div className="h-10 w-full bg-surface-200 shimmer rounded-md" />
      </div>

      {/* Lista de dias */}
      <div className="flex flex-col gap-4 pb-72">
        {[...Array(4)].map((_, dayIndex) => (
          <div
            key={dayIndex}
            className="border rounded-xl p-4 space-y-4 bg-surface-100 shadow-sm"
          >
            {/* Data */}
            <div className="h-5 w-32 bg-surface-200 shimmer rounded-md" />

            {/* Aviso de exceção */}
            <div className="h-6 w-full bg-surface-200 shimmer rounded-md" />

            {/* Slots do dia */}
            {[...Array(3)].map((_, slotIndex) => (
              <div
                key={slotIndex}
                className="flex flex-col gap-3 border rounded-md p-3"
              >
                {/* Horário */}
                <div className="h-4 w-24 bg-surface-200 shimmer rounded-md" />

                {/* Dropdown */}
                <div className="h-10 w-full bg-surface-200 shimmer rounded-md" />

                {/* Chips de publicadores */}
                <div className="flex gap-2 flex-wrap">
                  {[...Array(3)].map((_, chipIndex) => (
                    <div
                      key={chipIndex}
                      className="h-8 w-24 bg-surface-200 shimmer rounded-md"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
