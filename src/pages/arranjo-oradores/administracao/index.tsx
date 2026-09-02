import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import DropdownObject from "@/Components/DropdownObjects"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { addAndUpdateSpeakerCoordinateAtom } from "@/atoms/systemCongregationAtoms"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { Gender, IPublisher } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { CheckCircle2, Phone, Save, ShieldCheck, User, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function AdminSpeakerArrangement() {
    const { user } = useAuthContext()
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const sendSpeakerCoordinator = useSetAtom(addAndUpdateSpeakerCoordinateAtom)
    const [speakerCoordinator, setSpeakerCoordinator] = useState<IPublisher | null>(user?.congregation?.speakerCoordinator || null)
    const [isSaving, setIsSaving] = useState(false)

    const fetchConfig = user?.congregation ? `${API_ROUTES.PUBLISHERS}/congregationId/${user.congregation?.id}` : ""
    const { data: publishers, mutate } = useAuthorizedFetch<IPublisher[]>(fetchConfig)

    const filteredPublishersMan = publishers?.filter(p => p.gender === Gender.Masculino && p.dateImmersed)

    useEffect(() => {
        setPageActive('/arranjo-oradores/administracao')
    }, [setPageActive])

    useEffect(() => {
        if (user?.congregation?.speakerCoordinator) {
            setSpeakerCoordinator(user.congregation.speakerCoordinator)
        }
    }, [user?.congregation?.speakerCoordinator])

    function onSubmit() {
        if (!speakerCoordinator) {
            toast.warning("Por favor, selecione um publicador.")
            return
        }

        if (user?.congregation) {
            setIsSaving(true)
            toast.promise(sendSpeakerCoordinator(user.congregation.id, speakerCoordinator.id), {
                pending: 'Definindo coordenador de discursos...',
                success: 'Coordenador atualizado com sucesso!',
                error: 'Erro ao atualizar coordenador.'
            }).then(() => {
                mutate()
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                setIsSaving(false)
            })
        }
    }

    const currentCoordinator = user?.congregation?.speakerCoordinator

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Administração"} />

            <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto">
                {/* ==================================================== */}
                {/* 1. HERO CARD                                         */}
                {/* ==================================================== */}
                <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Arranjo de Oradores • Fim de Semana</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-typography-900">
                            Administração do Arranjo
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500">
                            Defina e gerencie o irmão designado para coordenar a programação de discursos públicos e hospitalidade da congregação.
                        </p>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* 2. MAIN CARDS GRID                                   */}
                {/* ==================================================== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Card: Coordenador Atual */}
                    <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-surface-300">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-primary-200" />
                                <h2 className="text-base font-bold text-typography-900">Coordenador Atual</h2>
                            </div>
                            {currentCoordinator ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Ativo
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    Não atribuído
                                </span>
                            )}
                        </div>

                        {currentCoordinator ? (
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-200/50 border border-surface-300/80">
                                <div className="p-3 rounded-full bg-primary-100/20 text-primary-200 shrink-0">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-typography-900">
                                        {currentCoordinator.fullName}
                                    </span>
                                    {currentCoordinator.phone && (
                                        <div className="flex items-center gap-1.5 text-xs text-typography-600 mt-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span>{currentCoordinator.phone}</span>
                                        </div>
                                    )}
                                    <span className="text-[11px] text-typography-500 mt-1">
                                        Responsável pelo arranjo de oradores locais e externos.
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-sm text-typography-500 bg-surface-200/40 rounded-xl border border-dashed border-surface-300">
                                Nenhum coordenador de discursos designado no momento. Selecione um irmão ao lado para designar.
                            </div>
                        )}
                    </div>

                    {/* Card: Designar / Alterar Coordenador */}
                    <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 pb-3 border-b border-surface-300">
                            <ShieldCheck className="h-5 w-5 text-primary-200" />
                            <h2 className="text-base font-bold text-typography-900">
                                {currentCoordinator ? "Alterar Coordenador" : "Designar Coordenador"}
                            </h2>
                        </div>

                        <p className="text-xs text-typography-500">
                            Selecione um irmão batizado pertencente à congregação local para exercer esta função.
                        </p>

                        <div className="flex flex-col gap-2 mt-1">
                            <label className="text-xs font-semibold text-typography-700">
                                Publicador (Irmão batizado):
                            </label>
                            <DropdownObject
                                textVisible
                                title="Selecione um irmão"
                                items={filteredPublishersMan ?? []}
                                selectedItem={filteredPublishersMan?.find(p => p.id === speakerCoordinator?.id) ?? null}
                                handleChange={item => setSpeakerCoordinator(item)}
                                labelKey="fullName"
                                border
                                full
                                emptyMessage="Nenhum publicador qualificado encontrado"
                            />
                        </div>

                        <div className="pt-3 border-t border-surface-300 flex justify-end">
                            <Button
                                onClick={onSubmit}
                                disabled={isSaving}
                                className="text-typography-200 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-sm"
                            >
                                <Save className="h-4 w-4" />
                                <span>{isSaving ? "Salvando..." : "Salvar Coordenador"}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </ContentDashboard>
    )
}

AdminSpeakerArrangement.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"])

export default AdminSpeakerArrangement
