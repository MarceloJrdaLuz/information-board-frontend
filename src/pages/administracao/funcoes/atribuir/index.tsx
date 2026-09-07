import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormUserRoles from "@/Components/Forms/FormUserRoles"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { ShieldCheck } from "lucide-react"
import { useEffect } from "react"

function AssignRole() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Atribuir Funções")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Funções", link: "/administracao/funcoes" },
            { label: "Atribuir", link: "/administracao/funcoes/atribuir" }
        ])
    }, [setPageActive, setCrumbs])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Atribuir Funções"} />
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-surface-300">
                    <div>
                        <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">
                            <ShieldCheck size={16} />
                            <span>Controle de Acessos & Permissões</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                            Atribuir Funções aos Usuários
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500 mt-1">
                            Selecione um usuário da congregação para gerenciar seus papéis e privilégios no sistema.
                        </p>
                    </div>
                </div>

                {/* Formulário Principal Reformulado */}
                <FormUserRoles />
            </div>
        </ContentDashboard>
    )
}

AssignRole.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION"])

export default AssignRole