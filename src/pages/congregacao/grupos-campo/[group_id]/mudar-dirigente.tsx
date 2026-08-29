import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import DropdownObject from "@/Components/DropdownObjects"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IPublisher, Situation } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { ArrowLeft, Check, UserCheck } from "lucide-react"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"

function ChangeGroupOverseer() {
    const { group_id, group_number } = useRouter().query
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const { handleSubmitSuccess, handleSubmitError } = useSubmit()

    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisher | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchConfigPublishers = congregationUser
        ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}`
        : ""
    const { data: getPublishers, mutate } = useAuthorizedFetch<IPublisher[]>(fetchConfigPublishers, {
        allowedRoles: ["ADMIN_CONGREGATION", "GROUPS_MANAGER"]
    })

    const changeGroupOverseer = async () => {
        if (!selectedPublisher) return
        try {
            setIsSubmitting(true)
            await api.put(`/group/${group_id}/change-groupOverseer`, {
                publisher_id: selectedPublisher?.id
            })
            handleSubmitSuccess(messageSuccessSubmit.groupOverseerUpdate)
            setSelectedPublisher(null)
            mutate()
            setTimeout(() => {
                Router.push({
                    pathname: `/congregacao/grupos-campo/${group_id}/add-publicadores`,
                    query: { group_number: `${group_number}` }
                })
            }, 800)
        } catch (err: any) {
            const message = err?.response?.data?.message
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (getPublishers) {
            const qualifiedPublishers = getPublishers.filter((publisher) => {
                if (publisher.gender !== "Masculino") return false
                if (publisher.situation && publisher.situation !== Situation.ATIVO) return false

                return publisher.privileges?.some((priv) => {
                    const normalized = priv
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                    return (
                        normalized.includes("anciao") ||
                        normalized.includes("servo ministerial") ||
                        normalized === "sm"
                    )
                })
            })
            setPublishers(sortArrayByProperty(qualifiedPublishers, "fullName"))
        }
    }, [getPublishers])

    useEffect(() => {
        setCrumbs((prev) => [
            ...prev,
            {
                label: "Editar grupo",
                link: `/congregacao/grupos-campo/${group_id}/add-publicadores?group_number=${group_number}`
            }
        ])
        return () => {
            setCrumbs((prev) => prev.slice(0, -1))
        }
    }, [setCrumbs, group_id, group_number])

    useEffect(() => {
        setPageActive("Mudar dirigente")
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Mudar Dirigente"} />
            <section className="flex flex-col w-full h-full p-4 sm:p-6 md:p-8">
                {/* Header Superior */}
                <div className="flex items-center gap-3 pb-4 border-b border-surface-300">
                    <button
                        onClick={() =>
                            Router.push({
                                pathname: `/congregacao/grupos-campo/${group_id}/add-publicadores`,
                                query: { group_number: `${group_number}` }
                            })
                        }
                        className="p-2 rounded-xl bg-surface-100 hover:bg-surface-300 border border-surface-300 text-typography-700 transition active:scale-95"
                        title="Voltar"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-800 tracking-tight">
                                {group_number ? `Mudar Dirigente - Grupo ${group_number}` : "Mudar Dirigente"}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                            Selecione o irmão qualificado (Ancião ou Servo Ministerial) que será o dirigente deste grupo
                        </p>
                    </div>
                </div>

                {/* Card Central de Seleção */}
                <div className="flex justify-center items-center py-10 w-full">
                    <div className="w-full max-w-xl bg-surface-100 rounded-2xl border border-surface-300 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-primary-200/10 text-primary-200">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-typography-800">
                                    Escolha o novo dirigente
                                </h2>
                                <p className="text-xs text-typography-500">
                                    Apenas Anciãos e Servos Ministeriais ativos são listados
                                </p>
                            </div>
                        </div>

                        {publishers && (
                            <div className="w-full">
                                <DropdownObject<IPublisher>
                                    title="Selecione o dirigente"
                                    items={publishers}
                                    selectedItem={selectedPublisher}
                                    handleChange={setSelectedPublisher}
                                    labelKey="fullName"
                                    labelKeySecondary="nickname"
                                    border
                                    textVisible
                                    full
                                    searchable
                                    emptyMessage="Nenhum Ancião ou Servo Ministerial encontrado"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-300">
                            <button
                                type="button"
                                onClick={() =>
                                    Router.push({
                                        pathname: `/congregacao/grupos-campo/${group_id}/add-publicadores`,
                                        query: { group_number: `${group_number}` }
                                    })
                                }
                                className="px-4 py-2.5 rounded-xl border border-surface-300 text-typography-700 hover:bg-surface-200 text-xs sm:text-sm font-semibold transition"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                disabled={!selectedPublisher || isSubmitting}
                                onClick={changeGroupOverseer}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs sm:text-sm transition active:scale-95 shadow-md disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Check className="w-4 h-4" />
                                <span>{isSubmitting ? "Atualizando..." : "Salvar Dirigente"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </ContentDashboard>
    )
}

ChangeGroupOverseer.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "GROUPS_MANAGER"])

export default ChangeGroupOverseer