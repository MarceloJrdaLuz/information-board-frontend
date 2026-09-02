"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

interface ScrollToTopButtonProps {
    threshold?: number;
    bottomClass?: string;
    className?: string;
}

export default function ScrollToTopButton({
    threshold = 150,
    bottomClass = "bottom-16 sm:bottom-20 right-6",
    className = ""
}: ScrollToTopButtonProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = (event?: Event) => {
            let currentScrollY = 0;

            // 1. Se o evento veio de um elemento com scroll
            if (event && event.target && event.target !== document) {
                const targetEl = event.target as HTMLElement;
                if (typeof targetEl.scrollTop === "number" && targetEl.scrollTop > 0) {
                    currentScrollY = targetEl.scrollTop;
                }
            }

            // 2. Container do Dashboard
            if (currentScrollY === 0) {
                const dashboardContainer =
                    document.getElementById("dashboard-scroll-container") ||
                    document.querySelector(".flex-1.overflow-y-auto");
                if (dashboardContainer && dashboardContainer.scrollTop > 0) {
                    currentScrollY = dashboardContainer.scrollTop;
                }
            }

            // 3. Window / DocumentElement (páginas públicas)
            if (currentScrollY === 0 && typeof window !== "undefined") {
                currentScrollY =
                    window.scrollY ||
                    document.documentElement.scrollTop ||
                    document.body.scrollTop ||
                    0;
            }

            setShowScrollTop(currentScrollY > threshold);
        };

        // Usa capture: true para capturar scroll de QUALQUER container filho
        window.addEventListener("scroll", handleScroll, { passive: true, capture: true });

        // Checagem inicial
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
        };
    }, [threshold]);

    const scrollToTop = () => {
        // Rola containers internos (como no dashboard)
        const scrollContainers = document.querySelectorAll(
            "#dashboard-scroll-container, .flex-1.overflow-y-auto"
        );
        scrollContainers.forEach((el) => {
            el.scrollTo({ top: 0, behavior: "smooth" });
        });

        // Rola a janela
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (!showScrollTop) return null;

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className={`fixed ${bottomClass} z-50 p-3 sm:p-3.5 rounded-full bg-primary-200 hover:bg-primary-150 text-white shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 animate-fade-in ${className}`}
            title="Voltar ao topo"
            aria-label="Voltar ao topo"
        >
            <ChevronUp size={22} className="stroke-[2.5]" />
        </button>
    );
}
