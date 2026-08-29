import BreadCrumbs from "@/Components/BreadCrumbs"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import GroupsFieldServicePdf from "@/Components/GroupFieldServiceListPdf"
import ListGroups from "@/Components/ListGroups"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IGroup } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { BlobProvider, Document } from "@react-pdf/renderer"
import { useAtom } from "jotai"
import { FileDown, Plus, Users } from "lucide-react"
import Router from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

interface IGroupPdfLinkComponentProps {
    groups: IGroup[] | undefined
    congregation: string
    showInactives?: boolean
}

function PdfLinkComponent({ groups, congregation, showInactives }: IGroupPdfLinkComponentProps) {
    return (
        <BlobProvider
            document={
                <Document>
                    <GroupsFieldServicePdf
                        groups={groups ?? []}
                        congregationName={congregation}
                        showInactives={showInactives}
                    />
                </Document>
            }
        >
            {({ blob, url, loading, error }) => {
                const isDisabled = loading || !!error || !blob

                return (
                    <a
                        href={url || "#"}
                        download={url ? `Grupos de campo congregacao ${congregation}.pdf` : undefined}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-100 border border-surface-300 text-typography-700 hover:text-primary-200 hover:border-primary-200 text-xs sm:text-sm font-semibold transition active:scale-95 shadow-sm ${
                            isDisabled ? "pointer-events-none opacity-50" : ""
                        }`}
                        title="Baixar lista de grupos em PDF"
                    >
                        <FileDown className="w-4 h-4 text-primary-200" />
                        <span>{loading ? "Gerando..." : "Exportar PDF"}</span>
                    </a>
                )
            }}
        </BlobProvider>
    )
}

function GroupsPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const { handleSubmitError, handleSubmitSuccess } = useSubmit()
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [groups, setGroups] = useState<IGroup[]>()
    const [showInactives, setShowInactives] = useState(false)

    const fetchConfig = congregation_id ? `/groups/${congregation_id}` : ""
    const { data: getGroups, mutate } = useAuthorizedFetch<IGroup[]>(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "GROUPS_MANAGER", "GROUPS_VIEWER"]
    })

    useEffect(() => {
        if (getGroups) {
            const sort = sortArrayByProperty(getGroups, "number")
            setGroups(sort)
        }
    }, [getGroups])

    useEffect(() => {
        setPageActive("Grupos")
    }, [setPageActive])

    async function deleteGroup(group_id: string) {
        await api
            .delete(`group/${group_id}`)
            .then(() => {
                mutate()
                handleSubmitSuccess(messageSuccessSubmit.groupDelete)
            })
            .catch((err) => {
                const {
                    response: {
                        data: { message }
                    }
                } = err
                if (message === '"Unauthorized"') {
                    handleSubmitError(messageErrorsSubmit.unauthorized)
                } else {
                    handleSubmitError(messageErrorsSubmit.default)
                }
            })
    }

    function handleDelete(group_id: string) {
        toast
            .promise(deleteGroup(group_id), {
                pending: "Excluindo grupo..."
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const skeletonGroupsList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 pb-28 w-full">
                {skeletonGroupsList.map((_, i) => (
                    <SkeletonGroupsList key={i + "skeleton"} />
                ))}
            </ul>
        )
    }

    const totalPublishers = groups?.reduce((acc, g) => acc + (g.publishers?.length ?? 0), 0) ?? 0

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Grupos de Campo"} />
            <section className="flex flex-col w-full h-full p-4 sm:p-6 md:p-8">
                {/* Header Principal da Página */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-300">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-typography-800 tracking-tight">
                                Grupos de Campo
                            </h1>
                            {groups && (
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-200/10 text-primary-200">
                                    {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-typography-500 mt-1">
                            Organize os publicadores por grupo de serviço de campo
                            {totalPublishers > 0 && ` (${totalPublishers} publicadores distribuídos)`}
                        </p>
                    </div>

                    {/* Barra de Ações: Criar Grupo & Exportar PDF */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Toggle de Inativos no PDF */}
                        <div className="flex items-center bg-surface-100 px-3 py-2 rounded-xl border border-surface-300 text-xs">
                            <CheckboxBoolean
                                handleCheckboxChange={setShowInactives}
                                checked={showInactives}
                                label="Incluir inativos no PDF"
                            />
                        </div>

                        {/* Botão Exportar PDF */}
                        {groups && groups.length > 0 && (
                            <PdfLinkComponent
                                showInactives={showInactives}
                                groups={groups}
                                congregation={congregation?.name ?? ""}
                            />
                        )}

                        {/* Botão Criar Grupo */}
                        <button
                            onClick={() => Router.push("/congregacao/grupos-campo/add")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs sm:text-sm transition active:scale-95 shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Criar Grupo</span>
                        </button>
                    </div>
                </div>

                {/* Grid de Grupos ou Estado Vazio */}
                {groups && groups.length > 0 ? (
                    <ListGroups
                        onDelete={(item_id) => handleDelete(item_id)}
                        items={groups}
                        path=""
                        label="Grupo"
                    />
                ) : (
                    <>
                        {!groups ? (
                            renderSkeleton()
                        ) : (
                            <div className="py-16">
                                <EmptyState message="Nenhum grupo de campo cadastrado nessa congregação ainda!" />
                            </div>
                        )}
                    </>
                )}
            </section>
        </ContentDashboard>
    )
}

GroupsPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "GROUPS_MANAGER",
    "GROUPS_VIEWER"
])

export default GroupsPage