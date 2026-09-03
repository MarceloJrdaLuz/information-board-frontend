import { IMechanicalConfig, IMechanicalWeek, MechanicalMeetingType, MechanicalRole } from "@/types/mechanical";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

// Registra as fontes Crimson Pro
try {
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
} catch (e) {
    // Ignora se já estiver registrada
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 24,
        paddingBottom: 24,
        paddingHorizontal: 22,
        fontSize: 10,
        color: "#2a2b2b",
        fontFamily: "Crimson Pro",
    },
    header: {
        fontSize: 20,
        textAlign: "center",
        marginBottom: 4,
        fontWeight: "bold",
        color: "#28456C",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    congregationName: {
        fontSize: 12,
        textAlign: "center",
        marginBottom: 14,
        color: "#3F4C59",
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: "#9CC2E5",
        borderRadius: 2,
        overflow: "hidden",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#28456C",
        color: "#FFFFFF",
        paddingVertical: 6,
        alignItems: "center",
    },
    headerCell: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 9.5,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.3,
        borderRightWidth: 1,
        borderRightColor: "#FFFFFF",
        paddingHorizontal: 3,
    },
    headerCellLast: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 9.5,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.3,
        paddingHorizontal: 3,
    },
    weekHeaderRow: {
        backgroundColor: "#DEEAF6",
        paddingVertical: 3.5,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#9CC2E5",
    },
    weekHeaderText: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#28456C",
        textTransform: "uppercase",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#9CC2E5",
        minHeight: 28,
        alignItems: "stretch",
    },
    rowEven: {
        backgroundColor: "#F7FAFC",
    },
    cell: {
        justifyContent: "center",
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRightWidth: 1,
        borderRightColor: "#9CC2E5",
    },
    cellLast: {
        justifyContent: "center",
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    dateCell: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 5,
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: "#9CC2E5",
        backgroundColor: "#F0F5FA",
    },
    weekLabel: {
        fontSize: 10.5,
        fontWeight: "bold",
        color: "#28456C",
        textAlign: "center",
        marginBottom: 1,
    },
    weekDates: {
        fontSize: 8,
        color: "#475569",
        textAlign: "center",
    },
    meetingTypeTitle: {
        fontSize: 9.5,
        fontWeight: "bold",
        color: "#28456C",
        textAlign: "center",
    },
    meetingDateSubtitle: {
        fontSize: 8,
        color: "#64748B",
        textAlign: "center",
        marginTop: 1,
    },
    itemText: {
        fontSize: 8.5,
        color: "#1e293b",
        marginBottom: 2,
    },
    itemLabel: {
        fontWeight: "bold",
        color: "#334155",
    },
    emptySlotText: {
        fontSize: 8,
        color: "#94a3b8",
        fontStyle: "italic",
    },
    footer: {
        marginTop: 12,
        textAlign: "center",
        fontSize: 8,
        color: "#64748B",
    },
});

interface MechanicalSchedulePdfProps {
    weeks: IMechanicalWeek[];
    congregationName?: string;
    monthFormatted: string;
    combineSoundAndMedia?: boolean;
    config?: IMechanicalConfig | null;
}

