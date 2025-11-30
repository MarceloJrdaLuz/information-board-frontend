import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { createExternalAtom, deleteExternalTalkAtom, updateExternalTalkAtom, updateStatusExternalTalkAtom } from "@/atoms/externalTalksAtoms"
import { CreateExternalTalksPayload, UpdateExternalTalksPayload } from "@/atoms/externalTalksAtoms/types"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import ExternalTalkRow from "@/Components/ExternalTalkRow"
import ExternalTalksSkeleton from "@/Components/ExternalTalksSkeleton"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IExternalTalk } from "@/types/externalTalks"
import { IExternalTalkFormData } from "@/types/weekendSchedule"
import { DayMeetingPublic, getWeekendDays } from "@/utils/dateUtil"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import moment from "moment"
import "moment/locale/pt-br"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function ExternalTalksPage() {
    moment.defineLocale("pt-br", null)
    const router = useRouter()
    const { date } = router.query
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const setCreateExternalTalk = useSetAtom(createExternalAtom)
    const setUpdateExternalTalk = useSetAtom(updateExternalTalkAtom)
    const setUpdateStatusExternalTalk = useSetAtom(updateStatusExternalTalkAtom)
    const setDeleteExternalTalk = useSetAtom(deleteExternalTalkAtom)

    const [monthOffset, setMonthOffset] = useState(0)
    const [weekendMeetingDay, setWeekendMeetingDay] = useState<Date[]>([])

    const baseDate = moment().add(monthOffset, "months")
    const prevMonthLabel = baseDate.clone().subtract(1, "month").format("MMMM")
    const nextMonthLabel = baseDate.clone().add(1, "month").format("MMMM")

    useEffect(() => {
        setPageActive("Saída de oradores")
    }, [setPageActive])

    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id

    const { data, mutate } = useAuthorizedFetch<IExternalTalkFormData>(
        `/form-data?form=externalTalks`, {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    }
    )

    // atualiza mês a partir da querystring
    useEffect(() => {
        if (!router.isReady) return

        const dateParam = Array.isArray(date) ? date[0] : date
        if (!dateParam) return

        const target = moment(dateParam, "YYYY-MM-DD", true)
        if (target.isValid()) {
            const now = moment()
            const monthDiff =
                (target.year() - now.year()) * 12 + (target.month() - now.month())
            setMonthOffset(monthDiff)
        } else {
            const alt = moment(dateParam)
            if (!alt.isValid()) return
            const monthDiffAlt =
                (alt.year() - moment().year()) * 12 + (alt.month() - moment().month())
            setMonthOffset(monthDiffAlt)
        }
    }, [router.isReady, date])

    useEffect(() => {
        if (!congregation?.dayMeetingPublic) return
        setWeekendMeetingDay(getWeekendDays(monthOffset, congregation?.dayMeetingPublic as DayMeetingPublic))
    }, [monthOffset, congregation?.dayMeetingPublic])

    const handleAddExternalTalk = async (talk: Partial<IExternalTalk>) => {
        const payload: CreateExternalTalksPayload = {
            date: talk.date ?? "",
            destinationCongregation_id: talk.destinationCongregation?.id ?? "",
            speaker_id: talk.speaker?.id ?? "",
            manualTalk: talk.manualTalk ?? undefined,
            talk_id: talk.talk?.id ?? undefined,
        }

        await toast.promise(
            setCreateExternalTalk(congregation_id ?? "", payload),
            { pending: "Salvando discurso externo..." }
        )

        mutate()
    }

    const handleUpdate = async (externalTalk_id: string, payload: Partial<IExternalTalk>) => {
        const paylodUpdate: UpdateExternalTalksPayload = {
            destinationCongregation_id: payload.destinationCongregation?.id,
            speaker_id: payload.speaker?.id,
            talk_id: payload.talk?.id,
            manualTalk: payload.manualTalk
        }
        await toast.promise(
            setUpdateExternalTalk(externalTalk_id ?? "", paylodUpdate),
            { pending: "Salvando discurso externo..." }
        )

        mutate()
    }

    const handleUpdateStatus = async (
        externalTalk_id: string,
        status: IExternalTalk["status"]
    ) => {
        const payload = { status }

        await toast.promise(
            setUpdateStatusExternalTalk(externalTalk_id, payload),
            { pending: "Atualizando status do discurso..." }
        )
        mutate()
    }

    const handleDelete = async (
        externalTalk_id: string,
    ) => {
        await toast.promise(
            setDeleteExternalTalk(externalTalk_id),
            { pending: "Excluindo discurso fora..." }
        )
        mutate()
    }

    const externalTalks = data?.externalTalks ?? []
    const speakers = data?.speakers ?? []
    const congregations = data?.congregations ?? []
    const talks = data?.talks ?? []

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Saída de oradores"} />
            {!data ? (
                <ExternalTalksSkeleton />
            ) : (
                <>
                    <div className="flex justify-between my-4 p-4">
                        <Button
                            className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200"
                            onClick={() => setMonthOffset((m) => m - 1)}>
                            ◀ {prevMonthLabel}
                        </Button>
                        <Button
                            className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200"
                            onClick={() => setMonthOffset((m) => m + 1)}>
                            {nextMonthLabel} ▶
                        </Button>
                    </div>


                    {weekendMeetingDay.map((date) => {
                        const startWeekend = moment(date).isoWeekday(5) // sexta
                        const endWeekend = moment(date).isoWeekday(7)   // domingo

                        const talksForDate = externalTalks.filter((t) =>
                            moment(t.date).isBetween(startWeekend, endWeekend, "day", "[]")
                        )

                        return (
                            <div key={`${date}`} className="p-4">
                                <ExternalTalkRow
                                    key={date.toISOString()}
                                    date={date}
                                    externalTalks={talksForDate}
                                    speakers={speakers}
                                    congregations={congregations}
                                    talks={talks}
                                    onAddExternalTalk={handleAddExternalTalk}
                                    onUpdate={handleUpdate}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDelete={handleDelete}
                                />
                            </div>
                        )
                    })}
                </>
            )}
        </ContentDashboard>
    )
}

ExternalTalksPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default ExternalTalksPage