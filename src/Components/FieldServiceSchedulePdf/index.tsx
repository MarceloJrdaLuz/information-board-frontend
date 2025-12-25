import { FieldServiceFixedSchedule, FieldServiceRotationBlock } from "@/types/fieldService";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

Font.register({
  family: "Crimson Pro",
  fonts: [
    { src: "/fonts/CrimsonPro-Light.ttf", fontWeight: "normal" },
    { src: "/fonts/CrimsonPro-Bold.ttf", fontWeight: "bold" },
  ],
});

interface FieldServiceSchedulePdfProps {
  congregationName?: string;
  rotationBlocks: FieldServiceRotationBlock[];
  fixedSchedules: FieldServiceFixedSchedule[];
  scale?: number; // Propriedade para controlar o tamanho
}

const COLORS = {
  headerBg: "#28456C",
  headerText: "#FFFFFF",
  tableBorder: "#9CC2E5",
  rowEvenBg: "#DEEAF6",
  textMain: "#2a2b2b",
  textTitle: "#28456C",
  textSubtitle: "#3F4C59",
};

export function FieldServiceSchedulePdf({
  congregationName,
  rotationBlocks,
  fixedSchedules,
  scale = 0.9, // Valor padrão é 1
}: FieldServiceSchedulePdfProps) {

  // Definição de estilos dentro do componente para usar o 'scale'
  const styles = StyleSheet.create({
    page: {
      padding: 25 * scale,
      fontSize: 12 * scale,
      color: COLORS.textMain,
      fontFamily: "Crimson Pro",
    },
    headerSection: {
      marginBottom: 15 * scale,
      textAlign: "center",
    },
    mainTitle: {
      fontSize: 22 * scale,
      fontWeight: "bold",
      color: COLORS.textTitle,
      marginBottom: 4 * scale,
    },
    congregationName: {
      fontSize: 14 * scale,
      color: COLORS.textSubtitle,
    },
    sectionTitle: {
      fontSize: 15 * scale,
      fontWeight: "bold",
      color: COLORS.textTitle,
      marginTop: 10 * scale,
      marginBottom: 6 * scale,
    },
    tableContainer: {
      borderWidth: 1 * scale,
      borderColor: COLORS.tableBorder,
      marginBottom: 20 * scale,
    },
    row: {
      flexDirection: "row",
      alignItems: "stretch", 
      borderBottomWidth: 1 * scale,
      borderBottomColor: COLORS.tableBorder,
      minHeight: 28 * scale, // Reduzi levemente o minHeight base
    },
    headerRow: {
      backgroundColor: COLORS.headerBg,
      borderBottomColor: COLORS.headerBg,
    },
    rowEven: {
      backgroundColor: COLORS.rowEvenBg,
    },
    cell: {
      justifyContent: "center",
      paddingVertical: 4 * scale,
      paddingHorizontal: 4 * scale,
    },
    borderRight: {
      borderRightWidth: 1 * scale,
      borderRightColor: COLORS.tableBorder,
    },
    whiteBorder: {
      borderRightColor: "#243f63",
    },
    headerText: {
      color: COLORS.headerText,
      fontSize: 13 * scale,
      fontWeight: "bold",
      textAlign: "center",
    },
    cellText: {
      textAlign: "center",
      fontSize: 11 * scale,
    },
    w20: { width: "20%" },
    w15: { width: "15%" },
    w35: { width: "35%" },
    w30: { width: "30%" },
    w40: { width: "40%" },
    w60: { width: "60%" },
  });

  const formatLongDate = (date: string) => {
    return dayjs(date).format("dddd – DD [de] MMMM").replace(/^\w/, s => s.toUpperCase());
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.headerSection} fixed>
          <Text style={styles.mainTitle}>Programação do Ministério de Campo</Text>
          {congregationName && <Text style={styles.congregationName}>{congregationName}</Text>}
        </View>

        {rotationBlocks.map((block, bIdx) => (
          <View key={bIdx} wrap={false}>
            <Text style={styles.sectionTitle}>{block.title}</Text>
            <View style={styles.tableContainer}>
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.w40, styles.borderRight, styles.whiteBorder]}>
                  <Text style={styles.headerText}>Semana</Text>
                </View>
                <View style={[styles.cell, styles.w60]}>
                  <Text style={styles.headerText}>Dirigente</Text>
                </View>
              </View>

              {block.schedules.map((item, iIdx) => (
                <View 
                  key={iIdx} 
                  style={[
                    styles.row, 
                    iIdx % 2 !== 0 ? styles.rowEven : {},
                    iIdx === block.schedules.length - 1 ? { borderBottomWidth: 0 } : {}
                  ]}
                >
                  <View style={[styles.cell, styles.w40, styles.borderRight]}>
                    <Text style={styles.cellText}>{formatLongDate(item.date)}</Text>
                  </View>
                  <View style={[styles.cell, styles.w60]}>
                    <Text style={styles.cellText}>{item.exceptionReason || item.leader}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {fixedSchedules.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Saídas Fixas</Text>
            <View style={styles.tableContainer}>
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.w20, styles.borderRight, styles.whiteBorder]}><Text style={styles.headerText}>Dia</Text></View>
                <View style={[styles.cell, styles.w15, styles.borderRight, styles.whiteBorder]}><Text style={styles.headerText}>Hora</Text></View>
                <View style={[styles.cell, styles.w35, styles.borderRight, styles.whiteBorder]}><Text style={styles.headerText}>Local</Text></View>
                <View style={[styles.cell, styles.w30]}><Text style={styles.headerText}>Dirigente</Text></View>
              </View>

              {fixedSchedules.map((item, fIdx) => (
                <View 
                  key={fIdx} 
                  style={[
                    styles.row, 
                    fIdx % 2 !== 0 ? styles.rowEven : {},
                    fIdx === fixedSchedules.length - 1 ? { borderBottomWidth: 0 } : {}
                  ]}
                >
                  <View style={[styles.cell, styles.w20, styles.borderRight]}><Text style={styles.cellText}>{item.weekday}</Text></View>
                  <View style={[styles.cell, styles.w15, styles.borderRight]}><Text style={styles.cellText}>{item.time}</Text></View>
                  <View style={[styles.cell, styles.w35, styles.borderRight]}><Text style={styles.cellText}>{item.location}</Text></View>
                  <View style={[styles.cell, styles.w30]}><Text style={styles.cellText}>{item.leader}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}