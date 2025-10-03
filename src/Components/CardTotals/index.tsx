import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { IMonthsWithYear, ITotalsReports } from "@/types/types"
import { Page, StyleSheet, Text, View } from '@react-pdf/renderer'


interface S21Props {
    months: IMonthsWithYear[]
    reports?: ITotalsReports[]
}

export default function CardTotals({ months, reports }: S21Props) {
    months.map(month => month.totalHours = 0)

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
        tableCell: {
            borderWidth: 1,
            borderColor: '#000',
            padding: 5,
        },
        checkbox: {
            borderWidth: 1,  // Adicione a largura da borda desejada
            borderColor: '#000',  // Cor da borda (preto)
            padding: 3,
            marginRight: 4
        },
        checkboxSelected: {
            borderWidth: 1,  // Adicione a largura da borda desejada
            borderColor: '#000',
            backgroundColor: "#000", // Cor da borda (preto)
            padding: 3,
            marginRight: 4
        },
    })

    return (
        <Page size="A4">
            <View style={{ padding: 20, flex: 1, flexDirection: "column" }}>
                <>
                    <Text style={styles.title}>
                        REGISTRO DE PUBLICADOR DE CONGREGAÇÃO
                    </Text>
                    <View style={{
                        flexDirection: "row", justifyContent: "space-between", fontSize: 12, fontFamily: "Times-Bold"
                    }}>
                        <View style={{ flexDirection: "column" }}>
                            <View style={{ flexDirection: "row", marginBottom: 3, fontWeight: "bold" }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Nome:</Text>
                                <Text style={{fontFamily: "Times-Roman"}}>{reports && reports.length > 0 ? reports[0]?.privileges : ""}</Text>
                            </View>
                            <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Data de nascimento:</Text>
                                <Text></Text>
                            </View>
                            <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Data de batismo:</Text>
                                <Text></Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "column", alignSelf: "flex-end" }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {<Text style={styles.checkbox}></Text>}
                                <Text style={{ width: 128 }}>Masculino</Text>

                                {<Text style={styles.checkbox}></Text>}
                                <Text >Feminino</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {<Text style={styles.checkbox}></Text>}
                                <Text style={{ width: 128 }}>Outras ovelhas</Text>

                                {<Text style={styles.checkbox}></Text>}
                                <Text >Ungido</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "row", alignItems: "center", marginTop: 2, fontFamily: "Times-Bold",
                    }}>
                        {<Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Ancião</Text>

                        {<Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginRight: 12, marginLeft: 2 }}>Servo ministerial</Text>

                        {reports && reports[0]?.privileges?.includes("Pioneiros regulares") ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Pioneiro regular</Text>

                        {reports && reports[0]?.privileges?.includes("Pioneiros especiais e Missionários em campo") ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Pioneiro especial</Text>

                        {reports && reports[0]?.privileges?.includes("Pioneiros especiais e Missionários em campo") ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Missionário em campo</Text>
                    </View>
                    {months.map((serviceYear, i) => (
                        <View key={`${serviceYear} ${i}`}>
                        <View style={{ flexDirection: "row", marginTop: 5, fontFamily: "Times-Bold", }}>
                            <View style={{ width: 112, height: 64, fontSize: 12, fontWeight: "bold", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#000' }}>
                                <Text>Ano de serviço</Text>
                                <Text>{serviceYear.year}</Text>
                            </View>
                            <View style={{ width: 80, height: 64, fontSize: 12, fontWeight: "bold", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#000', borderLeft: 0, paddingHorizontal: 8, textAlign: "center" }}>
                                <Text>Participou no ministério</Text>
                            </View>
                            <View style={{ width: 80, height: 64, fontSize: 12, fontWeight: "bold", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#000', borderLeft: 0, paddingHorizontal: 8, textAlign: "center" }}>
                                <Text>Estudos bíblicos</Text>
                            </View>
                            <View style={{ width: 80, height: 64, fontSize: 12, fontWeight: "bold", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#000', borderLeft: 0, paddingHorizontal: 8, textAlign: "center" }}>
                                <Text>Pioneiro auxiliar</Text>
                            </View>
                            <View style={{ width: 80, height: 64, fontSize: 12, fontWeight: "bold", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#000', borderLeft: 0, paddingHorizontal: 8, textAlign: "center" }}>
                                <Text>Horas</Text>
                                <Text style={{ fontSize: 8, fontFamily: "Times-Roman" }}>(se for pioneiro ou missionário em campo)</Text>
                            </View>
                            <View style={{ width: 160, fontSize: 12, fontWeight: "bold", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#000', borderLeft: 0 }}>
                                <Text>Observações</Text>
                            </View>
                        </View>
                        {serviceYear.months.map((month) => {
                            let splitMonth = month.split(" ")
                            const report = reports?.find(r => {
                                return (r.month === capitalizeFirstLetter(splitMonth[0]) && r.year === splitMonth[1])
                            })
                            if (report?.hours && report.hours > 0) serviceYear.totalHours += report.hours
                            return (
                                <View style={{ flexDirection: "row", height: 20, fontSize: 12, border: 0 }} key={month}>
                                    <View id="Mes" style={{ width: 112, borderLeft: 0, borderLeftWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderRight: 1, borderRightWidth: 1, borderColor: '#000', justifyContent: "center" }}>
                                        <Text style={{ paddingLeft: 2 }}>{capitalizeFirstLetter(splitMonth[0])}</Text>
                                    </View>
                                    <View id="Parcipou na pregação" style={{ width: 80, justifyContent: "center", alignItems: "center", borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000' }}>
                                        <Text style={styles.checkbox}></Text>
                                    </View>
                                    <View id="Estudos bíblicos" style={{ width: 80, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ textAlign: "center" }}>{report ? report.studies : ""}</Text>
                                    </View>
                                    <View id="Pioneiro auxiliar" style={{ width: 80, justifyContent: "center", alignItems: "center", borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000' }}>
                                        <Text style={styles.checkbox}></Text>
                                    </View>
                                    <View id="Horas" style={{ width: 80, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ textAlign: "center" }}>{report && !report.privileges?.includes("Publicadores") ? report.hours : ""}</Text>
                                    </View>
                                    <View id="Observações" style={{ width: 160, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ textAlign: "center" }}>{report && report.quantity}</Text>
                                    </View>
                                </View>
                            )
                        })}
                        <View style={{ flexDirection: "row", height: 20 }}>
                            <View style={{ width: 112 }}></View>
                            <View style={{ width: 80 }}></View>
                            <View style={{ width: 80 }}></View>
                            <View style={{ width: 80, fontSize: 10, fontFamily: "Times-Bold", justifyContent: "center", textAlign: "right", paddingRight: 4, borderRight: 1, borderRightWidth: 1 }}>
                                <Text>Total</Text>
                            </View>
                            <View style={{ width: 80, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: "center", alignItems: "center", fontSize: 12, fontFamily: "Times-Bold" }}>
                                <Text>{serviceYear.totalHours > 0 && serviceYear.totalHours}</Text>
                            </View>
                            <View style={{ width: 160, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000' }}></View>
                        </View>
                    </View>
                    ))}
                </>
            </View>
        </Page>
    )
}