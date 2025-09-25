import { IExternalTalk } from "@/entities/externalTalks";
import { IWeekendScheduleWithExternalTalks } from "@/entities/weekendSchedule";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 25,
        fontSize: 11,
        flexDirection: "column",
        fontFamily: "Helvetica",
    },
    header: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 15,
        fontFamily: "Helvetica-Bold",
        fontWeight: "extrabold",
        color: "#2a2b2b"
    },
    meetingBlock: {
        marginBottom: 12,
        border: 1,
        borderColor: "#AEAAAA",
    },
    meetingHeader: {
        backgroundColor: "#28456C",
        color: "white",
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        padding: 6,
    },
    meetingBody: {
        padding: 6,
        backgroundColor: "#d71818"
    },
    chairmanRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
        textAlign: "right",
        backgroundColor: "white",
    },
    talkBox: {
        borderTop: 1,
        borderColor: "#AEAAAA",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
    },
    externalTalkBox: {
        display: "flex",
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        fontSize: 11
    },
    watchtowerBox: {
        borderTop: 1,
        borderBottom: 1,
        borderColor: "#AEAAAA",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
    },
    sectionTalkTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 14,
        paddingVertical: 4,
        fontWeight: "extrabold",
        color: "#606A70"
    },
    sectionWatchtowerTitle: {
        fontFamily: "Helvetica-Bold",
        paddingVertical: 4,
        fontSize: 14,
        color: "#961526"

    },
    textLine: {
        fontFamily: "Helvetica-BoldOblique",
        fontSize: 11,
    }
});

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0"); // "06"
    const monthNames = [
        "JANEIRO",
        "FEVEREIRO",
        "MARÇO",
        "ABRIL",
        "MAIO",
        "JUNHO",
        "JULHO",
        "AGOSTO",
        "SETEMBRO",
        "OUTUBRO",
        "NOVEMBRO",
        "DEZEMBRO",
    ];
    const month = monthNames[date.getMonth()];
    return `${day} DE ${month}`;
}


export interface IWeekendSchedulesPdfProps {
    schedules: IWeekendScheduleWithExternalTalks[]
}

export default function WeekendMeeting({ schedules }: IWeekendSchedulesPdfProps) {
    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Reunião do Fim de Semana</Text>

            {schedules.map((schedule, idx) => (
                <View key={idx} style={styles.meetingBlock} wrap={false}>
                    {/* Cabeçalho com data */}
                    <Text style={styles.meetingHeader}>{formatDate(schedule.date).toLocaleUpperCase()}</Text>

                    <View style={[
                        styles.chairmanRow,
                        schedule.specialName
                            ? { justifyContent: "space-between" }
                            : { justifyContent: "flex-end" }
                    ]}>
                        {schedule.isSpecial && <Text style={styles.textLine}>
                            {schedule.specialName}
                        </Text>}
                        <Text style={styles.textLine}>
                            {schedule.chairman && `Presidente: ${schedule.chairman?.fullName}`}
                        </Text>
                    </View>
                    <View style={[
                        styles.talkBox,
                        (schedule.speaker || schedule.manualSpeaker || schedule.talk || schedule.manualTalk) ? { justifyContent: "space-between" } : { justifyContent: "flex-end" }
                    ]}>
                        {(schedule.talk || schedule.manualTalk || schedule.speaker || schedule.manualSpeaker) &&
                            <View >
                                <Text style={styles.sectionTalkTitle}>DISCURSO PÚBLICO</Text>
                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, maxWidth: "65%" }}>{schedule.talk?.title ? schedule.talk.title : schedule.manualTalk ?? ""}</Text>
                            </View>
                        }
                        {(schedule.speaker || schedule.manualSpeaker) &&
                            <View style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <Text style={styles.textLine}>{schedule.speaker ? schedule.speaker?.fullName : schedule.manualSpeaker ?? ""}</Text>
                                {schedule.speaker?.originCongregation && <Text style={styles.textLine}>{`(${schedule.speaker?.originCongregation?.name ?? ""} ${schedule.speaker?.originCongregation?.name !== schedule.speaker?.originCongregation?.city ? schedule.speaker?.originCongregation.city : ""})`}</Text>}
                            </View>}
                    </View>
                    {(schedule.watchTowerStudyTitle || schedule.reader) &&
                        <View style={styles.watchtowerBox}>
                            <View>
                                <Text style={styles.sectionWatchtowerTitle}>ESTUDO DE A SENTINELA</Text>
                                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, maxWidth: "65%" }}>{schedule.watchTowerStudyTitle}</Text>
                            </View>
                            <View style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <Text style={styles.textLine}>
                                    Leitor: {schedule.reader?.fullName}
                                </Text>
                            </View>
                        </View>}

                    {schedule.externalTalks && schedule.externalTalks?.length > 0 && (
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", padding: 5, fontFamily: "Helvetica-BoldOblique" }}>
                            <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end", width: "50%", color: "#595959", gap: 4 }}>
                                <Text style={{ fontSize: 12 }}>Discurso em outra congregação:</Text>
                                {schedule.externalTalks.map(talk => (
                                    <View key={talk.id} style={styles.externalTalkBox}>
                                        <View style={{ display: "flex", flexDirection: "row", gap: 6 }}>
                                            <Text>{`Nº - ${talk.talk?.number}`}</Text>
                                            <Text>{talk.speaker?.fullName}</Text>
                                            <Text>{`(${talk.destinationCongregation.name} ${talk.destinationCongregation.city !== talk.destinationCongregation.name ? talk.destinationCongregation.city : ""})`}</Text>
                                        </View>
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
