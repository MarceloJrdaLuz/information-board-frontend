import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormTransferPublisher from "@/Components/Forms/FormTransferPublisher"
import { Button } from "@/Components/ui/button"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IPublisher } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { AlertCircle, ArrowLeft, ArrowRightLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect } from "react"

function TransferPublishersPage() {
    const router = useRouter()
    const { id } = router.query
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    const fetchUrl = congregationUser?.id
        ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}`
        : ""

    const { data: publishers, isLoading } = useAuthorizedFetch<IPublisher[]>(fetchUrl, {
        allowedRoles: ["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"]
    })

    const filteredPublisherSelected = publishers?.find((p) => p.id === id)

    useEffect(() => {
        setPageActive("Transferir Publicador")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Pessoas", link: "/congregacao/pessoas" },
            { label: "Transferência", link: `/congregacao/pessoas/transferir/${id}` }
        ])
    }, [setCrumbs, setPageActive, id])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Transferir Publicador"} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
                {/* Header Superior da Página */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-2xl bg-primary-200/10 text-primary-200 shrink-0">
                            <ArrowRightLeft className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-800">
                                Transferência de Publicador
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                Mova o registro de publicadores e o histórico de relatórios (S-21) com atualização automática de escalas.
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => router.push("/congregacao/pessoas")}
                        className="rounded-xl gap-2 font-semibold text-xs border-surface-300 hover:text-primary-200 hover:bg-surface-200 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar para Pessoas</span>
                    </Button>
                </div>

                {/* Conteúdo: Loading / Não Encontrado / Formulário */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm gap-3">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin" />
                        <p className="text-sm font-medium text-typography-500">
                            Carregando dados para transferência...
                        </p>
                    </div>
                ) : !filteredPublisherSelected ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm text-center gap-3">
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-lg font-bold text-typography-800">
                            Publicador não encontrado
                        </h2>
                        <p className="text-sm text-typography-500 max-w-md">
                            O publicador que você está tentando transferir não foi encontrado na sua congregação ativa ou já foi transferido.
                        </p>
                        <Button
                            onClick={() => router.push("/congregacao/pessoas")}
                            className="mt-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl"
                        >
                            Voltar para Lista de Pessoas
                        </Button>
                    </div>
                ) : (
                    <FormTransferPublisher
                        allPublishers={publishers || []}
                        initialPublisher={filteredPublisherSelected}
                    />
                )}
            </div>
        </ContentDashboard>
    )
}

TransferPublishersPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"])

export default TransferPublishersPage
