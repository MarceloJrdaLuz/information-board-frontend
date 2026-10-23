import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { IBankAccountDeclarationData } from "@/types/documentModels";
import { formatLongDate } from "@/utils/letterParser";

interface Props {
    data: IBankAccountDeclarationData;
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
        fontSize: 13,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 28,
        color: "#111827",
    },
    bodyParagraph: {
        fontSize: 11,
        textAlign: "justify",
        lineHeight: 1.7,
        marginBottom: 16,
    },
    bold: {
        fontFamily: "Helvetica-Bold",
    },
    dateRow: {
        textAlign: "right",
        fontSize: 11,
        marginTop: 40,
        marginBottom: 60,
        color: "#2D3748",
    },
    signatureContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    signatureLabel: {
        fontSize: 10,
        color: "#4A5568",
        marginBottom: 45,
    },
    signatureName: {
        fontFamily: "Helvetica-Bold",
        fontSize: 11,
        textAlign: "center",
        marginBottom: 5,
    },
    signatureLine: {
        borderTopWidth: 0.8,
        borderTopColor: "#1A202C",
        width: "60%",
        marginBottom: 5,
    },
    signatureSubtext: {
        fontSize: 9,
        color: "#4A5568",
        textAlign: "center",
    },
    additionalNotesContainer: {
        marginTop: 24,
        paddingTop: 12,
        borderTopWidth: 0.5,
        borderTopColor: "#E2E8F0",
    },
    additionalNotesText: {
        fontSize: 9,
        color: "#4A5568",
        fontStyle: "italic",
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

export default function BankAccountDeclarationPdf({ data }: Props) {
    const formattedDate = formatLongDate(data.date);
    const locationDate = [
        data.city && data.state ? `${data.city} – ${data.state}` : data.city,
        formattedDate,
    ]
        .filter(Boolean)
        .join(", ");

    // Constrói o texto padrão caso não tenha texto customizado
    const defaultText = `Eu ${data.declarantName || "________________________________________________"}, ${
        data.declarantNationality || "brasileiro(a)"
    }${data.declarantCivilStatus ? `, ${data.declarantCivilStatus}` : ""}, portador(a) do RG nº ${
        data.declarantRg || "_____________________"
    } e do CPF nº ${data.declarantCpf || "_________________________"}. Declaro que o valor total presente na conta bancária nº ${
        data.accountNumber || "__________________"
    }, agência nº ${data.agencyNumber || "_____________"}${
        data.bankName ? `, do Banco ${data.bankName}` : ", do Banco ______________"
    } pertence à Congregação ${
        data.congregationName || "___________________________"
    } administrada pela Associação Bíblica e Cultural ${
        data.associationName || "_______________________________"
    } inscrita no CNPJ sob o nº ${
        data.associationCnpj || "____________________________"
    }, com sede no endereço ${
        data.associationAddress || "_____________________________________________________________________."
    }`;

    const textToRender = data.bodyText?.trim() || defaultText;

    return (
        <Document title={data.documentTitle || "Declaração de Conta Bancária"}>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{data.documentTitle}</Text>

                <Text style={styles.bodyParagraph}>{textToRender}</Text>

                {data.additionalNotes ? (
                    <View style={styles.additionalNotesContainer}>
                        <Text style={styles.additionalNotesText}>
                            Observações: {data.additionalNotes}
                        </Text>
                    </View>
                ) : null}

                <Text style={styles.dateRow}>{locationDate || "Local e Data"}</Text>

                <View style={styles.signatureContainer}>
                    <Text style={styles.signatureName}>
                        {data.declarantName || " "}
                    </Text>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureSubtext}>
                        {data.declarantCpf ? `CPF: ${data.declarantCpf}` : "Assinatura do Declarante"}
                    </Text>
                </View>

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

