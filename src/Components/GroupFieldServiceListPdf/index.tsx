import { IGroup, Situation } from "@/types/types"
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer"

export interface IGroupsFieldServicePdfProps {
    groups: IGroup[]
    congregationName?: string
    scale?: number
    showInactives?: boolean
}

export default function GroupsFieldServicePdf({
    groups,
    congregationName,
    scale = 1,
    showInactives = false,
}: IGroupsFieldServicePdfProps) {

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
        },
        congregationName: {
            fontSize: 13 * scale,
            textAlign: "center",
            marginBottom: 20 * scale,
            color: "#606A70",
            fontFamily: "Helvetica-BoldOblique",
        },

        table: {
            flexDirection: "row",
            gap: 12 * scale,
            width: "100%",
        },
        column: {
            flex: 1,
            border: 1,
            borderColor: "#B4B4B4",
            borderRadius: 6 * scale,
            padding: 8 * scale,
        },
        columnHeader: {
            fontSize: 14 * scale,
            fontFamily: "Helvetica-Bold",
            textAlign: "center",
            backgroundColor: "#28456C",
            color: "white",
            paddingVertical: 6 * scale,
            borderRadius: 4 * scale,
            marginBottom: 8 * scale,
        },
        overseerTitle: {
            fontFamily: "Helvetica-BoldOblique",
            fontSize: 11 * scale,
            marginTop: 4 * scale,
            marginBottom: 3 * scale,
            color: "#961526",
        },
        overseerName: {
            fontSize: 11 * scale,
            marginBottom: 5 * scale,
        },
        memberName: {
            fontSize: 11 * scale,
            marginBottom: 3 * scale,
        },
        inactiveTitle: {
            marginTop: 8 * scale,
            fontFamily: "Helvetica-BoldOblique",
            fontSize: 11 * scale,
            color: "#961526",
        },
        totalText: {
            fontSize: 10 * scale,
            marginBottom: 5 * scale,
            color: "#4b4b4b",
            fontFamily: "Helvetica-Oblique",
        }
    })

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Grupos de Saídas de Campo</Text>

            {congregationName && (
                <Text style={styles.congregationName}>{congregationName}</Text>
            )}

            <View style={styles.table}>
                {groups.map(group => {
                    const leaderId = group.groupOverseers.publisherId
                    // Remove o dirigente da lista
                    const publishersWithoutLeader = group.publishers.filter(
                        pub => pub.id !== leaderId
                    )
                    console.log(publishersWithoutLeader)
                    const activeMembers = publishersWithoutLeader
                        .filter(pub => pub.situation === Situation.ATIVO)
                        .sort((a, b) => a.fullName.localeCompare(b.fullName))

                    const inactiveMembers = publishersWithoutLeader
                        .filter(pub => pub.situation !== Situation.ATIVO)
                        .sort((a, b) => a.fullName.localeCompare(b.fullName))

                    const totalCount =
                        activeMembers.length +
                        inactiveMembers.length +
                        (group.groupOverseers ? 1 : 0)

                    return (
                        <View key={group.id} style={styles.column} wrap={false}>

                            <Text style={styles.columnHeader}>{group.name}</Text>

                            {/* Total */}
                            <Text style={styles.totalText}>
                                Total: {totalCount} publicadores (incluindo dirigente)
                            </Text>

                            {/* Dirigente */}
                            <Text style={styles.overseerTitle}>Dirigente:</Text>
                            <Text style={styles.overseerName}>
                                {group.groupOverseers.fullName}
                            </Text>

                            {/* Publicadores ativos */}
                            <Text style={styles.overseerTitle}>Publicadores:</Text>
                            {activeMembers.map(pub => (
                                <Text key={pub.id} style={styles.memberName}>
                                    {pub.fullName}
                                </Text>
                            ))}

                            {/* Publicadores inativos (somente se showInactives = true) */}
                            {showInactives && inactiveMembers.length > 0 && (
                                <>
                                    <Text style={styles.inactiveTitle}>Publicadores inativos:</Text>
                                    {inactiveMembers.map(pub => (
                                        <Text key={pub.id} style={styles.memberName}>
                                            {pub.fullName} - ({pub.situation})
                                        </Text>
                                    ))}
                                </>
                            )}
                        </View>
                    )
                })}
            </View>
        </Page>
    )
}
