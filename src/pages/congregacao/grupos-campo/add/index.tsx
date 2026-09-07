import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddGroup from "@/Components/Forms/FormAddGroup"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddGroupPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Criar Grupo")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Grupos de Campo", link: "/congregacao/grupos-campo" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Criar Grupo"} />
            <section className="flex m-10 justify-center items-center">
                <FormAddGroup />
            </section>
        </ContentDashboard>
    )
}

AddGroupPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "GROUPS_MANAGER"])

export default AddGroupPage