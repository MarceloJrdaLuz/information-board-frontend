import React, { useState } from "react";
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { IMidweekSchedule, MidweekRoom, MidweekSection, MidweekPartType, IPublisherMini } from "@/types/midweek";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { FileText, Download, Calendar, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { getLessonDetails } from "@/utils/midweekLessons";

dayjs.locale("pt-br");

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const getDisplayName = (pub?: IPublisherMini | null): string => {
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

export const MidweekS89PdfDocument: React.FC<{ schedules?: IMidweekSchedule[] }> = ({ schedules = [] }) => {
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
        const meetingDateFormatted = dayjs(schedule.meetingDate || schedule.weekDate).format("DD/MM/YYYY");

        const allMainTreasures = (schedule.parts || [])
            .filter(p => p.section === MidweekSection.TREASURES && p.room === MidweekRoom.MAIN && p.isActive !== false)
            .sort((a, b) => (typeOrder[a.partType] ?? 99) - (typeOrder[b.partType] ?? 99));

        const allMainMinistry = (schedule.parts || [])
            .filter(p => p.section === MidweekSection.MINISTRY && p.room === MidweekRoom.MAIN && p.isActive !== false)
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

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
        const studentParts = (schedule.parts || []).filter(p => {
            const isMinistry = p.section === MidweekSection.MINISTRY;
            const isBibleReading = p.partType === MidweekPartType.BIBLE_READING;
            const isActive = p.isActive !== false;
            return (isMinistry || isBibleReading) && isActive;
        }).sort((a, b) => {
            if (a.room !== b.room) {
                const roomOrder = { [MidweekRoom.MAIN]: 1, [MidweekRoom.AUXILIARY_1]: 2, [MidweekRoom.AUXILIARY_2]: 3 };
                return (roomOrder[a.room] ?? 99) - (roomOrder[b.room] ?? 99);
            }
            if (a.section !== b.section) {
                return a.section === MidweekSection.TREASURES ? -1 : 1;
            }
            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        });

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
                                                {getDisplayName(part.assignedPublisher)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Ajudante */}
                                    <View style={styles.fieldRow}>
                                        <Text style={styles.fieldLabel}>Ajudante:</Text>
                                        <View style={styles.dottedLine}>
                                            <Text style={styles.fieldValueText}>
                                                {part.requiresAssistant ? getDisplayName(part.assistantPublisher) : ""}
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
}> = ({ open, onClose, schedules = [], schedule, selectedScheduleId, year, month }) => {
    // Array seguro com todas as semanas disponíveis
    const list = schedules && schedules.length > 0
        ? schedules
        : schedule
            ? [schedule]
            : [];

    // "all" = Mês Inteiro, ou o ID da semana
    const [selectedScope, setSelectedScope] = useState<string>("all");

    const filteredSchedules = selectedScope === "all"
        ? list
        : list.filter(s => s.id === selectedScope);

    const isAll = selectedScope === "all";
    const currentYear = year || (list[0] ? dayjs(list[0].weekDate).year() : new Date().getFullYear());
    const currentMonth = month || (list[0] ? dayjs(list[0].weekDate).month() + 1 : new Date().getMonth() + 1);

    const currentDoc = <MidweekS89PdfDocument schedules={filteredSchedules} />;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] h-[92vh] flex flex-col bg-surface-100 border border-surface-300 p-4 sm:p-5">
                <DialogHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-300 gap-3">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary-200" />
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-bold text-typography-900">
                                Folhetos de Designação S-89 (PDF)
                            </DialogTitle>
                            <span className="text-xs text-typography-500">
                                {MONTH_NAMES[currentMonth - 1]} de {currentYear} • {filteredSchedules.length} semana(s) selecionada(s)
                            </span>
                        </div>
                    </div>

                    {/* Seletor de Escopo: Mês Inteiro vs Semana Específica */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center bg-surface-200 p-1 rounded-lg border border-surface-300">
                            <button
                                type="button"
                                onClick={() => setSelectedScope("all")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                    isAll
                                        ? "bg-surface-100 text-typography-900 shadow-sm"
                                        : "text-typography-500 hover:text-typography-900"
                                }`}
                            >
                                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                <span>Mês Inteiro ({list.length} semanas)</span>
                            </button>

                            {list.map(s => {
                                const weekFormatted = dayjs(s.meetingDate || s.weekDate).format("DD/MM");
                                const isSelected = selectedScope === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setSelectedScope(s.id)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all ${
                                            isSelected
                                                ? "bg-surface-100 text-typography-900 shadow-sm"
                                                : "text-typography-500 hover:text-typography-900"
                                        }`}
                                    >
                                        <Calendar className="h-3 w-3" />
                                        <span>Semana {weekFormatted}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <PDFDownloadLink
                            document={currentDoc}
                            fileName={
                                isAll
                                    ? `S89_Mes_${MONTH_NAMES[currentMonth - 1]}_${currentYear}.pdf`
                                    : `S89_Semana_${dayjs(filteredSchedules[0]?.meetingDate || filteredSchedules[0]?.weekDate).format("DD-MM-YYYY")}.pdf`
                            }
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
