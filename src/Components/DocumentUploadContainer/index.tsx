import React, { ReactNode } from "react"
import Link from "next/link"
import { 
    Calendar, 
    BookOpen, 
    DollarSign, 
    Sparkles, 
    Compass, 
    Users, 
    Star, 
    FileText 
} from "lucide-react"

interface IDocumentUploadContainerProps {
    title: string
    description: string
    currentRoute: string
    icon: ReactNode
    fileCount?: number
    loading?: boolean
    children: ReactNode
}

const CATEGORY_TABS = [
    {
        name: "Meio de Semana",
        href: "/documentos/meiodesemana",
        icon: Calendar,
    },
    {
        name: "Fim de Semana",
        href: "/documentos/fimdesemana",
        icon: BookOpen,
    },
    {
        name: "Contas",
        href: "/documentos/contas",
        icon: DollarSign,
    },
    {
        name: "Limpeza",
        href: "/documentos/limpeza",
        icon: Sparkles,
    },
    {
        name: "Saídas de Campo",
        href: "/documentos/pregacao/saidasdecampo",
        icon: Compass,
    },
    {
        name: "Testemunho Público",
        href: "/documentos/pregacao/testemunhopublico",
        icon: Users,
    },
    {
        name: "Eventos Especiais",
        href: "/documentos/eventosespeciais",
        icon: Star,
    },
]

export default function DocumentUploadContainer({
    title,
    description,
    currentRoute,
    icon,
    fileCount = 0,
    loading = false,
    children,
}: IDocumentUploadContainerProps) {
    return (
        <section className="w-full p-4 md:p-6 lg:p-8 pb-28 md:pb-36 flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Header Card */}
            <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-100/15 border border-primary-200/25 text-primary-200 flex items-center justify-center shrink-0 shadow-xs">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-typography-900 tracking-tight">
                                {title}
                            </h1>
                            <p className="text-xs md:text-sm text-typography-500 mt-0.5">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface-200 border border-surface-300 text-typography-700 shrink-0">
                        <FileText className="w-3.5 h-3.5 text-primary-200" />
                        <span>
                            {loading
                                ? "Carregando..."
                                : `${fileCount} ${fileCount === 1 ? "documento" : "documentos"}`}
                        </span>
                    </div>
                </div>

                {/* Categories Navigation Pills - wraps naturally without ugly scrollbars */}
                <div className="pt-4 border-t border-surface-300 flex flex-wrap items-center gap-2">
                    {CATEGORY_TABS.map((tab) => {
                        const isActive = tab.href === currentRoute
                        const TabIcon = tab.icon

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                                    isActive
                                        ? "bg-primary-200 text-white font-semibold shadow-xs"
                                        : "bg-surface-200 hover:bg-surface-300 text-typography-600 hover:text-typography-900 border border-surface-300/80"
                                }`}
                            >
                                <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-typography-500"}`} />
                                <span>{tab.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Content Slot */}
            <div className="flex flex-col gap-6 mb-8">
                {children}
            </div>
        </section>
    )
}
