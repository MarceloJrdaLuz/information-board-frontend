export default function CleaningSchedulePageSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Breadcrumb */}
            <div className="h-6 w-64 bg-surface-200 rounded-md mb-4 "></div>

            {/* Top cards */}
            <div className="flex justify-around flex-wrap mb-6 gap-4">
                {/* Configuração da Programação */}
                <div className="flex flex-wrap w-1/2 min-w-[280px] max-w-[400px] gap-4 p-4 bg-surface-100 rounded shadow">
                    <div className="h-6 w-48 bg-surface-200 rounded-md mb-3  shimmer"></div> {/* Título */}
                    <div className="h-8 w-full bg-surface-200 rounded-md  shimmer"></div> {/* Dropdown */}
                    <div className="h-10 w-full bg-surface-200 rounded-md  shimmer mt-2"></div> {/* Botão Salvar */}
                </div>

                {/* Escolher semanas */}
                <div className="flex flex-col w-1/2 min-w-[280px] max-w-[400px] gap-4 p-5 bg-surface-100 rounded shadow">
                    <div className="h-6 w-48 bg-surface-200 rounded-md  shimmer mb-3"></div> {/* Título */}
                    <div className="space-y-2">
                        <div className="h-10 w-full bg-surface-200 rounded-md  shimmer"></div> {/* Calendar Início */}
                        <div className="h-10 w-full bg-surface-200 rounded-md  shimmer"></div> {/* Calendar Fim */}
                        <div className="h-10 w-full bg-surface-200 rounded-md  shimmer"></div> {/* Botão Gerar */}
                        <div className="w-full flex justify-center">
                            <div className="h-10 w-36 bg-surface-200 rounded-md  shimmer mt-2 "></div> {/* Botão PDF */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cleaning Schedule Table Skeleton */}
            <div className="m-4">
                <div className="w-full rounded-xl shadow bg-surface-100 p-4">
                    {/* Título */}
                    <div className="h-6 w-48 bg-surface-200 rounded-md  shimmer mb-4"></div>

                    {/* Grid de cards */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="border border-typography-200 rounded-lg p-3 bg-surface-100">
                                {/* Data */}
                                <div className="h-5 w-24 bg-surface-200 rounded-md  shimmer mb-2" />
                                {/* Grupo */}
                                <div className="h-4 w-32 bg-surface-200 rounded-md  shimmer mb-2" />
                                {/* Responsáveis */}
                                <div className="space-y-1">
                                    <div className="h-3 w-20 bg-surface-200 rounded-md  shimmer" />
                                    <div className="h-3 w-28 bg-surface-200 rounded-md  shimmer" />
                                    <div className="h-3 w-24 bg-surface-200 rounded-md  shimmer" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
