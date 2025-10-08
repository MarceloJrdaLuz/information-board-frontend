import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ISpeaker } from "@/types/types";
import { formatNameCongregation } from "@/utils/formatCongregationName";

export interface ISpeakersListPdfProps {
    speakers: ISpeaker[];
    congregationName?: string;
    scale?: number;
}

export default function SpeakersListPdf({
    speakers,
    congregationName,
    scale = 1,
}: ISpeakersListPdfProps) {
    const styles = StyleSheet.create({
        page: {
            padding: 20 * scale,
            fontSize: 11 * scale,
            flexDirection: "column",
            fontFamily: "Helvetica",
            color: "#2a2b2b",
        },
        header: {
            fontSize: 20 * scale,
            textAlign: "center",
            marginBottom: 15 * scale,
            fontFamily: "Helvetica-Bold",
            color: "#2a2b2b",
        },
        congregationName: {
            fontSize: 13 * scale,
            textAlign: "center",
            marginBottom: 20 * scale,
            color: "#606A70",
            fontFamily: "Helvetica-BoldOblique",
        },
        speakerBox: {
            border: 1,
            borderColor: "#AEAAAA",
            borderRadius: 4 * scale,
            marginBottom: 10 * scale,
        },
        speakerHeader: {
            backgroundColor: "#28456C",
            color: "white",
            fontSize: 12 * scale,
            fontFamily: "Helvetica-Bold",
            paddingVertical: 5 * scale,
            paddingHorizontal: 8 * scale,
            borderTopLeftRadius: 4 * scale,
            borderTopRightRadius: 4 * scale,
        },
        speakerBody: {
            padding: 8 * scale,
            display: "flex",
            flexDirection: "column",
            gap: 4 * scale,
        },
        infoRow: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            fontSize: 11 * scale,
            color: "#333",
        },
        label: {
            fontFamily: "Helvetica-Bold",
            color: "#606A70",
        },
        value: {
            fontFamily: "Helvetica",
        },
        talks: {
            marginTop: 4 * scale,
            fontFamily: "Helvetica-BoldOblique",
            color: "#961526",
        },
    });

    const sortedSpeakers = [...speakers].sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
    );

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Oradores da Congregação</Text>
            {congregationName && (
                <Text style={styles.congregationName}>{congregationName}</Text>
            )}

            {sortedSpeakers.map((speaker, idx) => (
                <View key={idx} style={styles.speakerBox} wrap={false}>
                    <Text style={styles.speakerHeader}>{speaker.fullName}</Text>

                    <View style={styles.speakerBody}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Telefone:</Text>
                            <Text style={styles.value}>{speaker.phone || "Não cadastrado"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Congregação:</Text>
                            <Text style={styles.value}>
                                {formatNameCongregation(
                                    speaker.originCongregation?.name,
                                    speaker.originCongregation?.city
                                )}
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.talks}>
                                {speaker.talks?.length
                                    ? `Discursos: ${speaker.talks
                                        .map((t) => t.number)
                                        .sort((a, b) => Number(a) - Number(b))
                                        .join(", ")}`
                                    : "Nenhum discurso"}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </Page>
    );
}
