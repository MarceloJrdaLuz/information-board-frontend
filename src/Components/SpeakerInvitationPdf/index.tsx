import { Page, StyleSheet, Text, View, Link } from "@react-pdf/renderer";
import { ICongregation } from "@/types/types";
import { formatNameCongregation } from "@/utils/formatCongregationName";
import { IWeekendSchedule } from "@/types/weekendSchedule";
import moment from "moment";

interface ISpeakerInvitationPdfProps {
    schedule: IWeekendSchedule
    congregationLocale: ICongregation
    scale?: number;
}

export default function SpeakerInvitationPdf({
    schedule,
    congregationLocale,
    scale = 1,
}: ISpeakerInvitationPdfProps) {
    const styles = StyleSheet.create({
        page: {
            padding: 25 * scale,
            fontSize: 12 * scale,
            lineHeight: 1.4,
            fontFamily: "Helvetica",
            color: "#2a2b2b",
        },
        topRight: {
            width: "100%",
            alignItems: "flex-end",
            marginBottom: 20 * scale,
        },
        congregationHeader: {
            fontFamily: "Helvetica-Bold",
            fontSize: 14 * scale,
            color: "#2a2b2b",
        },
        topSubText: {
            fontSize: 11 * scale,
            color: "#606A70",
        },
        subject: {
            fontFamily: "Helvetica-BoldOblique",
            fontSize: 14 * scale,
            marginBottom: 18 * scale,
            marginLeft: 8 * scale,
            color: "#28456C",
        },
        paragraph: {
            marginBottom: 12 * scale,
            marginLeft: 14 * scale,
            textAlign: "justify",
        },
        detailsBox: {
            border: 1,
            borderColor: "#AEAAAA",
            borderRadius: 5 * scale,
            padding: 10 * scale,
            marginVertical: 18 * scale,
            width: "85%",
            alignSelf: "center",
        },
        detailRow: {
            flexDirection: "row",
            marginBottom: 5 * scale,
        },
        label: {
            fontFamily: "Helvetica-Bold",
            color: "#606A70",
        },
        signature: {
            marginTop: 20 * scale,
        },
        bold: {
            fontFamily: "Helvetica-Bold",
        },
        mapLink: {
            fontSize: 11 * scale,
            color: "#28456C",
            textDecoration: "underline",
        }
    });

    const mapUrl =
        congregationLocale.latitude && congregationLocale.longitude
            ? `https://www.google.com/maps?q=${congregationLocale.latitude},${congregationLocale.longitude}`
            : undefined;

    const themeText = schedule?.manualTalk
        ? schedule.manualTalk
        : schedule?.talk?.title;

    return (
        <Page size="A4" style={styles.page}>
            {/* Top Right Block */}
            <View style={styles.topRight}>
                <Text style={styles.congregationHeader}>
                    Congregação {formatNameCongregation(congregationLocale.name)}
                </Text>
                <Text style={styles.topSubText}>{congregationLocale.speakerCoordinator?.fullName}</Text>
                <Text style={styles.topSubText}>{congregationLocale.address}</Text>
                <Text style={styles.topSubText}>{congregationLocale.city}</Text>
            </View>

            {/* Subject */}
            <Text style={styles.subject}>
                Assunto: Convite para Orador Público
            </Text>

            <Text style={styles.paragraph}>
                Cristo Jesus, seus apóstolos e os que se associavam com eles
                realizavam reuniões públicas semelhantes às que temos hoje nas
                congregações do povo de Jeová. Assim como no primeiro século,
                esses discursos nos ajudam a sempre dar atenção aos ensinos
                cristãos e a permanecer firmes no serviço do Reino.
            </Text>

            <Text style={styles.paragraph}>
                É com grande alegria que o convidamos para proferir um discurso
                para o público em nossa congregação. Seguem os detalhes abaixo:
            </Text>

            {/* Details Box */}
            <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Data: </Text>
                    <Text>{moment(schedule?.date).format("DD/MM/YYYY")} - {congregationLocale.dayMeetingPublic}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Horário: </Text>
                    <Text>{moment(congregationLocale.hourMeetingPublic, "HH:mm:ss").format("HH:mm")}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Orador: </Text>
                    <Text>{schedule?.speaker?.fullName}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Congregação: </Text>
                    <Text>
                        {formatNameCongregation(
                            schedule?.speaker?.originCongregation?.name,
                            schedule?.speaker?.originCongregation?.city
                        )}
                    </Text>
                </View>
                 <View style={styles.detailRow}>
                    <Text style={styles.label}>Discurso: </Text>
                    <Text>{schedule.talk?.number} - {schedule.talk?.title}</Text>
                </View>
            </View>

            <Text style={styles.paragraph}>
                Caso use imagens, poderá criar uma playlist no
                aplicativo JW Library. Por favor, compartilhe as imagens com uma
                semana de antecedência no meu whatsapp.
            </Text>

            <Text style={styles.paragraph}>
                Seria um prazer para a congregação receber o irmão e a família para um lanche após a reunião. 
                Se for possível, confirme o quanto antes se vão ficar, e a quantidade de pessoas para que o arranjo possa ser organizado. 
            </Text>

            <Text style={styles.paragraph}>
                Estamos certos de que será uma ocasião de encorajamento mútuo.
            </Text>

            <Text style={styles.signature}>Seu irmão,</Text>
            <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Text style={[styles.signature, {
                    fontFamily: "Helvetica-BoldOblique",
                    fontSize: 16
                }]}>{congregationLocale.speakerCoordinator?.fullName}</Text>
                <Text>{congregationLocale.speakerCoordinator?.phone}</Text>
            </View>

            <Text style={[styles.bold, { marginTop: 20 * scale }]}>
                Localização do Salão do Reino:
            </Text>
            <Text style={{ marginTop: 5 * scale }}>{congregationLocale.address}</Text>
            <Text>{congregationLocale.city}</Text>
            {mapUrl && (
                <Link src={mapUrl}>
                    <Text style={styles.mapLink}>Clique para abrir no Google Maps</Text>
                </Link>
            )}
        </Page>
    );
}
