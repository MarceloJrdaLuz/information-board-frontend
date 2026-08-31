import React from "react";
import Link from "next/link";
import { IBreadCrumbsProps } from "./types";
import { ChevronRight, Home } from "lucide-react";

export default function BreadCrumbs({ crumbs, pageActive }: IBreadCrumbsProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center w-full px-4 sm:px-6 py-2 bg-surface-100/90 dark:bg-surface-100/70 border-b border-surface-300 backdrop-blur-sm overflow-x-auto whitespace-nowrap scroll-smooth transition-colors"
        >
            <ol className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                {crumbs.map((crumb, index) => {
                    const isFirst = index === 0;
                    const isHomeLabel = crumb.label.toLowerCase() === "início" || crumb.label.toLowerCase() === "inicio" || crumb.label.toLowerCase() === "home";

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
                <li className="inline-flex items-center" aria-current="page">
                    <ChevronRight className="w-3.5 h-3.5 text-typography-400 mx-0.5 sm:mx-1 shrink-0" aria-hidden="true" />
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md font-semibold text-typography-900 dark:text-typography-100 bg-surface-200/80 dark:bg-surface-200/50 border border-surface-300/80 max-w-[220px] sm:max-w-none truncate shadow-xs">
                        {pageActive}
                    </span>
                </li>
            </ol>
        </nav>
    );
}