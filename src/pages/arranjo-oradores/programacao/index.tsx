import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import ContentDashboard from "@/Components/ContentDashboard"
import DropdownObject from "@/Components/DropdownObjects"
import PdfIcon from "@/Components/Icons/PdfIcon"
import ScheduleRow from "@/Components/ScheduleRow"
import SpeakerInvitationPdf from "@/Components/SpeakerInvitationPdf"
import WeekendMeeting from "@/Components/WeekendSchedulePdf"
import WeekendScheduleSkeleton from "@/Components/WeekendScheduleSkeleton"
import { Card, CardContent } from "@/Components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import {
    chairmansAtom,
    congregationsAtom,
    createWeekendScheduleAtom,
    readersAtom,
    schedulesAtom,
    speakersAtom,
    talksAtom,
    updateWeekendScheduleAtom
} from "@/atoms/weekendScheduleAtoms"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IExternalTalk } from "@/types/externalTalks"
import { ICongregation, ISpeaker } from "@/types/types"
import { IRecordWeekendSchedule, IWeekendSchedule, IWeekendScheduleFormData, IWeekendScheduleWithExternalTalks } from "@/types/weekendSchedule"
import { DayMeetingPublic, getWeekendDays, getWeekendRange } from "@/utils/dateUtil"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { BlobProvider, Document, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { useAtom, useSetAtom } from "jotai"
import { ChevronDown, ChevronUp } from "lucide-react"
import moment from "moment"
import "moment/locale/pt-br"; // importa o idioma
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

interface PdfLinkComponentProps {
    schedule: IWeekendSchedule
    congregationLocale: ICongregation
}

function PdfSpeakerInvitation({ schedule, congregationLocale }: PdfLinkComponentProps) {
    return (
        <BlobProvider
            document={
                <Document>
                    <SpeakerInvitationPdf schedule={schedule} congregationLocale={congregationLocale} />
                </Document>
            }
        >
            {({ blob, url, loading, error }) => (
                <a href={url ?? "#"} download={`Convite - ${schedule.speaker?.fullName}.pdf`}>
                    <Button outline className="bg-surface-100 w-[200px] text-primary-200 p-1 md:p-3 border-typography-300 rounded-none hover:opacity-80">
                        <PdfIcon />
                        <span className="text-primary-200 font-semibold">
                            {loading ? "Gerando PDF..." : "Gerar Convite PDF"}
                        </span>
                    </Button>
                </a>
            )}
        </BlobProvider>
    )
}

function WeekendSchedulePage() {
    moment.defineLocale("pt-br", null)
    const router = useRouter()
    const { date } = router.query
    const { user } = useAuthContext()
    const congregation = user?.congregation
    const congregation_id = user?.congregation?.id
    const [crumbs,] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [monthOffset, setMonthOffset] = useState<number>(0)
    const [weekendMeetingDay, setWeekendMeetingDay] = useState<Date[]>([])
    const [weekendSchedules, setWeekendSchedules] = useAtom(schedulesAtom)
    const [isClient, setIsClient] = useState(false)
    const [initialWeekendSchedules, setInitialWeekendSchedules] = useState<Record<string, IRecordWeekendSchedule>>({})

    const setTalks = useSetAtom(talksAtom)
    const setSpeakers = useSetAtom(speakersAtom)
    const setReaders = useSetAtom(readersAtom)
    const setChairmans = useSetAtom(chairmansAtom)
    const setCongregations = useSetAtom(congregationsAtom)
    const [weekendScheduleWithExternalTalks, setWeekendScheduleWithExternalTalks] = useState<IWeekendScheduleWithExternalTalks[]>([])
    const setCreateWeekendSchedule = useSetAtom(createWeekendScheduleAtom)
    const setUpdateWeekendSchedule = useSetAtom(updateWeekendScheduleAtom)
    const [startDatePdfGenerate, setStartDatePdfGenerate] = useState<string | null>(null)
    const [endDatePdfGenerate, setEndDatePdfGenerate] = useState<string | null>(null)
    const baseDate = moment().add(monthOffset, "months")
    const [pdfScale, setPdfScale] = useState(1);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedSpeaker, setSelectedSpeaker] = useState<ISpeaker | null>(null)
    const [isPdfSectionOpen, setIsPdfSectionOpen] = useState(false)

    const prevMonthLabel = baseDate.clone().subtract(1, "month").format("MMMM")
    const nextMonthLabel = baseDate.clone().add(1, "month").format("MMMM")

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!router.isReady) return

        const dateParam = Array.isArray(date) ? date[0] : date
        if (!dateParam) return

        const target = moment(dateParam, "YYYY-MM-DD", true)
        if (!target.isValid()) {

            const alt = moment(dateParam)
            if (!alt.isValid()) return

            const monthDiffAlt =
                (alt.year() - moment().year()) * 12 + (alt.month() - moment().month())
            setMonthOffset(monthDiffAlt)
            return
        }

        const now = moment()
        const monthDiff =
            (target.year() - now.year()) * 12 + (target.month() - now.month())
        setMonthOffset(monthDiff)
    }, [router.isReady, date])

    useEffect(() => {
        if (!congregation?.dayMeetingPublic) return
        setWeekendMeetingDay(getWeekendDays(monthOffset, congregation?.dayMeetingPublic as DayMeetingPublic))
    }, [monthOffset, congregation?.dayMeetingPublic])

    const firstWeekend = weekendMeetingDay[0]
    const lastWeekend = weekendMeetingDay[weekendMeetingDay.length - 1]

    const effectiveStart = startDatePdfGenerate
        || (firstWeekend ? getWeekendRange(firstWeekend).friday.format("YYYY-MM-DD") : null)

    const effectiveEnd = endDatePdfGenerate
        || (lastWeekend ? getWeekendRange(lastWeekend).sunday.format("YYYY-MM-DD") : null)


    // Busca dados do backend usando o intervalo do fim de semana
    const { data: rawExternalData } = useAuthorizedFetch<IExternalTalk[]>(
        congregation_id && effectiveStart && effectiveEnd
            ? `/congregation/${congregation_id}/externalTalks/period?start=${effectiveStart}&end=${effectiveEnd}`
            : "",
        { allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"] }
    )

    const externalData = useMemo(() => rawExternalData ?? [], [rawExternalData])

    const { data, mutate } = useAuthorizedFetch<IWeekendScheduleFormData>(`/form-data?form=weekendSchedule`, {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    // Monta o weekendSchedule com os externalTalks já filtrados
    useEffect(() => {
        if (data) {
            const schedulesWithTalks = (data.weekendSchedules ?? []).map(sched => {
                // Para cada schedule, pega os external talks que caem dentro do fim de semana da congregação local
                const weekendStartDate = moment(sched.date).isoWeekday(5)
                const weekendEndDate = moment(sched.date).isoWeekday(7)
                const talksForWeekend = externalData.filter(t =>
                    moment(t.date).isBetween(weekendStartDate, weekendEndDate, "day", "[]")
                )
                return {
                    ...sched,
                    externalTalks: talksForWeekend
                }
            })

            // Ordena por data crescente
            schedulesWithTalks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            setWeekendScheduleWithExternalTalks(schedulesWithTalks)
        }
    }, [data, externalData])

    useEffect(() => {
        if (!data) return
        setTalks(data.talks)
        setSpeakers(data.speakers)
        setReaders(data.readers)
        setChairmans(data.chairmans)
        setCongregations(data.congregations)

        if (data.weekendSchedules) {
            const weekendSchedulesByDate =
                data.weekendSchedules.reduce<Record<string, IRecordWeekendSchedule>>(
                    (acc, sched) => {
                        acc[sched.date] = {
                            id: sched.id,
                            date: sched.date,
                            speaker_id: sched.speaker?.id,
                            visitingCongregation_id: sched.visitingCongregation?.id,
                            talk_id: sched.talk?.id,
                            chairman_id: sched.chairman?.id,
                            reader_id: sched.reader?.id,
                            isSpecial: sched.isSpecial,
                            manualSpeaker: sched.manualSpeaker,
                            manualTalk: sched.manualTalk,
                            specialName: sched.specialName,
                            watchTowerStudyTitle: sched.watchTowerStudyTitle
                        }
                        return acc
                    },
                    {}
                )
            setWeekendSchedules(weekendSchedulesByDate)
            setInitialWeekendSchedules(weekendSchedulesByDate)
        }
    }, [data, setChairmans, setReaders, setCongregations, setSpeakers, setTalks, setWeekendSchedules])

    useEffect(() => {
        setPageActive("Programação")
    }, [setPageActive])

    const hasChanges = (a: IRecordWeekendSchedule, b?: IRecordWeekendSchedule) => {
        if (!b) return true // novo item
        const fields: (keyof IRecordWeekendSchedule)[] = [
            "speaker_id",
            "visitingCongregation_id",
            "talk_id",
            "chairman_id",
            "reader_id",
            "isSpecial",
            "manualSpeaker",
            "manualTalk",
            "specialName",
            "watchTowerStudyTitle"
        ]
        return fields.some(f => a[f] !== b[f])
    }

    const handleSave = async () => {
        try {
            const allSchedules = Object.values(weekendSchedules)
            const newSchedules = allSchedules.filter(s => !s.id)
            const changedSchedules = allSchedules.filter(s =>
                s.id && hasChanges(s, initialWeekendSchedules[s.date])
            )

            if (newSchedules.length === 0 && changedSchedules.length === 0) {
                toast.info("Nenhuma alteração para salvar.")
                return
            }

            if (changedSchedules.length > 0) {
                await toast.promise(setUpdateWeekendSchedule({ schedules: changedSchedules }), {
                    pending: "Atualizando programações alteradas..."
                }).then(() => {

                }).catch(err => {
                    console.log(err)
                })
            }

            if (newSchedules.length > 0) {
                await toast.promise(
                    setCreateWeekendSchedule(congregation_id ?? "", { schedules: newSchedules }),
                    { pending: "Criando novas programações..." }
                ).then(() => {

                }).catch(err => {
                    console.log(err)
                })
            }

            mutate()
        } catch (err) {
            console.error(err)
            toast.error("Erro ao salvar a programação.")
        }
    }


    const PdfLinkComponent = () => (
        <BlobProvider
            document={
                <Document>
                    <WeekendMeeting schedules={filteredSchedules} scale={pdfScale} />
                </Document>
            }
        >
            {({ blob, url, loading, error }) => (
                <a href={url ?? "#"} download={"Reunião do fim de semana.pdf"}>
                    <Button
                        outline
                        className="text-primary-200 p-1 md:p-3 border-typography-300 rounded-none hover:opacity-80 w-fit min-w-[200px]"
                    >
                        <PdfIcon />
                        <span className="text-primary-200 font-semibold">
                            {loading ? "Gerando PDF..." : "Baixar PDF"}
                        </span>
                    </Button>
                </a>
            )}
        </BlobProvider>
    );


    // Filtra para gerar PDF considerando datas do usuário ou o fim de semana
    const filteredSchedules = weekendScheduleWithExternalTalks.filter(s => {
        const schedDate = new Date(s.date).getTime()
        const startFilter = effectiveStart ? new Date(effectiveStart).getTime() : 0
        const endFilter = effectiveEnd ? new Date(effectiveEnd).getTime() : Infinity
        return schedDate >= startFilter && schedDate <= endFilter
    })

    // Filtrar `weekendSchedules` com speaker_id preenchido
    const scheduledSpeakers = useMemo(() => {
        if (!data?.speakers) return [];

        const now = moment().startOf("day"); // evita problemas com hora

        const ids = new Set<string>();

        Object.values(weekendSchedules).forEach(s => {
            if (!s?.date || !s?.speaker_id) return;

            const scheduleDate = moment(s.date).startOf("day");

            if (scheduleDate.isSameOrAfter(now)) {
                ids.add(s.speaker_id);
            }
        });

        return data.speakers.filter(sp => ids.has(sp.id));
    }, [weekendSchedules, data?.speakers]);


    const selectedSchedule = useMemo(() => {
        if (!selectedSpeaker) return null;
        return Object.values(weekendSchedules).find(
            (s) => s.speaker_id === selectedSpeaker.id
        ) ?? null;
    }, [selectedSpeaker, weekendSchedules]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Programação do Fim de Semana" />
            <section className="flex flex-wrap w-full h-full p-4 relative">
                {!data ? (
                    <WeekendScheduleSkeleton />
                ) : (
                    <>
                        <div className="w-full space-y-4">
                            <div className="sticky top-0 z-30">
                                <div className="md:hidden flex justify-center bg-surface-100 border-b shadow-sm p-2 w-10 ml-2 -mb-2 rounded-t-md border-none ">
                                    <button
                                        onClick={() => setShowFilters((o) => !o)}
                                        className="flex items-center gap-2 text-sm text-typography-600"
                                    >
                                        {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                </div>

                                {/* Painel */}
                                <div
                                    className={`
           bg-surface-100 border-b shadow-sm rounded-xl flex flex-col gap-3 md:gap-4
    transition-all duration-300 overflow-visible
    ${showFilters ? "max-h-screen opacity-100 p-4 pointer-events-auto" : "max-h-0 opacity-0 p-0 pointer-events-none"}
    md:opacity-100 md:max-h-screen md:pointer-events-auto
        `}
                                >
                                    <div className="flex justify-between items-center gap-4">
                                        <Button
                                            onClick={() => setMonthOffset((m) => m - 1)}
                                            className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200"
                                        >
                                            {prevMonthLabel}
                                        </Button>

                                        <Button
                                            onClick={() => setMonthOffset((m) => m + 1)}
                                            className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200"
                                        >
                                            {nextMonthLabel}
                                        </Button>
                                    </div>

                                    <Button className="w-full text-typography-200" onClick={handleSave}>
                                        Salvar todas
                                    </Button>
                                </div>
                            </div>

                            <Card className="w-full bg-surface-100">
                                <CardContent className="flex flex-col p-5 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsPdfSectionOpen(o => !o)}
                                        className="w-full flex justify-between items-center bg-surface-100 px-4 py-2 rounded-md hover:brightness-105 transition"
                                    >
                                        <span className="font-semibold text-typography-700">
                                            Exportar / PDF
                                        </span>

                                        {isPdfSectionOpen ? (
                                            <ChevronUp size={20} className="text-typography-700" />
                                        ) : (
                                            <ChevronDown size={20} className="text-typography-700" />
                                        )}
                                    </button>

                                    <div className={`transition-all duration-300 ease-out overflow-hidden
      ${isPdfSectionOpen ? "max-h-[800px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>

                                        <div className="flex flex-wrap justify-around gap-4 mt-2">
                                            {/* Convite ao Orador */}
                                            <Card className="flex flex-col gap-3 w-full border rounded-md px-8 py-4">
                                                <h2 className="font-bold text-md text-primary-200 text-center">Convite ao Orador</h2>
                                                <div className="flex justify-center w-full">
                                                    <div className="w-full min-w-[200px] max-w-[200px]">
                                                        <DropdownObject
                                                            textVisible
                                                            title="Selecionar Orador"
                                                            items={scheduledSpeakers ?? []}
                                                            selectedItem={scheduledSpeakers?.find(s => s.id === selectedSpeaker?.id) ?? null}
                                                            handleChange={item => setSelectedSpeaker(item)}
                                                            labelKey="fullName"
                                                            border
                                                            full
                                                            emptyMessage="Nenhum orador"
                                                        />
                                                    </div>
                                                </div>
                                                {selectedSchedule && congregation && (
                                                    <PdfSpeakerInvitation
                                                        schedule={{
                                                            ...selectedSchedule,
                                                            speaker: data?.speakers.find(sp => sp.id === selectedSpeaker?.id) ?? undefined,
                                                            talk: data?.talks.find(t => t.id === selectedSchedule.talk_id) ?? undefined,
                                                            visitingCongregation: data?.congregations.find(c => c.id === selectedSchedule.visitingCongregation_id) ?? undefined
                                                        }}
                                                        congregationLocale={congregation}
                                                    />
                                                )}
                                            </Card>

                                            {/* Agenda de Designações */}
                                            <Card className="flex flex-col gap-3 w-full px-8 py-4 border rounded-md">
                                                <h2 className="font-bold text-md text-primary-200 text-center">Agenda de Designações</h2>
                                                <div className="flex flex-col items-center gap-3 w-full">
                                                    <Calendar
                                                        full
                                                        titleHidden
                                                        label="Data inicial"
                                                        selectedDate={startDatePdfGenerate}
                                                        handleDateChange={setStartDatePdfGenerate}
                                                    />
                                                    <Calendar
                                                        full
                                                        titleHidden
                                                        label="Data final"
                                                        selectedDate={endDatePdfGenerate}
                                                        handleDateChange={setEndDatePdfGenerate}
                                                    />

                                                    <Select value={pdfScale.toString()} onValueChange={v => setPdfScale(Number(v))}>
                                                        <SelectTrigger className="w-fit">
                                                            <SelectValue placeholder="Escala do PDF" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">100%</SelectItem>
                                                            <SelectItem value="0.9">90%</SelectItem>
                                                            <SelectItem value="0.8">80%</SelectItem>
                                                            <SelectItem value="0.7">70%</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Button onClick={() => setShowPdfPreview(!showPdfPreview)} className="px-4 py-2 w-fit min-w-[200px]">
                                                        {showPdfPreview ? "Fechar pré-visualização" : "Visualizar PDF"}
                                                    </Button>
                                                    {isClient && <PdfLinkComponent />}
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {showPdfPreview && (
                                <div className="w-full h-[90vh] mt-4 border rounded-lg overflow-hidden">
                                    <PDFViewer style={{ width: "100%", height: "100%" }}>
                                        <Document>
                                            <WeekendMeeting schedules={filteredSchedules} scale={pdfScale} />
                                        </Document>
                                    </PDFViewer>
                                </div>
                            )}

                            <div className="space-y-4 mt-6 pb-36 h-fit">
                                {weekendMeetingDay.map((d) => {
                                    const weekend = getWeekendRange(d) // { friday, saturday, sunday } (Moment objects)

                                    const externalForDate = (externalData ?? []).filter((t) =>
                                        moment(t.date).isBetween(weekend.friday, weekend.sunday, "day", "[]")
                                    )
                                    return (
                                        <div key={d.toISOString()} className="bg-surface-100 border rounded-xl shadow-sm">
                                            <ScheduleRow date={d} externalTalks={externalForDate} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )
                }

            </section >
        </ContentDashboard >
    )
}

WeekendSchedulePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default WeekendSchedulePage