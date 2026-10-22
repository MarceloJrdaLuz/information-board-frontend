import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ILetterData } from "@/types/letterGenerator";
import { formatLongDate, parseInlineFormatting, parseLetterBody } from "@/utils/letterParser";

interface Props {
    data: ILetterData;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 45,
        paddingBottom: 48,
        paddingHorizontal: 54,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#1A202C",
        lineHeight: 1.45,
    },
    // Cabeçalho da Congregação
    headerContainer: {
        marginBottom: 10,
    },
    congregationTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 10.5,
        textAlign: "right",
        textTransform: "uppercase",
        color: "#1A202C",
        letterSpacing: 0.3,
    },
    congregationAddress: {
        fontSize: 8.5,
        textAlign: "right",
        color: "#4A5568",
        marginTop: 2,
    },
    dividerLine: {
        borderBottomWidth: 0.8,
        borderBottomColor: "#CBD5E0",
        marginTop: 8,
        marginBottom: 14,
    },
    // Data
    dateRow: {
        textAlign: "right",
        fontSize: 9.5,
        color: "#2D3748",
        marginBottom: 18,
    },
    // Destinatário
    recipientBlock: {
        marginBottom: 16,
    },
    recipientCongregation: {
        fontSize: 10,
        color: "#1A202C",
        marginBottom: 2,
    },
    recipientAttention: {
        fontSize: 10,
        color: "#1A202C",
        marginBottom: 8,
    },
    subjectRow: {
        fontFamily: "Helvetica-Bold",
        fontSize: 10,
        color: "#1A202C",
    },
    // Saudação
    salutationText: {
        fontSize: 10,
        marginBottom: 12,
    },
    // Corpo
    paragraph: {
        fontSize: 10,
        textAlign: "justify",
        marginBottom: 10,
        lineHeight: 1.48,
        color: "#1A202C",
    },
    heading: {
        fontFamily: "Helvetica-Bold",
        fontSize: 10.5,
        color: "#1A202C",
        marginTop: 14,
        marginBottom: 8,
    },
    // Conclusão e Despedida
    signOffPhrase: {
        fontSize: 10,
        textAlign: "justify",
        marginTop: 10,
        marginBottom: 12,
        lineHeight: 1.48,
    },
    closingText: {
        fontSize: 10,
        marginBottom: 28,
    },
    // Bloco de Assinaturas (Nome ACIMA da linha, Função/Privilégio ABAIXO da linha)
    signaturesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 14,
        marginBottom: 20,
    },
    signatureBox: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 8,
    },
    signatureName: {
        fontFamily: "Helvetica-Bold",
        fontSize: 8.5,
        textAlign: "center",
        color: "#1A202C",
        marginBottom: 5,
        minHeight: 12,
    },
    signatureLine: {
        borderTopWidth: 0.8,
        borderTopColor: "#1A202C",
        width: "90%",
        marginBottom: 4,
    },
    signatureRole: {
        fontSize: 8,
        textAlign: "center",
        color: "#4A5568",
    },
    additionalFooterNote: {
        fontSize: 9,
        textAlign: "center",
        color: "#2D3748",
        marginTop: 10,
        marginBottom: 10,
    },
    // Rodapé fixo (em todas as páginas)
    footerContainer: {
        position: "absolute",
        bottom: 24,
        left: 54,
        right: 54,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 0.5,
        borderTopColor: "#E2E8F0",
        paddingTop: 6,
    },
    footerDocumentTitle: {
        fontSize: 8,
        color: "#718096",
    },
    footerPageNumber: {
        fontSize: 8,
        color: "#718096",
    },
});

/**
 * Renderiza textos com suporte a negrito e itálico inline no PDF
 */
function renderPdfFormattedText(text: string, isHeading: boolean = false) {
    const tokens = parseInlineFormatting(text);
    return tokens.map((token, idx) => {
        let fontFamily = isHeading ? "Helvetica-Bold" : "Helvetica";
        if (token.bold && token.italic) fontFamily = "Helvetica-BoldOblique";
        else if (token.bold) fontFamily = "Helvetica-Bold";
        else if (token.italic) fontFamily = isHeading ? "Helvetica-BoldOblique" : "Helvetica-Oblique";

        return (
            <Text key={idx} style={{ fontFamily }}>
                {token.text}
            </Text>
        );
    });
}

