import { IPublisher, IReports, Privileges } from "@/entities/types"
import { CheckSquareIcon, SquareIcon } from "lucide-react"
import moment from "moment"
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Polygon, Rect } from '@react-pdf/renderer';


export interface S21Props {
    serviceYear: string
    months: string[]
    publisher: IPublisher
    reports?: IReports[]
}

export default function S212({ months, publisher, serviceYear, reports }: S21Props) {
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            backgroundColor: '#E4E4E4'
        },
        section: {
            margin: 10,
            padding: 10,
            flexGrow: 1
        },
        title: {
            fontSize: 16,
            fontWeight: "extrabold",
            textAlign: "center",
            marginVertical: "10px",
        },
        tableCell: {
            borderWidth: 1,  // Adicione a largura da borda desejada
            borderColor: '#000',  // Cor da borda (preto)
            padding: 5,  // Espaçamento interno para o conteúdo da célula
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
    });

    const ExampleSvg = () => (
        <Svg width="10" height="10" viewBox="-10 -10 10 10">
            <Polygon points="0,0 80,120 -80,120" fill="#234236" />
            <Polygon points="0,-40 60,60 -60,60" fill="#0C5C4C" />
            <Polygon points="0,-80 40,0 -40,0" fill="#38755B" />
            <Rect x="-20" y="120" width="40" height="30" fill="#A32B2D" />
        </Svg>
    );

    return (
        <Page size="A4">
            <View style={{ padding: 20, flex: 1, flexDirection: "column" }}>
                <>
                    <Text style={styles.title}>
                        REGISTRO DE PUBLICADOR DE CONGREGAÇÃO
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 12, fontWeight: "extrabold" }}>
                        <View style={{ flexDirection: "column" }}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Nome:</Text>
                                <Text>{publisher.fullName}</Text>
                            </View>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Data de nascimento:</Text>
                                <Text>{publisher.birthDate && moment(publisher.birthDate).format("DD/MM/YYYY")}</Text>
                            </View>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ fontWeight: "bold", marginRight: 2 }}>Data de batismo:</Text>
                                <Text>{publisher.dateImmersed && moment(publisher.dateImmersed).format("DD/MM/YYYY")}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "column", alignSelf: "flex-end" }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {publisher.gender !== "Masculino" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text style={{ width: 128 }}>Masculino</Text>

                                {publisher.gender !== "Feminino" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text >Feminino</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {publisher.hope !== "Outras ovelhas" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text style={{ width: 128 }}>Outras ovelhas</Text>

                                {publisher.hope !== "Ungido" ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                                <Text >Ungido</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {publisher.privileges.includes(Privileges.ANCIAO) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{fontSize: 12}}>Ancião</Text>

                        {publisher.privileges.includes(Privileges.SM) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{fontSize: 12}}>Servo ministerial</Text>

                        {publisher.privileges.includes(Privileges.PIONEIROREGULAR) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{fontSize: 12}}>Pioneiro regular</Text>

                        {publisher.privileges.includes(Privileges.PIONEIROESPECIAL) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{fontSize: 12}}>Pioneiro especial</Text>

                        {publisher.privileges.includes(Privileges.MISSIONARIOEMCAMPO) ? <Text style={styles.checkboxSelected}></Text> : <Text style={styles.checkbox}></Text>}
                        <Text style={{fontSize: 12}}>Missionário em campo</Text>

                    </View>
                    {/* 
                        {publisher.privileges.includes("Servo ministerial") ? "✔" : "▢"} Servo ministerial
                        {publisher.privileges.includes("Pioneiro regular") ? "✔" : "▢"} Pioneiro regular
                        {publisher.privileges.includes("Pioneiro especial") ? "✔" : "▢"} Pioneiro especial
                        {publisher.privileges.includes("Missionário em campo") ? "✔" : "▢"} Missionário em campo */}
                    <View>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ width: 60, fontSize: 10, fontWeight: "bold" }}>
                                <Text>Ano de serviço</Text>
                                <Text>{serviceYear}</Text>
                            </View>
                            <View style={{ width: 80, fontSize: 10, fontWeight: "bold" }}>
                                <Text>Participou no ministério</Text>
                            </View>
                            <View style={{ width: 80, fontSize: 10, fontWeight: "bold" }}>
                                <Text>Estudos bíblicos</Text>
                            </View>
                            <View style={{ width: 80, fontSize: 10, fontWeight: "bold" }}>
                                <Text>Pioneiro auxiliar</Text>
                            </View>
                            <View style={{ width: 80, fontSize: 10, fontWeight: "bold" }}>
                                <Text>Horas</Text>
                                <Text style={{ fontSize: 8 }}>(se for pioneiro ou missionário em campo)</Text>
                            </View>
                            <View style={{ width: 200, fontSize: 10, fontWeight: "bold" }}>
                                <Text>Observações</Text>
                            </View>
                        </View>
                        {months.map((month) => (
                            <View style={{ flexDirection: "row" }} key={month + "2"}>
                                <View style={{ width: 60 }}>
                                    <Text>{month}</Text>
                                </View>
                                <View style={{ width: 80, alignItems: "center" }}>
                                    <Text>▢</Text>
                                </View>
                                <View style={{ width: 80 }}></View>
                                <View style={{ width: 80, alignItems: "center" }}>
                                    <Text>▢</Text>
                                </View>
                                <View style={{ width: 80 }}></View>
                                <View style={{ width: 200 }}></View>
                            </View>
                        ))}
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ width: 60 }}></View>
                            <View style={{ width: 80 }}></View>
                            <View style={{ width: 80 }}></View>
                            <View style={{ width: 80, fontSize: 10, fontWeight: "bold", textAlign: "right" }}>
                                <Text>Total</Text>
                            </View>
                            <View style={{ width: 80 }}></View>
                            <View style={{ width: 200 }}></View>
                        </View>
                    </View>
                </>
            </View>
        </Page>
    )
}