export const MechanicalSchedulePdf: React.FC<MechanicalSchedulePdfProps> = ({
    weeks,
    congregationName,
    monthFormatted,
    combineSoundAndMedia,
    config
}) => {
    // Determina quais funções são ativas na congregação
    const hasAttendants = config
        ? (config.midweekAttendantsCount > 0 || config.weekendAttendantsCount > 0)
        : weeks.some(w => w.schedules.some(s => s.assignments.some(a => a.role === MechanicalRole.ATTENDANT)));

    const isCombined = combineSoundAndMedia ?? config?.combineSoundAndMedia ?? false;

    const hasSound = config
        ? (isCombined || config.midweekSoundCount > 0 || config.weekendSoundCount > 0)
        : weeks.some(w => w.schedules.some(s => s.assignments.some(a => a.role === MechanicalRole.SOUND || a.role === MechanicalRole.SOUND_AND_MEDIA)));

    const hasMedia = config
        ? (!isCombined && (config.midweekMediaCount > 0 || config.weekendMediaCount > 0))
        : weeks.some(w => w.schedules.some(s => s.assignments.some(a => a.role === MechanicalRole.MEDIA)));

    const hasSoundMediaCol = hasSound || hasMedia || isCombined;

    const hasRovingMics = config
        ? (config.midweekRovingMicsCount > 0 || config.weekendRovingMicsCount > 0)
        : weeks.some(w => w.schedules.some(s => s.assignments.some(a => a.role === MechanicalRole.ROVING_MIC)));

    const hasStageMics = config
        ? (config.midweekStageMicsCount > 0 || config.weekendStageMicsCount > 0)
        : weeks.some(w => w.schedules.some(s => s.assignments.some(a => a.role === MechanicalRole.STAGE_MIC)));

    const isSameTeamWholeWeek =
        Boolean(config?.sameTeamWholeWeek) ||
        (weeks.length > 0 &&
            weeks.every(w => {
                const mid = w.schedules.find(s => s.meetingType === MechanicalMeetingType.MIDWEEK);
                const end = w.schedules.find(s => s.meetingType === MechanicalMeetingType.WEEKEND);
                if (!mid || !end) return true;
                if (!mid.assignments || !end.assignments) return false;
                if (mid.assignments.length === 0 && end.assignments.length === 0) return true;
                return (
                    mid.assignments.length > 0 &&
                    mid.assignments.every(ma => {
                        const ea = end.assignments.find(a => a.role === ma.role && a.order === ma.order);
                        return ea && ea.publisher_id === ma.publisher_id;
                    })
                );
            }));

    // Cálculo dinâmico das larguras em Portrait (Vertical)
    const dateColWidth = isSameTeamWholeWeek ? 23 : 21;
    const remainingWidth = 100 - dateColWidth;

    const weightAttendants = hasAttendants ? 28 : 0;
    const weightSoundMedia = hasSoundMediaCol ? 24 : 0;
    const weightRovingMics = hasRovingMics ? 24 : 0;
    const weightStageMics = hasStageMics ? 14 : 0;

    const totalWeight = weightAttendants + weightSoundMedia + weightRovingMics + weightStageMics || 1;

    const widthDate = `${dateColWidth}%`;
    const widthAttendants = `${Math.round((weightAttendants / totalWeight) * remainingWidth)}%`;
    const widthSoundMedia = `${Math.round((weightSoundMedia / totalWeight) * remainingWidth)}%`;
    const widthRovingMics = `${Math.round((weightRovingMics / totalWeight) * remainingWidth)}%`;
    const widthStageMics = `${Math.round((weightStageMics / totalWeight) * remainingWidth)}%`;

    const isCompact = weeks.length > 6;
    const dynamicRowPadding = isCompact ? 3 : 5;
    const dynamicItemFontSize = isCompact ? 7.2 : 8.5;
    const dynamicWeekLabelFontSize = isCompact ? 9 : 10.5;
    const dynamicWeekDatesFontSize = isCompact ? 6.8 : 8;

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={[styles.page, isCompact ? { padding: 18 } : {}]}>
                {/* Cabeçalho do Documento */}
                <View fixed>
                    <Text style={[styles.header, isCompact ? { fontSize: 13, marginBottom: 2 } : {}]}>
                        Programação de Partes Mecânicas
                    </Text>
                    <Text style={[styles.congregationName, isCompact ? { fontSize: 8.5, marginBottom: 6 } : {}]}>
                        {congregationName ? `${congregationName} • ` : ""}
                        {monthFormatted}
                    </Text>
                </View>

                {/* Tabela Vertical */}
                <View style={styles.tableContainer}>
                    {/* Linha de Cabeçalho da Tabela */}
                    <View style={[styles.tableHeader, isCompact ? { paddingVertical: 4 } : {}]}>
                        <Text style={[styles.headerCell, { width: widthDate }, isCompact ? { fontSize: 8 } : {}]}>
                            {isSameTeamWholeWeek ? "Semana / Reuniões" : "Reunião"}
                        </Text>
                        {hasAttendants && (
                            <Text style={[styles.headerCell, { width: widthAttendants }, isCompact ? { fontSize: 8 } : {}]}>
                                Indicadores
                            </Text>
                        )}
                        {hasSoundMediaCol && (
                            <Text
                                style={[
                                    hasRovingMics || hasStageMics ? styles.headerCell : styles.headerCellLast,
                                    { width: widthSoundMedia },
                                    isCompact ? { fontSize: 8 } : {}
                                ]}
                            >
                                {isCombined ? "Som & Mídias" : "Som / Mídias"}
                            </Text>
                        )}
                        {hasRovingMics && (
                            <Text
                                style={[
                                    hasStageMics ? styles.headerCell : styles.headerCellLast,
                                    { width: widthRovingMics },
                                    isCompact ? { fontSize: 8 } : {}
                                ]}
                            >
                                Microfones Volantes
                            </Text>
                        )}
                        {hasStageMics && (
                            <Text style={[styles.headerCellLast, { width: widthStageMics }, isCompact ? { fontSize: 8 } : {}]}>
                                Pedestal
                            </Text>
                        )}
                    </View>

                    {/* Semanas */}
                    {weeks.map((week, weekIdx) => {
                        const isEven = weekIdx % 2 === 1;

                        // Se a semana não tiver reuniões no Salão (Evento Especial, Assembleia, Congresso, etc.)
                        if (week.hasNoMeeting) {
                            const midweekSched = week.schedules.find(s => s.meetingType === MechanicalMeetingType.MIDWEEK);
                            const weekendSched = week.schedules.find(s => s.meetingType === MechanicalMeetingType.WEEKEND);
                            const midweekText = midweekSched ? dayjs(midweekSched.date).format("ddd, DD/MM") : "";
                            const weekendText = weekendSched ? dayjs(weekendSched.date).format("ddd, DD/MM") : "";
                            const datesSummary = `${midweekText}${midweekText && weekendText ? " • " : ""}${weekendText}` || week.formattedWeek;
                            const eventName = week.eventTitle || "Evento Especial — Não haverá reunião no Salão do Reino";

                            return (
                                <View key={week.weekStartDate} style={[styles.row, isEven ? styles.rowEven : {}, { backgroundColor: isEven ? "#F1F5F9" : "#F8FAFC" }]}>
                                    <View style={[styles.dateCell, { width: widthDate, paddingVertical: dynamicRowPadding }]}>
                                        <Text style={[styles.weekLabel, { fontSize: dynamicWeekLabelFontSize }]}>Semana {weekIdx + 1}</Text>
                                        <Text style={[styles.weekDates, { fontSize: dynamicWeekDatesFontSize }]}>{datesSummary}</Text>
                                    </View>
                                    <View style={[styles.cellLast, { width: `${remainingWidth}%`, justifyContent: "center", alignItems: "center", paddingVertical: dynamicRowPadding + 2, backgroundColor: "#F1F5F9" }]}>
                                        <Text style={{ fontSize: isCompact ? 8 : 9, fontWeight: "bold", color: "#28456C", textAlign: "center" }}>
                                            🏛️ {eventName}
                                        </Text>
                                        <Text style={{ fontSize: isCompact ? 6.5 : 7.5, color: "#64748B", textAlign: "center", marginTop: 1 }}>
                                            (Não haverá designações de partes mecânicas nesta semana)
                                        </Text>
                                    </View>
                                </View>
                            );
                        }

                        // Modo 1: Equipe Única para a Semana Toda (1 Linha Consolidada por Semana)
                        if (isSameTeamWholeWeek) {
                            const midweekSched = week.schedules.find(s => s.meetingType === MechanicalMeetingType.MIDWEEK);
                            const weekendSched = week.schedules.find(s => s.meetingType === MechanicalMeetingType.WEEKEND);
                            const activeSched = midweekSched || weekendSched;
                            if (!activeSched) return null;

                            const attendants = activeSched.assignments.filter(
                                a => a.role === MechanicalRole.ATTENDANT
                            );
                            const soundAndMedia = activeSched.assignments.filter(
                                a => a.role === MechanicalRole.SOUND_AND_MEDIA
                            );
                            const sound = activeSched.assignments.filter(
                                a => a.role === MechanicalRole.SOUND
                            );
                            const media = activeSched.assignments.filter(
                                a => a.role === MechanicalRole.MEDIA
                            );
                            const rovingMics = activeSched.assignments.filter(
                                a => a.role === MechanicalRole.ROVING_MIC
                            );
                            const stageMics = activeSched.assignments.filter(
                                a => a.role === MechanicalRole.STAGE_MIC
                            );

                            const midweekText = midweekSched ? dayjs(midweekSched.date).format("ddd, DD/MM") : "";
                            const weekendText = weekendSched ? dayjs(weekendSched.date).format("ddd, DD/MM") : "";
                            const datesSummary = `${midweekText}${midweekText && weekendText ? " • " : ""}${weekendText}`;

                            return (
                                <View key={week.weekStartDate} style={[styles.row, isEven ? styles.rowEven : {}]}>
                                    {/* Data da Semana */}
                                    <View style={[styles.dateCell, { width: widthDate, paddingVertical: dynamicRowPadding }]}>
                                        <Text style={[styles.weekLabel, { fontSize: dynamicWeekLabelFontSize }]}>Semana {weekIdx + 1}</Text>
                                        <Text style={[styles.weekDates, { fontSize: dynamicWeekDatesFontSize }]}>{datesSummary}</Text>
                                    </View>

                                    {/* Indicadores */}
                                    {hasAttendants && (
                                        <View style={[styles.cell, { width: widthAttendants }]}>
                                            {attendants.length > 0 ? (
                                                attendants.map((a, idx) => (
                                                    <Text key={a.id} style={styles.itemText}>
                                                        <Text style={styles.itemLabel}>
                                                            {attendants.length > 1 ? `• Ind. ${idx + 1}: ` : "• "}
                                                        </Text>
                                                        {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                    </Text>
                                                ))
                                            ) : (
                                                <Text style={styles.emptySlotText}>-</Text>
                                            )}
                                        </View>
                                    )}

                                    {/* Som & Mídias */}
                                    {hasSoundMediaCol && (
                                        <View
                                            style={[
                                                hasRovingMics || hasStageMics ? styles.cell : styles.cellLast,
                                                { width: widthSoundMedia }
                                            ]}
                                        >
                                            {soundAndMedia.length > 0 ? (
                                                soundAndMedia.map((a) => (
                                                    <Text key={a.id} style={styles.itemText}>
                                                        <Text style={styles.itemLabel}>• </Text>
                                                        {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                    </Text>
                                                ))
                                            ) : (
                                                <>
                                                    {sound.map((a) => (
                                                        <Text key={a.id} style={styles.itemText}>
                                                            <Text style={styles.itemLabel}>• Som: </Text>
                                                            {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                        </Text>
                                                    ))}
                                                    {media.map((a) => (
                                                        <Text key={a.id} style={styles.itemText}>
                                                            <Text style={styles.itemLabel}>• Mídia: </Text>
                                                            {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                        </Text>
                                                    ))}
                                                    {sound.length === 0 && media.length === 0 && (
                                                        <Text style={styles.emptySlotText}>-</Text>
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    )}

                                    {/* Microfones Volantes */}
                                    {hasRovingMics && (
                                        <View
                                            style={[
                                                hasStageMics ? styles.cell : styles.cellLast,
                                                { width: widthRovingMics }
                                            ]}
                                        >
                                            {rovingMics.length > 0 ? (
                                                rovingMics.map((a, idx) => (
                                                    <Text key={a.id} style={styles.itemText}>
                                                        <Text style={styles.itemLabel}>
                                                            {rovingMics.length > 1 ? `• Vol. ${idx + 1}: ` : "• "}
                                                        </Text>
                                                        {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                    </Text>
                                                ))
                                            ) : (
                                                <Text style={styles.emptySlotText}>-</Text>
                                            )}
                                        </View>
                                    )}

                                    {/* Pedestal */}
                                    {hasStageMics && (
                                        <View style={[styles.cellLast, { width: widthStageMics }]}>
                                            {stageMics.length > 0 ? (
                                                stageMics.map((a) => (
                                                    <Text key={a.id} style={styles.itemText}>
                                                        <Text style={styles.itemLabel}>• </Text>
                                                        {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                    </Text>
                                                ))
                                            ) : (
                                                <Text style={styles.emptySlotText}>-</Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        }

                        // Modo 2: Reuniões Independentes (Meio de Semana e Fim de Semana separados)
                        return (
                            <View key={week.weekStartDate}>
                                {/* Cabeçalho da Semana */}
                                <View style={styles.weekHeaderRow}>
                                    <Text style={styles.weekHeaderText}>{week.formattedWeek}</Text>
                                </View>

                                {/* Linhas das Reuniões */}
                                {week.schedules.map((sched, sIdx) => {
                                    const attendants = sched.assignments.filter(
                                        a => a.role === MechanicalRole.ATTENDANT
                                    );
                                    const soundAndMedia = sched.assignments.filter(
                                        a => a.role === MechanicalRole.SOUND_AND_MEDIA
                                    );
                                    const sound = sched.assignments.filter(
                                        a => a.role === MechanicalRole.SOUND
                                    );
                                    const media = sched.assignments.filter(
                                        a => a.role === MechanicalRole.MEDIA
                                    );
                                    const rovingMics = sched.assignments.filter(
                                        a => a.role === MechanicalRole.ROVING_MIC
                                    );
                                    const stageMics = sched.assignments.filter(
                                        a => a.role === MechanicalRole.STAGE_MIC
                                    );

                                    const isMidweek = sched.meetingType === MechanicalMeetingType.MIDWEEK;
                                    const dateFormatted = dayjs(sched.date).format("dddd, DD/MM");

                                    return (
                                        <View
                                            key={sched.id}
                                            style={[styles.row, sIdx % 2 === 1 ? styles.rowEven : {}]}
                                        >
                                            {/* Reunião / Data */}
                                            <View style={[styles.dateCell, { width: widthDate }]}>
                                                <Text style={styles.meetingTypeTitle}>
                                                    {isMidweek ? "Meio de Semana" : "Fim de Semana"}
                                                </Text>
                                                <Text style={styles.meetingDateSubtitle}>
                                                    {dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)}
                                                </Text>
                                            </View>

                                            {/* Indicadores */}
                                            {hasAttendants && (
                                                <View style={[styles.cell, { width: widthAttendants }]}>
                                                    {attendants.length > 0 ? (
                                                        attendants.map((a, idx) => (
                                                            <Text key={a.id} style={styles.itemText}>
                                                                <Text style={styles.itemLabel}>
                                                                    {attendants.length > 1 ? `• Ind. ${idx + 1}: ` : "• "}
                                                                </Text>
                                                                {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                            </Text>
                                                        ))
                                                    ) : (
                                                        <Text style={styles.emptySlotText}>-</Text>
                                                    )}
                                                </View>
                                            )}

                                            {/* Som & Mídias */}
                                            {hasSoundMediaCol && (
                                                <View
                                                    style={[
                                                        hasRovingMics || hasStageMics ? styles.cell : styles.cellLast,
                                                        { width: widthSoundMedia }
                                                    ]}
                                                >
                                                    {soundAndMedia.length > 0 ? (
                                                        soundAndMedia.map((a) => (
                                                            <Text key={a.id} style={styles.itemText}>
                                                                <Text style={styles.itemLabel}>• </Text>
                                                                {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                            </Text>
                                                        ))
                                                    ) : (
                                                        <>
                                                            {sound.map((a) => (
                                                                <Text key={a.id} style={styles.itemText}>
                                                                    <Text style={styles.itemLabel}>• Som: </Text>
                                                                    {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                                </Text>
                                                            ))}
                                                            {media.map((a) => (
                                                                <Text key={a.id} style={styles.itemText}>
                                                                    <Text style={styles.itemLabel}>• Mídia: </Text>
                                                                    {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                                </Text>
                                                            ))}
                                                            {sound.length === 0 && media.length === 0 && (
                                                                <Text style={styles.emptySlotText}>-</Text>
                                                            )}
                                                        </>
                                                    )}
                                                </View>
                                            )}

                                            {/* Microfones Volantes */}
                                            {hasRovingMics && (
                                                <View
                                                    style={[
                                                        hasStageMics ? styles.cell : styles.cellLast,
                                                        { width: widthRovingMics }
                                                    ]}
                                                >
                                                    {rovingMics.length > 0 ? (
                                                        rovingMics.map((a, idx) => (
                                                            <Text key={a.id} style={styles.itemText}>
                                                                <Text style={styles.itemLabel}>
                                                                    {rovingMics.length > 1 ? `• Vol. ${idx + 1}: ` : "• "}
                                                                </Text>
                                                                {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                            </Text>
                                                        ))
                                                    ) : (
                                                        <Text style={styles.emptySlotText}>-</Text>
                                                    )}
                                                </View>
                                            )}

                                            {/* Pedestal */}
                                            {hasStageMics && (
                                                <View style={[styles.cellLast, { width: widthStageMics }]}>
                                                    {stageMics.length > 0 ? (
                                                        stageMics.map((a) => (
                                                            <Text key={a.id} style={styles.itemText}>
                                                                <Text style={styles.itemLabel}>• </Text>
                                                                {a.publisher?.nickname || a.publisher?.fullName || "-"}
                                                            </Text>
                                                        ))
                                                    ) : (
                                                        <Text style={styles.emptySlotText}>-</Text>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>

                {/* Rodapé */}
                <Text style={styles.footer}>
                    Quadro de Anúncios • Gerado em {dayjs().format("DD/MM/YYYY [às] HH:mm")}
                </Text>
            </Page>
        </Document>
    );
};