export default function LetterPdfDocument({ data }: Props) {
    const formattedDate = formatLongDate(data.date);
    const sections = parseLetterBody(data.bodyRaw);

    // Constrói o texto do endereço completo da congregação remetente
    const addressParts = [
        data.congregationAddress,
        data.congregationCity && data.congregationState
            ? `${data.congregationCity} – ${data.congregationState}`
            : data.congregationCity,
        data.congregationZipCode ? `CEP ${data.congregationZipCode}` : "",
    ].filter(Boolean);
    const fullAddress = addressParts.join(" · ");

    const validSignatures = (data.signatures || []).filter(
        s => s.name?.trim() || s.role?.trim()
    );

    return (
        <Document title={data.subject || data.documentTitle || "Carta de Apresentação"}>
            <Page size="A4" style={styles.page}>
                {/* 1. Cabeçalho da Congregação */}
                <View style={styles.headerContainer}>
                    <Text style={styles.congregationTitle}>
                        CONGREGAÇÃO {data.congregationName || "LUIS GOMES"}{" "}
                        {data.congregationNumber ? `(${data.congregationNumber})` : ""}
                    </Text>
                    {fullAddress ? (
                        <Text style={styles.congregationAddress}>{fullAddress}</Text>
                    ) : null}
                    <View style={styles.dividerLine} />
                </View>

                {/* 2. Data */}
                {formattedDate ? (
                    <Text style={styles.dateRow}>{formattedDate}</Text>
                ) : null}

                {/* 3. Bloco do Destinatário */}
                <View style={styles.recipientBlock}>
                    {data.destinationCongregation ? (
                        <Text style={styles.recipientCongregation}>
                            {data.destinationCongregation}
                        </Text>
                    ) : null}
                    {data.destinationAttention ? (
                        <Text style={styles.recipientAttention}>
                            A/C: {data.destinationAttention}
                        </Text>
                    ) : null}
                    {data.subject ? (
                        <Text style={styles.subjectRow}>Assunto: {data.subject}</Text>
                    ) : null}
                </View>

                {/* 4. Saudação */}
                {data.salutation ? (
                    <Text style={styles.salutationText}>{data.salutation}</Text>
                ) : null}

                {/* 5. Corpo da Carta (Parágrafos e Títulos com formatação inline) */}
                {sections.map((section) => {
                    if (section.type === "heading") {
                        return (
                            <Text key={section.id} style={styles.heading} minPresenceAhead={30}>
                                {renderPdfFormattedText(section.text, true)}
                            </Text>
                        );
                    }
                    return (
                        <Text key={section.id} style={styles.paragraph}>
                            {renderPdfFormattedText(section.text)}
                        </Text>
                    );
                })}

                {/* 6. Conclusão e Despedida */}
                {data.signOffPhrase ? (
                    <Text style={styles.signOffPhrase}>
                        {renderPdfFormattedText(data.signOffPhrase)}
                    </Text>
                ) : null}

                {data.closing ? (
                    <Text style={styles.closingText}>{data.closing}</Text>
                ) : null}

                {/* 7. Bloco de Assinaturas: Nome ACIMA da linha, Função/Privilégio ABAIXO da linha */}
                {validSignatures.length > 0 && (
                    <View wrap={false}>
                        <View style={styles.signaturesContainer}>
                            {validSignatures.map((sig, idx) => (
                                <View key={idx} style={styles.signatureBox}>
                                    <Text style={styles.signatureName}>
                                        {sig.name || " "}
                                    </Text>
                                    <View style={styles.signatureLine} />
                                    {sig.role ? (
                                        <Text style={styles.signatureRole}>{sig.role}</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>

                        {data.additionalFooterNote ? (
                            <Text style={styles.additionalFooterNote}>
                                {data.additionalFooterNote}
                            </Text>
                        ) : null}
                    </View>
                )}

                {/* 8. Rodapé Fixo */}
                <View style={styles.footerContainer} fixed>
                    <Text style={styles.footerDocumentTitle}>
                        {data.documentTitle || "Carta de apresentação"}
                    </Text>
                    <Text
                        style={styles.footerPageNumber}
                        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
                    />
                </View>
            </Page>
        </Document>
    );
}
