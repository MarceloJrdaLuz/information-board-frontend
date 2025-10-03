import { capitalizeFirstLetter } from '@/functions/isAuxPioneerMonthNow'
import { getMonthsByYear, } from "@/functions/meses"
import { IMeetingAssistance } from "@/types/types"
import { Page, StyleSheet, Text, View } from '@react-pdf/renderer'

export interface S88Props {
    meetingAssistance?: IMeetingAssistance[]
    yearsServices: string[]
}

export default function S88({ meetingAssistance, yearsServices }: S88Props) {
    let midWeekTotalYear = 0
    let endWeekTotalYear = 0

    const styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            backgroundColor: '#E4E4E4',
        },
        section: {
            margin: 10,
            padding: 10,
            flexGrow: 1
        },
        title: {
            fontSize: 16,
            fontFamily: "Times-Bold",
            fontWeight: "bold",
            textAlign: "center",
            marginVertical: "10px",
        },
        subtitle: {
            fontSize: 16,
            fontFamily: "Times-Bold",
            fontWeight: "bold",
            textAlign: "left",
            marginVertical: "10px",
            marginLeft: "5px"
        },
        rowTable: {
            fontFamily: "Times-Roman",
            fontSize: 12,
            height: 20,
            width: 70,
            justifyContent: "center",
            alignItems: "center",
            borderColor: '#000',
            borderLeft: 0.5,
            borderTop: 0.5,
        },
        rowTableInitial: {
            fontFamily: "Times-Roman",
            fontSize: 12,
            width: 80,
            height: 20,
            justifyContent: "center",
            alignItems: "flex-start",
            borderColor: '#000',
            borderTop: 0.5,
            paddingLeft: 3
        },
        headerTable: {
            fontFamily: "Times-Bold",
            fontSize: 12,
            height: 38,
            width: 70,
            justifyContent: "center",
            alignItems: "center",
            borderLeft: 0.5
        },
        headerTableInitial: {
            fontFamily: "Times-Bold",
            fontSize: 12,
            width: 80,
            height: 38,
            justifyContent: "center",
            alignItems: "center",
            borderColor: '#000',
        }
    })

    return (
        <Page size="A4">
            <View style={{ padding: 15, flex: 1, flexDirection: "column" }}>
                <>
                    <Text style={styles.title}>
                        REGISTRO DA ASSISTÊNCIA ÀS REUNIÕES CONGREGACIONAIS
                    </Text>
                    <Text style={styles.subtitle}>
                        Reunião do meio de semana
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
                        {yearsServices?.map(yearService => {
                            const { months } = getMonthsByYear(yearService)
                            let yearlyTotal = 0
                            let yearlyCount = 0
                            return (
                                <View key={yearService} style={{ border: 1, borderColor: "#000", justifyContent: "space-between", flexGrow: 1 }}>
                                    <View style={{ flexDirection: "row" }}>
                                        <View style={styles.headerTableInitial}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Ano de serviço</Text>
                                            <Text>{yearService}</Text>
                                        </View>
                                        <View style={styles.headerTable}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Quantidade</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>de reuniões</Text>
                                        </View>
                                        <View style={styles.headerTable}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Assistência</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>total</Text>
                                        </View>
                                        <View style={styles.headerTable}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Assistência</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>média por</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>semana</Text>
                                        </View>
                                    </View>
                                    {months.map(month => {
                                        const assistance = meetingAssistance?.find(
                                            assist => assist.month === capitalizeFirstLetter(month.split(' ')[0]) && assist.year === month.split(' ')[1]
                                        )
                                        const monthSplit = month.split(" ")
                                        const midWeekCount = assistance ? assistance.midWeek.filter(value => Number(value) > 0).length : 0
                                        const midWeekTotal = assistance?.midWeekTotal ?? 0
                                        const midWeekAverage = midWeekCount > 0 ? (midWeekTotal / midWeekCount).toFixed(2) : "0.00"

                                        yearlyTotal += midWeekTotal
                                        yearlyCount += midWeekCount
                                        return (
                                            <View key={month} style={{ flexDirection: "row" }}>
                                                <View style={styles.rowTableInitial}>
                                                    <Text>{capitalizeFirstLetter(monthSplit[0])}</Text>
                                                </View>
                                                <View style={styles.rowTable}>
                                                    <Text>{midWeekCount}</Text>
                                                </View>
                                                <View style={styles.rowTable}>
                                                    <Text>{assistance?.midWeekTotal ?? 0}</Text>
                                                </View>
                                                <View style={styles.rowTable}>
                                                    <Text>{midWeekAverage}</Text>
                                                </View>
                                            </View>
                                        )
                                    })}
                                    <View style={{ flexDirection: "row", }}>
                                        <View style={{
                                            fontFamily: "Times-Bold",
                                            fontSize: 12,
                                            width: 220,
                                            height: 20,
                                            borderTop: 0.5,
                                            justifyContent: "center",
                                            alignItems: "flex-end",
                                            paddingRight: 5,
                                        }}>
                                            <Text style={{ paddingLeft: 2 }}> Assistência média por mês</Text>
                                        </View>
                                        <View style={styles.rowTable}>
                                            <Text style={{ paddingLeft: 2 }}>{yearlyCount > 0 ? (yearlyTotal / yearlyCount).toFixed(2) : "0.00"}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                    <Text style={styles.subtitle}>
                        Reunião do fim de semana
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        {yearsServices?.map(yearService => {
                            const { months } = getMonthsByYear(yearService)
                            let yearlyTotal = 0
                            let yearlyCount = 0
                            return (
                                <View key={yearService} style={{ border: 1, borderColor: "#000", justifyContent: "space-between", flexGrow: 1 }}>
                                    <View style={{ flexDirection: "row" }}>
                                        <View style={styles.headerTableInitial}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Ano de serviço</Text>
                                            <Text>{yearService}</Text>
                                        </View>
                                        <View style={styles.headerTable}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Quantidade</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>de reuniões</Text>
                                        </View>
                                        <View style={styles.headerTable}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Assistência</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>total</Text>
                                        </View>
                                        <View style={styles.headerTable}>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Assistência</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>média por</Text>
                                            <Text style={{ fontWeight: "bold", textAlign: "center" }}>semana</Text>
                                        </View>
                                    </View>
                                    {months.map(month => {
                                        const assistance = meetingAssistance?.find(
                                            assist => assist.month === capitalizeFirstLetter(month.split(' ')[0]) && assist.year === month.split(' ')[1]
                                        )
                                        const monthSplit = month.split(" ")
                                        const endWeekCount = assistance ? assistance.endWeek.filter(value => Number(value) > 0).length : 0
                                        const endWeekTotal = assistance?.endWeekTotal ?? 0
                                        const endWeekAverage = endWeekCount > 0 ? (endWeekTotal / endWeekCount).toFixed(2) : "0.00"

                                        yearlyTotal += endWeekTotal
                                        yearlyCount += endWeekCount
                                        return (
                                            <View key={month} style={{ flexDirection: "row" }}>
                                                <View style={styles.rowTableInitial}>
                                                    <Text>{capitalizeFirstLetter(monthSplit[0])}</Text>
                                                </View>
                                                <View style={styles.rowTable}>
                                                    <Text>{endWeekCount}</Text>
                                                </View>
                                                <View style={styles.rowTable}>
                                                    <Text>{assistance?.endWeekTotal ?? 0}</Text>
                                                </View>
                                                <View style={styles.rowTable}>
                                                    <Text>{endWeekAverage}</Text>
                                                </View>
                                            </View>
                                        )
                                    })}
                                    <View style={{ flexDirection: "row", }}>
                                        <View style={{
                                            fontFamily: "Times-Bold",
                                            fontSize: 12,
                                            width: 220,
                                            height: 20,
                                            borderTop: 0.5,
                                            justifyContent: "center",
                                            alignItems: "flex-end",
                                            paddingRight: 5,
                                        }}>
                                            <Text style={{ paddingLeft: 2 }}> Assistência média por mês</Text>
                                        </View>
                                        <View style={styles.rowTable}>
                                            <Text style={{ paddingLeft: 2 }}>{yearlyCount > 0 ? (yearlyTotal / yearlyCount).toFixed(2) : "0.00"}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </>
            </View>
        </Page>
    )
}