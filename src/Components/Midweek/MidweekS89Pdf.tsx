import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import UniversalPdfViewer from "@/Components/UniversalPdfViewer";
import { useAuthContext } from "@/context/AuthContext";
import { useCongregationContext } from "@/context/CongregationContext";
import { api } from "@/services/api";
import {
    IMidweekSchedule,
    IPublisherMini,
    MidweekPartType,
    MidweekRoom,
    MidweekSection,
    MidweekSpecialType,
} from "@/types/midweek";
import { getLessonDetails } from "@/utils/midweekLessons";
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Calendar, Check, Download, FileText, Loader2, Plus, Sparkles } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

dayjs.locale("pt-br");

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const MIDWEEK_DAY_MAP: Record<string, number> = {
    "Segunda-feira": 1,
    "Terça-feira": 2,
    "Quarta-feira": 3,
    "Quinta-feira": 4,
    "Sexta-feira": 5,
};

export const getMidweekMeetingDayOffset = (dayName?: string | null): number => {
    if (!dayName) return 0;
    const isoDay = MIDWEEK_DAY_MAP[dayName];
    if (!isoDay) return 0;
    return isoDay - 1; // Segunda = 0, Terça = 1, Quarta = 2, Quinta = 3, Sexta = 4
};

export const formatMidweekActualDate = (
    weekDate: string,
    explicitMeetingDate?: string | null,
    dayMeetingLifeAndMinistary?: string | null
): string => {
    if (explicitMeetingDate && explicitMeetingDate !== weekDate) {
        return dayjs(explicitMeetingDate).format("DD/MM/YYYY");
    }
    const offset = getMidweekMeetingDayOffset(dayMeetingLifeAndMinistary);
    return dayjs(weekDate).add(offset, "day").format("DD/MM/YYYY");
};

const getDisplayName = (pub?: IPublisherMini | null, customName?: string | null): string => {
    if (customName && customName.trim()) return customName.trim();
    if (!pub) return "";
    const nick = pub.nickname?.trim();
    if (nick) return nick;
    return pub.fullName || "";
};

const styles = StyleSheet.create({
    page: {
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        fontFamily: "Helvetica",
        flexDirection: "row",
        flexWrap: "wrap"
    },
    // Grid 2x2: 4 filipetas por folha A4 agrupadas no topo com o espaço livre embaixo
    quadrant: {
        width: "50%",
        height: "50%",
        paddingTop: 32,
        paddingBottom: 16,
        paddingHorizontal: 32,
        flexDirection: "column",
        justifyContent: "flex-start"
    },
    // Cabeçalho Oficial em Negrito Destacado
    headerBox: {
        alignItems: "center",
        marginBottom: 10
    },
    headerTitle1: {
        fontSize: 11.5,
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        textAlign: "center",
        color: "#000000",
        letterSpacing: 0.2
    },
    headerTitle2: {
        fontSize: 11.5,
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        textAlign: "center",
        color: "#000000",
        letterSpacing: 0.2,
        marginTop: 2
    },
    // Campos com Linhas Pontilhadas
    fieldsBox: {
        flexDirection: "column",
        gap: 7,
        marginTop: 4,
        marginBottom: 6
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "flex-end"
    },
    fieldLabel: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        color: "#000000",
        marginRight: 4,
        paddingBottom: 0.5
    },
    dottedLine: {
        flex: 1,
        borderBottomWidth: 0.8,
        borderBottomColor: "#000000",
        borderBottomStyle: "dotted",
        paddingBottom: 1,
        paddingLeft: 4,
        justifyContent: "flex-end"
    },
    fieldValueText: {
        fontSize: 10,
        color: "#000000",
        fontFamily: "Helvetica"
    },
    // Linha do Ponto sem a palavra "Ponto"
    studyPointRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginTop: 1
    },
    studyPointText: {
        fontSize: 9.5,
        color: "#000000",
        fontFamily: "Helvetica"
    },
    // Local
    localBox: {
        marginTop: 4,
        marginBottom: 10
    },
    localLabel: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 5
    },
    checkboxList: {
        flexDirection: "column",
        gap: 5,
        paddingLeft: 14
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    checkboxSquare: {
        width: 11,
        height: 11,
        borderWidth: 0.9,
        borderColor: "#4B5563",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 0.5
    },
    checkboxMark: {
        fontSize: 8.5,
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        color: "#000000",
        textAlign: "center",
        marginTop: -1
    },
    checkboxText: {
        fontSize: 9.5,
        color: "#000000"
    },
    // Observação para o estudante (Próxima do Local)
    noteBox: {
        marginTop: 8
    },
    noteText: {
        fontSize: 7.2,
        color: "#000000",
        lineHeight: 1.35,
        textAlign: "left"
    },
    boldSpan: {
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold"
    },
    italicSpan: {
        fontFamily: "Helvetica-Oblique",
        fontStyle: "italic"
    },
    footerCode: {
        fontSize: 7.5,
        color: "#000000",
        marginTop: 6
    },
    // Marcas de Corte da Folha A4
    cropTop: {
        position: "absolute",
        top: 0,
        left: "50%",
        width: 1,
        height: 18,
        backgroundColor: "#000000",
        transform: "translateX(-0.5px)"
    },
    cropBottom: {
        position: "absolute",
        bottom: 0,
        left: "50%",
        width: 1,
        height: 18,
        backgroundColor: "#000000",
        transform: "translateX(-0.5px)"
    },
    cropLeft: {
        position: "absolute",
        left: 0,
        top: "50%",
        height: 1,
        width: 18,
        backgroundColor: "#000000",
        transform: "translateY(-0.5px)"
    },
    cropRight: {
        position: "absolute",
        right: 0,
        top: "50%",
        height: 1,
        width: 18,
        backgroundColor: "#000000",
        transform: "translateY(-0.5px)"
    }
});

