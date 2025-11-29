import { NavBar } from "../NavBar";

export default function LayoutSkeleton() {
    return (
        <main className="flex w-screen h-screen overflow-hidden bg-secondary-100">

            {/* NAVBAR LATERAL (Desktop) */}
            <aside className="hidden md:flex md:flex-col md:w-2/12 md:min-w-[185px] max-w-[300px] bg-gradient-to-b from-primary-200 to-primary-150 text-typography-100 shadow-2xl animate-pulse">

                {/* Logo */}
                <div className="w-full h-[80px] flex items-center justify-center border-b-2">
                    <NavBar.Logo isMenuOpen={true} isDesktop={true} />
                </div>

                {/* Skeleton Items */}
                <div>
                    <NavBar.Skeleton items={5} />
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <section className="flex flex-col flex-1 w-full bg-secondary-100">
                
                {/* HEADER */}
                <header className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-primary-100 to-primary-150 shadow-md animate-pulse">
                    <div className="h-10 w-10 bg-primary-200 rounded-full shimmer" />
                    <div className="h-10 w-10 bg-primary-100 rounded-full shimmer" />
                </header>

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-y-auto space-y-4 shimmer" />

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
