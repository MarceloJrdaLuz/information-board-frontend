import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import PdfIcon from "@/Components/Icons/PdfIcon"
import Input from "@/Components/Input"
import Layout from "@/Components/Layout"
import ScheduleRow from "@/Components/ScheduleRow"
import SpeakerFilters from "@/Components/SpeakerFilters"
import WeekendMeeting from "@/Components/WeekendSchedulePdf"
import WeekendScheduleSkeleton from "@/Components/WeekendScheduleSkeleton"
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
import { useCongregationContext } from "@/context/CongregationContext"
import { IExternalTalk } from "@/entities/externalTalks"
import { IRecordWeekendSchedule, IWeekendScheduleFormData, IWeekendScheduleWithExternalTalks } from "@/entities/weekendSchedule"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { getSaturdays } from "@/utils/dateUtil"
import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Card, CardBody, CardHeader, Option, Select } from "@material-tailwind/react"
import { Document, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { useAtom, useSetAtom } from "jotai"
import { ChevronDown, ChevronUp } from "lucide-react"
import moment from "moment"
import "moment/locale/pt-br"; // importa o idioma
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

export default function WeekendSchedulePage() {
    moment.defineLocale("pt-br", null)
    const router = useRouter()
    const { date } = router.query
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [monthOffset, setMonthOffset] = useState<number>(0)
    const [saturdays, setSaturdays] = useState<Date[]>([])
    const [weekendSchedules, setWeekendSchedules] = useAtom(schedulesAtom)
    const [isClient, setIsClient] = useState(false)

    const setTalks = useSetAtom(talksAtom)
    const setSpeakers = useSetAtom(speakersAtom)
    const setReaders = useSetAtom(readersAtom)
    const setChairmans = useSetAtom(chairmansAtom)
    const setCongregations = useSetAtom(congregationsAtom)
    const [weekendScheduleWithExternalTalks, setWeekendScheduleWithExternalTalks] = useState<IWeekendScheduleWithExternalTalks[]>([])
    const setCreateWeekendSchedule = useSetAtom(createWeekendScheduleAtom)
    const setUpdateWeekendSchedule = useSetAtom(updateWeekendScheduleAtom)
    const [startDatePdfGenerate, setStartDatePdfGenerate] = useState<string>("")
    const [endDatePdfGenerate, setEndDatePdfGenerate] = useState<string>("")
    const baseDate = moment().add(monthOffset, "months")
    const [pdfScale, setPdfScale] = useState(1);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

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
        setSaturdays(getSaturdays(monthOffset))
    }, [monthOffset])

    const startDate = saturdays.length > 0 ? moment(saturdays[0]).format("YYYY-MM-DD") : null
    const endDate = saturdays.length > 0 ? moment(saturdays.at(-1)).format("YYYY-MM-DD") : null

    const effectiveStart = startDatePdfGenerate || startDate
    const effectiveEnd = endDatePdfGenerate || endDate

    const { data: rawExternalData } = useFetch<IExternalTalk[]>(
        congregation_id && effectiveStart && effectiveEnd
            ? `/congregation/${congregation_id}/externalTalks/period?start=${effectiveStart}&end=${effectiveEnd}`
            : ""
    )

    const externalData = useMemo(() => rawExternalData ?? [], [rawExternalData])

    const { data, mutate } = useFetch<IWeekendScheduleFormData>(`/form-data?form=weekendSchedule`)

    useEffect(() => {
        if (data || externalData) {
            const schedulesWithTalks = (data?.weekendSchedules ?? []).map(sched => ({
                ...sched,
                externalTalks: externalData.filter(t => t.date === sched.date)
            }))

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
        }
    }, [data])

    useEffect(() => {
        setPageActive("Programação")
    }, [setPageActive])

    const handleSave = async () => {
        try {
            const allSchedules = Object.values(weekendSchedules).map((s) => ({
                id: s.id,
                date: s.date,
                speaker_id: s.speaker_id,
                talk_id: s.talk_id,
                chairman_id: s.chairman_id,
                reader_id: s.reader_id,
                isSpecial: s.isSpecial,
                manualSpeaker: s.manualSpeaker,
                manualTalk: s.manualTalk,
                specialName: s.specialName,
                watchTowerStudyTitle: s.watchTowerStudyTitle
            }))

            const newSchedules = allSchedules.filter((s) => !s.id)
            const existingSchedules = allSchedules.filter((s) => s.id)

            if (existingSchedules.length > 0) {
                await toast.promise(setUpdateWeekendSchedule({ schedules: existingSchedules }), {
                    pending: "Atualizando programações existentes...",
                })
            }

            if (newSchedules.length > 0) {
                await toast.promise(
                    setCreateWeekendSchedule(congregation_id ?? "", { schedules: newSchedules }),
                    { pending: "Criando novas programações..." }
                )
            }
            mutate()
        } catch (err) {
            console.error(err)
            toast.error("Erro ao salvar a programação.")
        }
    }

    const PdfLinkComponent = () => (
        <PDFDownloadLink
            document={
                <Document>
                    <WeekendMeeting schedules={filteredSchedules} scale={pdfScale} />
                </Document>
            }
            fileName={"Reunião do fim de semana.pdf"}
        >
            {({ loading }) => (
                <Button className="bg-white text-primary-200 p-1 md:p-3 border-gray-300 rounded-none hover:opacity-80">
                    <PdfIcon />
                    <span className="text-primary-200 font-semibold">
                        {loading ? "Gerando PDF..." : "Baixar PDF"}
                    </span>
                </Button>
            )}
        </PDFDownloadLink>
    );

    const filteredSchedules = weekendScheduleWithExternalTalks.filter(s => {
        const schedDate = new Date(s.date).getTime()
        const afterStart = startDatePdfGenerate ? schedDate >= new Date(startDatePdfGenerate).getTime() : true
        const beforeEnd = endDatePdfGenerate ? schedDate <= new Date(endDatePdfGenerate).getTime() : true
        return afterStart && beforeEnd
    })

    return (
        <Layout pageActive="programacao">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive="Programação" />
                <section className="flex flex-wrap w-full h-full p-4 relative">
                    {!data ? (
                        <WeekendScheduleSkeleton />
                    ) : (
                        <>
                            <div className="w-full space-y-4">
                                <div className="sticky top-0 z-30">
                                    <div className="md:hidden flex justify-center bg-white border-b shadow-sm p-2 w-10 ml-2 -mb-2 rounded-t-md border-none ">
                                        <button
                                            onClick={() => setShowFilters((o) => !o)}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>

                                    {/* Painel */}
                                    <div
                                        className={`
          bg-white border-b shadow-sm p-4 rounded-xl flex flex-col md:gap-4
          transition-all duration-300 overflow-visible
          ${showFilters ? "max-h-screen" : "max-h-0 md:max-h-screen"}
          ${showFilters ? "opacity-100" : "opacity-0 md:opacity-100"}
          ${showFilters ? "p-4" : "p-0 md:p-4"}
          md:opacity-100 md:max-h-screen
        `}
                                    >
                                        <div className="flex justify-between items-center gap-2">
                                            <Button
                                                onClick={() => setMonthOffset((m) => m - 1)}
                                                className="rounded-lg px-4 py-2 text-sm shadow capitalize"
                                            >
                                                ◀ {prevMonthLabel}
                                            </Button>

                                            <Button
                                                onClick={() => setMonthOffset((m) => m + 1)}
                                                className="rounded-lg px-4 py-2 text-sm shadow capitalize"
                                            >
                                                {nextMonthLabel} ▶
                                            </Button>
                                        </div>

                                        <SpeakerFilters />

                                        <Button className="w-full" onClick={handleSave}>
                                            Salvar todas
                                        </Button>
                                    </div>
                                </div>

                                <Card className="w-full p-4">
                                    <CardBody className="flex flex-wrap gap-4 items-center">
                                        <Input
                                            placeholder="Data inicial"
                                            type="date"
                                            value={startDatePdfGenerate}
                                            onChange={(e) => setStartDatePdfGenerate(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="Data final"
                                            type="date"
                                            value={endDatePdfGenerate}
                                            onChange={(e) => setEndDatePdfGenerate(e.target.value)}
                                            min={startDatePdfGenerate || undefined}
                                            className="flex-1"
                                        />
                                        <div className="flex-1">
                                            <Select
                                                label="Escala do PDF"
                                                value={pdfScale.toString()}
                                                onChange={(value) => setPdfScale(Number(value))}
                                            >
                                                <Option value="1">100%</Option>
                                                <Option value="0.9">90%</Option>
                                                <Option value="0.8">80%</Option>
                                                <Option value="0.7">70%</Option>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={() => setShowPdfPreview(!showPdfPreview)}
                                            className="px-4 py-2 rounded-lg border shadow"
                                        >
                                            {showPdfPreview ? "Fechar pré-visualização" : "Visualizar PDF"}
                                        </Button>
                                        {isClient && <PdfLinkComponent />}
                                    </CardBody>
                                </Card>
                                {showPdfPreview && (
                                    <div className="w-full h-[80vh] mt-4 border rounded-lg overflow-hidden">
                                        <PDFViewer style={{ width: "100%", height: "100%" }}>
                                            <Document>
                                                <WeekendMeeting schedules={filteredSchedules} scale={pdfScale} />
                                            </Document>
                                        </PDFViewer>
                                    </div>
                                )}

                                <div className="space-y-4 mt-6">
                                    {saturdays.map((d) => {
                                        const externalForDate = (externalData ?? []).filter((t) =>
                                            moment(t.date).isSame(d, "day")
                                        )
                                        return (
                                            <div key={d.toISOString()} className="bg-white border rounded-xl shadow-sm p-4">
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
        </Layout >
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('TALK_MANAGER')) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}