interface ItemWithSchedule {
    part: any;
    meetingDateFormatted: string;
    partNumberDisplay: string;
    pointDisplayText: string;
    isMainRoom: boolean;
    isAux1: boolean;
    isAux2: boolean;
}

export const MidweekS89PdfDocument: React.FC<{
    schedules?: IMidweekSchedule[];
    dayMeetingLifeAndMinistary?: string | null;
}> = ({ schedules = [], dayMeetingLifeAndMinistary }) => {
    const typeOrder: Record<string, number> = {
        [MidweekPartType.TALK]: 1,
        [MidweekPartType.GEMS]: 2,
        [MidweekPartType.BIBLE_READING]: 3
    };

    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    // Estrutura de páginas para o documento
    const pages: ItemWithSchedule[][] = [];

    // Itera por cada semana
    (schedules || []).forEach(schedule => {
        // Pula semanas especiais sem reunião (Assembleia, Congresso, Memorial)
        const isNoMeeting = schedule.isSpecial && (
            schedule.specialType === MidweekSpecialType.CIRCUIT_ASSEMBLY ||
            schedule.specialType === MidweekSpecialType.REGIONAL_CONVENTION ||
            schedule.specialType === MidweekSpecialType.MEMORIAL
        );

        if (isNoMeeting) {
            return;
        }

        // Data real da reunião conforme o dia da semana configurado na congregação
        const meetingDateFormatted = formatMidweekActualDate(
            schedule.weekDate,
            schedule.meetingDate,
            dayMeetingLifeAndMinistary
        );

        const sortMinistryParts = (a: any, b: any) => {
            if (a.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && b.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return 1;
            if (b.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && a.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return -1;
            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        };

        const allMainTreasures = (schedule.parts || [])
            .filter(p => p.section === MidweekSection.TREASURES && p.room === MidweekRoom.MAIN && p.isActive !== false)
            .sort((a, b) => (typeOrder[a.partType] ?? 99) - (typeOrder[b.partType] ?? 99));

        const allMainMinistry = (schedule.parts || [])
            .filter(p => p.section === MidweekSection.MINISTRY && p.room === MidweekRoom.MAIN && p.isActive !== false)
            .sort(sortMinistryParts);

        // Mapa com os números exatos das partes na reunião daquela semana
        const partNumberMap = new Map<string, number>();
        let currentPartCount = 1;

        allMainTreasures.forEach(p => {
            partNumberMap.set(p.partType === MidweekPartType.BIBLE_READING ? "BIBLE_READING" : p.id, currentPartCount++);
        });

        allMainMinistry.forEach((p, idx) => {
            partNumberMap.set(`MINISTRY_${idx}`, currentPartCount++);
        });

        // Partes dos estudantes desta semana (Salão Principal + Salas Auxiliares)
        // Obs: WHAT_WOULD_YOU_SAY é consideração congregacional, não gera S-89.
        // Se a parte não tiver estudante designado, NÃO gera S-89 vazio!
        const studentParts = (schedule.parts || []).filter(p => {
            const isMinistry = p.section === MidweekSection.MINISTRY && p.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY;
            const isBibleReading = p.partType === MidweekPartType.BIBLE_READING;
            const isActive = p.isActive !== false;

            const studentName = getDisplayName(
                p.assignedPublisher,
                p.custom_speaker_name
            );
            const hasStudent = !!(studentName && studentName.trim().length > 0);

            return (isMinistry || isBibleReading) && isActive && hasStudent;
        }).sort((a, b) => {
            if (a.room !== b.room) {
                const roomOrder = { [MidweekRoom.MAIN]: 1, [MidweekRoom.AUXILIARY_1]: 2, [MidweekRoom.AUXILIARY_2]: 3 };
                return (roomOrder[a.room] ?? 99) - (roomOrder[b.room] ?? 99);
            }
            if (a.section !== b.section) {
                return a.section === MidweekSection.TREASURES ? -1 : 1;
            }
            return sortMinistryParts(a, b);
        });

        // Se não houver partes de estudantes nesta semana com designações, não gera S-89 vazios
        if (studentParts.length === 0) {
            return;
        }

        const weekSlips: ItemWithSchedule[] = studentParts.map(part => {
            let partNumberDisplay = "";
            if (part.partType === MidweekPartType.BIBLE_READING) {
                const num = partNumberMap.get("BIBLE_READING") || 3;
                partNumberDisplay = `${num}`;
            } else {
                const ministryIndex = allMainMinistry.findIndex(
                    mp => mp.id === part.id || (mp.title === part.title && (mp.orderIndex ?? 0) === (part.orderIndex ?? 0))
                );
                const num = partNumberMap.get(`MINISTRY_${ministryIndex >= 0 ? ministryIndex : (part.orderIndex ?? 0)}`);
                partNumberDisplay = num ? `${num}` : `${part.orderIndex || ""}`;
            }

            const isMainRoom = part.room === MidweekRoom.MAIN;
            const isAux1 = part.room === MidweekRoom.AUXILIARY_1;
            const isAux2 = part.room === MidweekRoom.AUXILIARY_2;

            const lessonInfo = getLessonDetails(
                part.brochure,
                part.lessonNumber,
                part.studyPoint,
                part.studyPointDescription
            );

            let pointDisplayText = "";
            if (lessonInfo) {
                if (lessonInfo.brochureName.includes("Melhore")) {
                    pointDisplayText = lessonInfo.fullDisplay;
                } else {
                    const lmdLessonNum = part.lessonNumber || 1;
                    const lmdPointNum = part.studyPoint || null;
                    pointDisplayText = `lmd lição ${lmdLessonNum}${lessonInfo.lessonTheme ? ` (${lessonInfo.lessonTheme})` : ""}${lmdPointNum ? ` • ponto ${lmdPointNum}` : ""}${lessonInfo.pointDescription ? `: ${lessonInfo.pointDescription}` : ""}`;
                }
            }

            return {
                part,
                meetingDateFormatted,
                partNumberDisplay,
                pointDisplayText,
                isMainRoom,
                isAux1,
                isAux2
            };
        });

        if (weekSlips.length > 0) {
            const weekChunks = chunkArray(weekSlips, 4);
            pages.push(...weekChunks);
        }
    });

    if (pages.length === 0) {
        return (
            <Document>
                <Page size="A4" style={[styles.page, { padding: 40, justifyContent: "center", alignItems: "center" }]}>
                    <Text style={{ fontSize: 12, color: "#4B5563" }}>
                        Nenhuma designação de estudante encontrada para o período selecionado.
                    </Text>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            {pages.map((pageParts, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    {/* Marcas de Corte da Folha */}
                    <View style={styles.cropTop} />
                    <View style={styles.cropBottom} />
                    <View style={styles.cropLeft} />
                    <View style={styles.cropRight} />

                    {/* 4 Quadrantes da Folha */}
                    {pageParts.map((item) => {
                        const { part, meetingDateFormatted, partNumberDisplay, pointDisplayText, isMainRoom, isAux1, isAux2 } = item;

                        return (
                            <View key={part.id} style={styles.quadrant}>
                                {/* Cabeçalho em Negrito */}
                                <View style={styles.headerBox}>
                                    <Text style={styles.headerTitle1}>
                                        DESIGNAÇÃO PARA A REUNIÃO
                                    </Text>
                                    <Text style={styles.headerTitle2}>
                                        NOSSA VIDA E MINISTÉRIO CRISTÃO
                                    </Text>
                                </View>

                                {/* Campos com Linhas Pontilhadas e Rótulos em Negrito */}
                                <View style={styles.fieldsBox}>
                                    {/* Nome */}
                                    <View style={styles.fieldRow}>
                                        <Text style={styles.fieldLabel}>Nome:</Text>
                                        <View style={styles.dottedLine}>
                                            <Text style={styles.fieldValueText}>
                                                {getDisplayName(part.assignedPublisher, part.custom_speaker_name)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Ajudante */}
                                    <View style={styles.fieldRow}>
                                        <Text style={styles.fieldLabel}>Ajudante:</Text>
                                        <View style={styles.dottedLine}>
                                            <Text style={styles.fieldValueText}>
                                                {part.requiresAssistant ? getDisplayName(part.assistantPublisher, part.custom_assistant_name) : ""}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Data */}
                                    <View style={styles.fieldRow}>
                                        <Text style={styles.fieldLabel}>Data:</Text>
                                        <View style={styles.dottedLine}>
                                            <Text style={styles.fieldValueText}>
                                                {meetingDateFormatted}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Número da parte */}
                                    <View style={styles.fieldRow}>
                                        <Text style={styles.fieldLabel}>Número da parte:</Text>
                                        <View style={styles.dottedLine}>
                                            <Text style={styles.fieldValueText}>
                                                {partNumberDisplay}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Linha do Ponto de Estudo / Lição (Sem a palavra Ponto) */}
                                    {pointDisplayText ? (
                                        <View style={styles.studyPointRow}>
                                            <View style={styles.dottedLine}>
                                                <Text style={styles.studyPointText}>
                                                    {pointDisplayText}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Local */}
                                <View style={styles.localBox}>
                                    <Text style={styles.localLabel}>Local:</Text>
                                    <View style={styles.checkboxList}>
                                        {/* Salão principal */}
                                        <View style={styles.checkboxRow}>
                                            <View style={styles.checkboxSquare}>
                                                {isMainRoom && <Text style={styles.checkboxMark}>X</Text>}
                                            </View>
                                            <Text style={styles.checkboxText}>Salão principal</Text>
                                        </View>

                                        {/* Sala B */}
                                        <View style={styles.checkboxRow}>
                                            <View style={styles.checkboxSquare}>
                                                {isAux1 && <Text style={styles.checkboxMark}>X</Text>}
                                            </View>
                                            <Text style={styles.checkboxText}>Sala B</Text>
                                        </View>

                                        {/* Sala C */}
                                        <View style={styles.checkboxRow}>
                                            <View style={styles.checkboxSquare}>
                                                {isAux2 && <Text style={styles.checkboxMark}>X</Text>}
                                            </View>
                                            <Text style={styles.checkboxText}>Sala C</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Observação para o estudante e Rodapé */}
                                <View style={styles.noteBox}>
                                    <Text style={styles.noteText}>
                                        <Text style={styles.boldSpan}>Observação para o estudante: </Text>
                                        A lição e a fonte de matéria para a sua designação estão na{" "}
                                        <Text style={styles.italicSpan}>Apostila da Reunião Vida e Ministério</Text>
                                        . Veja as instruções para a parte que estão nas{" "}
                                        <Text style={styles.italicSpan}>Instruções para a Reunião Nossa Vida e Ministério Cristão</Text>
                                        {" "}(S-38).
                                    </Text>

                                    <Text style={styles.footerCode}>
                                        S-89-T      11/23
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </Page>
            ))}
        </Document>
    );
};

export const MidweekS89PdfModal: React.FC<{
    open: boolean;
    onClose: () => void;
    schedules?: IMidweekSchedule[];
    schedule?: IMidweekSchedule;
    selectedScheduleId?: string | null;
    year?: number;
    month?: number;
    congregationId?: string;
    dayMeetingLifeAndMinistary?: string;
}> = ({
    open,
    onClose,
    schedules = [],
    schedule,
    selectedScheduleId,
    year,
    month,
    congregationId: propCongregationId,
    dayMeetingLifeAndMinistary: propDayMeeting
}) => {
    const { congregation } = useCongregationContext();
    const { user } = useAuthContext();
    const effectiveCongregationId = propCongregationId || congregation?.id || user?.congregation?.id;
    const effectiveDayMeeting = propDayMeeting || congregation?.dayMeetingLifeAndMinistary || user?.congregation?.dayMeetingLifeAndMinistary;

    const baseYear = year || (schedules[0] ? dayjs(schedules[0].weekDate).year() : dayjs().year());
    const baseMonth = month || (schedules[0] ? dayjs(schedules[0].weekDate).month() + 1 : dayjs().month() + 1);

    // Meses selecionados pelo usuário (ex: [{ year: 2026, month: 11 }, { year: 2026, month: 12 }])
    const [selectedMonths, setSelectedMonths] = useState<Array<{ year: number; month: number }>>([
        { year: baseYear, month: baseMonth }
    ]);

    // Cache de programações por mês (chave 'YYYY-M')
    const [cachedMonths, setCachedMonths] = useState<Record<string, IMidweekSchedule[]>>({});
    const [loadingMonth, setLoadingMonth] = useState<string | null>(null);

    // "all" = Mês Inteiro (ou todos os meses selecionados), ou ID da semana
    const [selectedScope, setSelectedScope] = useState<string>("all");

    // Inicializa o cache quando o modal abre ou os dados iniciais mudam
    useEffect(() => {
        if (open) {
            const initialList = schedules && schedules.length > 0
                ? schedules
                : schedule
                    ? [schedule]
                    : [];
            const key = `${baseYear}-${baseMonth}`;
            setCachedMonths(prev => ({
                ...prev,
                [key]: initialList
            }));
            setSelectedMonths([{ year: baseYear, month: baseMonth }]);
            setSelectedScope("all");
        }
    }, [open, baseYear, baseMonth, schedules, schedule]);

    // Meses rápidos disponíveis para selecionar/alternar (-1 mês até +4 meses)
    const quickMonths = useMemo(() => {
        const baseDate = dayjs(`${baseYear}-${String(baseMonth).padStart(2, "0")}-01`);
        const list = [];
        for (let i = -1; i <= 4; i++) {
            const d = baseDate.add(i, "month");
            list.push({
                year: d.year(),
                month: d.month() + 1,
                label: `${MONTH_NAMES[d.month()].slice(0, 3)}/${d.format("YY")}`,
                fullLabel: `${MONTH_NAMES[d.month()]} de ${d.year()}`
            });
        }
        return list;
    }, [baseYear, baseMonth]);

    const toggleMonth = async (mYear: number, mMonth: number) => {
        const key = `${mYear}-${mMonth}`;
        const isSelected = selectedMonths.some(m => m.year === mYear && m.month === mMonth);

        if (isSelected) {
            if (selectedMonths.length <= 1) {
                toast.info("Pelo menos um mês deve permanecer selecionado.");
                return;
            }
            setSelectedMonths(prev => prev.filter(m => !(m.year === mYear && m.month === mMonth)));
            setSelectedScope("all");
        } else {
            if (!cachedMonths[key]) {
                if (!effectiveCongregationId) {
                    toast.error("Congregação não encontrada para carregar dados adicionais.");
                    return;
                }
                setLoadingMonth(key);
                try {
                    const res = await api.get(
                        `/midweek/schedules/congregation/${effectiveCongregationId}?year=${mYear}&month=${mMonth}`
                    );
                    const fetched: IMidweekSchedule[] = Array.isArray(res.data) ? res.data : [];
                    setCachedMonths(prev => ({ ...prev, [key]: fetched }));
                    setSelectedMonths(prev =>
                        [...prev, { year: mYear, month: mMonth }].sort((a, b) =>
                            a.year !== b.year ? a.year - b.year : a.month - b.month
                        )
                    );
                    setSelectedScope("all");
                } catch (err) {
                    console.error("Erro ao carregar mês adicional:", err);
                    toast.error(`Erro ao carregar programação de ${MONTH_NAMES[mMonth - 1]} de ${mYear}`);
                } finally {
                    setLoadingMonth(null);
                }
            } else {
                setSelectedMonths(prev =>
                    [...prev, { year: mYear, month: mMonth }].sort((a, b) =>
                        a.year !== b.year ? a.year - b.year : a.month - b.month
                    )
                );
                setSelectedScope("all");
            }
        }
    };

    // Reúne todas as semanas dos meses selecionados
    const combinedSchedules = useMemo(() => {
        const result: IMidweekSchedule[] = [];
        selectedMonths.forEach(m => {
            const list = cachedMonths[`${m.year}-${m.month}`] || [];
            result.push(...list);
        });
        return result.sort((a, b) => dayjs(a.weekDate).diff(dayjs(b.weekDate)));
    }, [selectedMonths, cachedMonths]);

    const filteredSchedules = selectedScope === "all"
        ? combinedSchedules
        : combinedSchedules.filter(s => s.id === selectedScope);

    const isAll = selectedScope === "all";

    const currentDoc = (
        <MidweekS89PdfDocument
            schedules={filteredSchedules}
            dayMeetingLifeAndMinistary={effectiveDayMeeting}
        />
    );

    const monthsSummary = selectedMonths
        .map(m => `${MONTH_NAMES[m.month - 1].slice(0, 3)}/${m.year}`)
        .join(", ");

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] h-[92vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-5">
                <DialogHeader className="flex flex-col gap-3 pb-3 border-b border-surface-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary-200" />
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-typography-900">
                                    Folhetos de Designação S-89 (PDF)
                                </DialogTitle>
                                <span className="text-xs text-typography-500">
                                    {selectedMonths.length === 1
                                        ? `${MONTH_NAMES[selectedMonths[0].month - 1]} de ${selectedMonths[0].year}`
                                        : `${selectedMonths.length} meses selecionados (${monthsSummary})`
                                    } • {combinedSchedules.length} semana(s) no total
                                </span>
                            </div>
                        </div>

                        <PDFDownloadLink
                            document={currentDoc}
                            fileName={
                                selectedMonths.length === 1
                                    ? (isAll
                                        ? `S89_${MONTH_NAMES[selectedMonths[0].month - 1]}_${selectedMonths[0].year}.pdf`
                                        : `S89_Semana_${formatMidweekActualDate(filteredSchedules[0]?.weekDate, filteredSchedules[0]?.meetingDate, effectiveDayMeeting).replace(/\//g, "-")}.pdf`)
                                    : `S89_Multiplos_Meses_${selectedMonths.map(m => `${MONTH_NAMES[m.month - 1].slice(0, 3)}_${m.year}`).join("_")}.pdf`
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary-200 hover:opacity-90 text-white font-semibold text-xs shadow-sm cursor-pointer whitespace-nowrap"
                        >
                            <Download className="h-4 w-4" />
                            <span>Baixar PDF</span>
                        </PDFDownloadLink>
                    </div>

                    {/* Barra de Seleção de Meses & Escopo de Semanas */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
                        {/* Seletor de Meses */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-typography-700 mr-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-primary-200" />
                                <span>Meses:</span>
                            </span>
                            {quickMonths.map(qm => {
                                const isSelected = selectedMonths.some(m => m.year === qm.year && m.month === qm.month);
                                const isLoading = loadingMonth === `${qm.year}-${qm.month}`;
                                return (
                                    <button
                                        key={`${qm.year}-${qm.month}`}
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => toggleMonth(qm.year, qm.month)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-primary-200 text-white shadow-2xs"
                                                : "bg-surface-200 text-typography-600 hover:bg-surface-300 hover:text-typography-900 border border-surface-300"
                                        }`}
                                        title={qm.fullLabel}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : isSelected ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <Plus className="w-3 h-3 opacity-60" />
                                        )}
                                        <span>{qm.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Seletor de Escopo (Mês / Semana) */}
                        <div className="flex items-center bg-surface-200 p-1 rounded-lg border border-surface-300 overflow-x-auto max-w-full scrollbar-none">
                            <button
                                type="button"
                                onClick={() => setSelectedScope("all")}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    isAll
                                        ? "bg-surface-100 text-typography-900 shadow-sm"
                                        : "text-typography-500 hover:text-typography-900"
                                }`}
                            >
                                <Sparkles className="h-3 w-3 text-purple-500" />
                                <span>
                                    {selectedMonths.length === 1 ? "Mês Inteiro" : "Todos os Meses"} ({combinedSchedules.length})
                                </span>
                            </button>

                            {combinedSchedules.map(s => {
                                const actualDateStr = formatMidweekActualDate(s.weekDate, s.meetingDate, effectiveDayMeeting);
                                const weekFormatted = actualDateStr.slice(0, 5);
                                const isSelected = selectedScope === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setSelectedScope(s.id)}
                                        className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-surface-100 text-typography-900 shadow-sm"
                                                : "text-typography-500 hover:text-typography-900"
                                        }`}
                                    >
                                        <Calendar className="h-3 w-3" />
                                        <span>{weekFormatted}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 w-full mt-3 rounded-xl overflow-hidden border border-surface-300 bg-surface-200 flex flex-col">
                    <UniversalPdfViewer
                        document={currentDoc}
                        title={
                            isAll
                                ? (selectedMonths.length === 1
                                    ? `Designações S-89 — ${MONTH_NAMES[selectedMonths[0].month - 1]} de ${selectedMonths[0].year}`
                                    : `Designações S-89 — ${monthsSummary}`)
                                : `Designações S-89 — Semana de ${formatMidweekActualDate(filteredSchedules[0]?.weekDate, filteredSchedules[0]?.meetingDate, effectiveDayMeeting)}`
                        }
                        fileName={
                            selectedMonths.length === 1
                                ? (isAll
                                    ? `S89_${MONTH_NAMES[selectedMonths[0].month - 1]}_${selectedMonths[0].year}.pdf`
                                    : `S89_Semana_${formatMidweekActualDate(filteredSchedules[0]?.weekDate, filteredSchedules[0]?.meetingDate, effectiveDayMeeting).replace(/\//g, "-")}.pdf`)
                                : `S89_Multiplos_Meses_${selectedMonths.map(m => `${MONTH_NAMES[m.month - 1].slice(0, 3)}_${m.year}`).join("_")}.pdf`
                        }
                        minHeight="600px"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
