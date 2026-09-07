import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditHospitalityGroup from "@/Components/Forms/FormEditHospitalityGroup"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function EditHospitalityGroupPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Grupo")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Grupos de hospitalidade", link: "/reunioes/fimdesemana/grupos-hospitalidade" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Grupo"} />
            <section className="flex justify-center">
                <FormEditHospitalityGroup />
            </section>
        </ContentDashboard>
    )
}

EditHospitalityGroupPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default EditHospitalityGroupPage