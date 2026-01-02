import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import { formatHour } from "@/utils/formatTime"

dayjs.locale("pt-br")

Font.register({
  family: "Crimson Pro",
  fonts: [
    { src: "/fonts/CrimsonPro-Light.ttf", fontWeight: "normal" },
    { src: "/fonts/CrimsonPro-Bold.ttf", fontWeight: "bold" },
  ],
})

interface IPublicWitnessPdfPublisher {
  id: string
  name: string
}

interface IPublicWitnessPdfSlot {
  start_time: string
  end_time: string
  publishers: IPublicWitnessPdfPublisher[]
}

interface IPublicWitnessPdfSchedule {
  date: string
  slots: IPublicWitnessPdfSlot[]
}

export interface IPublicWitnessRotationBlock {
  title: string
  weekday?: number
  schedules: IPublicWitnessPdfSchedule[]
}

interface IPublicWitnessFixedSchedule {
  title: string
  date?: string | null
  weekday?: number | null
  start_time: string
  end_time: string
  publishers: IPublicWitnessPdfPublisher[]
}

interface PublicWitnessSchedulePdfProps {
  congregationName?: string
  rotationBlocks: IPublicWitnessRotationBlock[]
  fixedSchedules: IPublicWitnessFixedSchedule[]
  scale?: number
}

const COLORS = {
  headerBg: "#28456C",
  headerText: "#FFFFFF",
  tableBorder: "#9CC2E5",
  rowEvenBg: "#DEEAF6",
  textMain: "#2a2b2b",
  textTitle: "#28456C",
  textSubtitle: "#3F4C59",
}

export function PublicWitnessSchedulePdf({
  congregationName,
  rotationBlocks,
  fixedSchedules,
  scale = 0.9,
}: PublicWitnessSchedulePdfProps) {
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
      marginTop: 12 * scale,
      marginBottom: 6 * scale,
    },
    tableContainer: {
      borderWidth: 1 * scale,
      borderColor: COLORS.tableBorder,
      marginBottom: 18 * scale,
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1 * scale,
      borderBottomColor: COLORS.tableBorder,
      minHeight: 28 * scale,
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
    headerText: {
      color: COLORS.headerText,
      fontSize: 13 * scale,
      fontWeight: "bold",
      textAlign: "center",
    },
    cellText: {
      fontSize: 11 * scale,
      textAlign: "center",
    },
    w25: { width: "25%" },
    w30: { width: "30%" },
    w45: { width: "45%" },
    w50: { width: "50%" },
  })

  const formatLongDate = (date: string) =>
    dayjs(date)
      .format("dddd – DD [de] MMMM")
      .replace(/^\w/, s => s.toUpperCase())

  const weeklyFixed = fixedSchedules.filter(fs => !fs.date)

  // Contador global para alternar cores
  let globalRowIndex = 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerSection} fixed>
          <Text style={styles.mainTitle}>Testemunho Público</Text>
          {congregationName && (
            <Text style={styles.congregationName}>{congregationName}</Text>
          )}
        </View>

        {/* ================= RODÍZIOS ================= */}
        {rotationBlocks.map((block, idxBlock) => (
          <View key={idxBlock} wrap={false}>
            <Text style={styles.sectionTitle}>{block.title}</Text>

            <View style={styles.tableContainer}>
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.w30, styles.borderRight]}>
                  <Text style={styles.headerText}>Data</Text>
                </View>
                <View style={[styles.cell, styles.w25, styles.borderRight]}>
                  <Text style={styles.headerText}>Horário</Text>
                </View>
                <View style={[styles.cell, styles.w45]}>
                  <Text style={styles.headerText}>Publicadores</Text>
                </View>
              </View>

              {block.schedules.map((day) =>
                day.slots.map((slot, idxSlot) => {
                  const isEven = globalRowIndex % 2 !== 0
                  globalRowIndex++

                  return (
                    <View
                      key={`${day.date}-${idxSlot}`}
                      style={[
                        styles.row,
                        isEven ? styles.rowEven : {},
                        globalRowIndex ===
                        block.schedules.reduce((acc, d) => acc + d.slots.length, 0)
                          ? { borderBottomWidth: 0 }
                          : {},
                      ]}
                    >
                      {/* SE NÃO É O PRIMEIRO HORÁRIO DO DIA, DEIXA DATA EM BRANCO */}
                      <View style={[styles.cell, styles.w30, styles.borderRight]}>
                        <Text style={styles.cellText}>
                          {idxSlot === 0 ? formatLongDate(day.date) : ""}
                        </Text>
                      </View>
                      <View style={[styles.cell, styles.w25, styles.borderRight]}>
                        <Text style={styles.cellText}>
                          {formatHour(slot.start_time)} – {formatHour(slot.end_time)}
                        </Text>
                      </View>
                      <View style={[styles.cell, styles.w45]}>
                        <Text style={styles.cellText}>
                          {slot.publishers.length
                            ? slot.publishers.map(p => p.name).join(" — ")
                            : "—"}
                        </Text>
                      </View>
                    </View>
                  )
                })
              )}
            </View>
          </View>
        ))}

        {/* ================= FIXOS ================= */}
        {weeklyFixed.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Horários Fixos</Text>

            <View style={styles.tableContainer}>
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.w25, styles.borderRight]}>
                  <Text style={styles.headerText}>Dia</Text>
                </View>
                <View style={[styles.cell, styles.w25, styles.borderRight]}>
                  <Text style={styles.headerText}>Horário</Text>
                </View>
                <View style={[styles.cell, styles.w50]}>
                  <Text style={styles.headerText}>Publicadores</Text>
                </View>
              </View>

              {weeklyFixed.map((f, i) => {
                const isEven = i % 2 !== 0
                return (
                  <View
                    key={i}
                    style={[
                      styles.row,
                      isEven ? styles.rowEven : {},
                      i === weeklyFixed.length - 1 ? { borderBottomWidth: 0 } : {},
                    ]}
                  >
                    <View style={[styles.cell, styles.w25, styles.borderRight]}>
                      <Text style={styles.cellText}>
                        {WEEKDAY_LABEL[f.weekday as Weekday]}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.w25, styles.borderRight]}>
                      <Text style={styles.cellText}>
                        {formatHour(f.start_time)} – {formatHour(f.end_time)}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.w50]}>
                      <Text style={styles.cellText}>
                        {f.publishers.length
                          ? f.publishers.map(p => p.name).join(" — ")
                          : "—"}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}
