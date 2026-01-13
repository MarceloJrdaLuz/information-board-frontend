import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Button from "@/Components/Button"
import EmptyState from "@/Components/EmptyState"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { useEffect } from "react"
import Router from "next/router"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { API_ROUTES } from "@/constants/apiRoutes"
import { ListGeneric } from "@/Components/ListGeneric"
import { IReminder } from "@/types/reminder"
import { toast } from "react-toastify"
import { deleteReminderAtom } from "@/atoms/remindersAtom"
import { useAuthContext } from "@/context/AuthContext"
import dayjs from "dayjs"

export default function RemindersPage() {
    const [crumbs] = useAtom(crumbsAtom)
    const { user } = useAuthContext()
    const [, setPageActive] = useAtom(pageActiveAtom)
    const deleteReminder = useSetAtom(deleteReminderAtom)

    const { data, mutate } = useAuthorizedFetch<IReminder[]>(
        `${API_ROUTES.PUBLISHER_REMINDERS}/publishers/${user?.publisher?.id}/all`
    )

    async function handleDelete(reminder_id: string) {
        await toast.promise(deleteReminder(reminder_id), {
            pending: "Excluindo lembrete..."
        }).then(() => mutate())
    }

    useEffect(() => {
        setPageActive("Lembretes")
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Lembretes" />

            <section className="p-5">
                <div className="flex justify-between mb-3">
                    <Button outline onClick={() => Router.push("/meus-lembretes/add")}>
                        Novo lembrete
                    </Button>
                </div>

                {data?.length ? (
                    <ListGeneric<IReminder>
                        items={data}
                        path="/meus-lembretes"
                        label="do lembrete"
                        onUpdate={(item) =>
                            Router.push(`/meus-lembretes/edit/${item.id}`)
                        }
                        onDelete={handleDelete}
                        renderItem={(item) => (
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-typography-800">{item.title}</h3>
                                <span className="text-sm text-typography-700">
                                    {dayjs(item.startDate).format("DD/MM/YYYY")} → {dayjs(item.endDate).format("DD/MM/YYYY")}
                                </span>
                                {item.isRecurring && (
                                    <span className="text-xs text-primary-200">
                                        Recorrente
                                    </span>
                                )}
                                {item.description && (
                                    <p className="text-sm text-typography-500">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                ) : (
                    <EmptyState message="Nenhum lembrete cadastrado" />
                )}
            </section>
        </ContentDashboard>
    )
}

RemindersPage.getLayout = withProtectedLayout()
