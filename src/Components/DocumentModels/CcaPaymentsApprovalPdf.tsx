import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ICcaPaymentsApprovalData } from "@/types/documentModels";
import { formatLongDate } from "@/utils/letterParser";

interface Props {
    data: ICcaPaymentsApprovalData;
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
        marginBottom: 28,
        color: "#111827",
    },
    metaRow: {
        fontSize: 11,
        color: "#1F2937",
        marginBottom: 12,
    },
    metaBold: {
        fontFamily: "Helvetica-Bold",
    },
    congregationHeader: {
        fontSize: 11,
        marginBottom: 8,
        color: "#1F2937",
    },
    dividerLine: {
        borderBottomWidth: 0.8,
        borderBottomColor: "#D1D5DB",
        marginBottom: 22,
    },
    bodyParagraph: {
        fontSize: 11.5,
        textAlign: "justify",
        lineHeight: 1.8,
        marginBottom: 20,
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

export default function CcaPaymentsApprovalPdf({ data }: Props) {
    const formattedDate = formatLongDate(data.date);
    const validSignatures = (data.signatures || []).filter(
        s => s.name?.trim() || s.role?.trim()
    );

    const congFull = [
        data.congregationName || "________________________",
        data.congregationState,
    ]
        .filter(Boolean)
        .join(" ");

    const congWithNumber = data.congregationNumber
        ? `${congFull} (${data.congregationNumber})`
        : congFull;

    const defaultText = `Aprovou que o ${
        data.approverRole || "Coordenador do corpo de anciãos"
    } possa aprovar pagamentos de despesas operacionais de rotina no Salão do Reino no valor máximo de R$ ${
        data.maxRoutineAmount || "400,00"
    }, desde que haja fundos suficientes na congregação.`;

    const textToRender = data.bodyText?.trim() || defaultText;

    return (
        <Document title={data.documentTitle || "Registro de Pagamentos Aprovados pelo CCA"}>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{data.title || "Registro de valor pagamentos aprovados pelo CCA"}</Text>

                <Text style={styles.metaRow}>
                    Data: <Text style={styles.metaBold}>{formattedDate || "____/____/________"}</Text>
                </Text>

                <Text style={styles.congregationHeader}>
                    O corpo de anciãos da congregação{" "}
                    <Text style={styles.metaBold}>{congWithNumber}</Text>
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

