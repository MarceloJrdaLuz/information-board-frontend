import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { createExternalAtom, updateStatusExternalTalkAtom } from "@/atoms/externalTalksAtoms"
import { CreateExternalTalksPayload } from "@/atoms/externalTalksAtoms/types"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import ExternalTalkRow from "@/Components/ExternalTalkRow"
import ExternalTalksSkeleton from "@/Components/ExternalTalksSkeleton"
import Layout from "@/Components/Layout"
import { useCongregationContext } from "@/context/CongregationContext"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { IExternalTalk } from "@/types/externalTalks"
import { IExternalTalkFormData } from "@/types/weekendSchedule"
import { DayMeetingPublic, getWeekendDays } from "@/utils/dateUtil"
import { useAtom, useSetAtom } from "jotai"
import moment from "moment"
import "moment/locale/pt-br"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function ExternalTalksPage() {
    moment.defineLocale("pt-br", null)
    const router = useRouter()
    const { date } = router.query
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const setCreateExternalTalk = useSetAtom(createExternalAtom)
    const setUpdateStatusExternalTalk = useSetAtom(updateStatusExternalTalkAtom)

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

    const { data, mutate } = useFetch<IExternalTalkFormData>(
        `/form-data?form=externalTalks`
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

    const externalTalks = data?.externalTalks ?? []
    const speakers = data?.speakers ?? []
    const congregations = data?.congregations ?? []
    const talks = data?.talks ?? []

    return (
        <Layout pageActive="saida-oradores" >
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                {!data ? (
                    <ExternalTalksSkeleton />
                ) : (
                    <>
                        <div className="flex justify-between my-4 p-4">
                            <Button
                                className="rounded-lg px-4 py-2 text-sm shadow capitalize"
                                onClick={() => setMonthOffset((m) => m - 1)}>
                                ◀ {prevMonthLabel}
                            </Button>
                            <Button
                                className="rounded-lg px-4 py-2 text-sm shadow capitalize"
                                onClick={() => setMonthOffset((m) => m + 1)}>
                                {nextMonthLabel} ▶
                            </Button>
                        </div>


                        {weekendMeetingDay.map((date) => {
                            const talksForDate = externalTalks.filter(
                                (t) => t.date === moment(date).format("YYYY-MM-DD")
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
                                        onUpdateStatus={handleUpdateStatus}
                                    />
                                </div>
                            )
                        })}
                    </>
                )}


            </ContentDashboard>
        </Layout>
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
