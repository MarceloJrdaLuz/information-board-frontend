import { ChevronDown } from "lucide-react"
import { ReactNode, useState } from "react"

interface CollapsibleCardProps {
    title: string
    children: ReactNode
    defaultOpen?: boolean
    full?: boolean
}

export function CollapsibleCard({
    title,
    children,
    defaultOpen = false,
    full
}: CollapsibleCardProps) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className={`bg-surface-100 rounded-md shadow border w-full ${!full && "max-w-[400px]"}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
                <h3 className="font-semibold text-typography-700">
                    {title}
                </h3>

                <ChevronDown
                    className={`transition-transform text-typography-700 ${open ? "rotate-180" : ""}`}
                    size={18}
                />
            </button>

            {open && (
                <div className="px-4 pb-4 pt-1 border-t">
                    {children}
                </div>
            )}
        </div>
    )
}
