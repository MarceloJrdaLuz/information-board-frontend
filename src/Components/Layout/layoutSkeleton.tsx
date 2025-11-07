import { Card } from "@material-tailwind/react";

export default function LayoutSkeleton() {
    return (
        <main className="flex w-screen h-screen overflow-hidden bg-secondary-100">
            {/* NAVBAR LATERAL */}
            <aside className="w-[15%] bg-primary-200 shadow-lg flex flex-col p-4 animate-pulse">
                {/* Logo / Título */}
                <div className="h-10 w-3/4 bg-primary-100 rounded-md mb-6" />

                {/* Itens de menu simulados */}
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-9 w-full bg-primary-100 rounded-md"
                        />
                    ))}
                </div>

                {/* Rodapé da sidebar */}
                <div className="mt-auto pt-4">
                    <div className="h-8 w-2/3 bg-secondary-300 rounded-md" />
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <section className="flex flex-col flex-1 w-[75%] bg-secondary-100">
                {/* HEADER */}
                <header className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-primary-100 to-primary-150 shadow-md animate-pulse">
                    <div className="h-10 w-10 bg-primary-200 rounded-full" />
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-secondary-300 rounded-full" />
                        <div className="h-10 w-10 bg-secondary-300 rounded-full" />
                    </div>
                </header>

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 h-full">

                </div>

                {/* FOOTER */}
                <footer className="w-full bg-gradient-to-r from-primary-100 to-primary-150 py-3 shadow-md animate-pulse">
                    <div className="container mx-auto flex items-center justify-between px-6">
                        <div className="h-6 w-1/5 bg-secondary-300 rounded-md" />
                        <div className="h-6 w-1/6 bg-secondary-300 rounded-md" />
                        <div className="h-6 w-1/4 bg-secondary-300 rounded-md" />
                    </div>
                </footer>
            </section>
        </main>
    )
}
