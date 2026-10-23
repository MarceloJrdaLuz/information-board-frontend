import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { IExpenseForecastData } from "@/types/documentModels";
import { formatLongDate } from "@/utils/letterParser";

interface Props {
    data: IExpenseForecastData;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 54,
        paddingBottom: 48,
        paddingHorizontal: 56,
        fontFamily: "Helvetica",
        fontSize: 11,
        color: "#1A202C",
        lineHeight: 1.6,
    },
    title: {
        fontFamily: "Helvetica-Bold",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 35,
        color: "#111827",
    },
    congregationHeader: {
        fontSize: 11,
        marginBottom: 10,
        color: "#1F2937",
    },
    congregationName: {
        fontFamily: "Helvetica-Bold",
    },
    dividerLine: {
        borderBottomWidth: 0.8,
        borderBottomColor: "#D1D5DB",
        marginBottom: 24,
    },
    bodyParagraph: {
        fontSize: 11.5,
        textAlign: "justify",
        lineHeight: 1.8,
        marginBottom: 20,
    },
    bold: {
        fontFamily: "Helvetica-Bold",
    },
    additionalNotesContainer: {
        marginTop: 20,
        paddingTop: 12,
        borderTopWidth: 0.5,
        borderTopColor: "#E2E8F0",
    },
    additionalNotesText: {
        fontSize: 9.5,
        color: "#4A5568",
        fontStyle: "italic",
    },
    signaturesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 180,
        marginBottom: 20,
    },
    signatureBox: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 8,
    },
    signatureName: {
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
        textAlign: "center",
        color: "#1A202C",
        marginBottom: 5,
        minHeight: 14,
    },
    signatureLine: {
        borderTopWidth: 0.8,
        borderTopColor: "#1A202C",
        width: "88%",
        marginBottom: 5,
    },
    signatureRole: {
        fontSize: 8.5,
        textAlign: "center",
        color: "#4A5568",
    },
    footerContainer: {
        position: "absolute",
        bottom: 24,
        left: 56,
        right: 56,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 0.5,
        borderTopColor: "#E2E8F0",
        paddingTop: 6,
    },
    footerText: {
        fontSize: 8,
        color: "#718096",
    },
});

export default function ExpenseForecastPdf({ data }: Props) {
    const formattedDate = formatLongDate(data.approvalDate);

    const defaultText = `Aprovou no dia ${
        formattedDate || "____/____/________"
    } que a congregação tivesse um saldo reserva na conta de no máximo R$ ${
        data.maxReserveAmount || "1.300,00"
    }.`;

    const textToRender = data.bodyText?.trim() || defaultText;
    const validSignatures = (data.signatures || []).filter(
        s => s.name?.trim() || s.role?.trim()
    );

    return (
        <Document title={data.documentTitle || "Registro de Previsão de Gastos"}>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{data.title || "Registro de previsão de gastos"}</Text>

                <Text style={styles.congregationHeader}>
                    O corpo de anciãos da congregação{" "}
                    <Text style={styles.congregationName}>
                        {data.congregationName || "________________________"}
                        {data.congregationNumber ? ` - ${data.congregationNumber}` : ""}
                    </Text>
                </Text>
                <View style={styles.dividerLine} />

                <Text style={styles.bodyParagraph}>{textToRender}</Text>

                {data.additionalNotes ? (
                    <View style={styles.additionalNotesContainer}>
                        <Text style={styles.additionalNotesText}>
                            Observações: {data.additionalNotes}
                        </Text>
                    </View>
                ) : null}

                {validSignatures.length > 0 && (
                    <View style={styles.signaturesContainer}>
                        {validSignatures.map((sig, idx) => (
                            <View key={idx} style={styles.signatureBox}>
                                <Text style={styles.signatureName}>
                                    {sig.name || " "}
                                </Text>
                                <View style={styles.signatureLine} />
                                <Text style={styles.signatureRole}>
                                    {sig.role || "Ancião"}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.footerContainer} fixed>
                    <Text style={styles.footerText}>{data.documentTitle}</Text>
                    <Text
                        style={styles.footerText}
                        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
                    />
                </View>
            </Page>
        </Document>
    );
}

