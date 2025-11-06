export default function WeekendScheduleSkeleton() {
  return (
    <section className="flex flex-wrap w-full h-full p-5 animate-pulse">
      <div className="w-full p-4 space-y-4">
        {/* Header fixo com filtros e botões de navegação */}
        <div className="sticky top-0 bg-surface-100 border-b shadow-sm z-10 p-4 rounded-xl flex flex-col gap-3">
          {/* Filtros */}
          <div className="h-8 w-48 bg-typography-200 rounded-md" />
          {/* Botões navegação */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-28 bg-typography-200 rounded-md" />
            <div className="h-8 w-28 bg-typography-200 rounded-md" />
          </div>
        </div>

        {/* Botão salvar todas */}
        <div className="w-full h-10 bg-typography-200 rounded-md" />

        {/* Gerar PDF + inputs de datas */}
        <div className="flex flex-wrap gap-3 items-center bg-typography-50 border rounded-xl p-4 shadow-sm mt-4">
          <div className="h-10 w-32 bg-typography-200 rounded-md" />
          <div className="flex flex-1 gap-3">
            <div className="flex-1 h-10 bg-typography-200 rounded-md" />
            <div className="flex-1 h-10 bg-typography-200 rounded-md" />
          </div>
        </div>

        {/* Lista de sábados (cards) */}
        <div className="space-y-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-100 border rounded-xl shadow-sm p-4 space-y-3"
            >
              {/* Data */}
              <div className="h-6 w-32 bg-typography-200 rounded-md" />
              {/* Switch evento especial */}
              <div className="h-6 w-40 bg-typography-200 rounded-md" />
              {/* Dropdowns simulados */}
              <div className="h-10 w-full bg-typography-200 rounded-md" />
              <div className="h-10 w-full bg-typography-200 rounded-md" />
              <div className="h-10 w-full bg-typography-200 rounded-md" />
              <div className="h-10 w-full bg-typography-200 rounded-md" />
              {/* Campo tema da Sentinela */}
              <div className="h-10 w-full bg-typography-200 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
