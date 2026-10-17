export default function NavBarOptionSkeleton({ items = 6, className }: { items?: number; className?: string }) {
    const widths = ["w-32", "w-40", "w-36", "w-28", "w-36", "w-24"]

    return (
        <ul className={`space-y-1 ${className || ""}`}>
            {Array.from({ length: items }).map((_, i) => (
                <li
                    key={i}
                    className="flex items-center px-3 py-2.5 my-1 rounded-xl animate-pulse cursor-default bg-white/5"
                >
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 shrink-0 mr-3" />
                    <span className={`h-4 ${widths[i % widths.length]} bg-white/20 rounded-md`} />
                </li>
            ))}
        </ul>
    )
}

