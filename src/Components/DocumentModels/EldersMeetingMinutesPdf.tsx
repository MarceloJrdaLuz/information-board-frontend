import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { IEldersMeetingAgendaData } from "@/types/documentModels";

interface Props {
    data: IEldersMeetingAgendaData;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 36,
        paddingHorizontal: 38,
        fontFamily: "Helvetica",
        fontSize: 9.5,
        color: "#0F172A",
        lineHeight: 1.4,
    },
    headerContainer: {
        textAlign: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#1E3A5F",
        paddingBottom: 8,
        marginBottom: 10,
    },
    subHeader: {
        fontFamily: "Helvetica-Bold",
        fontSize: 7.5,
        color: "#1E3A5F",
        textTransform: "uppercase",
        letterSpacing: 1,
        textAlign: "center",
        marginBottom: 2,
    },
    title: {
        fontFamily: "Helvetica-Bold",
        fontSize: 13,
        textAlign: "center",
        color: "#0F2942",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    metaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 4,
        padding: 8,
        marginBottom: 10,
    },
    metaCol: {
        width: "50%",
        flexDirection: "row",
        alignItems: "baseline",
        paddingVertical: 2.5,
        paddingHorizontal: 4,
    },
    metaLabel: {
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
        color: "#1E3A5F",
        marginRight: 4,
    },
    metaValue: {
        flex: 1,
        fontSize: 9,
        color: "#1E293B",
        borderBottomWidth: 0.8,
        borderBottomColor: "#CBD5E1",
        minHeight: 12,
        paddingBottom: 1,
    },
    preamble: {
        fontSize: 8.5,
        color: "#334155",
        textAlign: "justify",
        marginBottom: 10,
        lineHeight: 1.4,
    },
    sectionContainer: {
        marginBottom: 12,
    },
    sectionHeader: {
        borderLeftWidth: 3,
        borderLeftColor: "#1E3A5F",
        paddingLeft: 6,
        marginBottom: 6,
    },
    sectionTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 10,
        color: "#0F2942",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    table: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 3,
        overflow: "hidden",
    },
    tableHeaderRow: {
        flexDirection: "row",
        backgroundColor: "#1E3A5F",
        paddingVertical: 4.5,
        paddingHorizontal: 4,
    },
    tableHeaderSubRow: {
        flexDirection: "row",
        backgroundColor: "#E2E8F0",
        paddingVertical: 3.5,
        paddingHorizontal: 4,
    },
    thText: {
        fontFamily: "Helvetica-Bold",
        fontSize: 8,
        color: "#FFFFFF",
        textTransform: "uppercase",
    },
    thSubText: {
        fontFamily: "Helvetica-Bold",
        fontSize: 7.5,
        color: "#334155",
        textTransform: "uppercase",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 0.8,
        borderBottomColor: "#E2E8F0",
        paddingVertical: 5,
        paddingHorizontal: 4,
    },
    tableRowEven: {
        backgroundColor: "#F8FAFC",
    },
    tdNum: {
        width: "6%",
        fontFamily: "Helvetica-Bold",
        fontSize: 8.5,
        color: "#64748B",
        textAlign: "center",
    },
    tdSubjectCol: {
        width: "42%",
        paddingRight: 6,
    },
    tdDecisionCol: {
        width: "52%",
        paddingRight: 4,
    },
    subjectTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
        color: "#0F172A",
        textTransform: "uppercase",
    },
    refText: {
        fontSize: 8,
        color: "#475569",
        marginTop: 1.5,
    },
    decisionText: {
        fontSize: 8.5,
        color: "#0F172A",
        lineHeight: 1.35,
    },
    pendingDecisionText: {
        fontSize: 8,
        fontFamily: "Helvetica-Oblique",
        color: "#94A3B8",
    },
    subSectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#F1F5F9",
        borderBottomWidth: 1.5,
        borderBottomColor: "#1E3A5F",
        paddingHorizontal: 6,
        paddingVertical: 2.5,
        marginTop: 6,
        marginBottom: 3,
    },
    subSectionTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 8.5,
        color: "#1E3A5F",
    },
    signaturesContainer: {
        marginTop: 20,
        paddingTop: 10,
    },
    signaturesGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
    },
    signatureBlock: {
        width: "42%",
        alignItems: "center",
        textAlign: "center",
    },
    signatureName: {
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
        color: "#0F172A",
        marginBottom: 3,
        minHeight: 12,
        textAlign: "center",
    },
    signatureLine: {
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#0F172A",
        marginBottom: 3,
    },
    signatureRole: {
        fontSize: 8,
        color: "#475569",
        textAlign: "center",
    },
    pageFooter: {
        marginTop: 14,
        paddingTop: 6,
        borderTopWidth: 0.8,
        borderTopColor: "#E2E8F0",
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 7.5,
        color: "#94A3B8",
    },
});

