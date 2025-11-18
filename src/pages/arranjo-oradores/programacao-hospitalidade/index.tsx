import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import HospitalityRow from "@/Components/HospitalityWeekendRow"
import SkeletonHospitalityRow from "@/Components/HospitalityWeekendRow/skeleton"
import WeekendScheduleSkeleton from "@/Components/WeekendScheduleSkeleton"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import {
    createHospitalityWeekendAtom,
    dirtyWeekendsAtom,
    hospitalityGroup,
    hospitalityWeekendsAtom,
} from "@/atoms/hospitalityWeekendScheduleAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IHospitalityWeekend, IRecordHospitalityAssignment, IRecordHospitalityWeekend } from "@/types/hospitality"
import { IHospitalityGroup } from "@/types/types"
import { DayMeetingPublic, getWeekendDays } from "@/utils/dateUtil"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import moment from "moment"
import "moment/locale/pt-br"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function HospitalityWeekendPage() {
    moment.defineLocale("pt-br", null)
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [monthOffset, setMonthOffset] = useState<number>(0)
    const [weekendMeetingDay, setWeekendMeetingDay] = useState<Date[]>([])

    const [, setHospitalityWeekends] = useAtom(hospitalityWeekendsAtom)
    const setGroups = useSetAtom(hospitalityGroup)

    const setCreateHospitalityWeekend = useSetAtom(createHospitalityWeekendAtom)
    const [dirtyWeekends] = useAtom(dirtyWeekendsAtom);

    const baseDate = moment().add(monthOffset, "months")
    const prevMonthLabel = baseDate.clone().subtract(1, "month").format("MMMM")
    const nextMonthLabel = baseDate.clone().add(1, "month").format("MMMM")

    const { data, mutate } = useAuthorizedFetch<IHospitalityWeekend[]>(`congregation/${congregation_id ?? ""}/hospitality/weekends`, {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })
    const { data: groups } = useAuthorizedFetch<IHospitalityGroup[]>(`${congregation_id ? `congregation/${congregation_id}/hospitalityGroups` : ""}`, {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    useEffect(() => {
        if (!data) return;
        const weekendsByDate = (data ?? []).reduce<Record<string, IRecordHospitalityWeekend>>((acc, weekend) => {
            const assignments: IRecordHospitalityAssignment[] = (weekend.assignments ?? []).map(a => ({
                id: a.id,
                eventType: a.eventType,
                completed: a.completed,
                group_id: a.group.id, // converte o objeto group para apenas o id
            }))

            acc[weekend.date] = {
                id: weekend.id,
                date: weekend.date,
                assignments
            }

            return acc
        }, {})

        setHospitalityWeekends(weekendsByDate)
    }, [data, monthOffset, setHospitalityWeekends]);

    useEffect(() => {
        if (groups) {
            setGroups(groups)
        }
    }, [groups, setGroups])

    useEffect(() => {
        if (!congregation?.dayMeetingPublic) return
        setWeekendMeetingDay(getWeekendDays(monthOffset, congregation?.dayMeetingPublic as DayMeetingPublic))
    }, [monthOffset, congregation?.dayMeetingPublic])

    useEffect(() => {
        setPageActive("Hospitalidade")
    }, [setPageActive])

    const handleSave = async () => {
        const alteredWeekends = Object.values(dirtyWeekends);
        if (!alteredWeekends.length) return toast.info("Nenhuma alteração para salvar.");

        await toast.promise(
            setCreateHospitalityWeekend(congregation_id ?? "", { weekends: alteredWeekends }),
            { pending: "Salvando arranjos..." }
        );
        mutate()
    };

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Hospitalidade" />
            <section className="flex flex-wrap w-full h-full p-4 relative">
                {!data ? (
                    <SkeletonHospitalityRow />
                ) : (
                    <div className="w-full space-y-6">
                        {/* Filtros e controles */}
                        <div className="sticky top-0 z-30 bg-surface-100 p-4 rounded-xl shadow flex flex-col gap-4">
                            <div className="flex justify-between items-center gap-2">
                                <Button
                                    onClick={() => setMonthOffset((m) => m - 1)}
                                    className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200"
                                >
                                    ◀ {prevMonthLabel}
                                </Button>

                                <Button
                                    onClick={() => setMonthOffset((m) => m + 1)}
                                    className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200"
                                >
                                    {nextMonthLabel} ▶
                                </Button>
                            </div>

                            <Button className="w-full text-typography-200" onClick={handleSave}>
                                Salvar todas
                            </Button>
                        </div>

                        {/* Lista de sábados */}
                        <div className="space-y-4 pb-36">
                            {weekendMeetingDay.map((d) => (
                                <div
                                    key={d.toISOString()}
                                    className="bg-surface-100 border rounded-xl shadow-sm p-4"
                                >
                                    <HospitalityRow date={d} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </ContentDashboard>
    )
}

HospitalityWeekendPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default HospitalityWeekendPage