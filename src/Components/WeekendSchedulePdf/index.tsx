import { IWeekendScheduleWithExternalTalks } from "@/types/weekendSchedule";
import { formatNameCongregation } from "@/utils/formatCongregationName";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import moment from "moment";

export interface IWeekendSchedulesPdfProps {
    schedules: IWeekendScheduleWithExternalTalks[];
    scale?: number;
}

const formatDate = (dateString: string) => {
    const date = moment(dateString, "YYYY-MM-DD").toDate();
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
    ];
    const month = monthNames[date.getMonth()];
    return `${day} DE ${month}`;
}

export default function WeekendMeeting({ schedules, scale = 1 }: IWeekendSchedulesPdfProps) {
    const styles = StyleSheet.create({
        page: {
            padding: 20 * scale,
            fontSize: 11 * scale,
            flexDirection: "column",
            fontFamily: "Helvetica",
        },
        header: {
            fontSize: 20 * scale,
            textAlign: "center",
            marginBottom: 15 * scale,
            fontFamily: "Helvetica-Bold",
            fontWeight: "extrabold",
            color: "#2a2b2b"
        },
        meetingBlock: {
            marginBottom: 12 * scale,
            border: 1,
            borderColor: "#AEAAAA",
        },
        meetingHeader: {
            backgroundColor: "#28456C",
            color: "white",
            fontSize: 12 * scale,
            fontFamily: "Helvetica-Bold",
            padding: 6 * scale,
        },
        chairmanRow: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 5 * scale,
            textAlign: "right",
            backgroundColor: "white",
        },
        talkBox: {
            borderTop: 1,
            borderColor: "#AEAAAA",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 5 * scale,
        },
        externalTalkBox: {
            display: "flex",
            width: "100%",
            flexDirection: "row",
            justifyContent: "flex-end",
            fontSize: 11 * scale
        },
        watchtowerBox: {
            borderTop: 1,
            borderColor: "#AEAAAA",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 5 * scale,
        },
        sectionTalkTitle: {
            fontFamily: "Helvetica-Bold",
            fontSize: 14 * scale,
            paddingVertical: 4 * scale,
            fontWeight: "extrabold",
            color: "#606A70"
        },
        sectionWatchtowerTitle: {
            fontFamily: "Helvetica-Bold",
            paddingVertical: 4 * scale,
            fontSize: 14 * scale,
            color: "#961526"
        },
        textLine: {
            fontFamily: "Helvetica-BoldOblique",
            fontSize: 11 * scale,
        }
    });

    return (
        <Page size="A4" style={styles.page}>
            <Text fixed style={styles.header}>Reunião do Fim de Semana</Text>

            {schedules.map((schedule, idx) => (
                <View key={idx} style={styles.meetingBlock} wrap={false}>
                    <Text style={styles.meetingHeader}>{formatDate(schedule.date).toLocaleUpperCase()}</Text>

                    {schedule.isSpecial && schedule.specialName && (
                        <View
                            style={{
                                paddingVertical: 4 * scale,
                                paddingHorizontal: 6 * scale,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#c18626",
                                    fontFamily: "Helvetica-Bold",
                                    fontSize: 12 * scale,
                                    textAlign: "center",
                                    textTransform: "uppercase",
                                }}
                            >
                                {schedule.specialName}
                            </Text>
                        </View>
                    )}
                   {schedule.chairman && <View style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 5 * scale }}>
                        <Text style={styles.textLine}>
                            {schedule.chairman && `Presidente: ${schedule.chairman?.nickname ? schedule.chairman?.nickname : schedule.chairman?.fullName}`}
                        </Text>
                    </View>}

                    <View style={[
                        styles.talkBox,
                        (schedule.speaker || schedule.manualSpeaker || schedule.talk || schedule.manualTalk)
                            ? { justifyContent: "space-between" }
                            : { justifyContent: "flex-end" }
                    ]}>
                        {(schedule.talk || schedule.manualTalk || schedule.speaker || schedule.manualSpeaker) && (
                            <View>
                                <Text style={styles.sectionTalkTitle}>DISCURSO PÚBLICO</Text>
                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 * scale, maxWidth: "65%" }}>
                                    {schedule.talk?.title ? schedule.talk.title : schedule.manualTalk ?? ""}
                                </Text>
                            </View>
                        )}
                        {(schedule.speaker || schedule.manualSpeaker) && (
                            <View style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <Text style={styles.textLine}>
                                    {schedule.speaker ? schedule.speaker?.fullName : schedule.manualSpeaker ?? ""}
                                </Text>
                                {schedule.speaker?.originCongregation && (
                                    <Text style={styles.textLine}>
                                        {formatNameCongregation(schedule.speaker.originCongregation.name, schedule.speaker.originCongregation.city)}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {(schedule.watchTowerStudyTitle || schedule.reader) && (
                        <View style={[styles.watchtowerBox, schedule.externalTalks && schedule.externalTalks.length > 0 ? { borderBottomWidth: 1 } : { borderBottomWidth: 0 }]}>
                            <View>
                                <Text style={styles.sectionWatchtowerTitle}>ESTUDO DE A SENTINELA</Text>
                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 * scale, maxWidth: "65%" }}>
                                    {schedule.watchTowerStudyTitle}
                                </Text>
                            </View>
                            {schedule.reader && (
                                <View style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                    <Text style={styles.textLine}>
                                        {`Leitor: ${schedule.reader.nickname || schedule.reader.fullName}`}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {schedule.externalTalks && schedule.externalTalks.length > 0 && (
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                padding: 5 * scale,
                                fontFamily: "Helvetica-BoldOblique",
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    justifyContent: "flex-end",
                                    width: "60%",
                                    color: "#595959",
                                    gap: 6 * scale,
                                }}
                            >
                                <Text style={{ fontSize: 12 * scale, textAlign: "right" }}>
                                    Discurso em outra congregação:
                                </Text>

                                {schedule.externalTalks.map((et) => (
                                    <View
                                        key={et.id}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            width: "100%",
                                            textAlign: "right",
                                        }}
                                    >
                                        {/* Nome e número do discurso */}
                                        <Text
                                            style={{
                                                fontSize: 11 * scale,
                                                flexShrink: 1,
                                                textAlign: "right",
                                            }}
                                        >
                                            {et.talk ? `Nº ${et.talk.number} - ` : ""}
                                            {et.speaker?.fullName}
                                        </Text>

                                        {/* Congregação de destino */}
                                        <Text
                                            style={{
                                                fontSize: 10 * scale,
                                                color: "#444",
                                                textAlign: "right",
                                                marginTop: 1 * scale,
                                            }}
                                        >
                                            {formatNameCongregation(et.destinationCongregation.name, et.destinationCongregation.city)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            ))}
        </Page>
    );
}
