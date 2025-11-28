import { NavBar } from "../NavBar";

export default function LayoutSkeleton() {
    return (
        <main className="flex w-screen h-screen overflow-hidden bg-secondary-100">
            {/* NAVBAR LATERAL */}
            <aside className="hidden bg-primary-200 shadow-lg w-2/3 md:w-2/12 md:flex md:min-w-[185px] md:flex-col pt-6 animate-pulse">
                {/* Logo / Título */}
                <div className="text-surface-300">
                    <NavBar.Logo isMenuOpen />
                </div>

                <NavBar.Skeleton items={5} />
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <section className="flex flex-col flex-1 w-[75%] bg-secondary-100">
                {/* HEADER */}
                <header className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-primary-100 to-primary-150 shadow-md animate-pulse">
                    <div className="h-10 w-10 bg-primary-200 shimmer rounded-full" />
                    <div className="h-10 w-10 bg-primary-100 shimmer rounded-full" />
                </header>

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-y-auto h-5/6 space-y-4 bg-surface-100 shimmer">

                </div>

                {/* FOOTER */}
                <footer className="w-full h-20 bg-gradient-to-r from-primary-100 to-primary-150 py-3 shadow-md animate-pulse">
                    <div className="container mx-auto flex items-center justify-between px-6">
                        <div className="h-6 w-1/5 bg-surface-200 rounded-md shimmer" />
                        <div className="h-6 w-1/6 bg-surface-200 rounded-md shimmer" />
                        <div className="h-6 w-1/4 bg-surface-200 rounded-md shimmer" />
                    </div>
                </footer>
            </section>
        </main>
    )
}
