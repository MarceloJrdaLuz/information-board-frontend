import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditCongregationAuxiliary from "@/Components/Forms/FormEditCongregationAuxiliary"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function EditCongregationPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Congregação")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregações", link: "/reunioes/fimdesemana/congregacoes" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Congregação"} />
            <section className="flex justify-center">
                <FormEditCongregationAuxiliary />
            </section>
        </ContentDashboard>
    )
}

EditCongregationPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default EditCongregationPage