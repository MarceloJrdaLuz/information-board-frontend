import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { IMidweekSchedule, IPublisherMini, MidweekPartType, MidweekRoom, MidweekSection, MidweekSpecialType } from "@/types/midweek";
import { getLessonDetails } from "@/utils/midweekLessons";
import { Document, Font, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Columns, Download, LayoutTemplate, Printer } from "lucide-react";
import React, { useState } from "react";

dayjs.locale("pt-br");

// Registra as fontes Crimson Pro para o Modelo Grade
try {
    Font.register({
        family: "Crimson Pro",
        fonts: [
            {
                src: "/fonts/CrimsonPro-Regular.ttf",
                fontWeight: "normal",
            },
            {
                src: "/fonts/CrimsonPro-Bold.ttf",
                fontWeight: "bold",
            },
            {
                src: "/fonts/CrimsonPro-Italic.ttf",
                fontStyle: "italic",
                fontWeight: "normal",
            },
            {
                src: "/fonts/CrimsonPro-BoldItalic.ttf",
                fontStyle: "italic",
                fontWeight: "bold",
            },
            {
                src: "/fonts/CrimsonPro-SemiBold.ttf",
                fontWeight: 600,
            },
            {
                src: "/fonts/CrimsonPro-Medium.ttf",
                fontWeight: 500,
            },
        ],
    });
} catch (e) {
    // Ignora se já estiver registrada
}

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const getDisplayName = (pub?: IPublisherMini | null): string => {
    if (!pub) return "—";
    const nick = pub.nickname?.trim();
    if (nick) return nick;
    return pub.fullName || "—";
};

// ==========================================
// ESTILOS: MODELO 1 (Grade com Tabela)
// ==========================================
const styles1 = StyleSheet.create({
    page: {
        paddingTop: 12,
        paddingBottom: 10,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        fontFamily: "Crimson Pro",
        color: "#1E293B"
    },
    docHeader: {
        marginBottom: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderBottomWidth: 1.5,
        borderBottomColor: "#1E3A5F",
        paddingBottom: 4
    },
    docTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1E3A5F",
        textTransform: "uppercase",
        letterSpacing: 0.5
    },
    docSubtitle: {
        fontSize: 9,
        color: "#64748B",
        marginTop: 1
    },
    docMonthTag: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#1E3A5F",
        textTransform: "uppercase"
    },
    weekCard: {
        marginBottom: 8,
        borderWidth: 0.75,
        borderColor: "#CBD5E1",
        borderRadius: 2,
        overflow: "hidden"
    },
    weekMainHeader: {
        backgroundColor: "#1E3A5F",
        minHeight: 22,
        flexDirection: "row",
        alignItems: "center"
    },
    weekTitleLeftBox: {
        width: "65%",
        paddingVertical: 4.5,
        paddingHorizontal: 8
    },
    weekTitleLeft: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFFFFF",
        textTransform: "uppercase",
        letterSpacing: 0.5
    },
    weekChairmanBox: {
        width: "35%",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4.5,
        paddingHorizontal: 6,
        borderLeftWidth: 0.5,
        borderLeftColor: "#3B5A82"
    },
    weekHeaderLabel: {
        width: "40%",
        fontSize: 8,
        fontWeight: "bold",
        color: "#94A3B8",
        textAlign: "right",
        paddingRight: 4
    },
    weekHeaderName: {
        width: "60%",
        fontSize: 9.5,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "left"
    },
    sectionBanner: {
        paddingVertical: 3.5,
        paddingHorizontal: 8,
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 8.5,
        textTransform: "uppercase",
        letterSpacing: 0.4
    },
    treasuresBanner: {
        backgroundColor: "#345C68"
    },
    ministryBanner: {
        backgroundColor: "#C57E0A"
    },
    livingBanner: {
        backgroundColor: "#8F1D2C"
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "#E2E8F0",
        minHeight: 18,
        alignItems: "center"
    },
    colTime: {
        width: "8%",
        paddingVertical: 3,
        paddingHorizontal: 4,
        fontSize: 8,
        color: "#64748B",
        textAlign: "right"
    },
    colContent: {
        width: "57%",
        paddingVertical: 3,
        paddingHorizontal: 6,
        fontSize: 8,
        color: "#1E293B",
        borderLeftWidth: 0.5,
        borderLeftColor: "#E2E8F0"
    },
    // Coluna de Designados (35% de largura total)
    colAssigneeContainer: {
        width: "35%",
        paddingVertical: 3,
        paddingHorizontal: 4,
        borderLeftWidth: 0.5,
        borderLeftColor: "#E2E8F0",
        flexDirection: "column",
        justifyContent: "center"
    },
    // Grade Single Room (1 sala)
    assigneeGridRowSingle: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%"
    },
    assigneeLabelCellSingle: {
        width: "40%",
        fontSize: 7.5,
        color: "#64748B",
        textAlign: "right",
        paddingRight: 4
    },
    assigneeNameCellSingle: {
        width: "60%",
        fontSize: 8.5,
        fontWeight: "bold",
        color: "#0F172A",
        textAlign: "left"
    },
    assigneeSingleName: {
        width: "100%",
        fontSize: 8.5,
        fontWeight: "bold",
        color: "#0F172A",
        textAlign: "left",
        paddingLeft: "40%"
    },
    // Grade Dual Room (Salão Principal + Sala B lado a lado)
    assigneeGridRowDual: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%"
    },
    assigneeLabelCellDual: {
        width: "28%",
        fontSize: 7,
        color: "#64748B",
        textAlign: "right",
        paddingRight: 3
    },
    assigneeMainCellDual: {
        width: "36%",
        fontSize: 8,
        fontWeight: "bold",
        color: "#0F172A",
        textAlign: "left",
        paddingRight: 2
    },
    assigneeAuxCellDual: {
        width: "36%",
        fontSize: 8,
        fontWeight: "bold",
        color: "#0F172A",
        textAlign: "left",
        borderLeftWidth: 0.5,
        borderLeftColor: "#E2E8F0",
        paddingLeft: 4
    },
    songRow: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 0.5,
        borderBottomColor: "#E2E8F0",
        minHeight: 18,
        alignItems: "center"
    },
    songLeftBox: {
        width: "65%",
        paddingVertical: 3,
        paddingHorizontal: 8
    },
    songTitle: {
        fontSize: 8.5,
        fontWeight: "bold",
        color: "#1E293B"
    },
    titleBold: {
        fontWeight: "bold",
        color: "#0F172A"
    },
    methodItalic: {
        fontStyle: "italic",
        color: "#475569"
    },
    lessonBadge: {
        fontSize: 7.5,
        color: "#64748B"
    },
    specialBanner: {
        padding: 12,
        backgroundColor: "#FEF3C7",
        alignItems: "center",
        justifyContent: "center"
    },
    specialTitle: {
        fontSize: 10.5,
        fontWeight: "bold",
        color: "#92400E",
        textTransform: "uppercase"
    },
    specialDesc: {
        fontSize: 8,
        color: "#B45309",
        marginTop: 2
    },
    pageFooter: {
        position: "absolute",
        bottom: 8,
        left: 20,
        right: 20,
        textAlign: "center",
        fontSize: 7.5,
        color: "#94A3B8"
    }
});

