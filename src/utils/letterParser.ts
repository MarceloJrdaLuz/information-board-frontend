import { ILetterContentSection } from "@/types/letterGenerator";

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
 * Analisa o texto bruto (colado ou digitado) e separa em parágrafos e títulos de seção.
 */
export function parseLetterBody(rawText: string): ILetterContentSection[] {
    if (!rawText || !rawText.trim()) return [];

    // Quebra por quebras de linha duplas ou individuais vazias
    const rawParagraphs = rawText.split(/\r?\n\s*\r?\n/);
    const sections: ILetterContentSection[] = [];

    rawParagraphs.forEach((block, index) => {
        const clean = block.trim();
        if (!clean) return;

        // Verifica se é marcado explicitamente como heading:
        // Ex: "### Título", "## Título", "# Título", "**Título**"
        if (/^#{1,3}\s+(.+)$/.test(clean)) {
            const match = clean.match(/^#{1,3}\s+(.+)$/);
            sections.push({
                id: `heading-${index}`,
                type: "heading",
                text: match ? match[1].trim() : clean,
            });
            return;
        }

        if (/^\*\*(.+)\*\*$/.test(clean)) {
            const match = clean.match(/^\*\*(.+)\*\*$/);
            sections.push({
                id: `heading-${index}`,
                type: "heading",
                text: match ? match[1].trim() : clean,
            });
            return;
        }

        // Detecção heurística de subtítulo curto (ex: "Histórico e aspectos que merecem atenção")
        const isShortLine = clean.length <= 75 && !clean.includes("\n");
        const noEndingPunctuation = !clean.endsWith(".") && !clean.endsWith(",") && !clean.endsWith(";");
        const isKnownHeading = /^(histórico|avaliação|aspectos|recomendação|resumo|observações|conclusão)/i.test(clean);

        if (isShortLine && (noEndingPunctuation || isKnownHeading)) {
            sections.push({
                id: `heading-${index}`,
                type: "heading",
                text: clean,
            });
            return;
        }

        // Parágrafo regular
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
    const lines = Math.ceil((section.text || "").length / 90);
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
        // Se as assinaturas precisam caber na última folha e o peso for muito alto,
        // movemos os parágrafos finais para evitar bloco de assinaturas órfão
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
