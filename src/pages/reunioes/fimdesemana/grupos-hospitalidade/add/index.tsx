import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddHospitalityGroup from "@/Components/Forms/FormAddHospitalityGroup"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddHospitalityGroupPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Adicionar Grupo")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Grupos de hospitalidade", link: "/reunioes/fimdesemana/grupos-hospitalidade" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar Grupo"} />
            <section className="flex m-10 justify-center items-center">
                <FormAddHospitalityGroup />
            </section>
        </ContentDashboard>
    )
}

AddHospitalityGroupPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default AddHospitalityGroupPage