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
import { FileDown, Layers, Plus, UserCheck, Users } from "lucide-react"
import Router from "next/router"
import { useEffect, useMemo, useState } from "react"
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
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const [groups, setGroups] = useState<IGroup[]>()
    const [showInactives, setShowInactives] = useState(false)

    const fetchConfig = congregation_id ? `/groups/${congregation_id}` : ""
    const { data: getGroups, mutate, isLoading } = useAuthorizedFetch<IGroup[]>(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "GROUPS_MANAGER", "GROUPS_VIEWER"]
    })

    useEffect(() => {
        if (getGroups) {
            const sort = sortArrayByProperty(getGroups, "number")
            setGroups(sort)
        }
    }, [getGroups])

    useEffect(() => {
        setPageActive("Grupos de Campo")
        setCrumbs([
            { label: "Início", link: "/dashboard" }
        ])
    }, [setPageActive, setCrumbs])

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

    const stats = useMemo(() => {
        const total = groups?.length ?? 0
        const totalPublishers = groups?.reduce((acc, g) => acc + (g.publishers?.length ?? 0), 0) ?? 0
        const withOverseer = groups?.filter((g) => !!g.groupOverseers).length ?? 0
        return { total, totalPublishers, withOverseer }
    }, [groups])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Grupos de Campo"} />
            <section className="flex flex-col w-full h-full p-4 sm:p-6 md:p-8 gap-6">
                {/* Header Principal com Métricas (Estilo Oradores) */}
                <div className="flex flex-col gap-4 p-5 sm:p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                                <Users className="h-4 w-4" />
                                <span>Congregação • Grupos de Campo</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-800 tracking-tight">
                                Grupos de Campo
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500">
                                Organize os publicadores por grupo de serviço de campo e acompanhe seus dirigentes.
                            </p>
                        </div>

                        {/* Barra de Ações: Criar Grupo & Exportar PDF */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Toggle de Inativos no PDF */}
                            <div className="flex items-center bg-surface-200/60 px-3 py-2 rounded-xl border border-surface-300 text-xs">
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
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-200 hover:bg-primary-300 text-white font-semibold text-xs sm:text-sm transition active:scale-95 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Criar Grupo</span>
                            </button>
                        </div>
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                                <Layers className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Total de Grupos</div>
                                <div className="text-base font-bold text-typography-900">
                                    {isLoading || !getGroups ? (
                                        <span className="inline-block h-4 w-7 rounded bg-surface-300/70 animate-pulse align-middle" />
                                    ) : (
                                        stats.total
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Publicadores Vinculados</div>
                                <div className="text-base font-bold text-typography-900">
                                    {isLoading || !getGroups ? (
                                        <span className="inline-block h-4 w-7 rounded bg-surface-300/70 animate-pulse align-middle" />
                                    ) : (
                                        stats.totalPublishers
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                                <UserCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Com Dirigente</div>
                                <div className="text-base font-bold text-typography-900">
                                    {isLoading || !getGroups ? (
                                        <span className="inline-block h-4 w-12 rounded bg-surface-300/70 animate-pulse align-middle" />
                                    ) : (
                                        `${stats.withOverseer} de ${stats.total}`
                                    )}
                                </div>
                            </div>
                        </div>
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