export default function EldersMeetingMinutesPdf({ data }: Props) {
    const hasElderRecs = (data.elderRecommendations || []).length > 0;
    const hasServantRecs = (data.servantRecommendations || []).length > 0;
    const hasRemovals = (data.removals || []).length > 0;
    const hasAnyRecs = hasElderRecs || hasServantRecs || hasRemovals;

    const validTopics = (data.topics || []).filter(
        t => t.subject?.trim() || t.decision?.trim() || t.reference?.trim()
    );
    const topicsToRender = validTopics.length > 0 ? validTopics : (data.topics || []);

    return (
        <Document title="Ata da Reunião do Corpo de Anciãos">
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.headerContainer}>
                    <Text style={styles.subHeader}>Documento Confidencial do Corpo de Anciãos</Text>
                    <Text style={styles.title}>Ata da Reunião do Corpo de Anciãos</Text>
                </View>

                {/* Grade Meta */}
                <View style={styles.metaGrid}>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Congregação:</Text>
                        <Text style={styles.metaValue}>{data.congregationName || ""}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Oração inicial:</Text>
                        <Text style={styles.metaValue}>{data.openingPrayer || ""}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Local / Data:</Text>
                        <Text style={styles.metaValue}>{data.locationAndDate || ""}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Oração final:</Text>
                        <Text style={styles.metaValue}>{data.closingPrayer || ""}</Text>
                    </View>
                </View>

                {/* Preâmbulo */}
                <Text style={styles.preamble}>
                    O corpo de anciãos reuniu-se para orar e deliberar a respeito dos assuntos e necessidades da congregação. Abaixo estão formalmente registradas as resoluções, providências adotadas, designações e decisões tomadas:
                </Text>

                {/* Tabela de Decisões */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Deliberações e Decisões Tomadas</Text>
                    </View>

                    <View style={styles.table}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.thText, styles.tdNum]}>#</Text>
                            <Text style={[styles.thText, styles.tdSubjectCol]}>Assunto & Referência</Text>
                            <Text style={[styles.thText, styles.tdDecisionCol]}>Decisão Tomada, Responsável & Prazo</Text>
                        </View>

                        {topicsToRender.map((topic, idx) => {
                            const isEven = idx % 2 === 1;

                            return (
                                <View key={topic.id || idx} style={[styles.tableRow, isEven ? styles.tableRowEven : {}]} wrap={false}>
                                    <Text style={styles.tdNum}>{idx + 1}</Text>
                                    <View style={styles.tdSubjectCol}>
                                        <Text style={styles.subjectTitle}>
                                            {(topic.subject || "").toUpperCase()}
                                        </Text>
                                        {topic.reference?.trim() ? (
                                            <Text style={styles.refText}>Ref: {topic.reference}</Text>
                                        ) : null}
                                        {topic.duration?.trim() ? (
                                            <Text style={[styles.refText, { fontSize: 7, color: "#64748B" }]}>
                                                Tempo: {topic.duration}
                                            </Text>
                                        ) : null}
                                    </View>
                                    <View style={styles.tdDecisionCol}>
                                        {topic.decision?.trim() ? (
                                            <Text style={styles.decisionText}>{topic.decision}</Text>
                                        ) : (
                                            <Text style={styles.pendingDecisionText}>
                                                (Decisão pendente ou não preenchida)
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Recomendações e Remoções (se houver) */}
                {hasAnyRecs && (
                    <View style={styles.sectionContainer} wrap={false}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recomendações e Remoções Aprovadas</Text>
                        </View>

                        {hasElderRecs && (
                            <View style={{ marginBottom: 6 }} wrap={false}>
                                <View style={styles.subSectionHeader}>
                                    <Text style={styles.subSectionTitle}>Anciãos</Text>
                                    <Text style={[styles.subSectionTitle, { fontSize: 7.5, color: "#64748B" }]}>
                                        {data.elderRecommendations.length}{" "}
                                        {data.elderRecommendations.length === 1 ? "indicação" : "indicações"}
                                    </Text>
                                </View>
                                <View style={styles.table}>
                                    <View style={styles.tableHeaderSubRow}>
                                        <Text style={[styles.thSubText, { width: "6%", textAlign: "center" }]}>#</Text>
                                        <Text style={[styles.thSubText, { width: "54%" }]}>Nome</Text>
                                        <Text style={[styles.thSubText, { width: "40%" }]}>Decisão / Resolução</Text>
                                    </View>
                                    {data.elderRecommendations.map((rec, idx) => (
                                        <View key={rec.id || idx} style={styles.tableRow} wrap={false}>
                                            <Text style={styles.tdNum}>{idx + 1}</Text>
                                            <View style={{ width: "54%", paddingRight: 4 }}>
                                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>{rec.name}</Text>
                                                {rec.notes?.trim() ? (
                                                    <Text style={{ fontSize: 7.5, color: "#475569", marginTop: 1, fontFamily: "Helvetica-Oblique" }}>
                                                        {rec.notes}
                                                    </Text>
                                                ) : null}
                                            </View>
                                            <Text style={{ width: "40%", fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>
                                                {rec.decision || "Aprovado"}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasServantRecs && (
                            <View style={{ marginBottom: 6 }} wrap={false}>
                                <View style={styles.subSectionHeader}>
                                    <Text style={styles.subSectionTitle}>Servos Ministeriais</Text>
                                    <Text style={[styles.subSectionTitle, { fontSize: 7.5, color: "#64748B" }]}>
                                        {data.servantRecommendations.length}{" "}
                                        {data.servantRecommendations.length === 1 ? "indicação" : "indicações"}
                                    </Text>
                                </View>
                                <View style={styles.table}>
                                    <View style={styles.tableHeaderSubRow}>
                                        <Text style={[styles.thSubText, { width: "6%", textAlign: "center" }]}>#</Text>
                                        <Text style={[styles.thSubText, { width: "54%" }]}>Nome</Text>
                                        <Text style={[styles.thSubText, { width: "40%" }]}>Decisão / Resolução</Text>
                                    </View>
                                    {data.servantRecommendations.map((rec, idx) => (
                                        <View key={rec.id || idx} style={styles.tableRow} wrap={false}>
                                            <Text style={styles.tdNum}>{idx + 1}</Text>
                                            <View style={{ width: "54%", paddingRight: 4 }}>
                                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>{rec.name}</Text>
                                                {rec.notes?.trim() ? (
                                                    <Text style={{ fontSize: 7.5, color: "#475569", marginTop: 1, fontFamily: "Helvetica-Oblique" }}>
                                                        {rec.notes}
                                                    </Text>
                                                ) : null}
                                            </View>
                                            <Text style={{ width: "40%", fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>
                                                {rec.decision || "Aprovado"}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {hasRemovals && (
                            <View style={{ marginBottom: 6 }} wrap={false}>
                                <View style={styles.subSectionHeader}>
                                    <Text style={styles.subSectionTitle}>Remoções ou Renúncias</Text>
                                    <Text style={[styles.subSectionTitle, { fontSize: 7.5, color: "#64748B" }]}>
                                        {data.removals.length}{" "}
                                        {data.removals.length === 1 ? "registro" : "registros"}
                                    </Text>
                                </View>
                                <View style={styles.table}>
                                    <View style={styles.tableHeaderSubRow}>
                                        <Text style={[styles.thSubText, { width: "6%", textAlign: "center" }]}>#</Text>
                                        <Text style={[styles.thSubText, { width: "24%" }]}>Privilégio</Text>
                                        <Text style={[styles.thSubText, { width: "36%" }]}>Nome</Text>
                                        <Text style={[styles.thSubText, { width: "34%" }]}>Motivo / Resolução</Text>
                                    </View>
                                    {data.removals.map((rem, idx) => (
                                        <View key={rem.id || idx} style={styles.tableRow} wrap={false}>
                                            <Text style={styles.tdNum}>{idx + 1}</Text>
                                            <Text style={{ width: "24%", fontFamily: "Helvetica-Bold", fontSize: 8 }}>
                                                {rem.role === "servant" ? "Servo Ministerial" : "Ancião"}
                                            </Text>
                                            <Text style={{ width: "36%", fontSize: 8.5 }}>{rem.name}</Text>
                                            <Text style={{ width: "34%", fontSize: 8, color: "#334155" }}>{rem.reason}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Assinaturas da Ata */}
                <View style={styles.signaturesContainer} wrap={false}>
                    <View style={styles.signaturesGrid}>
                        <View style={styles.signatureBlock}>
                            <Text style={styles.signatureName}>{data.coordinatorName || " "}</Text>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureRole}>Coordenador do Corpo de Anciãos</Text>
                        </View>
                        <View style={styles.signatureBlock}>
                            <Text style={styles.signatureName}>{data.secretaryName || " "}</Text>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureRole}>Secretário da Congregação</Text>
                        </View>
                    </View>
                </View>

                {/* Rodapé */}
                <View style={styles.pageFooter} wrap={false}>
                    <Text>Ata da Reunião do Corpo de Anciãos — Arquivo Confidencial</Text>
                    <Text>Documento Oficial</Text>
                </View>
            </Page>
        </Document>
    );
}

