import { IMidweekSchedule, MidweekPartType, MidweekRoom, MidweekSection, MidweekSpecialType, IPublisherMini } from "@/types/midweek";
import { ITimelineItem } from "@/types/midweekChairman";
import { getLessonDetails } from "./midweekLessons";

/**
 * Converte string de hora 'HH:MM' em minutos do dia.
 */
function timeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
}

/**
 * Converte minutos do dia em string formatada 'HH:MM'.
 */
function minutesToTime(totalMinutes: number): string {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Adiciona uma quantidade de minutos a um horário no formato 'HH:MM'.
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
    return minutesToTime(timeToMinutes(timeStr) + minutesToAdd);
}

/**
 * Obtém o melhor nome para exibição do publicador (customizado > apelido > nome completo).
 */
function getPublisherName(pub?: IPublisherMini | string | null, customName?: string | null): string | null {
    if (customName && customName.trim()) return customName.trim();
    if (!pub) return null;
    if (typeof pub === 'string') return pub.trim() || null;
    const nick = pub.nickname?.trim();
    if (nick) return nick;
    return pub.fullName?.trim() || null;
}

/**
 * Constrói a sequência completa da linha do tempo da reunião de meio de semana
 * calculando os horários previstos de início e término para cada momento.
 */
export function buildMidweekTimeline(schedule: IMidweekSchedule, meetingStartTime: string): ITimelineItem[] {
    const items: ITimelineItem[] = [];
    let currentMinutes = timeToMinutes(meetingStartTime || '19:00');

    const pushItem = (itemData: Omit<ITimelineItem, 'startTime' | 'endTime'>) => {
        const start = minutesToTime(currentMinutes);
        currentMinutes += itemData.durationMinutes;
        const end = minutesToTime(currentMinutes);

        items.push({
            ...itemData,
            startTime: start,
            endTime: end
        });
    };

    const chairmanName = getPublisherName(schedule.chairman) || "Presidente";

    // =========================================================================
    // 1. INÍCIO: CÂNTICO INICIAL E ORAÇÃO (5 min sempre)
    // =========================================================================
    pushItem({
        id: `song_open_${schedule.id}`,
        title: schedule.songOpen ? `Cântico ${schedule.songOpen} e Oração` : "Cântico Inicial e Oração",
        section: 'HEADER',
        sectionTitle: "Início da Reunião",
        sectionColor: '#2F7682',
        durationMinutes: 5,
        songNumber: schedule.songOpen,
        assignedRoleLabel: "Oração Inicial",
        assignedName: getPublisherName(schedule.openingPrayer) || "A designar",
        isSong: true
    });

    // =========================================================================
    // 2. PALAVRAS INICIAIS DO PRESIDENTE (1 min)
    // =========================================================================
    pushItem({
        id: `chairman_intro_${schedule.id}`,
        title: "Comentários iniciais",
        section: 'HEADER',
        sectionTitle: "Início da Reunião",
        sectionColor: '#2F7682',
        durationMinutes: 1,
        assignedRoleLabel: "Presidente",
        assignedName: chairmanName,
        isChairmanComment: true
    });

    // =========================================================================
    // 3. TESOUROS DA PALAVRA DE DEUS
    // =========================================================================
    const allTreasuresParts = (schedule.parts || [])
        .filter(p => p.section === MidweekSection.TREASURES && (p.isActive ?? true));

    const mainTreasuresParts = allTreasuresParts.filter(p => p.room === MidweekRoom.MAIN);

    const typeOrder: Record<string, number> = {
        [MidweekPartType.TALK]: 1,
        [MidweekPartType.GEMS]: 2,
        [MidweekPartType.BIBLE_READING]: 3
    };

    const sortedTreasures = [...mainTreasuresParts].sort((a, b) => {
        const orderA = typeOrder[a.partType] ?? (a.orderIndex ?? 99);
        const orderB = typeOrder[b.partType] ?? (b.orderIndex ?? 99);
        return orderA - orderB;
    });

    sortedTreasures.forEach(part => {
        const isBibleReading = part.partType === MidweekPartType.BIBLE_READING;
        const isTalk = part.partType === MidweekPartType.TALK;

        // Partes de Tesouros e Joias NÃO possuem lições nem material fonte
        const lessonInfo = isBibleReading && (part.lessonNumber || part.studyPoint)
            ? getLessonDetails(
                part.brochure,
                part.lessonNumber,
                part.studyPoint,
                part.studyPointDescription
            )
            : null;

        // Se for Leitura da Bíblia, verifica se há leitor na Sala Auxiliar 1
        let auxReaderName: string | null = null;
        if (isBibleReading) {
            const auxPart = allTreasuresParts.find(
                p => p.partType === MidweekPartType.BIBLE_READING && p.room === MidweekRoom.AUXILIARY_1
            );
            if (auxPart) {
                auxReaderName = getPublisherName(auxPart.assignedPublisher, auxPart.custom_speaker_name || (auxPart as any).customSpeakerName);
            }
        }

        pushItem({
            id: part.id,
            title: part.title,
            section: 'TREASURES',
            sectionTitle: "Tesouros da Palavra de Deus",
            sectionColor: '#2F7682',
            durationMinutes: part.timeMinutes || (isBibleReading ? 4 : 10),
            assignedRoleLabel: isBibleReading ? "Leitor" : isTalk ? "Orador" : "Dirigente",
            assignedName: getPublisherName(part.assignedPublisher, part.custom_speaker_name || (part as any).customSpeakerName) || "A designar",
            auxReaderName,
            sourceMaterial: null,
            lessonInfo: isBibleReading && (lessonInfo?.fullDisplay || lessonInfo?.shortBadge) ? (lessonInfo.fullDisplay || lessonInfo.shortBadge) : null,
            partType: part.partType
        });

        // Após a Leitura da Bíblia, o presidente faz comentários breves (1 min)
        if (isBibleReading) {
            pushItem({
                id: `chairman_comment_reading_${part.id}`,
                title: "Comentários do Presidente",
                section: 'TREASURES',
                sectionTitle: "Tesouros da Palavra de Deus",
                sectionColor: '#2F7682',
                durationMinutes: 1,
                assignedRoleLabel: "Presidente",
                assignedName: chairmanName,
                isChairmanComment: true
            });
        }
    });

    // =========================================================================
    // 4. FAÇA SEU MELHOR NO MINISTÉRIO
    // =========================================================================
    const allMinistryParts = (schedule.parts || [])
        .filter(p => p.section === MidweekSection.MINISTRY && (p.isActive ?? true));

    const mainMinistryParts = allMinistryParts
        .filter(p => p.room === MidweekRoom.MAIN)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    mainMinistryParts.forEach((part, index) => {
        const lessonInfo = getLessonDetails(
            part.brochure,
            part.lessonNumber,
            part.studyPoint,
            part.studyPointDescription
        );

        // Busca parte correspondente na Sala Auxiliar 1
        const auxPart = allMinistryParts.find(
            p => p.room === MidweekRoom.AUXILIARY_1 &&
                 (p.orderIndex === part.orderIndex || (p.workbook_part_id && p.workbook_part_id === part.workbook_part_id))
        );

        const auxAssignedName = auxPart ? getPublisherName(auxPart.assignedPublisher, auxPart.custom_speaker_name || (auxPart as any).customSpeakerName) : null;
        const auxAssistantName = auxPart ? getPublisherName((auxPart as any).assistantPublisher || (auxPart as any).assignedAssistant) : null;

        const isTalk = part.partType === MidweekPartType.TALK || part.partType === MidweekPartType.STUDENT_TALK;
        const isWWYS = part.partType === MidweekPartType.WHAT_WOULD_YOU_SAY;

        pushItem({
            id: part.id,
            title: part.title,
            section: 'MINISTRY',
            sectionTitle: "Faça Seu Melhor no Ministério",
            sectionColor: '#D49000',
            durationMinutes: part.timeMinutes || 4,
            assignedRoleLabel: isWWYS ? "Orador (Consideração)" : isTalk ? "Orador" : "Titular",
            assignedName: getPublisherName(part.assignedPublisher, part.custom_speaker_name || (part as any).customSpeakerName) || "A designar",
            assistantName: getPublisherName((part as any).assistantPublisher || (part as any).assignedAssistant),
            auxAssignedName,
            auxAssistantName,
            sourceMaterial: part.sourceMaterial || null,
            lessonInfo: lessonInfo?.fullDisplay || lessonInfo?.shortBadge || null,
            isStudentPart: true,
            partType: part.partType
        });

        // O presidente faz conselhos/comentários de 1 minuto após CADA parte de estudante
        pushItem({
            id: `chairman_comment_ministry_${part.id}`,
            title: `Comentários do Presidente (Parte ${index + 1})`,
            section: 'MINISTRY',
            sectionTitle: "Faça Seu Melhor no Ministério",
            sectionColor: '#D49000',
            durationMinutes: 1,
            assignedRoleLabel: "Presidente",
            assignedName: chairmanName,
            isChairmanComment: true
        });
    });

    // =========================================================================
    // 5. CÂNTICO DO MEIO (5 min sempre)
    // =========================================================================
    pushItem({
        id: `song_middle_${schedule.id}`,
        title: schedule.songMiddle ? `Cântico ${schedule.songMiddle}` : "Cântico do Meio",
        section: 'LIVING',
        sectionTitle: "Nossa Vida Cristã",
        sectionColor: '#973934',
        durationMinutes: 5,
        songNumber: schedule.songMiddle,
        isSong: true
    });

    // =========================================================================
    // 6. NOSSA VIDA CRISTÃ
    // =========================================================================
    const isCoVisit = schedule.isSpecial && schedule.specialType === MidweekSpecialType.CIRCUIT_OVERSEER_VISIT;

    const livingParts = (schedule.parts || [])
        .filter(p =>
            p.section === MidweekSection.LIVING &&
            p.room === MidweekRoom.MAIN &&
            p.partType !== MidweekPartType.CBS &&
            !p.title.toLowerCase().includes("discurso de serviço") &&
            (p.isActive ?? true)
        )
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    livingParts.forEach(part => {
        pushItem({
            id: part.id,
            title: part.title,
            section: 'LIVING',
            sectionTitle: "Nossa Vida Cristã",
            sectionColor: '#973934',
            durationMinutes: part.timeMinutes || 15,
            assignedRoleLabel: "Designado",
            assignedName: getPublisherName(part.assignedPublisher, part.custom_speaker_name || (part as any).customSpeakerName) || "A designar",
            sourceMaterial: null,
            partType: part.partType
        });
    });

    // Estudo Bíblico de Congregação (30 min) ou Discurso de Serviço do SC (30 min)
    if (isCoVisit) {
        pushItem({
            id: `co_service_talk_${schedule.id}`,
            title: "Discurso de Serviço",
            section: 'LIVING',
            sectionTitle: "Nossa Vida Cristã",
            sectionColor: '#973934',
            durationMinutes: 30,
            assignedRoleLabel: "Superintendente de Circuito",
            assignedName: "Superintendente de Circuito",
            sourceMaterial: null
        });
    } else {
        const cbsPart = (schedule.parts || []).find(
            p => p.section === MidweekSection.LIVING && p.partType === MidweekPartType.CBS && p.isActive
        );

        pushItem({
            id: cbsPart?.id || `cbs_${schedule.id}`,
            title: cbsPart?.title || "Estudo Bíblico de Congregação",
            section: 'LIVING',
            sectionTitle: "Nossa Vida Cristã",
            sectionColor: '#973934',
            durationMinutes: cbsPart?.timeMinutes || 30,
            assignedRoleLabel: "Dirigente",
            assignedName: getPublisherName(schedule.cbsConductor) || "Dirigente a designar",
            readerName: getPublisherName(schedule.cbsReader) || "Leitor a designar",
            sourceMaterial: null
        });
    }

    // =========================================================================
    // 7. CONCLUSÃO: PALAVRAS CONCLUSIVAS DO PRESIDENTE (3 min)
    // =========================================================================
    pushItem({
        id: `chairman_conclusion_${schedule.id}`,
        title: "Comentário finais",
        section: 'CONCLUSION',
        sectionTitle: "Conclusão da Reunião",
        sectionColor: '#973934',
        durationMinutes: 3,
        assignedRoleLabel: "Presidente",
        assignedName: chairmanName,
        isChairmanComment: true
    });

    // =========================================================================
    // 8. CONCLUSÃO: CÂNTICO FINAL E ORAÇÃO (5 min sempre)
    // =========================================================================
    pushItem({
        id: `song_end_${schedule.id}`,
        title: schedule.songEnd ? `Cântico ${schedule.songEnd} e Oração` : "Cântico Final e Oração",
        section: 'CONCLUSION',
        sectionTitle: "Conclusão da Reunião",
        sectionColor: '#973934',
        durationMinutes: 5,
        songNumber: schedule.songEnd,
        assignedRoleLabel: "Oração Final",
        assignedName: getPublisherName(schedule.closingPrayer) || "A designar",
        isSong: true
    });

    return items;
}
