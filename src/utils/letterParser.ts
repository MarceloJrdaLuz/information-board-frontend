import { IInlineToken, ILetterContentSection } from "@/types/letterGenerator";

export interface IPaginatedLetterPage {
    pageNumber: number;
    isFirstPage: boolean;
    isLastPage: boolean;
    sections: ILetterContentSection[];
}

/**
 * Converte data ISO (YYYY-MM-DD) para formato por extenso:
 * Ex: "2026-03-02" -> "02 de março de 2026"
 */
export function formatLongDate(dateString: string): string {
    if (!dateString) return "";
    try {
        const [year, month, day] = dateString.split("-").map(Number);
        if (!year || !month || !day) return dateString;

        const months = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];

        const dayFormatted = String(day).padStart(2, "0");
        const monthFormatted = months[month - 1] || "";
        return `${dayFormatted} de ${monthFormatted} de ${year}`;
    } catch {
        return dateString;
    }
}

/**
 * Analisa a formatação inline dentro de um texto:
 * - ***texto*** => Negrito + Itálico
 * - **texto** => Negrito
 * - *texto* ou _texto_ => Itálico
 */
export function parseInlineFormatting(text: string): IInlineToken[] {
    if (!text) return [];

    // Captura tags markdown ***bold-italic***, **bold**, *italic*, _italic_
    const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
    const parts = text.split(regex);
    const tokens: IInlineToken[] = [];

    for (const part of parts) {
        if (!part) continue;

        if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
            tokens.push({
                text: part.slice(3, -3),
                bold: true,
                italic: true,
            });
        } else if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            tokens.push({
                text: part.slice(2, -2),
                bold: true,
            });
        } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            tokens.push({
                text: part.slice(1, -1),
                italic: true,
            });
        } else if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
            tokens.push({
                text: part.slice(1, -1),
                italic: true,
            });
        } else {
            tokens.push({
                text: part,
            });
        }
    }

    return tokens;
}

/**
 * Analisa o texto bruto (colado ou digitado) e separa em parágrafos e títulos de seção.
 * Permite controle total do usuário sobre o que é subtítulo (usando ### ou **título**) e o que é texto regular.
 */
export function parseLetterBody(rawText: string): ILetterContentSection[] {
    if (!rawText || !rawText.trim()) return [];

    // Quebra por quebras de linha duplas ou individuais vazias
    const rawParagraphs = rawText.split(/\r?\n\s*\r?\n/);
    const sections: ILetterContentSection[] = [];

    rawParagraphs.forEach((block, index) => {
        const clean = block.trim();
        if (!clean) return;

        // Subtítulo explícito com #, ## ou ###
        if (/^#{1,3}\s+(.+)$/.test(clean)) {
            const match = clean.match(/^#{1,3}\s+(.+)$/);
            sections.push({
                id: `heading-${index}`,
                type: "heading",
                text: match ? match[1].trim() : clean,
            });
            return;
        }

        // Subtítulo onde todo o bloco está entre **...**
        if (/^\*\*(.+)\*\*$/.test(clean) && !clean.slice(2, -2).includes("**")) {
            const match = clean.match(/^\*\*(.+)\*\*$/);
            sections.push({
                id: `heading-${index}`,
                type: "heading",
                text: match ? match[1].trim() : clean,
            });
            return;
        }

        // Parágrafo regular (suporta formatação inline interna)
        sections.push({
            id: `p-${index}`,
            type: "paragraph",
            text: clean.replace(/\r?\n/g, " "), // normaliza quebras internas de linha
        });
    });

    return sections;
}

function getSectionWeight(section: ILetterContentSection): number {
    if (section.type === "heading") return 45;
    // Remove tags markdown para cálculo de peso mais realista
    const cleanLength = (section.text || "").replace(/[*_#]/g, "").length;
    const lines = Math.ceil(cleanLength / 90);
    return lines * 19 + 14;
}

/**
 * Divide as seções da carta em páginas A4 virtuais com pesos proporcionais.
 * Permite visualizar exatamente cada folha física sem corte de texto ou sombras no meio da página.
 */
export function paginateLetterSections(
    sections: ILetterContentSection[],
    hasSignatures: boolean = true
): IPaginatedLetterPage[] {
    if (!sections || sections.length === 0) {
        return [
            {
                pageNumber: 1,
                isFirstPage: true,
                isLastPage: true,
                sections: [],
            },
        ];
    }

    const pages: IPaginatedLetterPage[] = [];
    let currentSections: ILetterContentSection[] = [];
    let currentWeight = 0;

    // Folha 1 possui cabeçalho, destinatário e saudação (orçamento de ~560 unidades)
    let budget = 560;

    for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const w = getSectionWeight(sec);

        if (currentWeight + w > budget && currentSections.length > 0) {
            pages.push({
                pageNumber: pages.length + 1,
                isFirstPage: pages.length === 0,
                isLastPage: false,
                sections: currentSections,
            });
            currentSections = [sec];
            currentWeight = w;
            budget = 850; // Folhas intermediárias/finais têm área útil maior
        } else {
            currentSections.push(sec);
            currentWeight += w;
        }
    }

    if (currentSections.length > 0) {
        const maxWeightForSignatures = pages.length === 0 ? 400 : 640;
        if (hasSignatures && currentWeight > maxWeightForSignatures && currentSections.length > 2) {
            const overflow = currentSections.slice(-2);
            const remaining = currentSections.slice(0, -2);
            pages.push({
                pageNumber: pages.length + 1,
                isFirstPage: pages.length === 0,
                isLastPage: false,
                sections: remaining,
            });
            pages.push({
                pageNumber: pages.length + 1,
                isFirstPage: false,
                isLastPage: true,
                sections: overflow,
            });
        } else {
            pages.push({
                pageNumber: pages.length + 1,
                isFirstPage: pages.length === 0,
                isLastPage: true,
                sections: currentSections,
            });
        }
    }

    // Ajusta numeração e flags
    const total = pages.length;
    pages.forEach((p, idx) => {
        p.pageNumber = idx + 1;
        p.isFirstPage = idx === 0;
        p.isLastPage = idx === total - 1;
    });

    return pages;
}
