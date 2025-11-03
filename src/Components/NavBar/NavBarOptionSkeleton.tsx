export default function NavBarOptionSkeleton({ items = 3 }: { items?: number }) {
    return (
        <ul>
            {
                Array.from({ length: items }).map((_, i) => (
                    <li key={i} className="relative flex items-center p-4 animate-pulse cursor-default">
                        <span className="pr-3 w-6 h-6 bg-gray-300 rounded-full" />
                        <span className="ml-2 h-4 w-24 bg-gray-300 rounded" />
                    </li>
                ))
            }
        </ul>
    )
}

