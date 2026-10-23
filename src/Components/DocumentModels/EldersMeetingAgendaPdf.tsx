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
        marginBottom: 12,
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
        marginBottom: 14,
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
        paddingVertical: 4,
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
    tdSubject: {
        width: "56%",
        paddingRight: 6,
    },
    tdReference: {
        width: "38%",
    },
    subjectTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
        color: "#0F172A",
        textTransform: "uppercase",
    },
    durationBadge: {
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        color: "#1E3A5F",
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
        alignSelf: "flex-start",
        marginTop: 2,
    },
    suggestedByTag: {
        fontSize: 7.5,
        color: "#475569",
        marginTop: 1.5,
    },
    excerptRow: {
        flexDirection: "row",
        borderBottomWidth: 0.8,
        borderBottomColor: "#E2E8F0",
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    excerptBox: {
        flex: 1,
        marginLeft: "6%",
        backgroundColor: "#F0F9FF",
        borderLeftWidth: 2.5,
        borderLeftColor: "#1E3A5F",
        borderWidth: 0.8,
        borderColor: "#BAE6FD",
        padding: 5,
        borderRadius: 2,
    },
    excerptLabel: {
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        color: "#0369A1",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    excerptText: {
        fontSize: 8,
        color: "#0F172A",
        lineHeight: 1.35,
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
    footerContainer: {
        marginTop: "auto",
        paddingTop: 12,
        borderTopWidth: 0.8,
        borderTopColor: "#CBD5E1",
        textAlign: "center",
    },
    footerText: {
        fontSize: 8.5,
        fontFamily: "Helvetica-Oblique",
        color: "#475569",
        textAlign: "center",
        lineHeight: 1.4,
    },
});

export default function EldersMeetingAgendaPdf({ data }: Props) {
    const hasElderRecs = (data.elderRecommendations || []).length > 0;
    const hasServantRecs = (data.servantRecommendations || []).length > 0;
    const hasRemovals = (data.removals || []).length > 0;
    const hasAnyRecs = hasElderRecs || hasServantRecs || hasRemovals;

    const validTopics = (data.topics || []).filter(
        t => t.subject?.trim() || t.reference?.trim() || t.referenceText?.trim()
    );
    const topicsToRender = validTopics.length > 0 ? validTopics : (data.topics || []);

    return (
        <Document title={data.documentTitle || "Pauta da Reunião do Corpo de Anciãos"}>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Pauta da Reunião do Corpo de Anciãos</Text>
                </View>

                {/* Grade 2x2 Meta */}
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

                {/* SEÇÃO 1: ASSUNTOS E NECESSIDADES */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Assuntos e necessidades da congregação</Text>
                    </View>

                    <View style={styles.table}>
                        {/* Header da Tabela */}
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.thText, styles.tdNum]}>#</Text>
                            <Text style={[styles.thText, styles.tdSubject]}>Assunto</Text>
                            <Text style={[styles.thText, styles.tdReference]}>Referência</Text>
                        </View>

                        {/* Linhas */}
                        {topicsToRender.map((topic, idx) => {
                            const isEven = idx % 2 === 1;
                            const hasExcerpt = Boolean(topic.referenceText && topic.referenceText.trim());

                            return (
                                <View key={topic.id || idx} wrap={false}>
                                    <View style={[styles.tableRow, isEven ? styles.tableRowEven : {}]}>
                                        <Text style={styles.tdNum}>{idx + 1}</Text>
                                        <View style={styles.tdSubject}>
                                            <Text style={styles.subjectTitle}>
                                                {(topic.subject || "").toUpperCase()}
                                            </Text>
                                            {topic.duration?.trim() ? (
                                                <Text style={styles.durationBadge}>
                                                    {topic.duration.trim()}
                                                </Text>
                                            ) : null}
                                            {topic.suggestedBy?.trim() ? (
                                                <Text style={styles.suggestedByTag}>
                                                    Indicado por: {topic.suggestedBy.trim()}
                                                </Text>
                                            ) : null}
                                        </View>
                                        <View style={styles.tdReference}>
                                            <Text>{topic.reference || ""}</Text>
                                            {topic.decision?.trim() ? (
                                                <View style={{ marginTop: 3, padding: 3, backgroundColor: "#ECFDF5", borderLeftWidth: 2, borderLeftColor: "#059669", borderRadius: 2 }}>
                                                    <Text style={{ fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#065F46", textTransform: "uppercase", marginBottom: 1 }}>
                                                        Decisão / Providências:
                                                    </Text>
                                                    <Text style={{ fontSize: 7.5, color: "#064E3B", lineHeight: 1.3 }}>
                                                        {topic.decision}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>

                                    {/* Trecho / Parágrafo se houver */}
                                    {hasExcerpt && (
                                        <View style={[styles.excerptRow, isEven ? styles.tableRowEven : {}]}>
                                            <View style={styles.excerptBox}>
                                                <Text style={styles.excerptLabel}>
                                                    Trecho da Referência / Publicação:
                                                </Text>
                                                <Text style={styles.excerptText}>
                                                    {topic.referenceText}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* SEÇÃO 2: RECOMENDAÇÕES E REMOÇÕES */}
                {hasAnyRecs && (
                    <View style={styles.sectionContainer} wrap={false}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recomendações e Remoções</Text>
                        </View>

                        {/* Anciãos */}
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
                                        <Text style={[styles.thSubText, { width: "58%" }]}>Nome</Text>
                                        <Text style={[styles.thSubText, { width: "36%" }]}>Decisão</Text>
                                    </View>
                                    {data.elderRecommendations.map((rec, idx) => (
                                        <View key={rec.id || idx} style={styles.tableRow} wrap={false}>
                                            <Text style={styles.tdNum}>{idx + 1}</Text>
                                            <View style={{ width: "58%", paddingRight: 4 }}>
                                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>
                                                    {rec.name}
                                                </Text>
                                                {(rec.birthDate || rec.baptismDate || rec.yearsAsServant) ? (
                                                    <Text style={{ fontSize: 7.5, color: "#64748B", marginTop: 1 }}>
                                                        {[
                                                            rec.birthDate ? `Nasc: ${rec.birthDate}` : null,
                                                            rec.baptismDate ? `Bat: ${rec.baptismDate}` : null,
                                                            rec.yearsAsServant ? `Servo: ${rec.yearsAsServant}` : null,
                                                        ].filter(Boolean).join("  •  ")}
                                                    </Text>
                                                ) : null}
                                                {rec.notes?.trim() ? (
                                                    <Text style={{ fontSize: 7.5, color: "#475569", marginTop: 1, fontFamily: "Helvetica-Oblique" }}>
                                                        {rec.notes}
                                                    </Text>
                                                ) : null}
                                            </View>
                                            <Text style={{ width: "36%", fontSize: 8.5 }}>{rec.decision || ""}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Servos Ministeriais */}
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
                                        <Text style={[styles.thSubText, { width: "58%" }]}>Nome</Text>
                                        <Text style={[styles.thSubText, { width: "36%" }]}>Decisão</Text>
                                    </View>
                                    {data.servantRecommendations.map((rec, idx) => (
                                        <View key={rec.id || idx} style={styles.tableRow} wrap={false}>
                                            <Text style={styles.tdNum}>{idx + 1}</Text>
                                            <View style={{ width: "58%", paddingRight: 4 }}>
                                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>
                                                    {rec.name}
                                                </Text>
                                                {(rec.birthDate || rec.baptismDate) ? (
                                                    <Text style={{ fontSize: 7.5, color: "#64748B", marginTop: 1 }}>
                                                        {[
                                                            rec.birthDate ? `Nasc: ${rec.birthDate}` : null,
                                                            rec.baptismDate ? `Bat: ${rec.baptismDate}` : null,
                                                        ].filter(Boolean).join("  •  ")}
                                                    </Text>
                                                ) : null}
                                                {rec.notes?.trim() ? (
                                                    <Text style={{ fontSize: 7.5, color: "#475569", marginTop: 1, fontFamily: "Helvetica-Oblique" }}>
                                                        {rec.notes}
                                                    </Text>
                                                ) : null}
                                            </View>
                                            <Text style={{ width: "36%", fontSize: 8.5 }}>{rec.decision || ""}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Remoções ou Renúncias */}
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
                                        <Text style={[styles.thSubText, { width: "34%" }]}>Motivo / Congregação</Text>
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

                {/* Rodapé com Lembrete Bíblico */}
                {data.footerNote ? (
                    <View style={styles.footerContainer} wrap={false}>
                        <Text style={styles.footerText}>{data.footerNote}</Text>
                    </View>
                ) : null}
            </Page>
        </Document>
    );
}

