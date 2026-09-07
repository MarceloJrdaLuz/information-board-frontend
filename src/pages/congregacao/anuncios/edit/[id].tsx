import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditNotice from "@/Components/Forms/FormEditNotice"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { ArrowLeft, Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"

function EditNoticePage() {
    const router = useRouter()
    const { id } = router.query

    const methods = useForm()

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Anúncio")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Anúncios", link: "/congregacao/anuncios" }
        ])
    }, [setPageActive, setCrumbs])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Anúncio"} />
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-300">
                    <div>
                        <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">
                            <Bell size={16} />
                            <span>Quadro de Avisos & Informativos</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                            Editar Anúncio
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500 mt-1">
                            Atualize as informações, texto e regras de exibição deste anúncio.
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

                <FormProvider {...methods}>
                    <section className="flex justify-center">
                        <FormEditNotice notice_id={id as string} />
                    </section>
                </FormProvider>
            </div>
        </ContentDashboard>
    )
}

EditNoticePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "NOTICES_MANAGER"])

export default EditNoticePage