// ==========================================
// ESTILOS: MODELO 2 (Modelo S-140 / Clean)
// ==========================================
const styles2 = StyleSheet.create({
    page: {
        paddingTop: 12,
        paddingBottom: 10,
        paddingHorizontal: 18,
        backgroundColor: "#FFFFFF",
        fontFamily: "Helvetica"
    },
    docHeader: {
        marginBottom: 6
    },
    docHeaderTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingBottom: 3
    },
    congregationName: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#000000",
        textTransform: "uppercase",
        letterSpacing: 0.3
    },
    mainTitle: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#000000"
    },
    headerLineThick: {
        borderBottomWidth: 1.5,
        borderBottomColor: "#000000",
        marginBottom: 1
    },
    headerLineThin: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#000000"
    },
    weekBlock: {
        marginBottom: 8
    },
    weekHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: 4,
        marginBottom: 4
    },
    weekTitle: {
        fontSize: 9.5,
        fontWeight: "bold",
        color: "#000000",
        textTransform: "uppercase"
    },
    weekRolesColumn: {
        alignItems: "flex-end"
    },
    roleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 1.5
    },
    roleLabel: {
        fontSize: 7.2,
        color: "#4B5563",
        marginRight: 4
    },
    roleValue: {
        fontSize: 7.5,
        fontWeight: "bold",
        color: "#000000"
    },
    sectionBanner: {
        paddingVertical: 2.5,
        paddingHorizontal: 6,
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 7.5,
        textTransform: "uppercase",
        marginTop: 4,
        marginBottom: 2
    },
    bannerTreasures: {
        backgroundColor: "#4B5563",
        width: "52%"
    },
    bannerMinistry: {
        backgroundColor: "#C57E0A",
        width: "52%"
    },
    bannerLiving: {
        backgroundColor: "#8F1D2C",
        width: "52%"
    },
    tableHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: -14,
        marginBottom: 2
    },
    headerSpaceLeft: {
        width: "52%"
    },
    headerColAux: {
        width: "24%",
        fontSize: 6.8,
        fontWeight: "bold",
        color: "#4B5563",
        textAlign: "center"
    },
    headerColMain: {
        width: "24%",
        fontSize: 6.8,
        fontWeight: "bold",
        color: "#4B5563",
        textAlign: "center"
    },
    cleanRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 1.8,
        fontSize: 7.2
    },
    colTime: {
        width: "6%",
        color: "#6B7280",
        fontSize: 7
    },
    colContent: {
        width: "46%",
        fontSize: 7.2,
        color: "#111827",
        paddingRight: 4
    },
    colLabelTag: {
        width: "18%",
        fontSize: 6.8,
        color: "#4B5563",
        textAlign: "right",
        paddingRight: 4
    },
    colAuxRoom: {
        width: "15%",
        fontSize: 7.2,
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center"
    },
    colMainRoom: {
        width: "15%",
        fontSize: 7.2,
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center"
    },
    colSingleName: {
        width: "30%",
        fontSize: 7.2,
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center"
    },
    titleBold: {
        fontWeight: "bold",
        color: "#000000"
    },
    pageFooter: {
        position: "absolute",
        bottom: 8,
        left: 20,
        right: 20,
        textAlign: "center",
        fontSize: 7,
        color: "#9CA3AF"
    }
});

