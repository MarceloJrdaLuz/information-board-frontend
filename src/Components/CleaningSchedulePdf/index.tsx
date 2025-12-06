import { ICleaningScheduleResponse } from "@/types/cleaning";
import { Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

// Registra a fonte
Font.register({
    family: "Crimson Pro",
    fonts: [
        {
            src: "/fonts/CrimsonPro-Light.ttf",
            fontWeight: "normal",
        },
        {
            src: "/fonts/CrimsonPro-Bold.ttf",
            fontWeight: "bold",
        },
    ],
});



interface ICleaningSchedulePdfProps {
    schedule: ICleaningScheduleResponse;
    congregationName?: string;
    scale?: number;
}

export default function CleaningSchedulePdf({
    schedule,
    congregationName,
    scale = 1,
}: ICleaningSchedulePdfProps) {

    const styles = StyleSheet.create({
        page: {
            padding: 25 * scale,
            fontSize: 14 * scale,
            color: "#2a2b2b",
        },
        header: {
            fontSize: 22 * scale,
            textAlign: "center",
            marginBottom: 12 * scale,
            fontFamily: "Crimson Pro",
            fontWeight: "bold",
            color: "#28456C"
        },
        congregationName: {
            fontSize: 14 * scale,
            textAlign: "center",
            marginBottom: 20 * scale,
            fontFamily: "Crimson Pro",
            color: "#3F4C59",
        },
        tableContainer: {
            borderWidth: 1 * scale,
            borderColor: "#9CC2E5",
        },
        tableHeader: {
            flexDirection: "row",
            backgroundColor: "#28456C",
            color: "white",
            fontFamily: "Crimson Pro",
            paddingVertical: 6 * scale,
        },
        headerDate: {
            width: "40%",
            textAlign: "center",
            borderRightWidth: 1 * scale,
            borderRightColor: "#FFFFFF",
        },
        headerPublishers: {
            width: "60%",
            textAlign: "center",
        },
        row: {
            flexDirection: "row",
            borderBottomWidth: 1 * scale,
            borderColor: "#9CC2E5",
            minHeight: 30 * scale,
        },
        rowEven: {
            backgroundColor: "#DEEAF6",
        },
        dateCol: {
            width: "40%",
            justifyContent: "center",
            alignItems: "center",
            borderRightWidth: 1 * scale,
            borderRightColor: "#9CC2E5",
            paddingVertical: 6 * scale,
        },
        pubCol: {
            width: "60%",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 6 * scale,
        },
        dateText: {
            fontFamily: "Crimson Pro",
            textAlign: "center",
        },
        pubText: {
            textAlign: "center",
            fontFamily: "Crimson Pro",
            paddingHorizontal: 4 * scale,
        },
    });

    return (
        <Page size="A4" style={styles.page}>
            <View fixed>
                <Text style={styles.header}>Programação de Limpeza</Text>
            </View>

            <View style={styles.tableContainer}>

                {/* HEADER */}
                <View fixed style={[styles.row, { backgroundColor: "#28456C" }]}>
                    <View style={[styles.dateCol, { borderRightColor: "#243f63" }]}>
                        <Text style={{ fontSize: 16 * scale, color: "white", fontFamily: "Crimson Pro", fontWeight: "bold" }}>Semana</Text>
                    </View>

                    <View style={styles.pubCol}>
                        <Text style={{ fontSize: 16 * scale, color: "white", fontFamily: "Crimson Pro", fontWeight: "bold" }}>Grupo</Text>
                    </View>
                </View>

                {/* BODY */}
                {(schedule?.schedules ?? []).map((item, i) => {
                    const isEven = i % 2 === 0;

                    const publishersDisplay = (item.group?.publishers ?? [])
                        .map(pub => {
                            if (!pub) return "";
                            return (pub.nickname?.trim() || pub.fullName?.trim() || "");
                        })
                        .filter(Boolean)
                        .join(" – ");

                    const formattedDate = item.date
                        ? dayjs(item.date).format("dddd – DD [de] MMMM").replace(/^\w/, s => s.toUpperCase())
                        : "";

                    const rowStyle: any[] = [styles.row];
                    if (isEven) rowStyle.push(styles.rowEven);

                    return (
                        <View
                            key={item.id}
                            style={[
                                ...rowStyle,
                                i === (schedule?.schedules?.length ?? 0) - 1
                                    ? { borderBottomWidth: 0 }
                                    : {}
                            ]}
                        >
                            <View style={styles.dateCol}>
                                <Text style={styles.dateText}>{formattedDate}</Text>
                            </View>

                            <View style={styles.pubCol}>
                                <Text style={styles.pubText}>{publishersDisplay}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </Page>
    );
}
