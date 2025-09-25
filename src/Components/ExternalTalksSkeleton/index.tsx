export default function ExternalTalksSkeleton() {
  return (
    <section className="w-full h-full p-5 animate-pulse">
      {/* Botões de navegação */}
      <div className="flex justify-between my-4 p-4">
        <div className="h-9 w-28 bg-gray-200 rounded-md" />
        <div className="h-9 w-28 bg-gray-200 rounded-md" />
      </div>

      {/* Lista de sábados (cada card simula um ExternalTalkRow) */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 flex flex-col gap-6 bg-gray-50 border shadow-sm"
          >
            {/* Data */}
            <div className="h-6 w-32 bg-gray-200 rounded-md" />

            {/* Programações existentes */}
            <div className="space-y-3">
              {[...Array(2)].map((_, j) => (
                <div
                  key={j}
                  className="flex justify-between items-start p-4 rounded-lg border bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="h-5 w-40 bg-gray-200 rounded-md" />
                      <div className="h-4 w-24 bg-gray-200 rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 w-28 bg-gray-200 rounded-md" />
                      <div className="h-4 w-28 bg-gray-200 rounded-md" />
                      <div className="h-4 w-40 bg-gray-200 rounded-md col-span-2" />
                    </div>
                  </div>
                  <div className="ml-4 h-8 w-20 bg-gray-200 rounded-md" />
                </div>
              ))}
            </div>

            {/* Formulário de adicionar discurso externo */}
            <div className="bg-white rounded-lg p-4 shadow-md border space-y-3">
              <div className="h-5 w-40 bg-gray-200 rounded-md" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
