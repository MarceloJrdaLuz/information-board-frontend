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
    updateWeekendScheduleAtom,
    workbookWeeksAtom
} from "@/atoms/weekendScheduleAtoms"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IExternalTalk } from "@/types/externalTalks"
import { ICongregation } from "@/types/types"
import { IRecordWeekendSchedule, IWeekendSchedule, IWeekendScheduleFormData, IWeekendScheduleWithExternalTalks } from "@/types/weekendSchedule"
import { DayMeetingPublic, getWeekendDays, getWeekendRange } from "@/utils/dateUtil"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { BlobProvider, Document, PDFViewer } from "@react-pdf/renderer"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
import { useAtom, useSetAtom } from "jotai"
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Eye,
    EyeOff,
    FileDown,
    Mail,
    RotateCcw,
    Save,
    Users
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

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
                <a href={url ?? "#"} download={`Convite - ${schedule.speaker?.fullName || "Orador"}.pdf`}>
                    <Button
                        outline
                        className="w-full sm:w-auto text-primary-200 p-2.5 md:p-3 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                        <PdfIcon />
                        <span className="font-semibold text-sm">
                            {loading ? "Gerando Convite..." : "Baixar Convite PDF"}
                        </span>
                    </Button>
                </a>
            )}
        </BlobProvider>
    )
}

