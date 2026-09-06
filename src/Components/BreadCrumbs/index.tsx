import React, { useMemo } from "react";
import Link from "next/link";
import { IBreadCrumbsProps } from "./types";
import { ChevronRight, Home } from "lucide-react";

function normalize(str?: string) {
    return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

export default function BreadCrumbs({ crumbs, pageActive }: IBreadCrumbsProps) {
    const sanitizedCrumbs = useMemo(() => {
        const normActive = normalize(pageActive);

        // Rotas inexistentes que não devem aparecer como links
        const invalidRoutes = ["/congregacao", "/reunioes", "/administracao"];

        const filtered = (crumbs || []).filter((crumb) => {
            if (!crumb || !crumb.label) return false;

            const normLabel = normalize(crumb.label);
            const link = (crumb.link || "").trim().toLowerCase();

            // Filtrar rotas intermediárias inexistentes
            if (invalidRoutes.includes(link)) return false;
            if (normLabel === "congregação" || normLabel === "congregacao") return false;
            if (normLabel === "reuniões" || normLabel === "reunioes") return false;

            // Filtrar itens intermediários cujo texto coincida com a página ativa
            if (normActive && normLabel === normActive) return false;

            return true;
        });

        // Deduplicar itens consecutivos com mesmo label
        const deduplicated = filtered.filter((crumb, idx, arr) => {
            if (idx === 0) return true;
            return normalize(crumb.label) !== normalize(arr[idx - 1].label);
        });

        // Garantir que Início seja o primeiro crumb
        const hasHome =
            deduplicated.length > 0 &&
            ["início", "inicio", "home"].includes(normalize(deduplicated[0].label));

        if (!hasHome) {
            deduplicated.unshift({ label: "Início", link: "/dashboard" });
        }

        return deduplicated;
    }, [crumbs, pageActive]);

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center w-full px-4 sm:px-6 py-2 bg-surface-100/90 dark:bg-surface-100/70 border-b border-surface-300 backdrop-blur-sm overflow-x-auto whitespace-nowrap scroll-smooth transition-colors"
        >
            <ol className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                {sanitizedCrumbs.map((crumb, index) => {
                    const isFirst = index === 0;
                    const isHomeLabel = ["início", "inicio", "home"].includes(normalize(crumb.label));

                    return (
                        <li key={index} className="inline-flex items-center">
                            {index > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 text-typography-400 mx-0.5 sm:mx-1 shrink-0" aria-hidden="true" />
                            )}
                            <Link
                                href={crumb.link}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium text-typography-600 dark:text-typography-400 hover:text-primary-200 dark:hover:text-primary-100 hover:bg-surface-200 transition-all duration-150"
                            >
                                {isFirst && isHomeLabel && (
                                    <Home className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                )}
                                <span>{crumb.label}</span>
                            </Link>
                        </li>
                    );
                })}

                {/* Página Ativa */}
                {pageActive && (
                    <li className="inline-flex items-center" aria-current="page">
                        <ChevronRight className="w-3.5 h-3.5 text-typography-400 mx-0.5 sm:mx-1 shrink-0" aria-hidden="true" />
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md font-semibold text-typography-900 dark:text-typography-100 bg-surface-200/80 dark:bg-surface-200/50 border border-surface-300/80 max-w-[220px] sm:max-w-none truncate shadow-xs">
                            {pageActive}
                        </span>
                    </li>
                )}
            </ol>
        </nav>
    );
}