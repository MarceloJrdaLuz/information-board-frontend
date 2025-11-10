import { IPublisher } from "@/types/types"
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer"

export interface IPublishersListPdfProps {
    publishers: IPublisher[]
    congregationName?: string
    scale?: number
}

export default function PublishersListPdf({
    publishers,
    congregationName,
    scale = 1,
}: IPublishersListPdfProps) {
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
        publisherBox: {
            border: 1,
            borderColor: "#AEAAAA",
            borderRadius: 4 * scale,
            marginBottom: 10 * scale,
        },
        publisherHeader: {
            backgroundColor: "#28456C",
            color: "white",
            fontSize: 12 * scale,
            fontFamily: "Helvetica-Bold",
            paddingVertical: 5 * scale,
            paddingHorizontal: 8 * scale,
            borderTopLeftRadius: 4 * scale,
            borderTopRightRadius: 4 * scale,
        },
        publisherBody: {
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
            flexShrink: 1,
            textAlign: "right",
        },
        sectionTitle: {
            marginTop: 6 * scale,
            fontFamily: "Helvetica-BoldOblique",
            color: "#961526",
            fontSize: 11 * scale,
        }
    })

    const sortedPublishers = [...publishers].sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
    )

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Publicadores da Congregação</Text>
            {congregationName && (
                <Text style={styles.congregationName}>{congregationName}</Text>
            )}

            {sortedPublishers.map((publisher, idx) => (
                <View key={idx} style={styles.publisherBox} wrap={false}>
                    <Text style={styles.publisherHeader}>{publisher.fullName}</Text>

                    <View style={styles.publisherBody}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Telefone:</Text>
                            <Text style={styles.value}>{publisher.phone || "Não cadastrado"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Endereço:</Text>
                            <Text style={styles.value}>{publisher.address || "Não cadastrado"}</Text>
                        </View>

                        {publisher.emergencyContact && (
                            <>
                                <Text style={styles.sectionTitle}>Contato de Emergência</Text>

                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Nome:</Text>
                                    <Text style={styles.value}>{publisher.emergencyContact.name || "—"}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Telefone:</Text>
                                    <Text style={styles.value}>{publisher.emergencyContact.phone || "—"}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Parentesco:</Text>
                                    <Text style={styles.value}>{publisher.emergencyContact.relationship || "—"}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>É Testemunha de Jeová:</Text>
                                    <Text style={styles.value}>{publisher.emergencyContact.isTj ? "Sim" : "Não"}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            ))}
        </Page>
    )
}
