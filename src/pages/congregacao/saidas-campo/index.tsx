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
import { useCongregationContext } from "@/context/CongregationContext"
import { FIELD_SERVICE_TYPE_LABEL, ITemplateFieldService, WEEKDAY_LABEL } from "@/types/fieldService"
import { formatHour } from "@/utils/formatTime"
import { ListGeneric } from "@/Components/ListGeneric"
import { deleteFieldServiceAtom } from "@/atoms/fieldServiceAtoms"
import { toast } from "react-toastify"

export default function FieldServiceTemplatesPage() {
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const { congregation } = useCongregationContext()
    const deleteFieldService = useSetAtom(deleteFieldServiceAtom)

    const { data, mutate } = useAuthorizedFetch<ITemplateFieldService[]>(
        congregation
            ? `${API_ROUTES.FIELD_SERVICE_TEMPLATES}/congregation/${congregation.id}`
            : ""
    )

    async function handleDelete(template_id: string) {
        await toast.promise(deleteFieldService(template_id), {
            pending: "Excluindo saída de campo..."
        }).then(() => {
            mutate()
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        setPageActive("Saídas de Campo")
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Saídas de Campo" />

            <section className="p-5">
                <div className="flex justify-between items-center mb-3">
                    <Button
                        outline
                        onClick={() =>
                            Router.push("/congregacao/saidas-campo/add")
                        }
                    >
                        Nova Saída
                    </Button>
                </div>

                {data && data.length > 0 ? (
                    <ListGeneric<ITemplateFieldService>
                        items={data}
                        path="/congregacao/saidas-campo"
                        label="do template"
                        onUpdate={(template) =>
                            Router.push(
                                `/congregacao/saidas-campo/edit/${template.id}`
                            )
                        }
                        onDelete={handleDelete}
                        renderItem={(template) => (
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-typography-800">
                                    {FIELD_SERVICE_TYPE_LABEL[template.type]}
                                </h3>

                                <span className="text-sm text-typography-700">
                                    {WEEKDAY_LABEL[template.weekday]} • {formatHour(template.time)}
                                </span>

                                <span className="text-sm text-typography-700">
                                    Local: {template.location}
                                </span>

                                {template.type === "FIXED" && template.leader && (
                                    <span className="text-sm text-primary-200 font-medium">
                                        Dirigente: {template.leader.nickname || template.leader.fullName}
                                    </span>
                                )}
                            </div>
                        )}
                    />
                ) : (
                    <EmptyState message="Nenhum template cadastrado" />
                )}
            </section>
        </ContentDashboard>
    )
}

FieldServiceTemplatesPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "FIELD_SERVICE_MANAGER",
])