function WeekendSchedulePage() {
    dayjs.locale("pt-br")
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
    const [isSaving, setIsSaving] = useState(false)

    const setTalks = useSetAtom(talksAtom)
    const setSpeakers = useSetAtom(speakersAtom)
    const setReaders = useSetAtom(readersAtom)
    const setChairmans = useSetAtom(chairmansAtom)
    const setCongregations = useSetAtom(congregationsAtom)
    const setWorkbookWeeks = useSetAtom(workbookWeeksAtom)
    const [weekendScheduleWithExternalTalks, setWeekendScheduleWithExternalTalks] = useState<IWeekendScheduleWithExternalTalks[]>([])
    const setCreateWeekendSchedule = useSetAtom(createWeekendScheduleAtom)
    const setUpdateWeekendSchedule = useSetAtom(updateWeekendScheduleAtom)
    const [startDatePdfGenerate, setStartDatePdfGenerate] = useState<string | null>(null)
    const [endDatePdfGenerate, setEndDatePdfGenerate] = useState<string | null>(null)
    const baseDate = dayjs().add(monthOffset, "month")
    const [pdfScale, setPdfScale] = useState(1);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [activeTool, setActiveTool] = useState<"none" | "invitation" | "pdf">("none");
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
            const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
            setShowScrollTop(scrollY > 250);
        };

        const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        }
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener("scroll", handleScroll);
            }
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        }
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const currentMonthLabel = baseDate.format("MMMM [de] YYYY")
    const prevMonthLabel = baseDate.clone().subtract(1, "month").format("MMM")
    const nextMonthLabel = baseDate.clone().add(1, "month").format("MMM")

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!router.isReady) return

        const dateParam = Array.isArray(date) ? date[0] : date
        if (!dateParam) return

        const target = dayjs(dateParam, "YYYY-MM-DD", true)
        if (!target.isValid()) {
            const alt = dayjs(dateParam)
            if (!alt.isValid()) return

            const monthDiffAlt =
                (alt.year() - dayjs().year()) * 12 + (alt.month() - dayjs().month())
            setMonthOffset(monthDiffAlt)
            return
        }

        const now = dayjs()
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
                const weekendStartDate = dayjs(sched.date).isoWeekday(5)
                const weekendEndDate = dayjs(sched.date).isoWeekday(7)
                const talksForWeekend = externalData.filter(t =>
                    dayjs(t.date).isBetween(weekendStartDate, weekendEndDate, "day", "[]")
                )
                return {
                    ...sched,
                    externalTalks: talksForWeekend
                }
            })

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
        if (data.workbookWeeks) {
            setWorkbookWeeks(data.workbookWeeks)
        }

        if (data.weekendSchedules) {
            const weekendSchedulesByDate =
                data.weekendSchedules.reduce<Record<string, IRecordWeekendSchedule>>(
                    (acc, sched) => {
                        let wtTitle = sched.watchTowerStudyTitle
                        if (!wtTitle && data.workbookWeeks) {
                            const monday = dayjs(sched.date).isoWeekday(1).format("YYYY-MM-DD")
                            const matchedWeek = data.workbookWeeks.find(w => dayjs(w.weekDate).format("YYYY-MM-DD") === monday)
                            if (matchedWeek?.watchtowerStudyTheme) {
                                wtTitle = matchedWeek.watchtowerStudyTheme
                            }
                        }

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
                            watchTowerStudyTitle: wtTitle
                        }
                        return acc
                    },
                    {}
                )
            setWeekendSchedules(weekendSchedulesByDate)
            setInitialWeekendSchedules(weekendSchedulesByDate)
        }
    }, [data, setChairmans, setReaders, setCongregations, setSpeakers, setTalks, setWeekendSchedules, setWorkbookWeeks])

    useEffect(() => {
        setPageActive("Programação")
    }, [setPageActive])

    const hasChanges = (a: IRecordWeekendSchedule, b?: IRecordWeekendSchedule) => {
        if (!b) return true
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

    // Calcula alterações pendentes
    const pendingChangesCount = useMemo(() => {
        const allSchedules = Object.values(weekendSchedules)
        const newSchedules = allSchedules.filter(s => !s.id)
        const changedSchedules = allSchedules.filter(s =>
            s.id && hasChanges(s, initialWeekendSchedules[s.date])
        )
        return newSchedules.length + changedSchedules.length
    }, [weekendSchedules, initialWeekendSchedules])

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const allSchedules = Object.values(weekendSchedules)
            const newSchedules = allSchedules.filter(s => !s.id)
            const changedSchedules = allSchedules.filter(s =>
                s.id && hasChanges(s, initialWeekendSchedules[s.date])
            )

            if (newSchedules.length === 0 && changedSchedules.length === 0) {
                toast.info("Nenhuma alteração para salvar.")
                setIsSaving(false)
                return
            }

            if (changedSchedules.length > 0) {
                await toast.promise(setUpdateWeekendSchedule({ schedules: changedSchedules }), {
                    pending: "Atualizando programações alteradas...",
                    success: "Programações salvas com sucesso!",
                    error: "Erro ao atualizar programações."
                })
            }

            if (newSchedules.length > 0) {
                await toast.promise(
                    setCreateWeekendSchedule(congregation_id ?? "", { schedules: newSchedules }),
                    {
                        pending: "Criando novas programações...",
                        success: "Novas programações criadas com sucesso!",
                        error: "Erro ao criar programações."
                    }
                )
            }

            mutate()
        } catch (err) {
            console.error(err)
            toast.error("Erro ao salvar a programação.")
        } finally {
            setIsSaving(false)
        }
    }

    // Filtra para gerar PDF considerando datas do usuário ou o fim de semana
    const filteredSchedules = useMemo(() => {
        return weekendScheduleWithExternalTalks.filter(s => {
            const schedDate = new Date(s.date).getTime()
            const startFilter = effectiveStart ? new Date(effectiveStart).getTime() : 0
            const endFilter = effectiveEnd ? new Date(effectiveEnd).getTime() : Infinity
            return schedDate >= startFilter && schedDate <= endFilter
        })
    }, [weekendScheduleWithExternalTalks, effectiveStart, effectiveEnd])

    const PdfLinkComponent = () => (
        <BlobProvider
            document={
                <Document>
                    <WeekendMeeting schedules={filteredSchedules} scale={pdfScale} />
                </Document>
            }
        >
            {({ blob, url, loading, error }) => (
                <a href={url ?? "#"} download={`Reunião do Fim de Semana - ${baseDate.format("MMMM YYYY")}.pdf`}>
                    <Button
                        outline
                        className="text-primary-200 p-2.5 md:p-3 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center justify-center gap-2 min-w-[180px] shadow-sm transition-all"
                    >
                        <FileDown className="h-4 w-4" />
                        <span className="font-semibold text-sm">
                            {loading ? "Gerando PDF..." : "Baixar PDF"}
                        </span>
                    </Button>
                </a>
            )}
        </BlobProvider>
    );

    // Opções de convite (orador + data)
    const scheduledOptions = useMemo(() => {
        if (!data?.speakers) return [];

        const now = dayjs().startOf("day");

        const options: { label: string, schedule: IRecordWeekendSchedule, id: string }[] = [];

        Object.values(weekendSchedules).forEach(s => {
            if (!s?.date || !s?.speaker_id) return;

            const scheduleDate = dayjs(s.date).startOf("day");

            if (scheduleDate.valueOf() >= now.valueOf()) {
                const speaker = data.speakers.find(sp => sp.id === s.speaker_id);
                if (speaker) {
                    options.push({
                        label: `${speaker.fullName} • ${scheduleDate.format("DD/MM/YYYY")}`,
                        schedule: s,
                        id: s.id || s.date
                    });
                }
            }
        });

        return options.sort((a, b) => dayjs(a.schedule.date).valueOf() - dayjs(b.schedule.date).valueOf());
    }, [weekendSchedules, data?.speakers]);

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    const selectedSchedule = useMemo(() => {
        if (!selectedOptionId) return null;
        return scheduledOptions.find(opt => opt.id === selectedOptionId)?.schedule ?? null;
    }, [selectedOptionId, scheduledOptions]);

    // Estatísticas do mês
    const stats = useMemo(() => {
        const total = weekendMeetingDay.length;
        let complete = 0;
        let special = 0;

        weekendMeetingDay.forEach(d => {
            const dateStr = d.toISOString().split("T")[0];
            const sched = weekendSchedules[dateStr];
            if (sched) {
                if (sched.isSpecial) {
                    special++;
                    complete++;
                } else if (
                    sched.chairman_id &&
                    (sched.speaker_id || sched.manualSpeaker) &&
                    (sched.talk_id || sched.manualTalk) &&
                    sched.reader_id &&
                    sched.watchTowerStudyTitle
                ) {
                    complete++;
                }
            }
        });

        return { total, complete, special, pending: total - complete };
    }, [weekendMeetingDay, weekendSchedules]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Programação do Fim de Semana" />

            <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto">
                {!data ? (
                    <WeekendScheduleSkeleton />
                ) : (
                    <>
                        {/* ==================================================== */}
                        {/* 1. HERO & METRICS CARD                               */}
                        {/* ==================================================== */}
                        <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>Arranjo de Oradores</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-typography-900 capitalize">
                                    {currentMonthLabel}
                                </h1>
                                <p className="text-xs sm:text-sm text-typography-500">
                                    Gerencie as designações de reuniões de fim de semana, oradores e temas.
                                </p>
                            </div>

                            {/* Metric Badges Strip */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-surface-300">
                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                        <CalendarIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-medium text-typography-500">Total no mês</div>
                                        <div className="text-base font-bold text-typography-900">{stats.total} reuniões</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-medium text-typography-500">Completas</div>
                                        <div className="text-base font-bold text-typography-900">{stats.complete} de {stats.total}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-medium text-typography-500">Pendentes</div>
                                        <div className="text-base font-bold text-typography-900">{stats.pending} restantes</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-medium text-typography-500">Saídas externas</div>
                                        <div className="text-base font-bold text-typography-900">{externalData.length} oradores</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ==================================================== */}
                        {/* 2. COMPACT STICKY NAVIGATION & ACTIONS BAR           */}
                        {/* ==================================================== */}
                        <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md">
                            {/* Month Navigation */}
                            <div className="flex items-center bg-surface-200/80 rounded-xl p-1 border border-surface-300">
                                <button
                                    onClick={() => setMonthOffset((m) => m - 1)}
                                    className="p-2 rounded-lg hover:bg-surface-100 text-typography-700 hover:text-typography-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                                    title="Mês anterior"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline capitalize">{prevMonthLabel}</span>
                                </button>

                                {monthOffset !== 0 && (
                                    <button
                                        onClick={() => setMonthOffset(0)}
                                        className="px-2.5 py-1 text-xs font-semibold text-primary-200 hover:bg-surface-100 rounded-lg transition-colors flex items-center gap-1"
                                        title="Voltar para o mês atual"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Hoje
                                    </button>
                                )}

                                <button
                                    onClick={() => setMonthOffset((m) => m + 1)}
                                    className="p-2 rounded-lg hover:bg-surface-100 text-typography-700 hover:text-typography-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                                    title="Próximo mês"
                                >
                                    <span className="hidden sm:inline capitalize">{nextMonthLabel}</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Action Buttons Toolbar */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTool(activeTool === "invitation" ? "none" : "invitation")}
                                    className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                        activeTool === "invitation"
                                            ? "bg-primary-200 text-white border-primary-200 shadow-sm"
                                            : "bg-surface-200/70 border-surface-300 text-typography-700 hover:bg-surface-200"
                                    }`}
                                >
                                    <Mail className="h-4 w-4" />
                                    <span className="hidden md:inline">Convite Orador</span>
                                </button>

                                <button
                                    onClick={() => setActiveTool(activeTool === "pdf" ? "none" : "pdf")}
                                    className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                        activeTool === "pdf"
                                            ? "bg-primary-200 text-white border-primary-200 shadow-sm"
                                            : "bg-surface-200/70 border-surface-300 text-typography-700 hover:bg-surface-200"
                                    }`}
                                >
                                    <FileDown className="h-4 w-4" />
                                    <span className="hidden md:inline">Exportar PDF</span>
                                </button>

                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-sm transition-all ${
                                        pendingChangesCount > 0
                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                                            : "text-typography-200"
                                    }`}
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {pendingChangesCount > 0
                                            ? `Salvar (${pendingChangesCount})`
                                            : "Salvar todas"}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {/* ==================================================== */}
                        {/* 2. EXPANDABLE ACTION TOOL: CONVITE AO ORADOR          */}
                        {/* ==================================================== */}
                        {activeTool === "invitation" && (
                            <div className="bg-surface-100 border border-primary-200/40 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 animate-in fade-in-50 duration-200">
                                <div className="flex items-center justify-between pb-3 border-b border-surface-300">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-primary-100/20 text-primary-200">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-typography-900">Gerar Convite ao Orador</h3>
                                            <p className="text-xs text-typography-500">
                                                Crie um PDF personalizado de confirmação com os dados da reunião e congregação.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTool("none")}
                                        className="text-xs text-typography-500 hover:text-typography-800 p-1"
                                    >
                                        Fechar
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <span className="text-xs font-semibold text-typography-700 block mb-1">
                                            Selecione o Orador e a Data da Designação
                                        </span>
                                        <DropdownObject
                                            textVisible
                                            title="Selecionar Orador e Data"
                                            items={scheduledOptions ?? []}
                                            selectedItem={
                                                scheduledOptions.find(opt => opt.id === selectedOptionId) ?? null
                                            }
                                            handleChange={item => setSelectedOptionId(item?.id ?? null)}
                                            labelKey="label"
                                            border
                                            full
                                            emptyMessage="Nenhuma designação futura com orador encontrada"
                                            searchable
                                        />
                                    </div>

                                    <div>
                                        {selectedSchedule && congregation ? (
                                            <PdfSpeakerInvitation
                                                schedule={{
                                                    ...selectedSchedule,
                                                    speaker: data?.speakers.find(sp => sp.id === selectedSchedule.speaker_id),
                                                    talk: data?.talks.find(t => t.id === selectedSchedule.talk_id),
                                                    visitingCongregation: data?.congregations.find(
                                                        c => c.id === selectedSchedule.visitingCongregation_id
                                                    )
                                                }}
                                                congregationLocale={congregation}
                                            />
                                        ) : (
                                            <div className="p-2.5 rounded-xl bg-surface-200/60 border border-surface-300 text-center text-xs text-typography-500">
                                                Selecione uma designação acima
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ==================================================== */}
                        {/* 3. EXPANDABLE ACTION TOOL: GERAR PROGRAMAÇÃO PDF     */}
                        {/* ==================================================== */}
                        {activeTool === "pdf" && (
                            <div className="bg-surface-100 border border-primary-200/40 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 animate-in fade-in-50 duration-200">
                                <div className="flex items-center justify-between pb-3 border-b border-surface-300">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-primary-100/20 text-primary-200">
                                            <FileDown className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-typography-900">Gerar Programação em PDF</h3>
                                            <p className="text-xs text-typography-500">
                                                Exporte a programação do quadro de anúncios para impressão ou compartilhamento.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTool("none")}
                                        className="text-xs text-typography-500 hover:text-typography-800 p-1"
                                    >
                                        Fechar
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="w-full">
                                        <span className="text-xs font-semibold text-typography-700 block mb-1">Data inicial</span>
                                        <Calendar
                                            full
                                            titleHidden
                                            label="Data inicial"
                                            selectedDate={startDatePdfGenerate}
                                            handleDateChange={setStartDatePdfGenerate}
                                        />
                                    </div>

                                    <div className="w-full">
                                        <span className="text-xs font-semibold text-typography-700 block mb-1">Data final</span>
                                        <Calendar
                                            full
                                            titleHidden
                                            label="Data final"
                                            selectedDate={endDatePdfGenerate}
                                            handleDateChange={setEndDatePdfGenerate}
                                            minDate={startDatePdfGenerate}
                                        />
                                    </div>

                                    <div className="w-full">
                                        <span className="text-xs font-semibold text-typography-700 block mb-1">Escala do Documento</span>
                                        <Select
                                            value={pdfScale.toString()}
                                            onValueChange={v => setPdfScale(Number(v))}
                                        >
                                            <SelectTrigger className="rounded-xl border-surface-300 bg-surface-100">
                                                <SelectValue placeholder="Escala do PDF" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="1">100% (Padrão)</SelectItem>
                                                <SelectItem value="0.9">90% (Mais compacto)</SelectItem>
                                                <SelectItem value="0.8">80%</SelectItem>
                                                <SelectItem value="0.7">70%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-surface-300">
                                    <Button
                                        outline
                                        onClick={() => setShowPdfPreview(!showPdfPreview)}
                                        className="rounded-xl border-surface-300 text-typography-700 hover:bg-surface-200 flex items-center gap-2 text-sm"
                                    >
                                        {showPdfPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        <span>{showPdfPreview ? "Ocultar Prévia" : "Pré-visualizar"}</span>
                                    </Button>

                                    {isClient && <PdfLinkComponent />}
                                </div>

                                {showPdfPreview && (
                                    <div className="w-full h-[80vh] mt-3 border border-surface-300 rounded-2xl overflow-hidden shadow-inner">
                                        <PDFViewer style={{ width: "100%", height: "100%" }}>
                                            <Document>
                                                <WeekendMeeting schedules={filteredSchedules} scale={pdfScale} />
                                            </Document>
                                        </PDFViewer>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ==================================================== */}
                        {/* 4. LISTA DE FINAIS DE SEMANA (CARDS MODERNOS)         */}
                        {/* ==================================================== */}
                        <div className="flex flex-col gap-5 pb-24">
                            {weekendMeetingDay.length === 0 ? (
                                <div className="p-12 text-center bg-surface-100 border border-surface-300 rounded-2xl flex flex-col items-center justify-center gap-3">
                                    <CalendarIcon className="h-10 w-10 text-typography-400" />
                                    <h3 className="text-base font-bold text-typography-800">
                                        Nenhuma reunião encontrada para este mês
                                    </h3>
                                    <p className="text-xs text-typography-500 max-w-sm">
                                        Verifique se o dia da reunião pública da congregação está configurado nas configurações.
                                    </p>
                                </div>
                            ) : (
                                weekendMeetingDay.map((d) => {
                                    const weekend = getWeekendRange(d)
                                    const externalForDate = (externalData ?? []).filter((t) =>
                                        dayjs(t.date).isBetween(weekend.friday.toDate(), weekend.sunday.toDate(), "day", "[]")
                                    )
                                    return (
                                        <ScheduleRow
                                            key={d.toISOString()}
                                            date={d}
                                            externalTalks={externalForDate}
                                        />
                                    )
                                })
                            )}
                        </div>
                    </>
                )}
            </section>

            {/* Botão Flutuante Voltar ao Topo */}
            {showScrollTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary-200 hover:bg-primary-150 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center animate-fade-in"
                    title="Voltar ao topo"
                    aria-label="Voltar ao topo"
                >
                    <ChevronUp size={20} />
                </button>
            )}
        </ContentDashboard>
    )
}

WeekendSchedulePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default WeekendSchedulePage
