import { useAtom } from "jotai"
import { openSubMenuAtom } from "@/atoms/atom"

export function LayoutSkeleton() {
  const [openSubMenu] = useAtom(openSubMenuAtom)

  return (
    <main className="flex w-screen h-screen animate-pulse">
      
      {/* Navbar Skeleton */}
      <aside className="flex flex-col w-64 bg-gray-200 p-4 space-y-2">
        {/* Logo */}
        <div className="h-12 w-full bg-gray-300 rounded mb-4"></div>

        {/* Menu Options */}
        <div className="h-8 w-full bg-gray-300 rounded"></div>
        <div className="h-8 w-full bg-gray-300 rounded"></div>
        <div className="h-8 w-full bg-gray-300 rounded"></div>
        <div className="h-8 w-full bg-gray-300 rounded"></div>

        {/* Submenus */}
        <div className="h-6 w-full bg-gray-300 rounded mt-2"></div>
        <div className="h-6 w-full bg-gray-300 rounded"></div>
      </aside>

      {/* Conteúdo principal */}
      <section className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <header className="flex justify-between items-center h-20 bg-gray-300 p-4 shadow-md">
          <div className="h-8 w-8 bg-gray-400 rounded-full"></div>
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-gray-400 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-400 rounded-full"></div>
          </div>
        </header>

        {/* Conteúdo principal skeleton */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* BreadCrumbs */}
          <div className="h-6 w-1/4 bg-gray-300 rounded"></div>

          {/* Título ou cards */}
          <div className="h-8 w-1/3 bg-gray-300 rounded"></div>

          {/* Grid de cards */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>

        {/* Footer Skeleton */}
        <footer className="w-full bg-gray-300 p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div className="h-6 w-20 bg-gray-400 rounded"></div>
            <div className="h-4 w-32 bg-gray-400 rounded"></div>
          </div>
        </footer>
      </section>
    </main>
  )
}
