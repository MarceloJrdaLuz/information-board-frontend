import { ITerritoryWithHistories } from '@/entities/territory';
import { getYearService } from '@/functions/meses';
import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';
import React from 'react';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 12,
        flexDirection: 'column',
    },
    header: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    table: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%',
        height: '91%',
        marginTop: 10,
        borderWidth: 2,
    },
    tableColl: {
        backgroundColor: '#f2f2f2',
        flexDirection: 'row',
        borderBottom: 1,
        borderLeft: 1,
        borderColor: "#000",
        height: '40px',
        width: '22%'
    },
    firstTableColl: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        display: 'flex',
        width: '12%'
    },
    rowTerritoryNumber: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: 1,
        borderRight: 1,
        borderColor: '#000',
        width: '35%',
        height: '40px',
        backgroundColor: '#f2f2f2'
    },
    rowUltimaData: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: 1,
        borderColor: '#000',
        width: '65%',
        height: '40px',
        backgroundColor: '#f2f2f2'
    },
    firstCollText: {
        textAlign: 'center', fontSize: 8
    },
    row: {
        display: 'flex',
        flex: 1,
        alignContent: 'center',
        fontSize: 9,
        height: '40px'
    },
    rowDesignadoPara: {
        textAlign: "center",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: '2px',
        borderBottom: 1,
        height: '40%'
    },
    rowTwoColl: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60%'
    },
    rowLeft: {
        display:'flex', 
        alignItems: 'center',
        textAlign: "center",
        borderRight: 1,
        padding: '2px',
        height: '100%',
        width: '50%'
    },
    rowRight: {
        textAlign: "center",
        padding: '2px',
        height: '100%',
        width: '50%'
    }
})

export interface S13Props {
    territoriesHistory: ITerritoryWithHistories[]
}

export default function S13({ territoriesHistory }: S13Props) {

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>REGISTRO DE DESIGNAÇÃO DE TERRITÓRIO</Text>
            <Text style={styles.subHeader}>{`Ano de Serviço: ${getYearService() - 1} -  ${getYearService()}`}</Text>
            <View style={styles.table}>
                {/* Cabeçalho da Tabela */}
                <View style={styles.firstTableColl}>
                    <View style={styles.rowTerritoryNumber}>
                        <Text style={styles.firstCollText}>Terr. n.º</Text>
                    </View>
                    <View style={styles.rowUltimaData}>
                        <Text style={styles.firstCollText}>Última data concluída</Text>
                    </View>
                </View>

                {Array(4).fill(null).map((_, index) => (
                    <View key={index} style={styles.tableColl}>
                        <View style={styles.row}>
                            <Text style={styles.rowDesignadoPara}>Designado para</Text>
                            <View style={styles.rowTwoColl}>
                                <Text style={styles.rowLeft}>Data da {"\n"} designação</Text>
                                <Text style={styles.rowRight}>Data da {"\n"} conclusão</Text>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Preenchendo linhas com dados do histórico existente */}
                {territoriesHistory.map((rowData, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        <View style={styles.firstTableColl}>
                            <View style={[styles.rowTerritoryNumber, { backgroundColor: "white" }]}>
                                <Text style={styles.firstCollText}>{rowData.number || ''}</Text>
                            </View>
                            <View style={[styles.rowUltimaData, { backgroundColor: "white" }]}>
                                <Text style={styles.firstCollText}>{moment(rowData.last_completion_date).format("DD/MM/YYYY") || ''}</Text>
                            </View>
                        </View>

                        {Array(4).fill(null).map((_, colIndex) => (
                            <View key={colIndex} style={[styles.tableColl, { backgroundColor: "white" }]}>
                                <View style={styles.row}>
                                    <View style={styles.rowDesignadoPara}>
                                        <Text>{rowData.histories[colIndex]?.caretaker || ''}</Text>
                                        <Text>- {rowData.histories[colIndex]?.work_type || ''}</Text>
                                    </View>
                                    <View style={styles.rowTwoColl}>
                                        <Text style={styles.rowLeft}>{rowData.histories[colIndex]?.assignment_date
                                            ? moment(rowData.histories[colIndex]?.assignment_date).format("DD/MM/YYYY")
                                            : ''}</Text>
                                        <Text style={styles.rowRight}> {rowData.histories[colIndex]?.completion_date
                                            ? moment(rowData.histories[colIndex]?.completion_date).format("DD/MM/YYYY")
                                            : ''}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </React.Fragment>
                ))}

                {/* Preenchendo linhas vazias até completar 17 */}
                {Array.from({ length: 17 - territoriesHistory.length }).map((_, rowIndex) => (
                    <React.Fragment key={rowIndex + territoriesHistory.length}>
                        <View style={styles.firstTableColl}>
                            <View style={[styles.rowTerritoryNumber, { backgroundColor: "white" }]}>
                                <Text style={styles.firstCollText}></Text>
                            </View>
                            <View style={[styles.rowUltimaData, { backgroundColor: "white" }]}>
                                <Text style={styles.firstCollText}></Text>
                            </View>
                        </View>

                        {Array(4).fill(null).map((_, colIndex) => (
                            <View key={colIndex} style={[styles.tableColl, { backgroundColor: "white" }]}>
                                <View style={styles.row}>
                                    <Text style={styles.rowDesignadoPara}></Text>
                                    <View style={styles.rowTwoColl}>
                                        <Text style={styles.rowLeft}></Text>
                                        <Text style={styles.rowRight}></Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </React.Fragment>
                ))}
            </View>
        </Page>
    );
}