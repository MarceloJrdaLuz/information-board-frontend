import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddPublisher from "@/Components/Forms/FormAddPublisher"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddPublishersPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Adicionar Pessoa")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Pessoas", link: "/congregacao/pessoas" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar Pessoa"} />
            <div className="flex justify-center w-full">
                <FormAddPublisher />
            </div>
        </ContentDashboard>
    )
}

AddPublishersPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"])

export default AddPublishersPage