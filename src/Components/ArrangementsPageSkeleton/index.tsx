export default function ArrangementsPageSkeleton() {
    return (
        <section className="flex flex-col w-full h-full animate-pulse">

            <div className="flex flex-col w-full p-5 gap-6">

                {/* Header */}
                <div className="flex flex-col gap-3">
                    <div className="h-6 w-64 bg-surface-200 shimmer rounded-md" />

                    <div className="flex justify-between items-center">
                        <div className="h-9 w-32 bg-surface-200 shimmer rounded-md" />
                    </div>
                </div>

                {/* Link PDF */}
                <div className="h-10 w-full bg-surface-200 shimmer rounded-md" />

                {/* ================= Arranjos Fixos ================= */}
                <div className="bg-surface-100 border rounded-xl shadow-sm p-4 space-y-4">
                    {/* Título do Collapsible */}
                    <div className="h-5 w-40 bg-surface-200 shimmer rounded-md" />

                    <div className="flex flex-wrap gap-4">
                        {[...Array(3)].map((_, i) => (
                            <ArrangementCardSkeleton key={i} />
                        ))}
                    </div>
                </div>

                {/* ================= Arranjos por Data ================= */}
                <div className="bg-surface-100 border rounded-xl shadow-sm p-4 space-y-4">
                    {/* Título do Collapsible */}
                    <div className="h-5 w-48 bg-surface-200 shimmer rounded-md" />

                    {[...Array(2)].map((_, d) => (
                        <div key={d} className="space-y-3 border-b border-surface-200 pb-4">
                            {/* Data */}
                            <div className="h-4 w-32 bg-surface-200 shimmer rounded-md" />

                            <div className="flex flex-wrap gap-4">
                                {[...Array(2)].map((_, i) => (
                                    <ArrangementCardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}

/* =======================
 *  Card Skeleton
 ======================= */
function ArrangementCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 p-4 border rounded-md w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]">

            {/* Título */}
            <div className="h-5 w-3/4 bg-surface-200 shimmer rounded-md" />

            {/* Tipo */}
            <div className="h-4 w-1/2 bg-surface-200 shimmer rounded-md" />

            {/* Horários */}
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-surface-200 shimmer rounded-md" />
                ))}
            </div>

            {/* Botão Programação */}
            <div className="flex justify-center mt-2">
                <div className="h-9 w-32 bg-surface-200 shimmer rounded-md" />
            </div>
        </div>
    )
}