// ==========================================
// DOCUMENTO: MODELO 1 (Grade com Tabela)
// ==========================================
const MidweekModel1Document: React.FC<{
    schedules: IMidweekSchedule[];
    year: number;
    month: number;
}> = ({ schedules, year, month }) => {
    return (
        <Document>
            <Page size="A4" style={styles1.page}>
                <View style={styles1.docHeader} fixed>
                    <View>
                        <Text style={styles1.docTitle}>Nossa Vida e Ministério Cristão</Text>
                        <Text style={styles1.docSubtitle}>Programação das Reuniões de Meio de Semana</Text>
                    </View>
                    <Text style={styles1.docMonthTag}>
                        {MONTH_NAMES[month - 1]} de {year}
                    </Text>
                </View>

                {schedules.map((schedule) => {
                    const weekDateObj = dayjs(schedule.weekDate);
                    const weekStart = weekDateObj.format("D");
                    const weekEnd = weekDateObj.add(6, "day").format("D [DE] MMMM");
                    const weekRangeFormatted = `${weekStart}-${weekEnd}`.toUpperCase();

                    const isNoMeeting = schedule.isSpecial && (
                        schedule.specialType === MidweekSpecialType.CIRCUIT_ASSEMBLY ||
                        schedule.specialType === MidweekSpecialType.REGIONAL_CONVENTION ||
                        schedule.specialType === MidweekSpecialType.MEMORIAL
                    );

                    if (isNoMeeting) {
                        return (
                            <View key={schedule.id} style={styles1.weekCard} wrap={false}>
                                <View style={styles1.weekMainHeader}>
                                    <View style={styles1.weekTitleLeftBox}>
                                        <Text style={styles1.weekTitleLeft}>{weekRangeFormatted}</Text>
                                    </View>
                                    <View style={styles1.weekChairmanBox}>
                                        <Text style={{ fontSize: 7.5, fontWeight: "bold", color: "#CBD5E1", width: "100%", textAlign: "center" }}>
                                            Semana Especial
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles1.specialBanner}>
                                    <Text style={styles1.specialTitle}>
                                        {schedule.specialName || "Semana de Evento Especial"}
                                    </Text>
                                    <Text style={styles1.specialDesc}>
                                        Não haverá reunião de meio de semana no Salão do Reino.
                                    </Text>
                                </View>
                            </View>
                        );
                    }

                    const treasuresMainParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.TREASURES && p.isActive && p.room === MidweekRoom.MAIN)
                        .sort((a, b) => {
                            const typeOrder: Record<string, number> = {
                                [MidweekPartType.TALK]: 1,
                                [MidweekPartType.GEMS]: 2,
                                [MidweekPartType.BIBLE_READING]: 3
                            };
                            return (typeOrder[a.partType] ?? 99) - (typeOrder[b.partType] ?? 99);
                        }) || [];

                    const auxBibleReadingPart = schedule.parts?.find(
                        p => p.section === MidweekSection.TREASURES && p.partType === MidweekPartType.BIBLE_READING && p.room === MidweekRoom.AUXILIARY_1 && p.isActive
                    );

                    const sortMinistryParts = (a: any, b: any) => {
                        if (a.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && b.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return 1;
                        if (b.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && a.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return -1;
                        return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
                    };

                    const ministryMainParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.MINISTRY && p.isActive && p.room === MidweekRoom.MAIN)
                        .sort(sortMinistryParts) || [];

                    const ministryAuxParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.MINISTRY && p.isActive && p.room === MidweekRoom.AUXILIARY_1)
                        .sort(sortMinistryParts) || [];

                    const hasAuxRoom = ministryAuxParts.length > 0 || !!auxBibleReadingPart;

                    const livingParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.LIVING && p.isActive && p.partType !== MidweekPartType.CBS && !p.custom_speaker_name)
                        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)) || [];

                    const cbsPart = schedule.parts?.find(p => p.section === MidweekSection.LIVING && p.partType === MidweekPartType.CBS && p.isActive);
                    const coTalkPart = schedule.parts?.find(p => p.section === MidweekSection.LIVING && p.isActive && p.custom_speaker_name);
                    const isCoVisit = schedule.isSpecial && schedule.specialType === MidweekSpecialType.CIRCUIT_OVERSEER_VISIT;

                    const coTalkTheme = (coTalkPart?.sourceMaterial && coTalkPart.sourceMaterial !== "Discurso de Serviço")
                        ? coTalkPart.sourceMaterial
                        : (coTalkPart?.title && coTalkPart.title !== "Discurso de Serviço")
                            ? coTalkPart.title
                            : undefined;

                    let partNumber = 1;

                    return (
                        <View key={schedule.id} style={styles1.weekCard} wrap={false}>
                            {/* Cabeçalho da Semana */}
                            <View style={styles1.weekMainHeader}>
                                <View style={styles1.weekTitleLeftBox}>
                                    <Text style={styles1.weekTitleLeft}>
                                        {weekRangeFormatted} {schedule.weeklyBibleReading ? `| ${schedule.weeklyBibleReading}` : ""}
                                    </Text>
                                </View>
                                <View style={styles1.weekChairmanBox}>
                                    <Text style={styles1.weekHeaderLabel}>Presidente:</Text>
                                    <Text style={styles1.weekHeaderName}>{getDisplayName(schedule.chairman)}</Text>
                                </View>
                            </View>

                            {/* Cântico Inicial e Comentários Iniciais */}
                            <View style={styles1.songRow}>
                                <View style={styles1.songLeftBox}>
                                    <Text style={styles1.songTitle}>
                                        Cântico {schedule.songOpen || "—"}
                                    </Text>
                                </View>
                                <View style={styles1.colAssigneeContainer}>
                                    <View style={styles1.assigneeGridRowSingle}>
                                        <Text style={styles1.assigneeLabelCellSingle}>Oração:</Text>
                                        <Text style={styles1.assigneeNameCellSingle}>{getDisplayName(schedule.openingPrayer)}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles1.tableRow}>
                                <Text style={styles1.colTime}>1 min.</Text>
                                <Text style={styles1.colContent}>• Comentários iniciais</Text>
                                <View style={styles1.colAssigneeContainer}>
                                    <Text style={styles1.assigneeSingleName}>Presidente</Text>
                                </View>
                            </View>

                            {/* TESOUROS DA PALAVRA DE DEUS */}
                            <View style={[styles1.sectionBanner, styles1.treasuresBanner]}>
                                <Text>Tesouros da Palavra de Deus</Text>
                            </View>

                            {treasuresMainParts.map((part) => {
                                const currentNum = partNumber++;
                                const isBibleReading = part.partType === MidweekPartType.BIBLE_READING;
                                const lessonInfo = isBibleReading ? getLessonDetails(part.brochure, part.lessonNumber, part.studyPoint, part.studyPointDescription) : null;

                                return (
                                    <View key={part.id} style={styles1.tableRow}>
                                        <Text style={styles1.colTime}>{part.timeMinutes} min.</Text>
                                        <Text style={styles1.colContent}>
                                            <Text style={styles1.titleBold}>{currentNum}. {part.title} </Text>
                                            {part.sourceMaterial && !isBibleReading && (
                                                <Text style={styles1.lessonBadge}>{part.sourceMaterial} </Text>
                                            )}
                                            {part.method && (
                                                <Text style={styles1.methodItalic}>{part.method} </Text>
                                            )}
                                            {isBibleReading && part.sourceMaterial && (
                                                <Text style={styles1.titleBold}>{part.sourceMaterial} </Text>
                                            )}
                                            {lessonInfo && (
                                                <Text style={styles1.lessonBadge}>({lessonInfo.formattedText})</Text>
                                            )}
                                        </Text>

                                        <View style={styles1.colAssigneeContainer}>
                                            {isBibleReading ? (
                                                hasAuxRoom ? (
                                                    <View style={styles1.assigneeGridRowDual}>
                                                        <Text style={styles1.assigneeLabelCellDual}>Estudante:</Text>
                                                        <Text style={styles1.assigneeMainCellDual}>{getDisplayName(part.assignedPublisher)}</Text>
                                                        <Text style={styles1.assigneeAuxCellDual}>{getDisplayName(auxBibleReadingPart?.assignedPublisher)}</Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles1.assigneeGridRowSingle}>
                                                        <Text style={styles1.assigneeLabelCellSingle}>Estudante:</Text>
                                                        <Text style={styles1.assigneeNameCellSingle}>{getDisplayName(part.assignedPublisher)}</Text>
                                                    </View>
                                                )
                                            ) : (
                                                <Text style={styles1.assigneeSingleName}>{getDisplayName(part.assignedPublisher)}</Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}

                            {/* FAÇA SEU MELHOR NO MINISTÉRIO */}
                            <View style={[styles1.sectionBanner, styles1.ministryBanner]}>
                                <Text>Faça Seu Melhor no Ministério</Text>
                            </View>

                            {ministryMainParts.map((part, index) => {
                                const currentNum = partNumber++;
                                const auxPart = ministryAuxParts[index];
                                const lessonInfo = getLessonDetails(part.brochure, part.lessonNumber, part.studyPoint, part.studyPointDescription);

                                return (
                                    <View key={part.id} style={styles1.tableRow}>
                                        <Text style={styles1.colTime}>{part.timeMinutes} min.</Text>
                                        <Text style={styles1.colContent}>
                                            <Text style={styles1.titleBold}>{currentNum}. {part.title}</Text>
                                            {part.sourceMaterial && (
                                                <Text style={styles1.titleBold}> {part.sourceMaterial}</Text>
                                            )}
                                            {part.method && (
                                                <Text style={styles1.methodItalic}> {part.method}</Text>
                                            )}
                                            {lessonInfo && (
                                                <Text style={styles1.lessonBadge}> ({lessonInfo.formattedText})</Text>
                                            )}
                                        </Text>

                                        <View style={styles1.colAssigneeContainer}>
                                            {part.partType === MidweekPartType.WHAT_WOULD_YOU_SAY ? (
                                                <Text style={styles1.assigneeSingleName}>{getDisplayName(part.assignedPublisher)}</Text>
                                            ) : hasAuxRoom ? (
                                                <>
                                                    <View style={styles1.assigneeGridRowDual}>
                                                        <Text style={styles1.assigneeLabelCellDual}>Estudante:</Text>
                                                        <Text style={styles1.assigneeMainCellDual}>{getDisplayName(part.assignedPublisher)}</Text>
                                                        <Text style={styles1.assigneeAuxCellDual}>{getDisplayName(auxPart?.assignedPublisher)}</Text>
                                                    </View>
                                                    {part.requiresAssistant && (
                                                        <View style={[styles1.assigneeGridRowDual, { marginTop: 2 }]}>
                                                            <Text style={styles1.assigneeLabelCellDual}>Ajudante:</Text>
                                                            <Text style={styles1.assigneeMainCellDual}>{getDisplayName(part.assistantPublisher)}</Text>
                                                            <Text style={styles1.assigneeAuxCellDual}>{getDisplayName(auxPart?.assistantPublisher)}</Text>
                                                        </View>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <View style={styles1.assigneeGridRowSingle}>
                                                        <Text style={styles1.assigneeLabelCellSingle}>Estudante:</Text>
                                                        <Text style={styles1.assigneeNameCellSingle}>{getDisplayName(part.assignedPublisher)}</Text>
                                                    </View>
                                                    {part.requiresAssistant && (
                                                        <View style={[styles1.assigneeGridRowSingle, { marginTop: 2 }]}>
                                                            <Text style={styles1.assigneeLabelCellSingle}>Ajudante:</Text>
                                                            <Text style={styles1.assigneeNameCellSingle}>{getDisplayName(part.assistantPublisher)}</Text>
                                                        </View>
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}

                            {/* NOSSA VIDA CRISTÃ */}
                            <View style={[styles1.sectionBanner, styles1.livingBanner]}>
                                <Text>Nossa Vida Cristã</Text>
                            </View>

                            <View style={styles1.songRow}>
                                <View style={styles1.songLeftBox}>
                                    <Text style={styles1.songTitle}>
                                        Cântico {schedule.songMiddle || "—"}
                                    </Text>
                                </View>
                                <View style={styles1.colAssigneeContainer} />
                            </View>

                            {livingParts.map((part) => {
                                const currentNum = partNumber++;
                                return (
                                    <View key={part.id} style={styles1.tableRow}>
                                        <Text style={styles1.colTime}>{part.timeMinutes} min.</Text>
                                        <Text style={styles1.colContent}>
                                            <Text style={styles1.titleBold}>{currentNum}. {part.title} </Text>
                                            {part.method && (
                                                <Text style={styles1.methodItalic}>{part.method}</Text>
                                            )}
                                        </Text>
                                        <View style={styles1.colAssigneeContainer}>
                                            <Text style={styles1.assigneeSingleName}>
                                                {part.custom_speaker_name || getDisplayName(part.assignedPublisher)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}

                            {isCoVisit ? (
                                <View style={styles1.tableRow}>
                                    <Text style={styles1.colTime}>30 min.</Text>
                                    <Text style={styles1.colContent}>
                                        <Text style={styles1.titleBold}>{partNumber++}. Discurso de Serviço </Text>
                                        {coTalkTheme ? (
                                            <Text style={styles1.titleBold}>• {coTalkTheme}</Text>
                                        ) : null}
                                    </Text>
                                    <View style={styles1.colAssigneeContainer}>
                                        <View style={styles1.assigneeGridRowSingle}>
                                            <Text style={styles1.assigneeLabelCellSingle}>Orador:</Text>
                                            <Text style={styles1.assigneeNameCellSingle}>
                                                {coTalkPart?.custom_speaker_name || "Superintendente de Circuito"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles1.tableRow}>
                                    <Text style={styles1.colTime}>30 min.</Text>
                                    <Text style={styles1.colContent}>
                                        <Text style={styles1.titleBold}>{partNumber++}. Estudo Bíblico de Congregação </Text>
                                        {cbsPart?.sourceMaterial && (
                                            <Text style={styles1.titleBold}>{cbsPart.sourceMaterial}</Text>
                                        )}
                                    </Text>
                                    <View style={styles1.colAssigneeContainer}>
                                        <View style={styles1.assigneeGridRowSingle}>
                                            <Text style={styles1.assigneeLabelCellSingle}>Dirigente:</Text>
                                            <Text style={styles1.assigneeNameCellSingle}>{getDisplayName(schedule.cbsConductor)}</Text>
                                        </View>
                                        <View style={[styles1.assigneeGridRowSingle, { marginTop: 2 }]}>
                                            <Text style={styles1.assigneeLabelCellSingle}>Leitor:</Text>
                                            <Text style={styles1.assigneeNameCellSingle}>{getDisplayName(schedule.cbsReader)}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <View style={styles1.tableRow}>
                                <Text style={styles1.colTime}>3 min.</Text>
                                <Text style={styles1.colContent}>• Comentários finais</Text>
                                <View style={styles1.colAssigneeContainer}>
                                    <Text style={styles1.assigneeSingleName}>Presidente</Text>
                                </View>
                            </View>

                            <View style={styles1.songRow}>
                                <View style={styles1.songLeftBox}>
                                    <Text style={styles1.songTitle}>
                                        Cântico {schedule.songEnd || "—"}
                                    </Text>
                                </View>
                                <View style={styles1.colAssigneeContainer}>
                                    <View style={styles1.assigneeGridRowSingle}>
                                        <Text style={styles1.assigneeLabelCellSingle}>Oração:</Text>
                                        <Text style={styles1.assigneeNameCellSingle}>{getDisplayName(schedule.closingPrayer)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
};

// ==========================================
// DOCUMENTO: MODELO 2 (Modelo S-140 / Clean)
// ==========================================
const MidweekModel2Document: React.FC<{
    schedules: IMidweekSchedule[];
    year: number;
    month: number;
    congregationName?: string;
}> = ({ schedules, year, month, congregationName }) => {
    return (
        <Document>
            <Page size="A4" style={styles2.page}>
                <View style={styles2.docHeader} fixed>
                    <View style={styles2.docHeaderTop}>
                        <Text style={styles2.congregationName}>
                            {congregationName || "CONGREGAÇÃO"}
                        </Text>
                        <Text style={styles2.mainTitle}>
                            Programação da reunião do meio de semana
                        </Text>
                    </View>
                    <View style={styles2.headerLineThick} />
                    <View style={styles2.headerLineThin} />
                </View>

                {schedules.map((schedule) => {
                    const weekDateObj = dayjs(schedule.weekDate);
                    const weekStart = weekDateObj.format("D");
                    const weekEnd = weekDateObj.add(6, "day").format("D [DE] MMMM");
                    const weekRangeFormatted = `${weekStart}-${weekEnd}`.toUpperCase();

                    const isNoMeeting = schedule.isSpecial && (
                        schedule.specialType === MidweekSpecialType.CIRCUIT_ASSEMBLY ||
                        schedule.specialType === MidweekSpecialType.REGIONAL_CONVENTION ||
                        schedule.specialType === MidweekSpecialType.MEMORIAL
                    );

                    if (isNoMeeting) {
                        return (
                            <View key={schedule.id} style={styles2.weekBlock} wrap={false}>
                                <View style={styles2.weekHeaderRow}>
                                    <Text style={styles2.weekTitle}>{weekRangeFormatted}</Text>
                                    <Text style={{ fontSize: 7.5, fontWeight: "bold", color: "#6B7280" }}>Semana Especial</Text>
                                </View>
                                <View style={{ padding: 8, backgroundColor: "#FEF3C7", borderRadius: 2 }}>
                                    <Text style={{ fontSize: 8.5, fontWeight: "bold", color: "#92400E" }}>
                                        {schedule.specialName || "Semana de Evento Especial"}
                                    </Text>
                                    <Text style={{ fontSize: 7, color: "#B45309", marginTop: 2 }}>
                                        Não haverá reunião de meio de semana no Salão do Reino.
                                    </Text>
                                </View>
                            </View>
                        );
                    }

                    const treasuresParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.TREASURES && p.isActive && p.room === MidweekRoom.MAIN)
                        .sort((a, b) => {
                            const typeOrder: Record<string, number> = {
                                [MidweekPartType.TALK]: 1,
                                [MidweekPartType.GEMS]: 2,
                                [MidweekPartType.BIBLE_READING]: 3
                            };
                            return (typeOrder[a.partType] ?? 99) - (typeOrder[b.partType] ?? 99);
                        }) || [];

                    const auxBibleReadingPart = schedule.parts?.find(
                        p => p.section === MidweekSection.TREASURES && p.partType === MidweekPartType.BIBLE_READING && p.room === MidweekRoom.AUXILIARY_1 && p.isActive
                    );

                    const sortMinistryParts2 = (a: any, b: any) => {
                        if (a.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && b.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return 1;
                        if (b.partType === MidweekPartType.WHAT_WOULD_YOU_SAY && a.partType !== MidweekPartType.WHAT_WOULD_YOU_SAY) return -1;
                        return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
                    };

                    const ministryMainParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.MINISTRY && p.isActive && p.room === MidweekRoom.MAIN)
                        .sort(sortMinistryParts2) || [];

                    const ministryAuxParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.MINISTRY && p.isActive && p.room === MidweekRoom.AUXILIARY_1)
                        .sort(sortMinistryParts2) || [];

                    const hasAuxRoom = ministryAuxParts.length > 0 || !!auxBibleReadingPart;

                    const livingParts = schedule.parts
                        ?.filter(p => p.section === MidweekSection.LIVING && p.isActive && p.partType !== MidweekPartType.CBS && !p.custom_speaker_name)
                        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)) || [];

                    const cbsPart = schedule.parts?.find(p => p.section === MidweekSection.LIVING && p.partType === MidweekPartType.CBS && p.isActive);
                    const coTalkPart = schedule.parts?.find(p => p.section === MidweekSection.LIVING && p.isActive && p.custom_speaker_name);
                    const isCoVisit = schedule.isSpecial && schedule.specialType === MidweekSpecialType.CIRCUIT_OVERSEER_VISIT;

                    const coTalkTheme = (coTalkPart?.sourceMaterial && coTalkPart.sourceMaterial !== "Discurso de Serviço")
                        ? coTalkPart.sourceMaterial
                        : (coTalkPart?.title && coTalkPart.title !== "Discurso de Serviço")
                            ? coTalkPart.title
                            : undefined;

                    let partNum = 1;

                    return (
                        <View key={schedule.id} style={styles2.weekBlock} wrap={false}>
                            {/* Cabeçalho da Semana */}
                            <View style={styles2.weekHeaderRow}>
                                <Text style={styles2.weekTitle}>
                                    {weekRangeFormatted} | {schedule.weeklyBibleReading || "LEITURA SEMANAL DA BÍBLIA"}
                                </Text>
                                <View style={styles2.weekRolesColumn}>
                                    <View style={styles2.roleRow}>
                                        <Text style={styles2.roleLabel}>Presidente:</Text>
                                        <Text style={styles2.roleValue}>{getDisplayName(schedule.chairman)}</Text>
                                    </View>
                                    {hasAuxRoom && (
                                        <View style={styles2.roleRow}>
                                            <Text style={styles2.roleLabel}>Conselheiro da sala B:</Text>
                                            <Text style={styles2.roleValue}>{getDisplayName(schedule.auxCounselor1)}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Início */}
                            <View style={styles2.cleanRow}>
                                <Text style={styles2.colTime}></Text>
                                <Text style={styles2.colContent}>• Cântico {schedule.songOpen || "—"}</Text>
                                <Text style={styles2.colLabelTag}>Oração:</Text>
                                <Text style={styles2.colSingleName}>{getDisplayName(schedule.openingPrayer)}</Text>
                            </View>
                            <View style={styles2.cleanRow}>
                                <Text style={styles2.colTime}></Text>
                                <Text style={styles2.colContent}>• Comentários iniciais (1 min)</Text>
                            </View>

                            {/* Seção: TESOUROS DA PALAVRA DE DEUS */}
                            <View style={[styles2.sectionBanner, styles2.bannerTreasures]}>
                                <Text>TESOUROS DA PALAVRA DE DEUS</Text>
                            </View>
                            <View style={styles2.tableHeaderRow}>
                                <View style={styles2.headerSpaceLeft} />
                                {hasAuxRoom && <Text style={styles2.headerColAux}>Salão principal</Text>}
                                <Text style={hasAuxRoom ? styles2.headerColMain : [styles2.headerColMain, { width: "48%" }]}>
                                    {hasAuxRoom ? "Sala B" : "Salão principal"}
                                </Text>
                            </View>

                            {treasuresParts.map((part) => {
                                const currentNumber = partNum++;
                                const isBibleReading = part.partType === MidweekPartType.BIBLE_READING;

                                return (
                                    <View key={part.id} style={styles2.cleanRow}>
                                        <Text style={styles2.colTime}></Text>
                                        <Text style={styles2.colContent}>
                                            {currentNumber}. {part.title} ({part.timeMinutes} min)
                                        </Text>
                                        {isBibleReading ? (
                                            <>
                                                <Text style={styles2.colLabelTag}>Estudante:</Text>
                                                <Text style={hasAuxRoom ? styles2.colAuxRoom : styles2.colSingleName}>
                                                    {getDisplayName(part.assignedPublisher)}
                                                </Text>
                                                {hasAuxRoom && (
                                                    <Text style={styles2.colMainRoom}>
                                                        {getDisplayName(auxBibleReadingPart?.assignedPublisher)}
                                                    </Text>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Text style={styles2.colLabelTag} />
                                                <Text style={hasAuxRoom ? styles2.colAuxRoom : styles2.colSingleName}>
                                                    {getDisplayName(part.assignedPublisher)}
                                                </Text>
                                                {hasAuxRoom && <Text style={styles2.colMainRoom} />}
                                            </>
                                        )}
                                    </View>
                                );
                            })}

                            {/* Seção: FAÇA SEU MELHOR NO MINISTÉRIO */}
                            <View style={[styles2.sectionBanner, styles2.bannerMinistry]}>
                                <Text>FAÇA SEU MELHOR NO MINISTÉRIO</Text>
                            </View>
                            <View style={styles2.tableHeaderRow}>
                                <View style={styles2.headerSpaceLeft} />
                                {hasAuxRoom && <Text style={styles2.headerColAux}>Salão principal</Text>}
                                <Text style={hasAuxRoom ? styles2.headerColMain : [styles2.headerColMain, { width: "48%" }]}>
                                    {hasAuxRoom ? "Sala B" : "Salão principal"}
                                </Text>
                            </View>

                            {ministryMainParts.map((part, index) => {
                                const currentNumber = partNum++;
                                const isWWYS = part.partType === MidweekPartType.WHAT_WOULD_YOU_SAY;
                                const auxPart = ministryAuxParts[index];

                                const mainStudent = getDisplayName(part.assignedPublisher);
                                const mainAssistant = part.requiresAssistant ? getDisplayName(part.assistantPublisher) : null;
                                const mainText = mainAssistant ? `${mainStudent} / ${mainAssistant}` : mainStudent;

                                const auxStudent = auxPart ? getDisplayName(auxPart.assignedPublisher) : "—";
                                const auxAssistant = auxPart && auxPart.requiresAssistant ? getDisplayName(auxPart.assistantPublisher) : null;
                                const auxText = auxAssistant ? `${auxStudent} / ${auxAssistant}` : auxStudent;

                                return (
                                    <View key={part.id} style={styles2.cleanRow}>
                                        <Text style={styles2.colTime}></Text>
                                        <Text style={styles2.colContent}>
                                            {currentNumber}. {part.title} ({part.timeMinutes} min)
                                        </Text>
                                        <Text style={styles2.colLabelTag}>{isWWYS ? "" : "Estudante/ajudante:"}</Text>
                                        <Text style={hasAuxRoom ? (isWWYS ? styles2.colSingleName : styles2.colAuxRoom) : styles2.colSingleName}>
                                            {mainText}
                                        </Text>
                                        {hasAuxRoom && !isWWYS && (
                                            <Text style={styles2.colMainRoom}>{auxText}</Text>
                                        )}
                                        {hasAuxRoom && isWWYS && (
                                            <Text style={styles2.colMainRoom} />
                                        )}
                                    </View>
                                );
                            })}

                            {/* Seção: NOSSA VIDA CRISTÃ */}
                            <View style={[styles2.sectionBanner, styles2.bannerLiving]}>
                                <Text>NOSSA VIDA CRISTÃ</Text>
                            </View>

                            <View style={styles2.cleanRow}>
                                <Text style={styles2.colTime}></Text>
                                <Text style={styles2.colContent}>• Cântico {schedule.songMiddle || "—"}</Text>
                            </View>

                            {livingParts.map((part) => {
                                const currentNumber = partNum++;
                                return (
                                    <View key={part.id} style={styles2.cleanRow}>
                                        <Text style={styles2.colTime}></Text>
                                        <Text style={styles2.colContent}>
                                            {currentNumber}. {part.title} ({part.timeMinutes} min)
                                        </Text>
                                        <Text style={styles2.colLabelTag} />
                                        <Text style={hasAuxRoom ? styles2.colAuxRoom : styles2.colSingleName}>
                                            {part.custom_speaker_name || getDisplayName(part.assignedPublisher)}
                                        </Text>
                                        {hasAuxRoom && <Text style={styles2.colMainRoom} />}
                                    </View>
                                );
                            })}

                            {isCoVisit ? (
                                <View style={styles2.cleanRow}>
                                    <Text style={styles2.colTime}></Text>
                                    <Text style={styles2.colContent}>
                                        {partNum++}. Discurso de Serviço (30 min){coTalkTheme ? ` • ${coTalkTheme}` : ""}
                                    </Text>
                                    <Text style={styles2.colLabelTag}>Orador:</Text>
                                    <Text style={hasAuxRoom ? styles2.colAuxRoom : styles2.colSingleName}>
                                        {coTalkPart?.custom_speaker_name || "Superintendente de Circuito"}
                                    </Text>
                                    {hasAuxRoom && <Text style={styles2.colMainRoom} />}
                                </View>
                            ) : (
                                <View style={styles2.cleanRow}>
                                    <Text style={styles2.colTime}></Text>
                                    <Text style={styles2.colContent}>
                                        {partNum++}. Estudo bíblico de congregação (30 min)
                                    </Text>
                                    <Text style={styles2.colLabelTag}>Dirigente/leitor:</Text>
                                    <Text style={hasAuxRoom ? styles2.colAuxRoom : styles2.colSingleName}>
                                        {getDisplayName(schedule.cbsConductor)} / {getDisplayName(schedule.cbsReader)}
                                    </Text>
                                    {hasAuxRoom && <Text style={styles2.colMainRoom} />}
                                </View>
                            )}

                            <View style={styles2.cleanRow}>
                                <Text style={styles2.colTime}></Text>
                                <Text style={styles2.colContent}>• Comentários finais (3 min)</Text>
                            </View>

                            <View style={styles2.cleanRow}>
                                <Text style={styles2.colTime}></Text>
                                <Text style={styles2.colContent}>• Cântico {schedule.songEnd || "—"}</Text>
                                <Text style={styles2.colLabelTag}>Oração:</Text>
                                <Text style={hasAuxRoom ? styles2.colAuxRoom : styles2.colSingleName}>
                                    {getDisplayName(schedule.closingPrayer)}
                                </Text>
                                {hasAuxRoom && <Text style={styles2.colMainRoom} />}
                            </View>
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
};

// ==========================================
// MODAL COM SELETOR DE MODELOS (1 e 2)
// ==========================================
export const MidweekMonthSchedulePdfModal: React.FC<{
    open: boolean;
    onClose: () => void;
    schedules: IMidweekSchedule[];
    year: number;
    month: number;
    congregationName?: string;
}> = ({ open, onClose, schedules, year, month, congregationName }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<"table" | "s140">("table");

    const currentDoc = selectedTemplate === "table" ? (
        <MidweekModel1Document schedules={schedules} year={year} month={month} />
    ) : (
        <MidweekModel2Document schedules={schedules} year={year} month={month} congregationName={congregationName} />
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] h-[92vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-5">
                <DialogHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-300 gap-3">
                    <div className="flex items-center gap-2">
                        <Printer className="h-5 w-5 text-primary-200" />
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-bold text-typography-900">
                                Programação do Mês para o Quadro de Avisos (PDF)
                            </DialogTitle>
                            <span className="text-xs text-typography-500">
                                {MONTH_NAMES[month - 1]} de {year}
                            </span>
                        </div>
                    </div>

                    {/* Seletor de Modelo de Layout */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-surface-200 p-1 rounded-lg border border-surface-300">
                            <button
                                type="button"
                                onClick={() => setSelectedTemplate("table")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                    selectedTemplate === "table"
                                        ? "bg-surface-100 text-typography-900 shadow-sm"
                                        : "text-typography-500 hover:text-typography-900"
                                }`}
                            >
                                <LayoutTemplate className="h-3.5 w-3.5" />
                                <span>Modelo Grade</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedTemplate("s140")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                    selectedTemplate === "s140"
                                        ? "bg-surface-100 text-typography-900 shadow-sm"
                                        : "text-typography-500 hover:text-typography-900"
                                }`}
                            >
                                <Columns className="h-3.5 w-3.5" />
                                <span>Modelo S-140</span>
                            </button>
                        </div>

                        <PDFDownloadLink
                            document={currentDoc}
                            fileName={`Programacao_Meio_de_Semana_${MONTH_NAMES[month - 1]}_${year}_${selectedTemplate}.pdf`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-200 hover:opacity-90 text-white font-semibold text-xs shadow-sm cursor-pointer"
                        >
                            <Download className="h-4 w-4" />
                            <span>Baixar PDF</span>
                        </PDFDownloadLink>
                    </div>
                </DialogHeader>

                <div className="flex-1 w-full mt-3 rounded-xl overflow-hidden border border-surface-300 bg-surface-200">
                    <PDFViewer width="100%" height="100%" showToolbar={true}>
                        {currentDoc}
                    </PDFViewer>
                </div>
            </DialogContent>
        </Dialog>
    );
};
