import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddNotice from "@/Components/Forms/FormAddNotice"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { ArrowLeft, BellPlus } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

function AddNoticePage() {
    const { congregation } = useCongregationContext()
    const congregationNumber = congregation?.number as string

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Criar Anúncio")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Anúncios", link: "/congregacao/anuncios" }
        ])
    }, [setPageActive, setCrumbs])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Criar Anúncio"} />
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-300">
                    <div>
                        <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">
                            <BellPlus size={16} />
                            <span>Quadro de Avisos & Informativos</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                            Criar Anúncio da Congregação
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500 mt-1">
                            Publique avisos oficiais, lembretes de relatórios e comunicados com visualização em tempo real.
                        </p>
                    </div>

                    <Link
                        href="/congregacao/anuncios"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300 text-typography-700 text-xs sm:text-sm font-semibold transition self-start sm:self-auto shadow-2xs"
                    >
                        <ArrowLeft size={16} />
                        <span>Voltar para Lista</span>
                    </Link>
                </div>

                {/* Formulário com Pré-visualização Integrada */}
                <FormAddNotice congregationNumber={congregationNumber} />
            </div>
        </ContentDashboard>
    )
}

AddNoticePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "NOTICES_MANAGER"])

export default AddNoticePage
