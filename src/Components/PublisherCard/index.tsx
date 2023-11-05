import { IPublisher, IReports, Privileges } from "@/entities/types"
import moment from "moment"
import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'


export interface S21Props {
    serviceYear: string
    months: string[]
    publisher: IPublisher
    reports?: IReports[]
}

export default function S21({ months, publisher, serviceYear, reports }: S21Props) {
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

    const isPionner = publisher.privileges.some(privilege =>
        privilege === Privileges.AUXILIARINDETERMINADO ||
        privilege === Privileges.MISSIONARIOEMCAMPO ||
        privilege === Privileges.PIONEIROREGULAR ||
        privilege === Privileges.PIONEIROESPECIAL
    )

    return (
        <Page size="A4">
            <View style={{ padding: 20, flex: 1, flexDirection: "column" }}>
                <>
                    <Text style={styles.title}>
                        REGISTRO DE PUBLICADOR DE CONGREGAÇÃO
                    </Text>
                    <View style={{
                        flexDirection: "row", justifyContent: "space-between", fontSize: 12, fontFamily: "Times-Bold",
                    }}>
                        <View style={{ flexDirection: "column" }}>
                            <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Nome:</Text>
                                <Text>{publisher.fullName}</Text>
                            </View>
                            <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Data de nascimento:</Text>
                                <Text>{publisher.birthDate && moment(publisher.birthDate).format("DD/MM/YYYY")}</Text>
                            </View>
                            <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Data de batismo:</Text>
                                <Text>{publisher.dateImmersed && moment(publisher.dateImmersed).format("DD/MM/YYYY")}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "column", alignSelf: "flex-end" }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {publisher.gender === "Masculino" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text style={{ width: 128 }}>Masculino</Text>

                                {publisher.gender === "Feminino" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text >Feminino</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {publisher.hope === "Outras ovelhas" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text style={{ width: 128 }}>Outras ovelhas</Text>

                                {publisher.hope === "Ungido" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text >Ungido</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "row", alignItems: "center", marginTop: 2, fontFamily: "Times-Bold",
                    }}>
                        {publisher.privileges.includes(Privileges.ANCIAO) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Ancião</Text>

                        {publisher.privileges.includes(Privileges.SM) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginRight: 12, marginLeft: 2 }}>Servo ministerial</Text>

                        {publisher.privileges.includes(Privileges.PIONEIROREGULAR) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Pioneiro regular</Text>

                        {publisher.privileges.includes(Privileges.PIONEIROESPECIAL) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Pioneiro especial</Text>

                        {publisher.privileges.includes(Privileges.MISSIONARIOEMCAMPO) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{ fontSize: 12, marginLeft: 2, marginRight: 12 }}>Missionário em campo</Text>
                    </View>
                    <View>
                        <View style={{ flexDirection: "row", marginTop: 5, fontFamily: "Times-Bold", }}>
                            <View style={{ width: 112, height: 64, fontSize: 12, fontWeight: "bold", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#000' }}>
                                <Text>Ano de serviço</Text>
                                <Text>{serviceYear}</Text>
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
                        {months.map((month) => {
                            const report = reports?.find(r => r.year === serviceYear && r.month === month)
                            return (
                                <View style={{ flexDirection: "row", height: 20, fontSize: 12, border: 0 }} key={month}>
                                    <View id="Mes" style={{ width: 112, borderLeft: 0, borderLeftWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderRight: 1, borderRightWidth: 1, borderColor: '#000' }}>
                                        <Text>{month}</Text>
                                    </View>
                                    <View id="Parcipou na pregação" style={{ width: 80, justifyContent: "center", alignItems: "center", borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000' }}>
                                        <Text style={!report || isPionner ? styles.checkbox : styles.checkboxSelected}></Text>
                                    </View>
                                    <View id="Estudos bíblicos" style={{ width: 80, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ textAlign: "center" }}>{report ? report.studies : ""}</Text>
                                    </View>
                                    <View id="Pioneiro auxiliar" style={{ width: 80, justifyContent: "center", alignItems: "center", borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000' }}>
                                        <Text style={styles.checkbox}></Text>
                                    </View>
                                    <View id="Horas" style={{ width: 80, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ textAlign: "center" }}>{report && isPionner ? report.hours : ""}</Text>
                                    </View>
                                    <View id="Observações" style={{ width: 160, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ textAlign: "center" }}>{report ? report.observations : ""}</Text>
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
                            <View style={{ width: 80, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000' }}></View>
                            <View style={{ width: 160, borderRight: 1, borderRightWidth: 1, borderTop: 0, borderTopWidth: 0, borderBottom: 1, borderBottomWidth: 1, borderColor: '#000' }}></View>
                        </View>
                    </View>
                </>
            </View>
        </Page>
    )
}