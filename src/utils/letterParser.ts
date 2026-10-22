import { ILetterContentSection } from "@/types/letterGenerator";

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

