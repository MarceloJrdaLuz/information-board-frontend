import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import PublisherList from "@/Components/PublishersList"
import { Button } from "@/Components/ui/button"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { CalendarOff, UserPlus, Users } from "lucide-react"
import Router from "next/router"
import { useEffect } from "react"

function PublishersPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const { roleContains } = useAuthContext()

    const canManage =
        roleContains("ADMIN_CONGREGATION") || roleContains("PUBLISHERS_MANAGER")

    useEffect(() => {
        setPageActive("Publicadores")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Publicadores", link: "/congregacao/publicadores" },
        ])
    }, [setPageActive, setCrumbs])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Publicadores" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Cabeçalho Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-typography-800">
                                    Publicadores
                                </h1>
                                <p className="text-xs sm:text-sm text-typography-500">
                                    Gerencie o rol de publicadores, privilégios, contatos e indisponibilidades.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {canManage && (
                            <Button
                                type="button"
                                onClick={() => Router.push("/congregacao/publicadores/add")}
                                className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-xs h-10 px-4 text-xs transition-all cursor-pointer"
                            >
                                <UserPlus size={16} />
                                <span>Adicionar pessoa</span>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => Router.push("/congregacao/publicadores/indisponibilidades")}
                            className="gap-2 rounded-xl border-surface-300 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-semibold text-xs h-10 px-4 shadow-2xs transition-all cursor-pointer"
                        >
                            <CalendarOff size={16} className="text-amber-500" />
                            <span>Indisponibilidades</span>
                        </Button>
                    </div>
                </div>

                {/* Lista e Recursos de Publicadores */}
                <PublisherList />
            </div>
        </ContentDashboard>
    )
}

PublishersPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER", "PUBLISHERS_VIEWER"])

export default PublishersPage
