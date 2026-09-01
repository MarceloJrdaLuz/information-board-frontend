// Dicionário Oficial das 12 Lições e Pontos de Estudo (3 a 5) da Brochura "Ame as Pessoas — Faça Discípulos" (lmd-T)
// Extraído diretamente da publicação oficial em português (wol.jw.org/pt)
export const LOVE_PEOPLE_LESSONS: Record<number, { theme: string; points: Record<number, string> }> = {
    1: {
        theme: "Interesse pelas pessoas",
        points: {
            3: "Seja flexível",
            4: "Seja observador",
            5: "Escute"
        }
    },
    2: {
        theme: "Naturalidade",
        points: {
            3: "Seja observador",
            4: "Seja paciente",
            5: "Seja adaptável"
        }
    },
    3: {
        theme: "Bondade",
        points: {
            3: "Tenha empatia",
            4: "Fale com bondade e respeito",
            5: "Seja prestativo"
        }
    },
    4: {
        theme: "Humildade",
        points: {
            3: "Não fale com ar de superioridade",
            4: "Deixe claro que aquilo que você ensina vem da Bíblia",
            5: "Mantenha a calma"
        }
    },
    5: {
        theme: "Tato",
        points: {
            3: "Escolha bem as palavras",
            4: "Não corrija logo a pessoa",
            5: "Sempre que possível, concorde com a pessoa e dê elogios"
        }
    },
    6: {
        theme: "Coragem",
        points: {
            3: "Confie em Jeová",
            4: "Não julgue as pessoas",
            5: "Seja corajoso, mas tenha tato e cautela"
        }
    },
    7: {
        theme: "Perseverança",
        points: {
            3: "Ajuste a sua programação para visitar a pessoa num horário que seja bom para ela",
            4: "Marque a próxima conversa",
            5: "Não perca a esperança"
        }
    },
    8: {
        theme: "Paciência",
        points: {
            3: "Tente usar um método diferente",
            4: "Não faça comparações",
            5: "Ore pela pessoa interessada"
        }
    },
    9: {
        theme: "Empatia",
        points: {
            3: "Escute com atenção",
            4: "Pense na pessoa interessada",
            5: "Use informações que se encaixem nas necessidades da pessoa"
        }
    },
    10: {
        theme: "Senso de compromisso",
        points: {
            3: "Faça o estudo na hora e no local que seja bom para o estudante",
            4: "Estude regularmente",
            5: "Ore pedindo para ter a atitude certa"
        }
    },
    11: {
        theme: "Simplicidade",
        points: {
            3: "Não fale demais",
            4: "Ajude seu estudante a fazer a ligação entre o que ele já aprendeu e o que está aprendendo agora",
            5: "Saiba usar as ilustrações"
        }
    },
    12: {
        theme: "Franqueza",
        points: {
            3: "Ajude seu estudante a estabelecer e alcançar alvos",
            4: "Identifique o que pode estar impedindo seu estudante de fazer progresso e tente ajudá-lo a vencer esses desafios",
            5: "Encerre estudos que não progridem"
        }
    }
};

// Dicionário Oficial das 20 Lições da Brochura "Melhore Sua Leitura e Seu Ensino" (th)
// Extraído diretamente da publicação oficial em português (th-T)
export const TEACHING_LESSONS: Record<number, string> = {
    1: "Comece bem",
    2: "Fale de coração",
    3: "Faça perguntas",
    4: "Prepare as pessoas para entender o texto",
    5: "Leia de modo correto",
    6: "Explique por que você leu o texto",
    7: "Use informações verdadeiras",
    8: "Ensine com ilustrações",
    9: "Use desenhos, fotos e vídeos",
    10: "Mude o volume, a emoção e o ritmo durante a apresentação",
    11: "Fale de modo animado",
    12: "Seja simpático e mostre que se importa",
    13: "Mostre como colocar o assunto em prática",
    14: "Chame atenção para os pontos principais",
    15: "Fale com convicção",
    16: "Concentre-se em coisas positivas",
    17: "Fale de modo fácil de entender",
    18: "Use informações interessantes",
    19: "Toque o coração das pessoas",
    20: "Faça uma boa conclusão"
};

export function getLessonDetails(
    brochure?: string | null,
    lessonNumber?: number | null,
    studyPoint?: number | null,
    studyPointDescription?: string | null
): {
    brochureName: string;
    lessonTheme?: string;
    pointDescription?: string;
    formattedText: string;
    shortBadge: string;
    fullDisplay: string;
} {
    const rawBrochure = (brochure || "").toLowerCase().trim();
    
    const isExplicitTh = rawBrochure.includes("th") || rawBrochure.includes("teach") || rawBrochure.includes("melhore");
    const isExplicitLmd = rawBrochure.includes("lmd") || rawBrochure.includes("love") || rawBrochure.includes("ame");

    const isTh = isExplicitTh || (!isExplicitLmd && studyPoint !== null && studyPoint !== undefined && studyPoint > 12);

    if (isTh) {
        const lessonNum = studyPoint || lessonNumber || 1;
        const lessonTitle = TEACHING_LESSONS[lessonNum] || studyPointDescription || undefined;

        return {
            brochureName: "Melhore (th)",
            lessonTheme: lessonTitle,
            pointDescription: undefined,
            formattedText: `Melhore lição ${lessonNum}`,
            shortBadge: `Melhore lição ${lessonNum}`,
            fullDisplay: `Melhore: Lição ${lessonNum}${lessonTitle ? ` (${lessonTitle})` : ""}`
        };
    }

    // Brochura "Ame as Pessoas" (lmd)
    const lmdLesson = lessonNumber || 1;
    const lmdPoint = studyPoint || null;
    const lessonData = LOVE_PEOPLE_LESSONS[lmdLesson];
    const lessonTheme = lessonData?.theme;
    
    // O ponto de estudo tem a sua própria descrição/ação (ex: "Seja flexível", "Seja observador", "Escute"), e nunca repete o tema da lição
    let pointDesc: string | undefined = undefined;
    if (lmdPoint && lessonData?.points?.[lmdPoint]) {
        pointDesc = lessonData.points[lmdPoint];
    } else if (studyPointDescription && studyPointDescription.trim().toLowerCase() !== lessonTheme?.toLowerCase()) {
        pointDesc = studyPointDescription.trim();
    }

    const parts: string[] = ["lmd"];
    if (lmdLesson) {
        parts.push(`lição ${lmdLesson}`);
    }
    if (lmdPoint) {
        parts.push(`ponto ${lmdPoint}`);
    }

    let fullDisplay = `lmd lição ${lmdLesson}`;
    if (lessonTheme) {
        fullDisplay += ` (${lessonTheme})`;
    }
    if (lmdPoint) {
        fullDisplay += ` • ponto ${lmdPoint}${pointDesc ? `: ${pointDesc}` : ""}`;
    }

    return {
        brochureName: "Ame as Pessoas (lmd)",
        lessonTheme,
        pointDescription: pointDesc,
        formattedText: parts.join(" "),
        shortBadge: parts.join(" "),
        fullDisplay
    };
}
